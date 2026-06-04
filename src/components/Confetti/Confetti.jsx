import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const COLORS = [
  '#FFE135', '#F5C518', '#FDD835', '#FFEE58', '#FFD740',
  '#FFF9C4', '#FFFDE7', '#F8EFD4', '#FFFFF0', '#FFCA28',
];

export default function Confetti() {
  const containerRef = useRef(null);

  useGSAP(() => {
    const container = containerRef.current;

    for (let i = 0; i < 90; i++) {
      const el = document.createElement('div');
      const isCircle = Math.random() > 0.55;
      const size = Math.random() * 10 + 5;

      Object.assign(el.style, {
        position: 'absolute',
        width: `${isCircle ? size : size * 0.55}px`,
        height: `${isCircle ? size : size * 1.7}px`,
        borderRadius: isCircle ? '50%' : '2px',
        background: COLORS[Math.floor(Math.random() * COLORS.length)],
        left: `${Math.random() * 100}%`,
        top: '-20px',
        willChange: 'transform, opacity',
      });

      container.appendChild(el);

      gsap.to(el, {
        y: window.innerHeight + 80,
        x: (Math.random() - 0.5) * 260,
        rotation: Math.random() * 720 - 360,
        opacity: 0,
        duration: Math.random() * 2 + 2.5,
        delay: Math.random() * 1.8,
        ease: 'power1.in',
        onComplete: () => el.remove(),
      });
    }
  }, { scope: containerRef });

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 20,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    />
  );
}
