import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createApplicator} from './src/applicator.js';
const m=createApplicator();m.pen.updateMatrixWorld(true);
const contact=m.pen.localToWorld(m.target.clone()).project(m.opticalCamera);
assert(Math.abs(contact.x)<1e-6&&Math.abs(contact.y)<1e-6&&contact.z<1,'Contact target must lie in the camera frame');
for(const x of [-5,5])for(const z of [-5,5]){
 const p=m.pen.localToWorld(m.target.clone().add(new THREE.Vector3(x,0,z))).project(m.opticalCamera);
 assert(Math.abs(p.x)<1&&Math.abs(p.y)<1&&p.z<1,'Surrounding contact area must remain in view');
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
console.log(JSON.stringify({checks:'passed',dimensions:m.dimensions,workingDistanceMm:+m.workingDistance.toFixed(2),contactNdc:contact.toArray(),componentEnvelopes:m.componentEnvelopes},null,2));
