import * as THREE from 'three';

// Millimetres throughout. Component envelopes are design targets, not selected hardware.
export const dimensions={diameter:20,bodyLength:88,wall:1.2,totalLength:126,cottonWidth:7.5,cottonLength:12,buttonTravel:.3};
export function createApplicator({head:headStyle='tapered'}={}){
 const tapered=headStyle==='tapered';
 const pen=new THREE.Group();pen.scale.setScalar(1/(20/.96));pen.rotation.z=-.34;
 const material=(color,metalness=0,roughness=.35)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
 const body=material(0xf8f8f3,.06,.32),head=material(0x294e80,.65,.25),silver=material(0xcbd3d9,.85,.28),dark=material(0x17232c,.15,.5),plastic=material(0xf4f3ed,.02,.5),pcb=material(0x215448,0,.7);
 const led=material(0xffffff);led.emissive.set(0xe4f3ff);led.emissiveIntensity=.5;
 const add=(geometry,mat,parent=pen)=>{const m=new THREE.Mesh(geometry,mat);parent.add(m);return m;};
 const cylinder=(r,h,y,mat,parent=pen)=>{const m=add(new THREE.CylinderGeometry(r,r,h,96),mat,parent);m.position.y=y;return m;};
 const box=(w,h,d,x,y,z,mat,parent)=>{const m=add(new THREE.BoxGeometry(w,h,d),mat,parent);m.position.set(x,y,z);return m;};
 const lathe=(profile,mat,parent=pen)=>add(new THREE.LatheGeometry(profile.map(([r,y])=>new THREE.Vector2(r,y)),96),mat,parent);
 const shellMaterial=body.clone();
 const shell=lathe([[9.6,-44],[10,-43.6],[10,43.6],[9.6,44],[8.8,44],[8.8,-44],[9.6,-44]],shellMaterial);
 // A real aperture reveals a separate curved push face, rather than painted-on hardware.
 shellMaterial.onBeforeCompile=s=>{
  s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 shellPosition;').replace('#include <begin_vertex>','#include <begin_vertex>\nshellPosition=position;');
  s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 shellPosition;').replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif(shellPosition.z>6.0 && length(vec2(shellPosition.x,shellPosition.y-20.0))<4.5) discard;');
 };
 const front=new THREE.Group();pen.add(front);
 // v4 tapered head: axisymmetric taper cut by a 20° bevel plane whose normal faces the cotton contact area.
 const bevel=THREE.MathUtils.degToRad(20),tb=Math.tan(bevel),taper=.13,faceY=64,camX=tapered?-2.3:-4.3,tipX=tapered?3.7:4.7;
 const normal=new THREE.Vector3(Math.sin(bevel),Math.cos(bevel),0);
 const faceAt=x=>faceY-x*tb;
 let cameraModule,lensLocal,stemExit,headRim=[];
 if(tapered){
  head.side=THREE.DoubleSide;
  const seg=96,rows=14,pos=[],idx=[];
  for(let i=0;i<=seg;i++){const a=i/seg*Math.PI*2,c=Math.cos(a),sn=Math.sin(a);
   const yTop=(faceY-(9.5+taper*44)*tb*c)/(1-taper*tb*c);
   for(let j=0;j<=rows;j++){const y=44+(yTop-44)*j/rows,r=9.5-taper*(y-44);pos.push(r*c,y,r*sn);}
   const rr=9.5-taper*(yTop-44);headRim.push(new THREE.Vector3(rr*c,yTop,rr*sn));}
  for(let i=0;i<seg;i++)for(let j=0;j<rows;j++){const a=i*(rows+1)+j,b=(i+1)*(rows+1)+j;idx.push(a,b,a+1,b,b+1,a+1);}
  const side=new THREE.BufferGeometry();side.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));side.setIndex(idx);side.computeVertexNormals();add(side,head,front);
  const capPos=[0,faceY,0],capIdx=[];headRim.forEach(v=>capPos.push(v.x,v.y,v.z));for(let i=1;i<=seg;i++)capIdx.push(0,i,i+1);
  const cap=new THREE.BufferGeometry();cap.setAttribute('position',new THREE.Float32BufferAttribute(capPos,3));cap.setIndex(capIdx);cap.computeVertexNormals();add(cap,head,front);
  cameraModule=new THREE.Group();front.add(cameraModule);cameraModule.position.set(camX,faceAt(camX),0);cameraModule.rotation.z=-bevel;
  // 3.9 mm-class endoscope module with LED ring: Ø6 mm bezel, flush-mounted on the bevel.
  cylinder(3,1,0,silver,cameraModule);cylinder(2.4,.3,.55,led,cameraModule);cylinder(1.95,.35,.7,dark,cameraModule);cylinder(1.2,.3,.85,material(0x153254,.7,.1),cameraModule);
  lensLocal=1;
  const socket=add(new THREE.CircleGeometry(1.6,40),dark,front);socket.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),normal);socket.position.set(tipX,faceAt(tipX),0).addScaledVector(normal,.03);
  stemExit=faceAt(tipX);
 }else{
  head.onBeforeCompile=s=>{
   s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 headPosition;').replace('#include <begin_vertex>','#include <begin_vertex>\nheadPosition=position;');
   s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 headPosition;').replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif(headPosition.y>49.0 && length(vec2(headPosition.x-4.7,headPosition.z))<1.5) discard;');
  };
  lathe([[9.5,44],[9.5,54.5],[9.1,55],[0,55],[0,53.8],[8.3,53.8],[8.3,44],[9.5,44]],head,front);
  cameraModule=new THREE.Group();front.add(cameraModule);cameraModule.position.set(-4.3,55.8,0);cameraModule.rotation.z=-Math.atan2(9,24.2);
  cylinder(3.9,1.3,0,silver,cameraModule);cylinder(3.1,.35,.82,led,cameraModule);cylinder(2.5,.4,1.15,dark,cameraModule);cylinder(1.65,.3,1.5,material(0x153254,.7,.1),cameraModule);
  lathe([[2.65,55.2],[2.65,55.78],[1.5,55.78],[1.5,49.2],[2.3,49.2],[2.3,55.2],[2.65,55.2]],dark,front).position.x=4.7;
  lensLocal=1.65;
 }
 cylinder(9.52,.35,44.2,silver,front);
 const tip=new THREE.Group();pen.add(tip);
 // Plug-in stem: buried spigot, axial stop, finger-grip collar and replaceable cotton.
 if(tapered){
  cylinder(1.35,6,stemExit-3,plastic,tip).position.x=tipX;
  cylinder(2.4,2.5,stemExit+.25,plastic,tip).position.x=tipX;
  cylinder(2,2,stemExit+2.5,plastic,tip).position.x=tipX;
  cylinder(1.35,4.5,stemExit+5.75,plastic,tip).position.x=tipX;
 }else{
  cylinder(1.35,6,53.5,plastic,tip).position.x=4.7;
  cylinder(2.4,1,56.7,plastic,tip).position.x=4.7;
  cylinder(2,3,58.7,plastic,tip).position.x=4.7;
  cylinder(1.35,10,65,plastic,tip).position.x=4.7;
 }
 const cotton=add(new THREE.SphereGeometry(3.75,40,28),material(0xfaf9f4,0,.95),tip);cotton.position.set(tipX,74,0);cotton.scale.y=1.6;
 const fibers=[];const random=i=>{const n=Math.sin(i*127.1+311.7)*43758.5453;return n-Math.floor(n);};
 for(let i=0;i<700;i++){const a=random(i*3)*Math.PI*2,z=random(i*3+1)*2-1,r=Math.sqrt(1-z*z),x=Math.cos(a)*r*3.75,y=z*6,d=Math.sin(a)*r*3.75;fibers.push(x+tipX,y+74,d,x*1.02+tipX,y*1.015+74,d*1.02);}
 const fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.Float32BufferAttribute(fibers,3));tip.add(new THREE.LineSegments(fg,new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.3})));
 const button=new THREE.Group();pen.add(button);button.position.y=20;
 function curvedFace(radius,offset,mat){
  const g=new THREE.RingGeometry(0,radius,96,18),p=g.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),r=Math.hypot(x,y);let groove=0;if(r>1.65&&r<3.98)groove=.018*(.5+.5*Math.sin(r*18-Math.atan2(y,x)));p.setZ(i,Math.sqrt(100-x*x)+offset-groove);}
  g.computeVertexNormals();return add(g,mat,button);
 }
 curvedFace(4.48,-.06,dark);const buttonFace=curvedFace(4.25,-.04,material(0xc7d0d5,.65,.42));
 buttonFace.material.onBeforeCompile=s=>{
  s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 facePosition;').replace('#include <begin_vertex>','#include <begin_vertex>\nfacePosition=position.xy;');
  s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 facePosition;').replace('#include <color_fragment>',`#include <color_fragment>
   float r=length(facePosition);
   if((abs(r-1.2)<.12 && facePosition.y<.7)||(abs(facePosition.x)<.12&&facePosition.y>.42&&facePosition.y<1.55)) diffuseColor.rgb=vec3(.08,.12,.15);`);
 };
 const internals=new THREE.Group();pen.add(internals);
 const battery=box(10,36,7,0,-21,0,silver,internals);battery.name='Battery envelope 10 × 36 × 7 mm';
 box(11,29,1,0,18,1,pcb,internals);
 for(let i=0;i<6;i++)box(2.8,3.5,1.2,(i%2-.5)*5.5,9+Math.floor(i/2)*8,2.1,dark,internals);
 for(const x of [-7,7])box(1,76,2,x,0,-2,plastic,internals);
 let cameraEnvelope,cameraRear;
 if(tapered){const c=cameraModule.position.clone().addScaledVector(normal,-2);cameraEnvelope=add(new THREE.CylinderGeometry(1.95,1.95,4,32),dark,internals);cameraEnvelope.position.copy(c);cameraEnvelope.rotation.z=-bevel;cameraRear=cameraModule.position.clone().addScaledVector(normal,-4);}
 else{cameraEnvelope=box(5,7,4,-4.3,49,0,dark,internals);cameraRear=new THREE.Vector3(-4.3,46,1);}
 cameraEnvelope.name='Camera envelope';
 box(4,4,1.8,0,20,6.5,dark,internals);box(2,2,1,0,20,8,plastic,internals);
 const usbBoard=box(12,8,1,0,-38,1,pcb,internals);
 for(const [color,x] of [[0xb95835,-2.5],[0x152c35,2.5]]){
  const path=new THREE.CatmullRomCurve3([new THREE.Vector3(x,-39,2),new THREE.Vector3(x,-2,4),new THREE.Vector3(x,35,3),cameraRear]);
  add(new THREE.TubeGeometry(path,48,.22,8,false),material(color),internals);
 }
 const tail=new THREE.Group();pen.add(tail);
 const tailShape=new THREE.Shape();tailShape.absarc(0,0,9.6,0,Math.PI*2,false);
 const hole=new THREE.Path();const w=8.5,h=3,r=1.1;hole.moveTo(-w/2+r,-h/2);hole.lineTo(w/2-r,-h/2);hole.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);hole.lineTo(w/2,h/2-r);hole.quadraticCurveTo(w/2,h/2,w/2-r,h/2);hole.lineTo(-w/2+r,h/2);hole.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);hole.lineTo(-w/2,-h/2+r);hole.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);tailShape.holes.push(hole);
 const cap=add(new THREE.ExtrudeGeometry(tailShape,{depth:1.6,bevelEnabled:true,bevelSize:.2,bevelThickness:.2,bevelSegments:3,curveSegments:48}),body,tail);cap.rotation.x=Math.PI/2;cap.position.y=-44.2;
 cylinder(8.65,3,-43,plastic,tail);
 const port=box(8.8,3,3.2,0,-43.5,0,dark,internals);box(6.5,.4,.55,0,-45.2,0,silver,internals);
 for(const x of [-6.5,6.5]){
  const screw=cylinder(.9,.25,-46,x===0?plastic:silver,tail);screw.position.x=x;
  box(1.2,.06,.16,x,-46.15,0,dark,tail);box(.16,.06,1.2,x,-46.15,0,dark,tail);
 }
 const status=add(new THREE.SphereGeometry(.45,16,12),led);status.position.set(0,12,9.99);
 const guides=new THREE.Group();pen.add(guides);
 const target=new THREE.Vector3(tipX,80,0);
 const lensPosition=new THREE.Vector3(0,lensLocal,0).applyAxisAngle(new THREE.Vector3(0,0,1),cameraModule.rotation.z).add(cameraModule.position);
 const opticalCamera=new THREE.PerspectiveCamera(60,1.5,.1,200);pen.add(opticalCamera);opticalCamera.position.copy(lensPosition);opticalCamera.up.set(0,0,1);
 const orientation=new THREE.Matrix4().lookAt(lensPosition,target,new THREE.Vector3(0,0,1));opticalCamera.quaternion.setFromRotationMatrix(orientation);
 const skin=add(new THREE.PlaneGeometry(30,22),material(0xd9aaa1,0,.85),guides);skin.rotation.x=Math.PI/2;skin.position.copy(target);skin.position.y+=.1;
 const hairs=[];for(let i=0;i<38;i++){const x=(random(i+800)-.5)*28+tipX,z=(random(i+900)-.5)*20;hairs.push(x,80.14,z,x+1.8,80.14,z+2.4);}
 const hg=new THREE.BufferGeometry();hg.setAttribute('position',new THREE.Float32BufferAttribute(hairs,3));guides.add(new THREE.LineSegments(hg,new THREE.LineBasicMaterial({color:0x4b3d36})));
 const opticalLines=new THREE.Group();guides.add(opticalLines);
 const lineMaterial=new THREE.LineBasicMaterial({color:0x477fa5,transparent:true,opacity:.65});
 pen.updateMatrixWorld(true);
 for(const [x,z] of [[-1,-1],[1,-1],[1,1],[-1,1]]){
  const ray=pen.worldToLocal(new THREE.Vector3(x,z,.5).unproject(opticalCamera)).sub(lensPosition); const end=lensPosition.clone().addScaledVector(ray,(80-lensPosition.y)/ray.y); const g=new THREE.BufferGeometry().setFromPoints([lensPosition,end]);opticalLines.add(new THREE.Line(g,lineMaterial));
 }
 const dimensionPoints=[new THREE.Vector3(-15,-46,0),new THREE.Vector3(-15,80,0),new THREE.Vector3(-17,80,0),new THREE.Vector3(-13,80,0),new THREE.Vector3(-17,-46,0),new THREE.Vector3(-13,-46,0)];
 const dg=new THREE.BufferGeometry().setFromPoints(dimensionPoints);const dimensionGuide=new THREE.LineSegments(dg,lineMaterial);guides.add(dimensionGuide);
 const grip=cylinder(10.2,36,-13,new THREE.MeshBasicMaterial({color:0x477fa5,wireframe:true,transparent:true,opacity:.10}),guides);
 const workingDistance=lensPosition.distanceTo(target);
 const headGeometry=tapered?{style:'tapered',bevelDeg:20,taperPerMm:taper,headLength:Math.max(...headRim.map(v=>v.y))-44,faceSpanX:Math.max(...headRim.map(v=>v.x))-Math.min(...headRim.map(v=>v.x)),faceWidthZ:2*Math.max(...headRim.map(v=>v.z)),cameraBezelRadius:3,collarRadius:2.4,cameraX:camX,tipX,rim:headRim,innerRadiusAt:y=>9.5-taper*(y-44)-1.2,faceAt,normal}:{style:'flat',headLength:11,faceSpanX:19,cameraX:-4.3,tipX};
 function setMode(mode){internals.visible=mode==='inside'||mode==='service';guides.visible=mode==='fit';button.visible=mode!=='inside';status.visible=mode!=='inside';shellMaterial.transparent=mode==='inside'||mode==='service';shellMaterial.opacity=mode==='inside'?.10:mode==='service'?.20:1;shellMaterial.depthWrite=mode!=='inside'&&mode!=='service';shellMaterial.needsUpdate=true;tail.position.y=mode==='service'?-12:0;tip.position.y=mode==='service'?14:0;}
 function setColor(color){body.color.set(color==='blue'?0xf8f8f3:0x20272c);body.metalness=color==='blue'?.06:.2;shellMaterial.color.copy(body.color);shellMaterial.metalness=body.metalness;head.color.set(color==='blue'?0x294e80:0xbfc8ce);head.metalness=color==='blue'?.65:.92;}
 setMode('hero');
 return {pen,headGeometry,cameraEnvelope,setMode,setColor,opticalCamera,opticalLines,dimensionGuide,grip,button,led,workingDistance,dimensions,internals,buttonFace,shell,componentEnvelopes:{battery:[10,36,7],board:[11,29,1],camera:tapered?'Ø3.9 × 4 mm module':[5,7,4]},target,lensPosition};
}




