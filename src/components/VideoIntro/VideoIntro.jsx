import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import './VideoIntro.css';

gsap.registerPlugin(useGSAP);

export default function VideoIntro({ onEnd }) {
  const containerRef = useRef(null);

  const { contextSafe } = useGSAP({ scope: containerRef });

  const handleVideoEnd = contextSafe(() => {
    gsap.to(containerRef.current, {
      opacity: 0,
      scale: 1.06,
      duration: 1.5,
      ease: 'power2.inOut',
      onComplete: () => {
        containerRef.current.style.display = 'none';
        onEnd?.();
      },
    });
  });

  return (
    <div ref={containerRef} className="video-intro">
      <video
        className="video-intro__video"
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnd}
        src="/proyectoAlpha/videos/FondoRecortado.mp4"
      />
      <div className="video-intro__overlay" />
    </div>
  );
}
