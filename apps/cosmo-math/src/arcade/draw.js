import { W, H } from './engine.js'
const colors=['#8ef5c5','#ffb4d0','#bda4ff','#ffd586','#8cdcff','#ff9d89']
const round=(c,x,y,w,h,r=10)=>{c.beginPath();c.roundRect(x,y,w,h,r)}
function rect(c,x,y,w,h,fill,r=8){c.fillStyle=fill;round(c,x,y,w,h,r);c.fill()}
function circle(c,x,y,r,fill){c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=fill;c.fill()}
function line(c,x,y,x2,y2,color,width=2){c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke()}
function star(c,x,y,r=10,color='#ffe49a',angle=0){c.save();c.translate(x,y);c.rotate(angle);c.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,rad=i%2?r*.45:r;i?c.lineTo(Math.cos(a)*rad,Math.sin(a)*rad):c.moveTo(Math.cos(a)*rad,Math.sin(a)*rad)}c.closePath();c.fillStyle=color;c.fill();c.restore()}
function eyes(c,x,y,space=6){circle(c,x-space,y,3.5,'#15213c');circle(c,x+space,y,3.5,'#15213c');circle(c,x-space+1,y-1,1,'white');circle(c,x+space+1,y-1,1,'white')}
function creature(c,x,y,color='#a0edb9',size=1){c.save();c.translate(x,y);c.scale(size,size);rect(c,-16,-14,32,28,color,12);circle(c,-10,-14,6,color);circle(c,10,-14,6,color);eyes(c,0,-2);line(c,-3,7,3,7,'#274c4e',2);c.restore()}
function ship(c,x,y,color,t=0){c.save();c.translate(x,y);c.fillStyle=color;c.beginPath();c.moveTo(0,-21);c.quadraticCurveTo(10,-8,19,17);c.lineTo(0,10);c.lineTo(-19,17);c.quadraticCurveTo(-10,-8,0,-21);c.fill();circle(c,0,-2,6,'#12233c');circle(c,-1,-4,2,'#c8ffff');c.fillStyle='#ffd38b';c.beginPath();c.moveTo(-6,15);c.lineTo(0,24+Math.sin(t*25)*5);c.lineTo(6,15);c.fill();c.restore()}
function rock(c,o,t){c.save();c.translate(o.x,o.y);c.rotate(t*.4+o.phase);c.fillStyle='#7d779a';c.beginPath();for(let i=0;i<7;i++){const a=i*Math.PI*2/7,r=o.w*(i%2?.46:.54);i?c.lineTo(Math.cos(a)*r,Math.sin(a)*r):c.moveTo(Math.cos(a)*r,Math.sin(a)*r)}c.closePath();c.fill();circle(c,-o.w*.12,-o.w*.08,o.w*.1,'#615a7d');circle(c,o.w*.16,o.w*.15,o.w*.07,'#a19bb4');c.restore()}
function fruit(c,x,y,t,variant=0){if(variant===2){star(c,x,y,12,'#ffdc80',t);return}circle(c,x,y+2,11,variant===1?'#c1a2ff':'#ff94b2');circle(c,x-3,y-2,3,'#ffffff60');line(c,x,y-8,x+5,y-14,'#8df4c1',4);circle(c,x+7,y-12,4,'#8df4c1')}
function glow(c,x,y,r,color){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'#00000000');circle(c,x,y,r,g)}
function background(c,e){const v=e.game.variant,k=e.game.kind,t=e.time
 const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,['#101c3c','#261b49','#123343'][v]);g.addColorStop(1,['#22264a','#142c48','#25344a'][v]);c.fillStyle=g;c.fillRect(0,0,W,H)
 glow(c,300,70,130,['#866bc530','#d976ad25','#56cfac20'][v]);circle(c,300,66,34,'#dcd5ff12');circle(c,289,55,6,'#ffffff0a');circle(c,309,80,9,'#ffffff08')
 for(let i=0;i<45;i++){const x=(i*89+17)%W,y=((i*67+31+t*(k==='racer'||k==='asteroid'?18:2))%H);circle(c,x,y,i%4===0?1.4:.7,`rgba(218,238,255,${.22+(Math.sin(i+t)*.5+.5)*.28})`)}
 if(['runner','sling','catch'].includes(k)){for(let layer=0;layer<2;layer++){c.fillStyle=layer?'#283f55':'#243650';c.beginPath();c.moveTo(0,440);for(let x=0;x<=W;x+=10)c.lineTo(x,340+layer*40+Math.sin(x/90+layer*2)*25);c.lineTo(W,H);c.lineTo(0,H);c.fill()}rect(c,0,k==='sling'?424:405,W,75,'#243c49',0);line(c,0,k==='sling'?424:405,W,k==='sling'?424:405,'#94d9b544',2)}
}
export function draw(c,e){
 c.save();background(c,e)
 if(e.shake>0)c.translate(Math.sin(e.time*100)*3,Math.cos(e.time*90)*3)
 const p=e.player,k=e.game.kind,t=e.time,v=e.game.variant
 if(k==='snake'){
  c.strokeStyle='#b9ecc508';c.lineWidth=1;for(let x=0;x<W;x+=20){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke()}for(let y=0;y<H;y+=20){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke()}
  glow(c,e.food.x*20+10,e.food.y*20+10,30,'#ffce7c35');fruit(c,e.food.x*20+10,e.food.y*20+10,t,v)
  for(const s of e.stones)rect(c,s.x*20+1,s.y*20+1,18,18,'#747a98',5)
  e.snake.forEach((s,i)=>{rect(c,s.x*20+1,s.y*20+1,18,18,i===0?'#c5ffd7':i%2?'#79dca3':'#5abf91',i===0?7:5);if(i===0){const x=s.x*20+10,y=s.y*20+10;circle(c,x+e.direction.x*4+e.direction.y*4,y+e.direction.y*4+e.direction.x*4,2,'#183d39');circle(c,x+e.direction.x*4-e.direction.y*4,y+e.direction.y*4-e.direction.x*4,2,'#183d39')}})
 }
 if(k==='flap'){
  for(const o of e.objects){const top=o.y-o.gap/2,bottom=o.y+o.gap/2;rect(c,o.x-o.w/2,-12,o.w,top+12,v===1?'#5686aa':'#6974ac',12);rect(c,o.x-o.w/2,bottom,o.w,H-bottom+12,v===1?'#5686aa':'#6974ac',12);rect(c,o.x-o.w/2-5,top-16,o.w+10,17,'#9ec9da',6);rect(c,o.x-o.w/2-5,bottom,o.w+10,17,'#9ec9da',6);line(c,o.x-o.w/2+10,0,o.x-o.w/2+10,top-20,'#ffffff12',5);if(!o.passed)star(c,o.x,o.y,12,'#ffe7a1',t)}
  c.save();c.translate(p.x,p.y);c.rotate(Math.max(-.45,Math.min(.6,p.vy/400)));glow(c,0,0,34,'#ffd17628');c.fillStyle='#ffda88';c.beginPath();c.ellipse(0,0,19,16,0,0,Math.PI*2);c.fill();c.fillStyle='#f2b96c';c.beginPath();c.ellipse(-8,4+Math.sin(t*22)*5,10,7,-.4,0,Math.PI*2);c.fill();circle(c,7,-5,6,'#fff9e6');circle(c,9,-5,2.5,'#29344e');c.fillStyle='#ff9b76';c.beginPath();c.moveTo(17,0);c.lineTo(27,4);c.lineTo(16,7);c.fill();c.restore()
 }
 if(k==='sling'){
  const a=e.anchor,pull=e.dragging?e.pull:a
  line(c,a.x-13,a.y+66,a.x-9,a.y-8,'#a07d70',11);line(c,a.x+12,a.y+66,a.x+8,a.y-8,'#cda17a',11)
  line(c,a.x-9,a.y-8,pull.x,pull.y,'#f0b69b',5);line(c,a.x+8,a.y-8,pull.x,pull.y,'#f0b69b',4)
  if(!e.projectile){for(let i=1;i<14;i++){const s=i*.085;circle(c,a.x+e.aim.x*s,a.y+e.aim.y*s+(v===2?85:140)*s*s,2.5,'#ffdf9a55')}glow(c,pull.x,pull.y,25,'#ffd48228');circle(c,pull.x,pull.y,12,'#ffd88c');eyes(c,pull.x,pull.y-2,4)}
  for(const o of e.objects){if(o.type==='alien')creature(c,o.x,o.y,'#a7e7b2');else if(o.type==='balloon'){line(c,o.x,o.y+15,o.x-3,o.y+50,'#b6a7e5',1);c.fillStyle=colors[Math.floor(o.phase)%6];c.beginPath();c.ellipse(o.x,o.y,17,21,0,0,Math.PI*2);c.fill();eyes(c,o.x,o.y,5)}else{rect(c,o.x-o.w/2,o.y-o.h/2,o.w,o.h,'#bc946e',5);rect(c,o.x-o.w/2+4,o.y-o.h/2+4,o.w-8,o.h-8,'#d6ad82',3);line(c,o.x-10,o.y-10,o.x+10,o.y+10,'#b58a66',2);line(c,o.x+10,o.y-10,o.x-10,o.y+10,'#b58a66',2)}}
  if(e.projectile){const b=e.projectile;glow(c,b.x,b.y,30,'#ffc88338');circle(c,b.x,b.y,12,'#ffdb8e');eyes(c,b.x,b.y,4);for(let i=1;i<5;i++)circle(c,b.x-b.vx*.018*i,b.y-b.vy*.018*i,6-i,'#ffcb7b55')}
 }
 if(k==='breakout'){
  for(const o of e.objects){rect(c,o.x-o.w/2,o.y-o.h/2,o.w,o.h,colors[o.color],5);rect(c,o.x-o.w/2+4,o.y-o.h/2+3,o.w-8,4,'#ffffff35',2);if(o.hp>1)circle(c,o.x,o.y,3,'#fff9')}
  if(v===1){glow(c,180,260,50,'#b89bff33');circle(c,180,260,27,'#b8a1f2');circle(c,180,260,17,'#534c8c');star(c,180,260,10)}
  glow(c,e.ball.x,e.ball.y,26,'#d8f8ff30');circle(c,e.ball.x,e.ball.y,8,'#ecfbff');rect(c,p.x-p.w/2,p.y-7,p.w,14,'#aaf5db',7);rect(c,p.x-p.w/2+7,p.y-5,p.w-14,3,'#ffffff99',2)
 }
 if(k==='blaster'){
  for(const b of e.shots){glow(c,b.x,b.y,13,b.super?'#b9a0ff55':'#8dffff25');rect(c,b.x-b.w/2,b.y-b.h/2,b.w,b.h,b.super?'#e0b8ff':'#9bfff2',3)}
  for(const o of e.objects){circle(c,o.x,o.y-5,12,'#bcb1ef');c.fillStyle=o.hp>1?'#f0b1ce':'#9da5e3';c.beginPath();c.ellipse(o.x,o.y+4,22,8,0,0,Math.PI*2);c.fill();eyes(c,o.x,o.y-5,4);circle(c,o.x-13,o.y+4,2,'#e5ffaa');circle(c,o.x+13,o.y+4,2,'#e5ffaa')}
  ship(c,p.x,p.y,e.game.color,t)
 }
 if(k==='runner'){
  for(let i=0;i<12;i++){const x=(i*40-e.distance%40);rect(c,x,410,23,4,'#65886f55',2)}
  for(const o of e.objects){if(o.type==='star')star(c,o.x,o.y,12,'#ffe497',t);else if(v===1){rect(c,o.x-5,o.y-5,10,28,'#dfc4a5');c.fillStyle='#bda3e3';c.beginPath();c.ellipse(o.x,o.y-9,o.w/2+4,15,0,Math.PI,0);c.fill();circle(c,o.x-7,o.y-14,3,'#f8e2ff');circle(c,o.x+7,o.y-16,2,'#f8e2ff')}else if(v===2){c.fillStyle='#ffab83';c.beginPath();c.moveTo(o.x-o.w/2,402);c.lineTo(o.x,402-o.h);c.lineTo(o.x+o.w/2,402);c.fill()}else rock(c,{...o,phase:0},0)}
  const bob=p.y===382?Math.sin(t*19)*2:0;creature(c,p.x,p.y+bob,'#ffce9b');c.fillStyle='#ffce9b';c.beginPath();c.moveTo(p.x-12,p.y-10);c.lineTo(p.x-16,p.y-28);c.lineTo(p.x-1,p.y-13);c.moveTo(p.x+1,p.y-13);c.lineTo(p.x+16,p.y-28);c.lineTo(p.x+12,p.y-10);c.fill();line(c,p.x-9,p.y+15,p.x-9+Math.sin(t*20)*5,p.y+21,'#ffe4bb',5);line(c,p.x+9,p.y+15,p.x+9-Math.sin(t*20)*5,p.y+21,'#ffe4bb',5)
 }
 if(k==='catch'){
  for(const o of e.objects)if(o.type==='rock')rock(c,o,t);else fruit(c,o.x,o.y,t,v)
  c.strokeStyle='#deb9a6';c.lineWidth=4;c.beginPath();c.arc(p.x,p.y-5,24,Math.PI,0);c.stroke();rect(c,p.x-32,p.y-7,64,26,'#ce9a7c',8);for(let i=-2;i<=2;i++)line(c,p.x+i*10,p.y-4,p.x+i*10,p.y+14,'#e8bc9455',3);line(c,p.x-30,p.y-4,p.x+30,p.y-4,'#f0caa2',6)
 }
 if(k==='asteroid'){
  for(const o of e.objects)if(o.type==='rock')rock(c,o,t);else {glow(c,o.x,o.y,24,'#9dffdf33');c.save();c.translate(o.x,o.y);c.rotate(t);c.fillStyle='#a0f2de';c.beginPath();c.moveTo(0,-13);c.lineTo(10,0);c.lineTo(0,13);c.lineTo(-10,0);c.fill();line(c,0,-10,0,10,'#ffffff88',2);c.restore()}
  ship(c,p.x,p.y,e.game.color,t)
 }
 if(k==='jumper'){
  for(const o of e.platforms){rect(c,o.x-o.w/2,o.y-5,o.w,o.h,v===2?'#6bbd9c':v===1?'#bb9ae7':'#b5d8ef',7);rect(c,o.x-o.w/2+5,o.y-5,o.w-10,4,'#ffffff66',4);if(v===0){circle(c,o.x-14,o.y-8,11,'#bddcf2');circle(c,o.x+4,o.y-10,14,'#cce7fa')}}
  creature(c,p.x,p.y,'#a7eead');circle(c,p.x-11,p.y-14,6,'#baffc0');circle(c,p.x+11,p.y-14,6,'#baffc0');circle(c,p.x-11,p.y-14,2,'#27484a');circle(c,p.x+11,p.y-14,2,'#27484a')
 }
 if(k==='racer'){
  rect(c,8,0,344,H,'#242b45',0);rect(c,13,0,4,H,'#97d3d533',0);rect(c,343,0,4,H,'#97d3d533',0)
  for(let i=0;i<9;i++)for(const x of [120,240])rect(c,x-2,(i*75+e.distance)%675-100,4,34,'#a7b4d844',2)
  for(const o of e.objects){if(o.type==='energy'){star(c,o.x,o.y,12,'#f8e99b',t);continue}drawCar(c,o.x,o.y,'#b593d4')}
  glow(c,p.x,p.y+30,35,e.input.held?'#ffc37a44':'#77f2ef22');drawCar(c,p.x,p.y,e.game.color);if(e.input.held){line(c,p.x-12,p.y+26,p.x-12,p.y+46+Math.sin(t*35)*10,'#ffd391',6);line(c,p.x+12,p.y+26,p.x+12,p.y+46+Math.sin(t*35)*10,'#ffd391',6)}
 }
 if(e.shield>0&&k!=='snake'&&k!=='sling'&&k!=='breakout'){c.strokeStyle='#b9f6ed99';c.lineWidth=2;c.beginPath();c.arc(p.x,p.y,30+Math.sin(t*8)*2,0,Math.PI*2);c.stroke()}
 for(const o of e.particles){c.globalAlpha=Math.min(1,o.life*2);circle(c,o.x,o.y,o.r,o.color)}c.globalAlpha=1
 c.textAlign='center';c.font='bold 16px ui-rounded, system-ui';for(const o of e.popups){c.globalAlpha=Math.min(1,o.life*2);c.fillStyle='#fff3bf';c.fillText(o.text,o.x,o.y)}c.globalAlpha=1
 const stageTime=t%50;if(e.stage>1&&stageTime<2.5){const alpha=Math.min(1,stageTime*3,(2.5-stageTime)*2);c.globalAlpha=alpha;rect(c,70,204,220,64,'#111c3de8',18);c.fillStyle='#d8fff0';c.font='bold 19px ui-rounded, system-ui';c.fillText(`${e.stage} / 4`,180,244);c.globalAlpha=1}
 c.restore()
}
function drawCar(c,x,y,color){rect(c,x-24,y-24,7,16,'#0f1932',3);rect(c,x+17,y-24,7,16,'#0f1932',3);rect(c,x-24,y+13,7,16,'#0f1932',3);rect(c,x+17,y+13,7,16,'#0f1932',3);rect(c,x-19,y-32,38,64,color,12);rect(c,x-14,y-17,28,15,'#273d57',5);rect(c,x-12,y+9,24,12,'#273d57',4);rect(c,x-15,y-29,8,4,'#fff4b2',2);rect(c,x+7,y-29,8,4,'#fff4b2',2);line(c,x-6,y-7,x-6,y+5,'#ffffff55',2)}
