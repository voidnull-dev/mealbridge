// GLA University hostel names documented in the university Self Study Report (20 June 2022), pp. 66–67.
// These are only selectable as GLA hostel identities; they are NOT seeded MealBridge partners.
// Current participation/authorization must still be verified by the MealBridge administrator.
export const hostelSource = 'https://www.gla.ac.in/Uploads/image/920imguf_Update-8feb23.pdf';
export const glaHostels = [
  {id:'A', name:'Pt. Lokmani Sharma', gender:'Boys'},
  {id:'B', name:'Shyama Prasad Mukharjee', gender:'Boys'},
  {id:'C', name:'C. V. Raman', gender:'Boys'},
  {id:'D', name:'Dr. Rajendra Prasad', gender:'Boys'},
  {id:'E', name:'Sir Vishveshwaraya', gender:'Boys'},
  {id:'F', name:'Bheemrao Ambedkar', gender:'Boys'},
  {id:'G', name:'APJ Abdul Kalam', gender:'Boys'},
  {id:'H', name:'Bhagwan Das Agrawal', gender:'Boys'},
  {id:'I', name:'Sarvapalli Radha Krishnan', gender:'Boys'},
  {id:'J', name:'Hari Das Agrawal', gender:'Boys'},
  {id:'Wing-3', name:'Wing-3', gender:'Boys'},
  {id:'Wing-5', name:'Wing-5', gender:'Boys'},
  {id:'GANGA', name:'Ganga Girls Hostel', gender:'Girls'},
  {id:'YAMUNA', name:'Yamuna Girls Hostel', gender:'Girls'},
  {id:'KC', name:'K.C. Girls Hostel', gender:'Girls'},
  {id:'GODAWRI', name:'Godawri Girls Hostel', gender:'Girls'}
];
export const hostelById = id => glaHostels.find(h => h.id === id);
export const hostelByName = name => glaHostels.find(h => h.name.toLowerCase() === String(name || '').trim().toLowerCase());
export const date=n=>new Intl.DateTimeFormat('en-IN',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Kolkata'}).format(new Date(n))+' IST';
export const localInput=n=>{const d=new Date(n);return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16);};
export function stats(s,l){const reserved=l.reserved||0,collected=l.collected||0;return {reserved,collected,available:l.open&&l.deadline>Date.now()?Math.max(0,l.total-reserved-collected):0,status:!l.open?'Closed':l.deadline<=Date.now()?'Expired':l.total-reserved-collected<=0?'Fully reserved':'Available'};}
