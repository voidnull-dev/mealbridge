import {mkdir,cp,rm} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=dirname(fileURLToPath(import.meta.url)),output=resolve(root,'dist');
if(dirname(output)!==root)throw Error('Invalid output path');
await rm(output,{recursive:true,force:true});await mkdir(output,{recursive:true});
for(const path of ['index.html','style.css','js','assets'])await cp(resolve(root,path),resolve(output,path),{recursive:true});
console.log('Copied plain HTML, CSS and JavaScript into dist. No compilation required.');
