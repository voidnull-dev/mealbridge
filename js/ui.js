export const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paths={arrow:'M7 17 17 7M7 7h10v10',leaf:'M20 4C8 2 2 10 6 17c7 4 15-2 14-13ZM4 21l11-11',box:'m3 7 9-4 9 4v10l-9 4-9-4ZM3 7l9 4 9-4M12 11v10M7 5l10 4',clock:'M12 8v4l3 2',pin:'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z M12 7v5',check:'m5 12 4 4 10-10',truck:'M3 6h11v11H3ZM14 10h4l3 4v3h-7M7 17v3M17 17v3',plus:'M12 5v14M5 12h14',down:'M12 4v16M5 13l7 7 7-7',back:'M20 12H4m7-7-7 7 7 7'};
export const icon=(name,size=20)=>`<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${name==='clock'?'<circle cx="12" cy="12" r="9"/>':''}<path d="${paths[name]||paths.box}"/></svg>`;
export const link=(url,text,cls='button')=>`<a class="${cls}" href="${escape(url)}" data-link>${text}</a>`;
export const field=(name,label,value='',type='text',extra='')=>`<label>${label}<input name="${name}" type="${type}" value="${escape(value)}" ${extra}></label>`;
export const options=(values,current)=>values.map(v=>`<option ${v===current?'selected':''} value="${escape(v)}">${escape(v)}</option>`).join('');
export const roleName=r=>r==='ngo'?'NGO':r==='hostel'?'Hostel':'Admin';
