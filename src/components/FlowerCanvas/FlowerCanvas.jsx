import { useRef, useEffect } from 'react';
import { createFlower, createBurstFlower } from './flowerPhysics';
import './FlowerCanvas.css';

const SPAWN_INTERVAL = 18; // "frames" (a 60fps) entre spawns
const BASE_DT = 1000 / 60; // referencia: 60 fps
const BURST_COUNT = 7;
// selectores donde un click no debe generar flores
const INTERACTIVE_SELECTOR = 'button, a, .gift-box-group, .letter-overlay, .circular-gallery, .lightbox, .candles-stage';

function maxFlowersFor(width) {
  return width < 640 ? 22 : 45;
}

export default function FlowerCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotion.matches) return undefined;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let rafId;
    let flowers = [];
    let lastTime = performance.now();
    let spawnAcc = 0;
    let maxFlowers = maxFlowersFor(window.innerWidth);
    // dimensiones lógicas en px CSS; el backing store escala por DPR
    let viewW = window.innerWidth;
    let viewH = window.innerHeight;
    const pointer = { x: -9999, y: -9999, active: false };

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      viewW = window.innerWidth;
      viewH = window.innerHeight;
      canvas.width = viewW * dpr;
      canvas.height = viewH * dpr;
      canvas.style.width = `${viewW}px`;
      canvas.style.height = `${viewH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      maxFlowers = maxFlowersFor(viewW);
    }

    resize();

    let resizeTimer;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        flowers = [];
      }, 150);
    }

    function onPointerMove(e) {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    }

    function onPointerLeave() {
      pointer.active = false;
    }

    function onPointerDown(e) {
      if (e.target.closest?.(INTERACTIVE_SELECTOR)) return;
      for (let i = 0; i < BURST_COUNT; i++) {
        flowers.push(createBurstFlower(e.clientX, e.clientY, viewW));
      }
    }

    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown);
    document.documentElement.addEventListener('pointerleave', onPointerLeave);

    function loop(now) {
      // factor normalizado a 60fps; clamp para evitar saltos al reenfocar pestaña
      const dt = Math.min((now - lastTime) / BASE_DT, 3);
      lastTime = now;

      ctx.clearRect(0, 0, viewW, viewH);

      // generar nueva flor (cadencia por tiempo, no por frame)
      spawnAcc += dt;
      if (spawnAcc >= SPAWN_INTERVAL && flowers.length < maxFlowers) {
        spawnAcc -= SPAWN_INTERVAL;
        flowers.push(createFlower(viewW));
      }

      // actualizar y dibujar
      const activePointer = pointer.active ? pointer : null;
      flowers = flowers.filter(f => !f.isOffscreen(viewH));
      for (const flower of flowers) {
        flower.update(dt, activePointer);
        flower.draw(ctx);
      }

      rafId = requestAnimationFrame(loop);
    }

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="flower-canvas" aria-hidden="true" />;
}
