import Matter from 'matter-js'
const { Engine, Bodies, Body, Composite, Constraint, Events, Sleeping } = Matter
const STEP = 1000 / 120
const MATERIALS = {
  wood: { density: .002, hp: 5, restitution: .12, color: '#d8ad7e' },
  glass: { density: .0012, hp: 2.2, restitution: .25, color: '#9be4ec' },
  stone: { density: .004, hp: 12, restitution: .08, color: '#9b9bb8' },
  alien: { density: .0018, hp: 2.8, restitution: .18, color: '#afe8b4' },
  barrel: { density: .0018, hp: 2, restitution: .1, color: '#ffad82' },
  balloon: { density: .0003, hp: .8, restitution: .5, color: '#e5b2f5' },
}
export const SHOT_TYPES = ['heavy', 'split', 'bomb']

export class SlingWorld {
  constructor(owner) {
    this.owner = owner
    this.engine = Engine.create({ positionIterations: 8, velocityIterations: 8, enableSleeping: true })
    this.engine.gravity.y = owner.game.variant === 2 ? .3 : .45
    this.round = 0
    this.shots = 0
    this.bodies = []
    this.projectiles = []
    this.debris = []
    this.rings = []
    this.ropes = []
    this.accumulator = 0
    this.armed = false
    Events.on(this.engine, 'collisionStart', event => this.collisions(event.pairs))
    this.build()
  }

  add(x, y, w, h, material, circle = false) {
    const spec = MATERIALS[material]
    const options = { density: spec.density, restitution: spec.restitution, friction: .65, frictionStatic: .9, frictionAir: .002, sleepThreshold: 45 }
    const body = circle ? Bodies.circle(x, y, w / 2, options) : Bodies.rectangle(x, y, w, h, { ...options, chamfer: { radius: 2 } })
    const item = { body, x, y, w, h, material, type: material === 'alien' || material === 'balloon' ? material : 'block', hp: spec.hp, maxHp: spec.hp, color: spec.color, circle, lastHit: -10 }
    body.plugin.item = item
    this.bodies.push(item)
    Composite.add(this.engine.world, body)
    return item
  }

  build() {
    Composite.clear(this.engine.world, false)
    Engine.clear(this.engine)
    this.bodies = []; this.projectiles = []; this.debris = []; this.ropes = []; this.rings = []
    this.owner.projectile = null
    this.shots = 0; this.armed = false; this.cleared = false; this.round++; this.clearWait = 0; this.accumulator = 0
    Composite.add(this.engine.world, [
      Bodies.rectangle(180, 444, 900, 40, { isStatic: true, friction: .8, restitution: .15 }),
      Bodies.rectangle(430, 240, 30, 600, { isStatic: true }),
      Bodies.rectangle(-80, 240, 30, 600, { isStatic: true }),
    ])
    const layout = (this.round - 1 + this.owner.game.variant) % 3
    if (layout === 0) {
      this.add(225, 397, 22, 54, 'wood'); this.add(315, 397, 22, 54, 'wood')
      this.add(270, 362, 120, 16, 'wood')
      this.add(245, 334, 18, 40, 'glass'); this.add(295, 334, 18, 40, 'glass')
      this.add(270, 306, 88, 16, 'stone')
      this.add(270, 284, 28, 28, 'alien', true)
      this.add(270, 410, 28, 28, 'alien', true)
      this.add(194, 411, 24, 26, 'barrel')
    } else if (layout === 1) {
      for (let floor = 0; floor < 3; floor++) {
        const y = 399 - floor * 64, left = 224 + floor * 7, right = 318 - floor * 7
        this.add(left, y, 20, 50, floor === 1 ? 'glass' : 'wood')
        this.add(right, y, 20, 50, 'wood')
        this.add(271, y - 32, right - left + 38, 14, floor === 2 ? 'glass' : 'wood')
      }
      this.add(271, 218, 28, 28, 'alien', true)
      this.add(271, 410, 28, 28, 'alien', true)
      this.add(271, 350, 26, 26, 'barrel')
    } else {
      this.add(208, 398, 24, 52, 'glass'); this.add(274, 398, 24, 52, 'wood')
      this.add(241, 364, 100, 16, 'wood')
      this.add(241, 342, 28, 28, 'alien', true)
      this.add(325, 397, 28, 54, 'stone')
      this.add(325, 356, 28, 28, 'alien', true)
      this.add(300, 411, 22, 26, 'barrel')
      this.add(241, 410, 28, 28, 'alien', true)
    }
    if (this.owner.game.variant === 1) {
      for (const x of [190, 340]) {
        const balloon = this.add(x, 215, 30, 36, 'balloon', true)
        const rope = Constraint.create({ pointA: { x, y: 285 }, bodyB: balloon.body, length: 70, stiffness: .06, damping: .08 })
        this.ropes.push(rope); Composite.add(this.engine.world, rope)
      }
    }
    // Let the tower settle before arming damage; resting supports never shatter.
    for (let i = 0; i < 90; i++) this.physicsStep()
    this.sync()
    if (this.round > 1) this.owner.announce('tower', { round: this.round })
  }

