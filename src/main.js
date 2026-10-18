import './style.css';
import {createApplicator} from './applicator.js';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const canvas=document.querySelector('#viewer');
const scene=new THREE.Scene();
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.25;
const pmrem=new THREE.PMREMGenerator(renderer);
const envScene=new RoomEnvironment();
scene.environment=pmrem.fromScene(envScene,0.04).texture;
envScene.dispose();pmrem.dispose();
scene.add(new THREE.HemisphereLight(0xffffff,0x95a4a3,2));
const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(4,8,7);scene.add(light);
const camera=new THREE.PerspectiveCamera(35,1,0.05,100);
const controls=new OrbitControls(camera,canvas);
controls.enableDamping=true;controls.enablePan=false;controls.minDistance=2;controls.maxDistance=24;controls.autoRotateSpeed=0.6;
let headStyle='tapered';let model=createApplicator({head:headStyle});scene.add(model.pen);
const views={hero:{position:[6,2.6,9],target:[0,.5,0]},head:{position:[3.4,5.2,4.8],target:[.9,2.8,0]},tail:{position:[1,-4.3,2.8],target:[-.7,-1.9,0]},inside:{position:[6,2.6,9],target:[0,.4,0]},fit:{position:[5,4,11],target:[0,.8,0]},service:{position:[7,3,13],target:[0,.7,0]}};
const copyFor=()=>({
 hero:['01 / DESIGN','Compact. Balanced. Precise.',headStyle==='tapered'?'A 20 mm grip, 126 mm overall. The head tapers over '+model.headGeometry.headLength.toFixed(0)+' mm to a '+model.headGeometry.bevelDeg.toFixed(0)+'° bevelled face carrying the camera beside a replaceable '+model.dimensions.cottonWidth+' × '+model.dimensions.cottonLength+' mm cotton tip. Dimensions are prototype targets.':'Original v3 flat head: a 20 mm cylindrical grip, 126 mm overall length and a replaceable cotton tip. Dimensions are prototype targets.'],
 head:['02 / PRECISION','A tip you can replace.','Pull the clean plastic collar to remove the tip. The plug-in stem has an insertion stop; the adjacent camera '+(headStyle==='tapered'?'sits flush on the bevel, which faces the contact area.':'is angled toward the contact area.')],
 tail:['03 / DETAIL','A serviceable charging base.','The centered USB-C opening sits between two recessed screws. The removable tail cap gives access to the internal carrier.'],
 inside:['04 / LAYOUT','Parts with room to fit.','A 1.2 mm shell, support rails, battery and board envelopes, button switch and charging board. Hardware selection and tolerances remain to be verified.'],
 fit:['05 / FIT & OPTICS','See the contact area.','126 mm overall · 20 mm grip · '+model.dimensions.cottonWidth+' × '+model.dimensions.cottonLength+' mm cotton · '+model.workingDistance.toFixed(0)+' mm working distance. The blue band marks a grip study zone. Camera view is a geometric simulation, not measured imaging.'],
 service:['06 / SERVICE','Replace. Open. Reassemble.','The cotton cartridge pulls forward; the two-screw tail cap opens at the base. Rails locate the internal carrier. Retention force, sealing and assembly sequence need prototype tests.']
});
let view='hero',colorway='blue',transition=null;
function setView(name,instant=false){view=name;const v=views[name];model.setMode(name);document.querySelector('#optics-label').hidden=name!=='fit';document.querySelector('#mode-label').textContent=name==='fit'?'FIT & OPTICS':name==='inside'?'INTERNAL VIEW':name==='service'?'SERVICE STUDY':'EXTERIOR';document.querySelectorAll('[data-view]').forEach(b=>{const active=b.dataset.view===name;b.classList.toggle('active',active);b.setAttribute('aria-pressed',active);});const copy=copyFor();['number','title','copy'].forEach((key,i)=>document.querySelector('#detail-'+key).textContent=copy[name][i]);const p=new THREE.Vector3(...v.position),t=new THREE.Vector3(...v.target);if(instant){camera.position.copy(p);controls.target.copy(t);controls.update();}else{transition={start:performance.now(),p0:camera.position.clone(),t0:controls.target.clone(),p,t};}controls.autoRotate=false;document.querySelector('#rotate').setAttribute('aria-pressed','false');}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));
document.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>{colorway=b.dataset.color;model.setColor(colorway);document.querySelectorAll('[data-color]').forEach(el=>{const active=el===b;el.classList.toggle('active',active);el.setAttribute('aria-pressed',active);});});
document.querySelectorAll('[data-head]').forEach(b=>b.onclick=()=>{if(b.dataset.head===headStyle)return;headStyle=b.dataset.head;scene.remove(model.pen);model.pen.traverse(o=>{o.geometry?.dispose();});model=createApplicator({head:headStyle});scene.add(model.pen);model.setColor(colorway);model.setMode(view);model.led.emissiveIntensity=powered?.5:0;const copy=copyFor();['number','title','copy'].forEach((key,i)=>document.querySelector('#detail-'+key).textContent=copy[view][i]);document.querySelectorAll('[data-head]').forEach(el=>{const active=el===b;el.classList.toggle('active',active);el.setAttribute('aria-pressed',active);});});
document.querySelector('#rotate').onclick=()=>{controls.autoRotate=!controls.autoRotate;document.querySelector('#rotate').setAttribute('aria-pressed',controls.autoRotate);};
document.querySelector('#reset').onclick=()=>setView('hero');
controls.addEventListener('start',()=>{transition=null;controls.autoRotate=false;document.querySelector('#rotate').setAttribute('aria-pressed','false');});
canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const dir=camera.position.clone().sub(controls.target);if(e.key==='ArrowLeft'||e.key==='ArrowRight')dir.applyAxisAngle(new THREE.Vector3(0,1,0),e.key==='ArrowLeft'?.12:-.12);else dir.applyAxisAngle(new THREE.Vector3(1,0,0),e.key==='ArrowUp'?.08:-.08);camera.position.copy(controls.target).add(dir);controls.update();}});
const resize=()=>{const {width,height}=canvas.parentElement.getBoundingClientRect();renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();};new ResizeObserver(resize).observe(canvas.parentElement);resize();
if(canvas.clientWidth<450){views.hero.position=[7,3,11];views.inside.position=[7,3,11];}
let powered=true;
document.querySelector('#power-demo').onclick=()=>{
 powered=!powered;model.led.emissiveIntensity=powered?.5:0;model.button.position.z=-.3;setTimeout(()=>{model.button.position.z=0;},220);
 document.querySelector('#power-demo').textContent=powered?'Power on · press to test':'Power off · press to test';
};
setView('hero',true);document.querySelector('#loading').hidden=true;
let last=performance.now();
renderer.setAnimationLoop(()=>{const now=performance.now();if(transition){const f=Math.min((now-transition.start)/700,1),s=f*f*(3-2*f);camera.position.lerpVectors(transition.p0,transition.p,s);controls.target.lerpVectors(transition.t0,transition.t,s);if(f===1)transition=null;}controls.update(Math.min((now-last)/1000,.1));last=now;renderer.setViewport(0,0,canvas.clientWidth,canvas.clientHeight);renderer.render(scene,camera);
 if(view==='fit'){
  const w=Math.min(180,canvas.clientWidth*.46),h=w/1.5,x=canvas.clientWidth-w-12,y=canvas.clientHeight-h-65;
  model.opticalLines.visible=model.dimensionGuide.visible=model.grip.visible=false;
  renderer.setScissorTest(true);renderer.setScissor(x,y,w,h);renderer.setViewport(x,y,w,h);renderer.render(scene,model.opticalCamera);renderer.setScissorTest(false);
  model.opticalLines.visible=model.dimensionGuide.visible=model.grip.visible=true;
 }
});
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();const m=document.querySelector('#loading');m.hidden=false;m.textContent='The 3D view has paused. Refresh the page to reload.';});





