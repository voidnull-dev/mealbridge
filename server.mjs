import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=process.cwd(),port=Number(process.env.PORT||5173);
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.svg':'image/svg+xml','.txt':'text/plain'};
createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');let path=resolve(root,'.'+decodeURIComponent(url.pathname));if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403).end();return;}try{if(!(await stat(path)).isFile())path=resolve(root,'index.html');}catch{if(extname(path)){res.writeHead(404).end('Not found');return;}path=resolve(root,'index.html');}res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(await readFile(path));}catch{res.writeHead(500).end('Could not load file');}}).listen(port,'127.0.0.1',()=>console.log(`MealBridge: http://127.0.0.1:${port}/`));
