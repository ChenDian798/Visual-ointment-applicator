import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createApplicator} from './src/applicator.js';
const report={};
// Cast rays through the simulated camera frame and classify what each pixel sees.
function frameCoverage(m){
 m.setMode('fit');m.pen.updateMatrixWorld(true);const cam=m.opticalCamera,k=m.pen.scale.x,meshes=[],tip=new Set();
 m.pen.traverse(o=>{if(o.isMesh)meshes.push(o)});m.cotton.parent.traverse(o=>tip.add(o));
 const rc=new THREE.Raycaster(),W=120,H=80;let cotton=0,stem=0,skin=0,nearest=Infinity;
 for(let j=0;j<H;j++)for(let i=0;i<W;i++){rc.setFromCamera(new THREE.Vector2((i+.5)/W*2-1,(j+.5)/H*2-1),cam);
  const h=rc.intersectObjects(meshes,false)[0];if(!h)continue;
  if(h.object===m.cotton){cotton++;nearest=Math.min(nearest,h.distance/k);}else if(tip.has(h.object))stem++;else if(h.object.geometry.type==='PlaneGeometry')skin++;}
 m.setMode('hero');const N=W*H;return {cottonPct:100*cotton/N,tipTotalPct:100*(cotton+stem)/N,skinPct:100*skin/N,cottonNearestMm:nearest};
}
for(const style of ['tapered','flat']){
 const m=createApplicator({head:style});m.pen.updateMatrixWorld(true);
 const aim=m.pen.localToWorld(m.aimPoint.clone()).project(m.opticalCamera);
 assert(Math.abs(aim.x)<1e-6&&Math.abs(aim.y)<1e-6&&aim.z<1,style+': aim point must be the frame centre');
 const contact=m.pen.localToWorld(m.target.clone()).project(m.opticalCamera);
 assert(Math.abs(contact.x)<.9&&Math.abs(contact.y)<.9&&contact.z<1,style+': contact target must lie in the camera frame');
 for(const x of [-5,5])for(const z of [-5,5]){
  const p=m.pen.localToWorld(m.target.clone().add(new THREE.Vector3(x,0,z))).project(m.opticalCamera);
  assert(Math.abs(p.x)<1&&Math.abs(p.y)<1&&p.z<1,style+': surrounding contact area must remain in view');
 }
 const positions=m.buttonFace.geometry.attributes.position;
 for(let i=0;i<positions.count;i++)assert(Math.hypot(positions.getX(i),positions.getZ(i))<=10,'Button face must not protrude beyond the cylinder');
 const dimensionsBefore=m.internals.children.filter(p=>p.isMesh).map(p=>p.geometry.uuid);
 m.setMode('inside');m.setMode('service');m.setColor('black');m.setMode('hero');
 assert.deepEqual(m.internals.children.filter(p=>p.isMesh).map(p=>p.geometry.uuid),dimensionsBefore,'Views and colorways must preserve part geometry');
 assert.equal(m.internals.scale.y,1,'Component envelopes must not be stretched');
 for(const part of m.internals.children.filter(p=>p.geometry.type==='BoxGeometry')){
  const p=part.geometry.parameters;
  const radial=Math.hypot(Math.abs(part.position.x)+p.width/2,Math.abs(part.position.z)+p.depth/2);
  if(Math.abs(part.position.y)+p.height/2<44)assert(radial<8.8,'Internal envelope must fit inside the shell');
 }
 const cover=frameCoverage(m);
 assert(cover.tipTotalPct<=20,style+': cotton and stem must cover at most 20% of the camera frame');
 assert(cover.cottonNearestMm>=10,style+': cotton must stay at least 10 mm from the lens');
 const g=m.headGeometry,result={contactNdc:[+contact.x.toFixed(2),+contact.y.toFixed(2)],cottonFramePct:+cover.cottonPct.toFixed(1),tipFramePct:+cover.tipTotalPct.toFixed(1),skinFramePct:+cover.skinPct.toFixed(1),cottonNearestMm:+cover.cottonNearestMm.toFixed(1),workingDistanceMm:+m.workingDistance.toFixed(2),headLengthMm:+g.headLength.toFixed(2),cameraToTipAxisMm:+(g.tipX-g.cameraX).toFixed(2)};
 if(style==='tapered'){
  const cos=Math.cos(THREE.MathUtils.degToRad(g.bevelDeg)),xs=g.rim.map(v=>v.x);
  const camRim=(g.cameraX-Math.min(...xs))/cos-g.cameraBezelRadius;
  const collarRim=(Math.max(...xs)-g.tipX)/cos-g.collarRadius/cos;
  const camCollar=(g.tipX-g.cameraX)/cos-g.cameraBezelRadius-g.collarRadius/cos;
  assert(camRim>=.5,'Camera bezel must sit inside the bevel face with 0.5 mm margin');
  assert(collarRim>=.5,'Tip collar must sit inside the bevel face with 0.5 mm margin');
  assert(camCollar>=.5,'Camera bezel and tip collar need 0.5 mm clearance');
  const e=m.cameraEnvelope;e.updateMatrix();let wall=Infinity;const pp=e.geometry.attributes.position;
  for(let i=0;i<pp.count;i++){const v=new THREE.Vector3().fromBufferAttribute(pp,i).applyMatrix4(e.matrix);wall=Math.min(wall,g.innerRadiusAt(v.y)-Math.hypot(v.x,v.z));}
  assert(wall>=.3,'Camera module envelope must clear the head inner wall by 0.3 mm');
  assert(m.workingDistance>=20&&m.workingDistance<=80,'Contact must sit inside the selected 3.9 mm module 20-80 mm working range');
  const axisOff=THREE.MathUtils.radToDeg(m.aimPoint.clone().sub(m.lensPosition).normalize().angleTo(g.normal));
  assert(axisOff<1,'Camera must be flush: optical axis on the bevel normal');
  Object.assign(result,{bevelDeg:g.bevelDeg,faceSpanMm:[+g.faceSpanX.toFixed(2),+g.faceWidthZ.toFixed(2)],cameraBezelToRimMm:+camRim.toFixed(2),collarToRimMm:+collarRim.toFixed(2),cameraToCollarGapMm:+camCollar.toFixed(2),cameraEnvelopeWallClearanceMm:+wall.toFixed(2),opticalAxisOffBevelNormalDeg:+axisOff.toFixed(2)});
 }
 report[style]=result;
}
console.log(JSON.stringify({checks:'passed',...Object.fromEntries(Object.entries(report).map(([k,v])=>[k,{dimensions:createApplicator({head:k}).dimensions,...v}]))},null,2));
