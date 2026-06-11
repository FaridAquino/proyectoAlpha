const TWO_PI = Math.PI * 2;

const POINTER_RADIUS = 120;
const POINTER_FORCE = 0.55;
const PUSH_DECAY = 0.94; // factor de decaimiento por frame (a 60fps)

class Flower {
  constructor(x, canvasWidth) {
    this.x = x;
    this.y = -20;
    this.velY = 0.6 + Math.random() * 1.2;
    this.velX = (Math.random() - 0.5) * 0.8;
    this.pushX = 0;
    this.pushY = 0;
    this.wobbleOffset = Math.random() * TWO_PI;
    this.wobbleSpeed = 0.02 + Math.random() * 0.03;
    this.wobbleAmp = 1.5 + Math.random() * 2.5;
    this.rotation = Math.random() * TWO_PI;
    this.rotationSpeed = (Math.random() - 0.5) * 0.04;
    this.tick = 0;
    this.canvasWidth = canvasWidth;
  }

  applyPointer(pointer, dt) {
    if (!pointer) return;
    const dx = this.x - pointer.x;
    const dy = this.y - pointer.y;
    const distSq = dx * dx + dy * dy;
    if (distSq >= POINTER_RADIUS * POINTER_RADIUS || distSq < 0.01) return;
    const dist = Math.sqrt(distSq);
    const force = (1 - dist / POINTER_RADIUS) * POINTER_FORCE * dt;
    this.pushX += (dx / dist) * force;
    this.pushY += (dy / dist) * force * 0.45;
  }

  update(dt = 1, pointer = null) {
    this.tick += dt;
    this.applyPointer(pointer, dt);

    // el empuje se disipa para volver a la caída natural
    const decay = Math.pow(PUSH_DECAY, dt);
    this.pushX *= decay;
    this.pushY *= decay;

    this.velY += 0.012 * dt;
    this.y += (this.velY + this.pushY) * dt;
    this.x += (this.velX + this.pushX + Math.sin(this.tick * this.wobbleSpeed + this.wobbleOffset) * this.wobbleAmp) * dt;
    this.rotation += this.rotationSpeed * dt;
  }

  isOffscreen(canvasHeight) {
    return this.y > canvasHeight + 60;
  }
}

export class Sunflower extends Flower {
  constructor(x, canvasWidth) {
    super(x, canvasWidth);
    this.scale = 25 + Math.random() * 20;
    this.petalCount = 10 + Math.floor(Math.random() * 4);
    this.petalColor = `hsl(${44 + Math.random() * 16}, 95%, ${55 + Math.random() * 10}%)`;
  }

  draw(ctx) {
    const s = this.scale;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // pétalos amarillos
    ctx.fillStyle = this.petalColor;
    for (let i = 0; i < this.petalCount; i++) {
      const angle = (TWO_PI / this.petalCount) * i;
      ctx.save();
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.72, s * 0.18, s * 0.42, 0, 0, TWO_PI);
      ctx.fill();
      ctx.restore();
    }

    // disco central café
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.32, 0, TWO_PI);
    ctx.fillStyle = '#6B3A1F';
    ctx.fill();

    // punteado interior
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.22, 0, TWO_PI);
    ctx.fillStyle = '#4A2510';
    ctx.fill();

    ctx.restore();
  }
}

export class Jasmine extends Flower {
  constructor(x, canvasWidth) {
    super(x, canvasWidth);
    this.scale = 8 + Math.random() * 6;
    this.velY = 0.4 + Math.random() * 0.8;
    this.petalAlpha = 0.82 + Math.random() * 0.18;
  }

  draw(ctx) {
    const s = this.scale;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // 5 pétalos blancos en 72°
    ctx.fillStyle = `rgba(255, 252, 235, ${this.petalAlpha})`;
    for (let i = 0; i < 5; i++) {
      const angle = (TWO_PI / 5) * i;
      ctx.save();
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.68, s * 0.28, s * 0.52, 0, 0, TWO_PI);
      ctx.fill();
      ctx.restore();
    }

    // centro amarillo
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.22, 0, TWO_PI);
    ctx.fillStyle = '#FFE066';
    ctx.fill();

    ctx.restore();
  }
}

export function createFlower(canvasWidth) {
  const x = Math.random() * canvasWidth;
  return Math.random() < 0.3
    ? new Sunflower(x, canvasWidth)
    : new Jasmine(x, canvasWidth);
}

export function createBurstFlower(x, y, canvasWidth) {
  const flower = Math.random() < 0.4
    ? new Sunflower(x, canvasWidth)
    : new Jasmine(x, canvasWidth);

  // impulso radial que se disipa solo; luego la gravedad la hace caer
  const angle = Math.random() * TWO_PI;
  const speed = 3 + Math.random() * 4;
  flower.y = y;
  flower.pushX = Math.cos(angle) * speed;
  flower.pushY = Math.sin(angle) * speed - 2;
  flower.velY = 0.2 + Math.random() * 0.5;
  flower.rotationSpeed = (Math.random() - 0.5) * 0.12;
  return flower;
}
