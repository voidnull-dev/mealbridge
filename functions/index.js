import {initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {onCall,HttpsError} from 'firebase-functions/v2/https';
import {randomInt,createHash,timingSafeEqual} from 'node:crypto';
import {text,validateListing,reserveQuantities,settleQuantities} from './domain.js';
const GLA_HOSTELS = new Map([
 ['A','Pt. Lokmani Sharma'],['B','Shyama Prasad Mukharjee'],['C','C. V. Raman'],['D','Dr. Rajendra Prasad'],
 ['E','Sir Vishveshwaraya'],['F','Bheemrao Ambedkar'],['G','APJ Abdul Kalam'],['H','Bhagwan Das Agrawal'],
 ['I','Sarvapalli Radha Krishnan'],['J','Hari Das Agrawal'],['Wing-3','Wing-3'],['Wing-5','Wing-5'],
 ['GANGA','Ganga Girls Hostel'],['YAMUNA','Yamuna Girls Hostel'],['KC','K.C. Girls Hostel'],['GODAWRI','Godawri Girls Hostel']
]);
const website=value=>{const v=String(value||'').trim(); if(!/^https:\/\/[^\s]+$/i.test(v)) fail('Enter the NGO official website using https://.'); return v;};
initializeApp();const db=getFirestore();
const fail=(message,code='failed-precondition')=>{throw new HttpsError(code,message);};
const hash=value=>createHash('sha256').update(value).digest('hex');
const id=value=>{if(typeof value!=='string'||!/^[A-Za-z0-9_-]{1,160}$/.test(value))fail('Invalid record ID.','invalid-argument');return value;};
export const mealbridgeAction=onCall({region:'asia-south1',maxInstances:10},async request=>{
 if(!request.auth||request.auth.token.firebase?.sign_in_provider!=='google.com'||request.auth.token.email_verified!==true)fail('Sign in with a verified Google account.','unauthenticated');
 const uid=request.auth.uid,d=request.data||{},now=Date.now(),userRef=db.doc(`users/${uid}`);
 try{
  if(d.action==='initializeAdmin'){
   if(request.auth.token.email?.toLowerCase()!=='suryanshdevniranjan@gmail.com')return {admin:false};
   const account=await getAuth().getUser(uid);await getAuth().setCustomUserClaims(uid,{...account.customClaims,admin:true});return {admin:true};
  }
  if(d.action==='onboard')return await db.runTransaction(async tx=>{
   const user=await tx.get(userRef);if(user.exists)fail('Your portal has already been selected. It cannot be changed.');
   if(!['hostel','ngo'].includes(d.role))fail('Choose Hostel or NGO.');
   const name=text(d.name,'Organization name',3,160);
   let profile={role:d.role,name,contact:text(d.contact,'Representative contact',7,200),email:request.auth.token.email,city:'Mathura',status:'pending',created:now};
   if(d.role==='hostel'){
    const hostelId=text(d.hostelId,'GLA hostel',1,40); const expected=GLA_HOSTELS.get(hostelId);
    if(!expected || expected.toLowerCase()!==name.toLowerCase())fail('Select a valid GLA hostel from the official reference list.');
    const hostelGender=['GANGA','YAMUNA','KC','GODAWRI'].includes(hostelId)?'Girls':'Boys';
    profile={...profile,hostelId,hostelGender,evidence:text(d.evidence,'Hostel authorization details',20,1500)};
   }else{
    profile={...profile,registrationNumber:text(d.registrationNumber,'NGO registration number',5,120),website:website(d.website),serviceArea:text(d.serviceArea,'Service area',3,300),evidence:text(d.evidence,'NGO verification details',20,1500)};
   }
   tx.create(userRef,profile);return {status:'pending'};
  });
  if(d.action==='review'){
   if(request.auth.token.admin!==true)fail('Administrator access required.','permission-denied');
   const target=db.doc(`users/${id(d.id)}`),note=text(d.note,'Review note',10,1000);
   if(!['approved','rejected'].includes(d.status))fail('Invalid review decision.');
   return await db.runTransaction(async tx=>{const snap=await tx.get(target);if(!snap.exists)fail('Request not found.');const p=snap.data();
    if(p.status!=='pending')fail('This request has already been reviewed.');
    const key=db.doc(`organizationKeys/${hash(p.role+':'+p.name.toLowerCase().replace(/\s+/g,' ').trim())}`),existing=await tx.get(key);
    if(d.status==='approved'&&existing.exists)fail('This organization already has an approved representative.');
    tx.update(target,{status:d.status,reviewNote:note,reviewed:now,reviewedBy:uid});
    if(d.status==='approved'){tx.create(key,{uid:d.id});tx.set(db.doc(`organizations/${d.id}`),{name:p.name,role:p.role,city:p.city,status:'approved',approved:now});}
    return {status:d.status};
   });
  }
  if(d.action==='resolveReport'){
   if(request.auth.token.admin!==true)fail('Administrator access required.','permission-denied');
   const ref=db.doc(`reports/${id(d.id)}`);return await db.runTransaction(async tx=>{const report=await tx.get(ref);if(!report.exists)fail('Report not found.');tx.update(ref,{status:'resolved',note:text(d.note,'Resolution',10,1000),resolvedBy:uid,resolved:now});if(d.close)tx.update(db.doc(`listings/${report.data().listingId}`),{open:false});return {ok:true};});
  }
  return await db.runTransaction(async tx=>{
   const user=await tx.get(userRef);if(!user.exists)fail('Select your portal first.');const p=user.data();
   const approved=role=>{if(p.role!==role||p.status!=='approved')fail(`An approved ${role} account is required.`,'permission-denied');};
   if(d.action==='publish'){
    approved('hostel');const l=validateListing(d,now),ref=db.doc(`listings/${uid}_${id(d.requestId)}`),old=await tx.get(ref);if(old.exists)return {id:ref.id};
    const privateInfo={contact:text(d.contact,'Pickup contact',7,300),instructions:text(d.instructions,'Pickup instructions',10,1500)};
    tx.create(ref,{...l,hostel:p.name,hostelUid:uid,open:true,reserved:0,collected:0,created:now});tx.create(db.doc(`pickupDetails/${ref.id}`),privateInfo);return {id:ref.id};
   }
   if(d.action==='edit'){
    approved('hostel');const ref=db.doc(`listings/${id(d.id)}`),snap=await tx.get(ref);if(!snap.exists||snap.data().hostelUid!==uid)fail('You do not own this listing.','permission-denied');const old=snap.data();
    if(old.reserved||old.collected)fail('A listing with reservations cannot be edited. Close it and publish a new listing if details change.');
    tx.update(ref,validateListing(d,now));tx.set(db.doc(`pickupDetails/${ref.id}`),{contact:text(d.contact,'Pickup contact',7,300),instructions:text(d.instructions,'Pickup instructions',10,1500)});return {id:ref.id};
   }
   if(d.action==='close'){
    approved('hostel');const ref=db.doc(`listings/${id(d.id)}`),l=await tx.get(ref);if(!l.exists||l.data().hostelUid!==uid)fail('You do not own this listing.','permission-denied');tx.update(ref,{open:false});return {ok:true};
   }
   if(d.action==='reserve'){
    approved('ngo');const ref=db.doc(`listings/${id(d.id)}`),res=db.doc(`reservations/${uid}_${id(d.requestId)}`);
    const [snap,existing,details]=await Promise.all([tx.get(ref),tx.get(res),tx.get(db.doc(`pickupDetails/${ref.id}`))]);
    if(existing.exists)return {id:res.id};if(!snap.exists||!details.exists)fail('Listing not found.');const l=snap.data(),change=reserveQuantities(l,d.quantity,d.eta,now),code=String(randomInt(100000,1000000));
    tx.update(ref,change);tx.create(res,{listingId:ref.id,meal:l.name,hostel:l.hostel,hostelUid:l.hostelUid,ngo:p.name,ngoUid:uid,quantity:d.quantity,eta:d.eta,deadline:l.deadline,contact:text(d.contact,'Pickup contact',7,300),...Object.fromEntries(Object.entries(details.data()).map(([k,v])=>['pickup'+k[0].toUpperCase()+k.slice(1),v])),status:'reserved',collected:0,created:now});
    tx.create(db.doc(`pickupSecrets/${res.id}`),{code,hash:hash(code),attempts:0,lockedUntil:0});return {id:res.id};
   }
   if(['cancel','collect','pickupCode'].includes(d.action)){
    const ref=db.doc(`reservations/${id(d.id)}`),snap=await tx.get(ref);if(!snap.exists)fail('Reservation not found.');const r=snap.data();
    if(d.action==='pickupCode'){if(r.ngoUid!==uid)fail('Only the reserving NGO can see the code.','permission-denied');const code=await tx.get(db.doc(`pickupSecrets/${ref.id}`));return {code:code.data()?.code||''};}
    if(d.action==='cancel'&&r.ngoUid!==uid||d.action==='collect'&&r.hostelUid!==uid)fail('This reservation belongs to another account.','permission-denied');
    if(r.status!=='reserved')fail('This reservation has already been finalized.');
    const listing=db.doc(`listings/${r.listingId}`),ls=await tx.get(listing);if(!ls.exists)fail('Listing not found.');const l=ls.data();
    if(d.action==='cancel'){tx.update(listing,{reserved:l.reserved-r.quantity});tx.update(ref,{status:'cancelled',cancelled:now});return {ok:true};}
    const secretRef=db.doc(`pickupSecrets/${ref.id}`),secret=(await tx.get(secretRef)).data();if(!secret)fail('Pickup code is unavailable.');if(secret.lockedUntil>now)fail('Too many attempts. Try again in 15 minutes.');
    if(!timingSafeEqual(Buffer.from(hash(String(d.code))),Buffer.from(secret.hash))){const attempts=secret.attempts+1;tx.update(secretRef,{attempts:attempts%5,lockedUntil:attempts>=5?now+900000:0});return {error:'Incorrect pickup code.'};}
    tx.update(listing,settleQuantities(l,r,d.quantity));tx.update(ref,{status:'collected',collected:d.quantity,collectedAt:now});return {ok:true};
   }
   if(d.action==='privateListing'){
    const ref=db.doc(`listings/${id(d.id)}`),l=await tx.get(ref);if(!l.exists||l.data().hostelUid!==uid)fail('Only the listing owner can edit pickup information.','permission-denied');return (await tx.get(db.doc(`pickupDetails/${ref.id}`))).data();
   }
   if(d.action==='report'){
    const listingId=id(d.id);if(!(await tx.get(db.doc(`listings/${listingId}`))).exists)fail('Listing not found.');
    const ref=db.doc(`reports/${uid}_${id(d.requestId)}`);tx.set(ref,{listingId,reason:text(d.reason,'Concern',10,1500),status:'open',uid,created:now});return {ok:true};
   }
   fail('Unknown action.','invalid-argument');
  });
 }catch(err){if(err instanceof HttpsError)throw err;if(err instanceof Error && !err.code)throw new HttpsError('invalid-argument',err.message);console.error('MealBridge action failed',d.action,err);throw new HttpsError('internal','The request could not be completed. Please retry.');}
});
