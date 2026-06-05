import { useRef, useEffect } from 'react';
import { createFlower } from './flowerPhysics';
import './FlowerCanvas.css';

const MAX_FLOWERS = 45;
const SPAWN_INTERVAL = 18; // "frames" (a 60fps) entre spawns
const BASE_DT = 1000 / 60; // referencia: 60 fps

export default function FlowerCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let rafId;
    let flowers = [];
    let lastTime = performance.now();
    let spawnAcc = 0;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
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

    window.addEventListener('resize', onResize);

    function loop(now) {
      // factor normalizado a 60fps; clamp para evitar saltos al reenfocar pestaña
      const dt = Math.min((now - lastTime) / BASE_DT, 3);
      lastTime = now;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // generar nueva flor (cadencia por tiempo, no por frame)
      spawnAcc += dt;
      if (spawnAcc >= SPAWN_INTERVAL && flowers.length < MAX_FLOWERS) {
        spawnAcc -= SPAWN_INTERVAL;
        flowers.push(createFlower(canvas.width));
      }

      // actualizar y dibujar
      flowers = flowers.filter(f => !f.isOffscreen(canvas.height));
      for (const flower of flowers) {
        flower.update(dt);
        flower.draw(ctx);
      }

      rafId = requestAnimationFrame(loop);
    }

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="flower-canvas" aria-hidden="true" />;
}
