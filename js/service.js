export const date=n=>new Intl.DateTimeFormat('en-IN',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Kolkata'}).format(new Date(n))+' IST';
export const localInput=n=>{const d=new Date(n);return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16);};
export function stats(s,l){const reserved=l.reserved||0,collected=l.collected||0;return {reserved,collected,available:l.open&&l.deadline>Date.now()?Math.max(0,l.total-reserved-collected):0,status:!l.open?'Closed':l.deadline<=Date.now()?'Expired':l.total-reserved-collected<=0?'Fully reserved':'Available'};}
