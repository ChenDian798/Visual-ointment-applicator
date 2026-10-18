import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createApplicator} from './src/applicator.js';
const report={};
for(const style of ['tapered','flat']){
 const m=createApplicator({head:style});m.pen.updateMatrixWorld(true);
 const contact=m.pen.localToWorld(m.target.clone()).project(m.opticalCamera);
 assert(Math.abs(contact.x)<1e-6&&Math.abs(contact.y)<1e-6&&contact.z<1,style+': contact target must lie in the camera frame');
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
 const g=m.headGeometry,result={workingDistanceMm:+m.workingDistance.toFixed(2),headLengthMm:+g.headLength.toFixed(2),cameraToTipAxisMm:+(g.tipX-g.cameraX).toFixed(2)};
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
  const lensToTarget=m.target.clone().sub(m.lensPosition).normalize();
  const aim=THREE.MathUtils.radToDeg(lensToTarget.angleTo(g.normal));
  assert(aim<15,'Bevel normal should point near the contact target');
  Object.assign(result,{bevelDeg:g.bevelDeg,faceSpanMm:[+g.faceSpanX.toFixed(2),+g.faceWidthZ.toFixed(2)],cameraBezelToRimMm:+camRim.toFixed(2),collarToRimMm:+collarRim.toFixed(2),cameraToCollarGapMm:+camCollar.toFixed(2),cameraEnvelopeWallClearanceMm:+wall.toFixed(2),opticalAxisOffBevelNormalDeg:+aim.toFixed(1)});
 }
 report[style]=result;
}
console.log(JSON.stringify({checks:'passed',dimensions:createApplicator().dimensions,...report},null,2));
