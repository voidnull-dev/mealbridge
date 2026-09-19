import * as T from '../assets/vendor/three.module.js';
const clamp=v=>T.MathUtils.clamp(v,0,1);
export function createScene(container,{hero=false,loader=false}={}){
 const scene=new T.Scene(),world=new T.Group();scene.add(world);
 const renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
 const camera=new T.PerspectiveCamera(38,1,.1,70);camera.position.set(10,9,15.5);
 const materials=new Map(),geometries=new Map(),textures=[];
 function material(c){if(!materials.has(c))materials.set(c,new T.MeshStandardMaterial({color:c,roughness:.88}));return materials.get(c);}
 function geometry(key,make){if(!geometries.has(key))geometries.set(key,make());return geometries.get(key);}
 function mesh(g,c,parent=world){const m=new T.Mesh(g,material(c));m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function box(p,s,c,parent=world){const m=mesh(geometry('box',()=>new T.BoxGeometry(1,1,1)),c,parent);m.position.set(...p);m.scale.set(...s);return m;}
 function ball(p,size,c,parent=world){const m=mesh(geometry('ico',()=>new T.IcosahedronGeometry(1,1)),c,parent);m.position.set(...p);m.scale.setScalar(size);return m;}
 function group(p,parent=world){const g=new T.Group();g.position.set(...p);parent.add(g);return g;}
 function label(text,p,w,parent){const canvas=document.createElement('canvas');canvas.width=640;canvas.height=100;const ctx=canvas.getContext('2d');ctx.fillStyle='#f3e9ce';ctx.fillRect(0,0,640,100);ctx.fillStyle='#294c3b';ctx.font='bold 38px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,320,53,610);const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;textures.push(texture);const mat=new T.MeshBasicMaterial({map:texture});materials.set('label-'+text,mat);const m=new T.Mesh(geometry('label',()=>new T.PlaneGeometry(1,1)),mat);m.scale.set(w,w/6.4,1);m.position.set(...p);parent.add(m);}
 function tree(x,z,s=1){const g=group([x,0,z]);g.scale.setScalar(s);box([0,.55,0],[.13,1.1,.13],'#8b7659',g);ball([0,1.38,0],.67,'#74915a',g);ball([.27,1.65,.1],.42,'#9aae67',g);}
 function person(p,color){const g=group(p);ball([0,.87,0],.13,'#bf936c',g);box([0,.56,0],[.32,.42,.21],color,g);[-.085,.085].forEach(x=>box([x,.22,0],[.1,.33,.12],'#42534a',g));[-.22,.22].forEach(x=>box([x,.51,0],[.1,.33,.12],color,g));}
 scene.add(new T.AmbientLight('#fff6e5',1.5));scene.add(new T.HemisphereLight('#fff3d8','#70835f',1.6));const sun=new T.DirectionalLight('#fff1d4',3.2);sun.position.set(-5,12,7);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-9,right:9,top:9,bottom:-9});sun.shadow.bias=-.001;scene.add(sun);
 let van,boxes;
 if(loader){[0,.4,.8].forEach(y=>box([0,y,0],[1.4,.36,1],y===.8?'#d8ed9a':'#75936d'));box([0,1.1,0],[.6,.25,.2],'#173d32');[-1,1].forEach(x=>box([x,.1,.3],[.55,.4,.55],'#d3a872'));camera.position.set(3,2,4);}
 else {
 const island=mesh(geometry('island',()=>new T.CylinderGeometry(6.3,6.6,.6,64)),'#b6c78e');island.position.y=-.35;
 const road=mesh(geometry('road',()=>new T.RingGeometry(3.3,4.7,80)),'#e5ddbd');road.rotation.x=-Math.PI/2;road.position.y=-.025;
 box([0,0,1.65],[10,.025,1.15],'#e5ddbd');[-4,-2,0,2,4].forEach(x=>box([x,.025,1.64],[.65,.018,.045],'#f8f2da'));
 const h=group([-3.4,0,-1.8]);box([0,1.45,0],[2.8,2.9,1.9],'#ebc187',h);box([0,2.97,0],[3.1,.22,2.1],'#536e5a',h);box([0,3.16,0],[2.7,.16,1.75],'#718b6a',h);
 [-.9,0,.9].forEach(x=>[1.35,2.15].forEach(y=>{box([x,y,1],[.43,.53,.12],'#f7e5bd',h);box([x,y,1.07],[.32,.42,.025],'#51706a',h);box([x,y,1.09],[.04,.42,.02],'#c1d7b0',h);}));box([0,.48,1],[.52,.96,.1],'#335c4a',h);box([0,.03,1.23],[.9,.12,.6],'#d5c59b',h);box([0,1.03,1.2],[1.35,.12,.55],'#c57948',h);label('THE HOSTEL KITCHEN',[0,2.72,1.12],2.7,h);box([-1.1,3.35,-.55],[.32,.6,.4],'#b8b8a0',h);box([1.1,.4,1.5],[.6,.8,.5],'#8aa365',h);
 const c=group([3.3,0,-1.5]);box([0,.92,0],[2.6,1.84,1.9],'#e9d9b8',c);const roof=mesh(geometry('roof',()=>new T.ConeGeometry(2.08,1,4)),'#68865f',c);roof.position.y=2.2;roof.rotation.y=Math.PI/4;box([0,.55,1],[.65,1.1,.12],'#365d4e',c);[-.88,.88].forEach(x=>box([x,1.13,.99],[.43,.5,.08],'#91a993',c));label('THE COMMUNITY TABLE',[0,1.65,1.13],2.55,c);box([0,.62,1.75],[2.1,.13,.67],'#bfa076',c);[-.8,.8].forEach(x=>box([x,.3,1.75],[.1,.6,.48],'#7d7956',c));box([0,.36,2.45],[2,.12,.3],'#8b9465',c);
 van=group([-.6,0,1.55]);box([-.25,.64,0],[1.75,.95,.95],'#668d68',van);box([.87,.55,0],[.75,.95,.95],'#d8ed9a',van);box([.94,.8,.48],[.47,.35,.035],'#46695d',van);box([1.26,.77,0],[.02,.35,.66],'#6c9984',van);box([1.29,.31,0],[.11,.16,.96],'#ebe9d4',van);[-.76,.86].forEach(x=>[-.5,.5].forEach(z=>{const wheel=mesh(geometry('wheel',()=>new T.CylinderGeometry(.26,.26,.15,16)),'#2b453b',van);wheel.position.set(x,.24,z);wheel.rotation.x=Math.PI/2;}));label('MEALBRIDGE',[-.22,.66,.486],1.6,van);
 boxes=new T.InstancedMesh(geometry('foodbox',()=>new T.BoxGeometry(.31,.24,.32)),material('#dbb07a'),20);boxes.castShadow=true;boxes.receiveShadow=true;world.add(boxes);
 person([-2.4,0,1.05],'#d87848');person([2.15,0,1.1],'#63849a');person([4.5,0,.3],'#dfb567');[[-5,0,1],[-4.5,-3.2,1.15],[-1,-3.6,.9],[1.2,-3.7,1.15],[5,-2.6,.95],[4.8,2.3,.7],[-4.6,2.65,.7]].forEach(p=>tree(...p));[-1,0,1].forEach((x,i)=>{const g=group([x*1.5-1,0,3.65]);box([0,.22,0],[.65,.42,.65],'#ccab78',g);ball([0,.57,0],.35,i===1?'#d8945b':'#8ea657',g);});
 }
 const fallback=container.innerHTML;container.replaceChildren(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');let width=1,active=true,dead=false,raf=0,progress=0,px=0,py=0,last=0;
 const dummy=new T.Object3D(),target=new T.Vector3();
 function resize(){const r=container.getBoundingClientRect();width=r.width;renderer.setSize(Math.max(1,r.width),Math.max(1,r.height),false);camera.aspect=Math.max(1,r.width)/Math.max(1,r.height);camera.updateProjectionMatrix();}
 const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(container);resize();
 const observer=new IntersectionObserver(([entry])=>{active=entry.isIntersecting;start();});observer.observe(container);
 function draw(now){raf=0;if(dead||!active||document.hidden)return;const dt=Math.min((now-last)/1000||.016,.05);last=now;
 if(loader){world.rotation.y+=dt*.6;world.rotation.z=.1;camera.lookAt(0,.5,0);}
 else {const p=progress,load=clamp((p-.23)/.25),trip=clamp((p-.5)/.34),unload=clamp((p-.84)/.15);world.rotation.y=T.MathUtils.damp(world.rotation.y,hero?-.32+Math.sin(now*.00013)*.045:-.35+p*.55,4,dt);world.scale.setScalar(width<650?.91:1);const distance=width<650?18:15.5;target.set(hero?distance*.65+px*.3:10-p*4,hero?9+py*.2:10-p*2,hero?distance:15.5-p*1.8);camera.position.lerp(target,1-Math.exp(-dt*3));camera.lookAt(hero?0:.4,0,0);van.position.x=-.6+trip*3.8;
 for(let i=0;i<20;i++){const pos=new T.Vector3(-2.2+i%4*.34,.2+Math.floor(i/4)*.26,.02);if(i<8){pos.lerp(new T.Vector3(-1+i%4*.34+trip*3.8,1.23+Math.floor(i/4)*.25,1.55),load);pos.lerp(new T.Vector3(2.6+i%4*.34,.83+Math.floor(i/4)*.25,.26),unload);pos.y+=Math.sin(load*Math.PI)*.9+Math.sin(unload*Math.PI)*.5;}dummy.position.copy(pos);dummy.scale.setScalar(Math.max(.01,clamp(p*8+1-i*.055)));dummy.updateMatrix();boxes.setMatrixAt(i,dummy.matrix);}boxes.instanceMatrix.needsUpdate=true;}
 renderer.render(scene,camera);raf=requestAnimationFrame(draw);}
 function start(){if(!raf&&!dead&&active&&!document.hidden)raf=requestAnimationFrame(draw);}
 const move=event=>{const r=container.getBoundingClientRect();px=(event.clientX-r.left)/r.width*2-1;py=(event.clientY-r.top)/r.height*2-1;};container.addEventListener('pointermove',move);document.addEventListener('visibilitychange',start);
 function lost(event){event.preventDefault();dispose();container.innerHTML=fallback;}
 renderer.domElement.addEventListener('webglcontextlost',lost);start();
 function dispose(){if(dead)return;dead=true;cancelAnimationFrame(raf);observer.disconnect();resizeObserver.disconnect();document.removeEventListener('visibilitychange',start);container.removeEventListener('pointermove',move);renderer.domElement.removeEventListener('webglcontextlost',lost);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());renderer.dispose();renderer.domElement.remove();}
 return {setProgress:p=>{progress=clamp(p);},dispose};
}
