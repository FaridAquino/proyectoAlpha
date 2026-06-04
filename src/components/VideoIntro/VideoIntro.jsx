import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './VideoIntro.css';

gsap.registerPlugin(ScrollTrigger);

export default function VideoIntro() {
  const containerRef = useRef(null);
  const hintRef = useRef(null);

  useGSAP(() => {
    gsap.to(containerRef.current, {
      y: '100vh',
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: '25% top',
        scrub: 1,
        onLeave: () => {
          containerRef.current.style.display = 'none';
        },
        onEnterBack: () => {
          containerRef.current.style.display = 'block';
        },
      },
    });

    // Bounce vertical — reemplaza el CSS animation
    gsap.to(hintRef.current, {
      y: 10,
      duration: 1.1,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    // Pulso de color: blanco jasmin → amarillo banana
    gsap.to(hintRef.current, {
      color: '#FFE135',
      duration: 1.9,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="video-intro">
      <video
        className="video-intro__video"
        autoPlay
        muted
        loop
        playsInline
        src="/proyectoAlpha/videos/FondoRecortado.mp4"
      />
      <div className="video-intro__overlay" />
      <div ref={hintRef} className="video-intro__hint">
        <span>Desliza para continuar</span>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}
