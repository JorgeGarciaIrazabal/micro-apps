import { SlingWorld } from './sling.js'
import { SESSION_SECONDS, STAGE_SECONDS } from './catalog.js'
export const W = 360, H = 480
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
export const hit = (a, b, pad = 0) => Math.abs(a.x-b.x) < (a.w+b.w)/2+pad && Math.abs(a.y-b.y) < (a.h+b.h)/2+pad
const distance = (a,b) => Math.hypot(a.x-b.x,a.y-b.y)

export class ArcadeEngine {
  constructor(game, random = Math.random) {
    this.game=game; this.random=random; this.time=0; this.score=0; this.stage=1; this.completed=false
    this.particles=[]; this.objects=[]; this.shots=[]; this.popups=[]; this.shield=2; this.cooldown=0; this.shake=0; this.events=[]
    this.streak=0;this.combo=1;this.comboClock=0;this.power=null;this.powerTime=0;this.pickups=[];this.pickupClock=10;this.notice=null;this.snacks=0;this.fuel=100;this.extraBalls=[];this.enemyShots=[];this.bossClock=24;this.portalLock=0
    this.spawn=0; this.shotClock=0; this.input={left:false,right:false,up:false,down:false,held:false}; this.target={x:180,y:390}; this.hasTarget=false
    this.player={x:180,y:380,w:28,h:28,vx:0,vy:0}; this.distance=0
    this.init()
  }
  rand(a,b) { return a+this.random()*(b-a) }
  init() {
    const k=this.game.kind
    if(k==='snake') { this.snake=[{x:8,y:12},{x:7,y:12},{x:6,y:12}];this.direction={x:1,y:0};this.nextDirection={x:1,y:0};this.snakeTick=0;this.stones=this.game.variant===2?[{x:4,y:6},{x:13,y:6},{x:4,y:18},{x:13,y:18}]:[];this.food=this.newFood();this.fruitClock=0 }
    if(k==='flap') {this.player={...this.player,x:85,y:240};this.spawn=1.5}
    if(k==='sling') {this.anchor={x:70,y:360};this.aim={x:250,y:-280};this.projectile=null;this.reload=0;this.sling=new SlingWorld(this)}
    if(k==='breakout') {this.player.y=438;this.player.w=88;this.player.h=14;this.ball={x:180,y:340,vx:120,vy:-175,r:8};this.bricks()}
    if(k==='runner') {this.player.x=72;this.player.y=382;this.player.h=32;this.jumps=0;this.spawn=1.2}
    if(k==='jumper') {this.player.y=350;this.player.vy=-300;this.platforms=Array.from({length:8},(_,i)=>({x:i===0?180:this.rand(45,315),y:440-i*64,w:85,h:12,phase:this.rand(0,6)}));this.height=0}
    if(k==='racer') {this.lane=1;this.player.y=380;this.spawn=1.5}
  }
  newFood() {
    for(let i=0;i<500;i++){const p={x:Math.floor(this.rand(1,17)),y:Math.floor(this.rand(1,23))};if(!this.snake.some(s=>s.x===p.x&&s.y===p.y)&&!(this.stones||[]).some(s=>s.x===p.x&&s.y===p.y))return {...p,golden:this.snacks%4===3}}
    return {x:1,y:1}
  }
  bricks() {this.objects=Array.from({length:30},(_,i)=>({x:30+i%6*60,y:65+Math.floor(i/6)*29,w:53,h:22,type:'brick',hp:this.game.variant===2&&i<12?2:1,color:i%6,bomb:i===8||i===22}))}
  burst(x,y,color='#ffd166',n=12) {for(let i=0;i<n;i++)this.particles.push({x,y,vx:this.rand(-120,120),vy:this.rand(-150,100),life:this.rand(.3,.8),color,r:this.rand(2,5)});if(this.particles.length>220)this.particles.splice(0,this.particles.length-220)}
  announce(type, data = {}) { this.notice = { type, data, life: 2.5 } }
  gain(x,y,n=10) {
    this.streak = this.comboClock > 0 ? this.streak + 1 : 1
    this.comboClock = 3.5
    this.combo = Math.min(4, 1 + Math.floor(this.streak / 4))
    const points = n * this.combo
    this.score += points
    this.burst(x,y,this.game.color)
    this.popups.push({x,y,text:`+${points}`,life:.8})
    if(this.popups.length>20)this.popups.shift()
    if(this.streak%4===0)this.announce('combo',{combo:this.combo})
    this.events.push('score')
  }
  setPower(type, seconds=8) {
    this.power=type;this.powerTime=seconds;this.announce(type);this.events.push('power')
    if(type==='multi') {
      this.player.w=116
      for(const sign of [-1,1])this.extraBalls.push({...this.ball,vx:sign*160,vy:-190})
      this.extraBalls=this.extraBalls.slice(-4)
    }
    if(type==='turbo')this.fuel=100
  }
  crash() {
    if(this.shield>0||['ghost','bubble','turbo'].includes(this.power))return
    this.shield=2;this.shake=.25;this.streak=0;this.combo=1;this.comboClock=0
    this.burst(this.player.x,this.player.y,'#ffa0bc',18);this.events.push('bump')
  }
  updateFlavor(dt) {
    this.comboClock=Math.max(0,this.comboClock-dt)
    if(this.comboClock===0){this.streak=0;this.combo=1}
    this.portalLock=Math.max(0,this.portalLock-dt)
    if(this.notice&&(this.notice.life-=dt)<=0)this.notice=null
    this.powerTime=Math.max(0,this.powerTime-dt)
    if(this.powerTime===0&&this.power){this.power=null;if(this.game.kind==='breakout')this.player.w=88}
    if(['snake','flap','sling'].includes(this.game.kind))return
    this.pickupClock-=dt
    if(this.pickupClock<=0){this.pickupClock=18;this.pickups.push({x:this.game.kind==='racer'?60+Math.floor(this.rand(0,3))*120:this.rand(40,320),y:-15,w:26,h:26})}
    for(const o of this.pickups){
      if(this.game.kind==='runner'){if(!o.placed){o.x=390;o.y=310;o.placed=true}o.x-=(140+this.stage*12)*dt}
      else o.y+=(this.game.kind==='racer'?180:95)*dt
      if(hit(o,this.player,10)){
        o.dead=true
        const power={breakout:'multi',blaster:'triple',runner:'wings',catch:'magnet',asteroid:'slow',jumper:'rocket',racer:'turbo'}[this.game.kind]
        this.setPower(power);this.gain(o.x,o.y,30)
      }
    }
    this.pickups=this.pickups.filter(o=>!o.dead&&o.y<510&&o.x>-30)
  }
  action() {
    if(this.completed)return
    const k=this.game.kind
    if(k==='flap') {this.player.vy=-205;this.burst(this.player.x-12,this.player.y,'#a5eeff',4)}
    if(k==='runner' && this.jumps<2) {this.player.vy=-360;this.jumps++;this.burst(this.player.x,this.player.y+15,'#ffd9a3',6)}
    if(k==='sling'){if(this.projectile)this.sling.activate();else if(this.reload<=0)this.sling.launch(this.aim)}
    if(['blaster','asteroid'].includes(k) && this.cooldown<=0) {this.cooldown=5;this.burst(this.player.x,this.player.y,'#b6fbff',35);if(k==='asteroid'){for(const o of this.objects)if(o.type==='rock'&&distance(o,this.player)<160){o.dead=true;this.gain(o.x,o.y,20)}}else for(let i=-2;i<=2;i++)this.shots.push({x:this.player.x,y:this.player.y,vx:i*65,vy:-420,w:8,h:28,super:true});this.events.push('launch')}
  }
  steer(dx,dy=0) {
    if(this.game.kind==='snake') {if(dx!==-this.direction.x||dy!==-this.direction.y)this.nextDirection={x:dx,y:dy}}
    if(this.game.kind==='racer')this.lane=clamp(this.lane+dx,0,2)
  }
  pointer(x,y,phase) {
    const k=this.game.kind
    if(k==='sling') {
      if(phase==='down'&&!this.projectile){this.dragging=true;this.pull={x:this.anchor.x,y:this.anchor.y}}
      if(this.dragging){const dx=clamp(x-this.anchor.x,-95,40),dy=clamp(y-this.anchor.y,-40,95);this.pull={x:this.anchor.x+dx,y:this.anchor.y+dy};this.aim={x:clamp(-dx*5.5,90,520),y:clamp(-dy*5.5,-520,-95)}}
      if(phase==='up'&&this.dragging){this.dragging=false;this.action()}
      return
    }
    if(['breakout','blaster','catch','asteroid','jumper'].includes(k)){this.target={x,y};this.hasTarget=true}
    if(phase==='down'&&['flap','runner'].includes(k))this.action()
  }
  update(dt) {
    if(this.completed)return
    dt=clamp(dt,0,.05);this.time+=dt;this.stage=Math.min(4,1+Math.floor(this.time/STAGE_SECONDS));this.shield=Math.max(0,this.shield-dt);this.cooldown=Math.max(0,this.cooldown-dt);this.shake=Math.max(0,this.shake-dt)
    if(this.time>=SESSION_SECONDS){this.completed=true;this.events.push('complete');return}
    const p=this.player, k=this.game.kind, v=this.game.variant
    this.updateFlavor(dt)
    this.particles=this.particles.filter(o=>(o.life-=dt)>0);for(const o of this.particles){o.x+=o.vx*dt;o.y+=o.vy*dt;o.vy+=120*dt}
    this.popups=this.popups.filter(o=>(o.life-=dt)>0);for(const o of this.popups)o.y-=32*dt
    if(['breakout','blaster','catch','asteroid','jumper'].includes(k)) {
      const speed=k==='asteroid'?220:290
      if(this.input.left||this.input.right) {p.x+=(Number(this.input.right)-Number(this.input.left))*speed*dt;this.hasTarget=false}
      else if(this.hasTarget)p.x+=(clamp(this.target.x,18,342)-p.x)*Math.min(1,dt*15)
      p.x=clamp(p.x,p.w/2,W-p.w/2)
      if(k==='asteroid'){if(this.input.up||this.input.down){p.y+=(Number(this.input.down)-Number(this.input.up))*speed*dt}else if(this.hasTarget)p.y+=(clamp(this.target.y,45,435)-p.y)*Math.min(1,dt*12);p.y=clamp(p.y,40,440)}
    }
    if(k==='snake') {
      this.snakeTick+=dt
      if(v===1){this.fruitClock+=dt;if(this.fruitClock>8){this.food=this.newFood();this.fruitClock=0}}
      const interval=.16-this.stage*.012
      if(this.snakeTick>=interval){this.snakeTick-=interval;this.direction={...this.nextDirection};const head={x:(this.snake[0].x+this.direction.x+18)%18,y:(this.snake[0].y+this.direction.y+24)%24};if(v===2&&this.portalLock===0){for(const [from,to] of [[{x:3,y:5},{x:14,y:18}],[{x:14,y:18},{x:3,y:5}]])if(head.x===from.x&&head.y===from.y){head.x=to.x;head.y=to.y;this.portalLock=1;this.announce('portal');break}}const eaten=head.x===this.food.x&&head.y===this.food.y
        if(this.snake.slice(0,eaten?undefined:-1).some(s=>s.x===head.x&&s.y===head.y)||this.stones.some(s=>s.x===head.x&&s.y===head.y)){if(this.shield<=0&&this.power!=='ghost'){this.crash();this.snake=this.snake.slice(0,3)}}
        p.x=head.x*20+10;p.y=head.y*20+10;this.snake.unshift(head);if(!eaten)this.snake.pop();else{const golden=this.food.golden;this.snacks++;this.gain(head.x*20+10,head.y*20+10,golden?75:v===1?30:20);if(golden)this.setPower('ghost');this.food=this.newFood();this.fruitClock=0}
        if(this.snake.length>36){this.score+=30;this.snake=this.snake.slice(0,18)}
      }
    }
    if(k==='flap') {
      p.vy+=440*dt;p.y+=p.vy*dt
      if(p.y<20){p.y=20;p.vy=45}if(p.y>H-22){this.crash();p.y=H-22;p.vy=-205}
      this.spawn-=dt;if(this.spawn<=0){this.spawn=2.3;this.objects.push({x:400,y:this.rand(145,330),w:58,gap:185-this.stage*6,type:'gate',passed:false,phase:this.rand(0,6),star:true,golden:Math.floor(this.time/2.3)%5===0})}
      for(const o of this.objects){o.x-=(80+this.stage*7)*dt;if(v===1)o.y+=Math.sin(this.time*1.5+o.phase)*17*dt;if(v===2)o.y+=Math.sin(this.time+o.phase)*25*dt;if(Math.abs(p.x-o.x)<o.w/2+11&&Math.abs(p.y-o.y)>o.gap/2-12){this.crash();p.vy=-130}if(o.star&&Math.abs(p.x-o.x)<24&&Math.abs(p.y-o.y)<30){o.star=false;this.gain(o.x,o.y,o.golden?100:50);if(o.golden)this.setPower('bubble');else this.announce('perfect')}if(!o.passed&&o.x<p.x){o.passed=true;this.gain(p.x,p.y,10)}}
    }
    if(k==='sling') { this.reload-=dt; this.sling.step(dt) }
    if(k==='breakout') {
      for(const b of [this.ball,...this.extraBalls]) {
        b.x+=b.vx*dt;b.y+=b.vy*dt
        if(b.x<8||b.x>352){b.vx*=-1;b.x=clamp(b.x,8,352)}if(b.y<12)b.vy=Math.abs(b.vy)
        if(b.vy>0&&hit({x:b.x,y:b.y,w:16,h:16},p)){b.vy=-Math.max(175,Math.abs(b.vy));b.vx=(b.x-p.x)*5;b.y=p.y-18}
        for(const o of this.objects)if(!o.dead&&hit({x:b.x,y:b.y,w:16,h:16},o)){
          o.hp--;b.vy*=-1
          if(o.hp<=0){o.dead=true;this.gain(o.x,o.y,15)
            if(o.bomb){this.announce('burst');this.shake=.18;for(const other of this.objects)if(!other.dead&&distance(o,other)<78){other.dead=true;this.gain(other.x,other.y,15)}}
          }break
        }
        if(v===1&&Math.hypot(b.x-180,b.y-260)<36){const angle=Math.atan2(b.y-260,b.x-180);b.vx=Math.cos(angle)*220;b.vy=Math.sin(angle)*220;b.x=180+Math.cos(angle)*38;b.y=260+Math.sin(angle)*38}
        if(b.y>H+15){if(b===this.ball){this.crash();b.x=p.x;b.y=350;b.vy=-175;b.vx=this.rand(-110,110)}else b.dead=true}
      }
      this.extraBalls=this.extraBalls.filter(b=>!b.dead)
      this.objects=this.objects.filter(o=>!o.dead)
      if(!this.objects.length){this.bricks();this.gain(180,200,75);this.announce('clear')}
    }
    if(k==='blaster') {
      this.shotClock-=dt
      if(this.shotClock<=0){this.shotClock=this.power==='triple'?.15:.22;for(const vx of this.power==='triple'?[-95,0,95]:[0])this.shots.push({x:p.x,y:p.y-20,vx,vy:-380,w:5,h:18})}
      this.spawn-=dt
      if(this.spawn<=0){this.spawn=.7-this.stage*.07;this.objects.push({x:this.rand(25,335),y:-20,w:30,h:25,type:'enemy',hp:v===1?2:1,phase:this.rand(0,6),speed:this.rand(45,70)+this.stage*8})}
      this.bossClock-=dt
      if(this.bossClock<=0&&!this.objects.some(o=>o.type==='boss')){this.bossClock=38;this.objects.push({x:180,y:-40,w:100,h:45,type:'boss',hp:30,maxHp:30,phase:0,shotClock:1});this.announce('boss')}
      for(const o of this.objects){
        if(o.type==='boss'){o.y=Math.min(85,o.y+45*dt);o.x=180+Math.sin(this.time*.8)*105;o.shotClock-=dt;if(o.shotClock<=0){o.shotClock=1.5;for(const vx of [-65,0,65])this.enemyShots.push({x:o.x,y:o.y+22,vx,vy:145,w:10,h:10})}}
        else{o.y+=o.speed*dt;o.x+=Math.sin(this.time*2+o.phase)*(v===2?65:30)*dt}
        if(hit(o,p)){this.crash();if(o.type!=='boss')o.dead=true}
      }
      for(const b of this.shots){b.x+=b.vx*dt;b.y+=b.vy*dt;for(const o of this.objects)if(!o.dead&&!b.dead&&hit(b,o)){o.hp-=b.super?4:1;b.dead=true;if(o.hp<=0){o.dead=true;this.gain(o.x,o.y,o.type==='boss'?250:20);if(o.type==='boss'){this.announce('bossClear');this.shake=.3}}}}
      for(const b of this.enemyShots){b.x+=b.vx*dt;b.y+=b.vy*dt;if(hit(b,p)){b.dead=true;this.crash()}}
      this.enemyShots=this.enemyShots.filter(b=>!b.dead&&b.y<510)
      this.shots=this.shots.filter(b=>!b.dead&&b.y>-30)
    }
    if(k==='runner') {
      p.vy+=(this.power==='wings'?530:850)*dt;p.y+=p.vy*dt;if(p.y>=382){p.y=382;p.vy=0;this.jumps=0}
      this.distance+=(140+this.stage*12)*dt
      this.spawn-=dt;if(this.spawn<=0){this.spawn=this.rand(1.4,2.1);this.objects.push({x:400,y:385,w:this.rand(24,38),h:this.rand(24,44),type:'obstacle',passed:false});if(v===2&&this.random()>.5)this.objects.at(-1).y=330;if(this.random()>.3){const y=this.rand(260,310);for(let i=0;i<4;i++)this.objects.push({x:440+i*30,y:y-Math.sin(i*Math.PI/3)*35,w:20,h:20,type:'star'})}}
      for(const o of this.objects){o.x-=(140+this.stage*12)*dt;if(hit(o,p,-4)){if(o.type==='star'){o.dead=true;this.gain(o.x,o.y,20)}else if(v===1&&p.vy>0&&p.y<o.y-8){o.dead=true;p.vy=-400;this.jumps=1;this.gain(o.x,o.y,15)}else this.crash()}if(o.type==='obstacle'&&!o.passed&&o.x<p.x-25){o.passed=true;this.score+=10}}
    }
    if(k==='catch') {
      p.y=424;p.w=65;p.h=28;this.spawn-=dt;if(this.spawn<=0){this.spawn=.55-this.stage*.05;this.objects.push({x:this.rand(25,335),y:-20,w:25,h:25,type:this.random()<.22?'rock':'fruit',speed:this.rand(100,145)+this.stage*10,phase:this.rand(0,6)})}
      for(const o of this.objects){if(this.power==='magnet'&&o.type==='fruit'&&distance(o,p)<135){o.x+=(p.x-o.x)*dt*5;o.y+=(p.y-o.y)*dt*2}o.y+=o.speed*dt;if(v===1&&o.y>445&&!o.bounced&&o.type==='fruit'){o.y=445;o.speed=-120;o.bounced=true}if(v===1&&o.bounced)o.speed+=180*dt;if(v===2)o.x+=Math.sin(o.phase+this.time*2)*40*dt;if(hit(o,p)){o.dead=true;if(o.type==='rock')this.crash();else this.gain(o.x,o.y,15)}}
    }
    if(k==='asteroid') {
      this.spawn-=dt;if(this.spawn<=0){this.spawn=.6-this.stage*.06;const rock=this.random()>.26;this.objects.push({x:this.rand(20,340),y:-35,w:rock?this.rand(25,52):22,h:30,type:rock?'rock':this.random()<.3?'pod':'crystal',speed:this.rand(60,130)+this.stage*12,vx:this.rand(-25,25),phase:this.rand(0,6)})}
      for(const o of this.objects){if(v===2&&o.type==='rock')o.speed+=18*dt;o.y+=o.speed*dt*(this.power==='slow'?.45:1);o.x+=o.vx*dt;if(v===1)o.x+=Math.sin(this.time+o.phase)*40*dt;if(hit(o,p,-3)){o.dead=true;if(o.type==='rock')this.crash();else {this.gain(o.x,o.y,o.type==='pod'?100:25);if(o.type==='pod')this.announce('rescue')}}}
    }
    if(k==='jumper') {
      const oldY=p.y;if(this.power==='rocket')p.vy=-260;else p.vy+=620*dt;p.y+=p.vy*dt
      for(const o of this.platforms){if(v===1)o.x=clamp(o.x+Math.sin(this.time+o.phase)*30*dt,40,320);if(p.vy>0&&oldY+14<=o.y&&p.y+14>=o.y&&Math.abs(p.x-o.x)<o.w/2+9){p.y=o.y-15;p.vy=o.spring?-440:-330;if(v===2)o.used=true;this.gain(p.x,p.y,o.spring?30:5);if(o.spring)this.announce('spring');break}}
      this.platforms=this.platforms.filter(o=>!o.used)
      if(p.y<205){const dy=205-p.y;p.y=205;this.height+=dy;for(const o of this.platforms)o.y+=dy;while(this.platforms.length&&this.platforms[0].y>H+20)this.platforms.shift();while(this.platforms.length<8){const top=this.platforms.at(-1);this.platforms.push({x:this.rand(45,315),y:top.y-64,w:80,h:12,phase:this.rand(0,6),spring:this.random()<.25})}}
      if(p.y>H+15){this.crash();p.y=380;p.vy=-330;this.platforms[0]={x:p.x,y:420,w:110,h:12,phase:0}}
    }
    if(k==='racer') {
      if(this.hasTarget)this.lane=clamp(Math.floor(this.target.x/120),0,2)
      const boosting=(this.input.held&&this.fuel>0)||this.power==='turbo';this.fuel=clamp(this.fuel+(boosting?-24:14)*dt,0,100);const speed=(130+this.stage*18)*(boosting?1.6:1);this.distance+=speed*dt;p.x+=(60+this.lane*120-p.x)*Math.min(1,dt*(v===2?6:12))
      this.spawn-=dt;if(this.spawn<=0){this.spawn=this.rand(.85,1.25);const lane=Math.floor(this.rand(0,3));this.objects.push({x:60+lane*120,y:-45,w:43,h:60,type:'car',passed:false,lane,drift:this.rand(0,6)});if(this.random()>.35)this.objects.push({x:60+(lane+1)%3*120,y:-100,w:22,h:22,type:'energy'})}
      for(const o of this.objects){o.y+=speed*dt;if(v===1&&o.type==='car'){const nextLane=clamp(o.lane+(Math.sin(this.time+o.drift)>.6?1:0),0,2);o.x+=(60+nextLane*120-o.x)*dt*2}if(hit(o,p,-4)){if(o.type==='energy'){o.dead=true;this.gain(o.x,o.y,20)}else this.crash()}if(o.type==='car'&&!o.passed&&o.y>p.y+50){o.passed=true;if(Math.abs(o.x-p.x)<90){this.gain(p.x,p.y-40,35);this.announce('close')}else this.score+=10}}
    }
    this.objects=this.objects.filter(o=>!o.dead&&o.x>-80&&o.x<W+100&&o.y<H+100)
  }
}
