import { useRef, useEffect } from 'react';
import { createFlower } from './flowerPhysics';
import './FlowerCanvas.css';

const MAX_FLOWERS = 45;
const SPAWN_INTERVAL = 18; // frames entre spawns

export default function FlowerCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let rafId;
    let flowers = [];
    let frame = 0;

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

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // generar nueva flor
      if (frame % SPAWN_INTERVAL === 0 && flowers.length < MAX_FLOWERS) {
        flowers.push(createFlower(canvas.width));
      }

      // actualizar y dibujar
      flowers = flowers.filter(f => !f.isOffscreen(canvas.height));
      for (const flower of flowers) {
        flower.update();
        flower.draw(ctx);
      }

      frame++;
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
