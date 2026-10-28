import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ARCADE_GAMES, assignedGame, SESSION_SECONDS } from '../src/arcade/catalog.js'
import { ArcadeEngine } from '../src/arcade/engine.js'
function seeded(seed=42) {return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}}
function advance(engine,seconds){for(let i=0;i<Math.ceil(seconds*60);i++)engine.update(1/60)}

test('30 automatically assigned missions include ten arcade mechanics and rotate on replay',()=>{
  assert.equal(ARCADE_GAMES.length,30)
  assert.equal(new Set(ARCADE_GAMES.map(g=>g.id)).size,30)
  assert.equal(new Set(ARCADE_GAMES.map(g=>g.kind)).size,10)
  for(let world=0;world<12;world++){
    assert.notEqual(assignedGame(world,3).id,assignedGame(world,6).id)
    assert.notEqual(assignedGame(world,3).id,assignedGame(world,3,2).id)
    assert.equal(assignedGame(world,3).id,assignedGame(world,3).id)
  }
})

test('each full game lasts over three minutes, recovers after crashes, and finishes once',()=>{
  assert.ok(SESSION_SECONDS>=180 && SESSION_SECONDS<=600)
  for(const game of ARCADE_GAMES){
    const e=new ArcadeEngine(game,seeded())
    // Some inputs exercise motion, projectiles, collision, and recovery for the entire session.
    for(let frame=0;frame<SESSION_SECONDS*60-1;frame++){
      if(frame%120===0){e.action();e.steer(frame%240===0?1:-1,0)}
      e.input.right=frame%240<120;e.input.left=!e.input.right
      if(frame%80===0)e.pointer(60+frame%240,350,'down')
      if(frame%80===20)e.pointer(30,425,'up')
      e.update(1/60)
      assert.ok(Number.isFinite(e.player.x)&&Number.isFinite(e.player.y),game.id)
      assert.ok(e.objects.length<250,game.id)
      assert.ok(e.particles.length<=220,game.id)
      assert.equal(e.completed,false,game.id)
    }
    advance(e,.1)
    assert.equal(e.completed,true,game.id)
    assert.equal(e.stage,4,game.id)
    const score=e.score, time=e.time
    advance(e,10)
    assert.equal(e.score,score);assert.equal(e.time,time)
    assert.equal(e.events.filter(event=>event==='complete').length,1)
  }
})

test('snake cannot reverse into itself, wraps at edges, and grows when eating',()=>{
  const e=new ArcadeEngine(ARCADE_GAMES.find(g=>g.kind==='snake'),seeded())
  e.steer(-1,0);assert.deepEqual(e.nextDirection,{x:1,y:0})
  e.food={x:9,y:12};advance(e,.17);assert.equal(e.snake.length,4);assert.equal(e.score,20)
  e.snake=[{x:17,y:4},{x:16,y:4},{x:15,y:4}];advance(e,.17);assert.equal(e.snake[0].x,0)
})

test('slingshot pull launches a projectile, collides with a tower, and reloads',()=>{
  const e=new ArcadeEngine(ARCADE_GAMES.find(g=>g.kind==='sling'),seeded())
  e.pointer(70,360,'down');e.pointer(30,425,'move');e.pointer(30,425,'up')
  assert.ok(e.projectile.vx>0&&e.projectile.vy<0)
  advance(e,5);assert.equal(e.projectile,null)
  e.projectile={x:252,y:260,vx:0,vy:100,r:12,age:0}
  advance(e,.1);assert.ok(e.score>0)
})

test('flight tap gives lift, runner double jump is bounded, and blaster recharge prevents spam',()=>{
  const flight=new ArcadeEngine(ARCADE_GAMES.find(g=>g.kind==='flap'),seeded());flight.action();assert.ok(flight.player.vy<0)
  const runner=new ArcadeEngine(ARCADE_GAMES.find(g=>g.kind==='runner'),seeded());runner.action();runner.action();runner.action();assert.equal(runner.jumps,2)
  const blaster=new ArcadeEngine(ARCADE_GAMES.find(g=>g.kind==='blaster'),seeded());blaster.action();const shots=blaster.shots.length;blaster.action();assert.equal(blaster.shots.length,shots);advance(blaster,5.1);blaster.action();assert.equal(Math.round(blaster.cooldown),5)
})