  collisions(pairs) {
    if (!this.armed) return
    for (const { bodyA: a, bodyB: b } of pairs) {
      const va = a.plugin.before || a.velocity, vb = b.plugin.before || b.velocity
      const speed = Math.hypot(va.x - vb.x, va.y - vb.y)
      if (speed < 1.8) continue
      for (const [body, other] of [[a,b],[b,a]]) {
        const item = body.plugin.item
        if (!item || item.dead || this.owner.time - item.lastHit < .12) continue
        const mass = other.isStatic ? body.mass : Math.min(other.mass, 4)
        const damage = (speed - 1.8) * (.45 + mass * .55)
        this.damage(item, damage)
      }
    }
  }

  damage(item, amount) {
    if (item.dead) return
    item.hp -= amount; item.lastHit = this.owner.time
    if (item.hp <= 0) item.dead = true
    else this.owner.burst(item.body.position.x, item.body.position.y, item.color, 3)
  }

  launch(aim) {
    if (this.owner.projectile || this.shots >= 3) return false
    this.armed = true
    const type = SHOT_TYPES[(this.shots + this.round - 1) % SHOT_TYPES.length]
    const body = Bodies.circle(this.owner.anchor.x, this.owner.anchor.y, type === 'heavy' ? 14 : 12, {
      density: type === 'heavy' ? .008 : .004, restitution: .48, friction: .5, frictionAir: .001,
      collisionFilter: { group: -1 },
    })
    Body.setVelocity(body, { x: aim.x / 60, y: aim.y / 60 })
    Body.setAngularVelocity(body, .08)
    const shot = { body, type, x: body.position.x, y: body.position.y, vx: aim.x, vy: aim.y, r: type === 'heavy' ? 14 : 12, age: 0, powerUsed: false, main: true }
    this.projectiles.push(shot); this.owner.projectile = shot; this.shots++
    Composite.add(this.engine.world, body)
    this.owner.events.push('launch')
    return true
  }

  activate() {
    const shot = this.owner.projectile
    if (!shot || shot.powerUsed || shot.age < .12) return
    shot.powerUsed = true
    const p = shot.body.position, velocity = shot.body.velocity
    if (shot.type === 'bomb') {
      this.explode(p.x, p.y, 115)
      Composite.remove(this.engine.world, shot.body)
      this.projectiles = this.projectiles.filter(s => s !== shot)
      this.owner.projectile = null; this.owner.reload = .5
    } else if (shot.type === 'split') {
      for (const sign of [-1,1]) {
        const body = Bodies.circle(p.x, p.y + sign * 20, 8, { density: .005, restitution: .4, collisionFilter: { group: -1 } })
        Body.setVelocity(body, { x: velocity.x * 1.1, y: velocity.y + sign * 2.4 })
        this.projectiles.push({ body, type: 'split', x: p.x, y: p.y, r: 8, age: shot.age, powerUsed: true })
        Composite.add(this.engine.world, body)
      }
      this.owner.announce('split')
    } else {
      Body.setVelocity(shot.body, { x: velocity.x * 1.65, y: velocity.y * .8 })
      this.owner.announce('dash')
    }
    this.owner.burst(p.x, p.y, '#ffe2a2', 22)
  }

  explode(x, y, radius = 100) {
    this.owner.shake = .35
    this.owner.burst(x, y, '#ffcb84', 34)
    this.rings.push({ x, y, radius, life: .55 })
    this.owner.announce('boom')
    for (const item of this.bodies) {
      if (item.dead) continue
      const dx = item.body.position.x - x, dy = item.body.position.y - y, d = Math.hypot(dx,dy)
      if (d > radius) continue
      const strength = (1 - d/radius) * 8
      Sleeping.set(item.body, false)
      Body.setVelocity(item.body, { x: item.body.velocity.x + dx / Math.max(15,d) * strength, y: item.body.velocity.y + dy / Math.max(15,d) * strength - 2 })
      Body.setAngularVelocity(item.body, (dx < 0 ? -1 : 1) * strength * .035)
      this.damage(item, strength * .8)
    }
  }

  physicsStep() {
    for (const item of [...this.bodies, ...this.projectiles]) item.body.plugin.before = { ...item.body.velocity }
    for (const item of this.bodies) if (item.material === 'balloon' && !item.dead) Body.applyForce(item.body, item.body.position, { x: Math.sin(this.owner.time) * .00001, y: -item.body.mass * .0007 })
    Engine.update(this.engine, STEP)
  }

  sync() {
    for (const item of [...this.bodies, ...this.projectiles]) {
      item.x = item.body.position.x; item.y = item.body.position.y; item.angle = item.body.angle
      item.vx = item.body.velocity.x * 60; item.vy = item.body.velocity.y * 60
    }
    this.owner.objects = this.bodies
  }

  step(dt) {
    this.accumulator += dt * 1000
    while (this.accumulator >= STEP) { this.physicsStep(); this.accumulator -= STEP }
    // Remove broken bodies after the solver has finished, then let debris strike the tower.
    for (const item of this.bodies) {
      if (!item.dead && (item.body.position.y > 510 || item.body.position.x < -45 || item.body.position.x > 405)) item.dead = true
      if (!item.dead || item.removed) continue
      item.removed = true
      const { x, y } = item.body.position
      Composite.remove(this.engine.world, item.body)
      for (const supported of this.bodies) if (!supported.dead) Sleeping.set(supported.body, false)
      for (const rope of this.ropes) if (rope.bodyB === item.body) Composite.remove(this.engine.world, rope)
      this.owner.gain(x, y, item.material === 'alien' ? 50 : item.material === 'balloon' ? 30 : 15)
      if (item.material === 'barrel') this.explode(x, y, 100)
      if (['wood','glass','stone'].includes(item.material)) {
        for (let i=0;i<2;i++) {
          const body = Bodies.rectangle(x + i*6-3, y, 7, 9, { density: .0006, friction: .8, restitution: .25 })
          Body.setVelocity(body, { x: this.owner.rand(-2,2), y: this.owner.rand(-3,0) })
          this.debris.push({ body, color: item.color, life: 2 })
          Composite.add(this.engine.world, body)
        }
      }
    }
    this.bodies = this.bodies.filter(o => !o.removed)
    this.rings = this.rings.filter(o => (o.life -= dt) > 0)
    this.debris = this.debris.filter(o => { o.life -= dt; if (o.life > 0) return true; Composite.remove(this.engine.world,o.body); return false })
    for (const shot of this.projectiles) {
      shot.age += dt
      if (shot.main && (shot.age > 4 || (shot.age > 1.3 && shot.body.speed < .5) || shot.body.position.x > 400)) {
        if (this.owner.projectile === shot) { this.owner.projectile = null; this.owner.reload = .35 }
      }
    }
    this.projectiles = this.projectiles.filter(s => { if (s.age < 8 && s.body.position.y < 530) return true; Composite.remove(this.engine.world,s.body); return false })
    const cleared = this.bodies.every(o => o.material !== 'alien')
    if (cleared) { if (!this.cleared) { this.owner.gain(270,200,100); this.owner.announce('clear'); this.cleared = true } this.clearWait += dt }
    else if (this.shots >= 3 && !this.owner.projectile) {
      if(this.clearWait===0)this.owner.announce('restack')
      this.clearWait += dt
    }
    if (this.clearWait > (cleared ? 2.5 : 3)) { this.cleared = false; this.build() }
    this.sync()
  }

  get nextShot() { return SHOT_TYPES[(Math.min(this.shots,2) + this.round - 1) % SHOT_TYPES.length] }
  get targets() { return this.bodies.filter(o => o.material === 'alien').length }
  get gravity() { return this.engine.gravity.y * 1000 }
}
