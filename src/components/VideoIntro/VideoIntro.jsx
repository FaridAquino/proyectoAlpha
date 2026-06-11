import { useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import './VideoIntro.css';

gsap.registerPlugin(useGSAP);

export default function VideoIntro({ onEnd }) {
  const containerRef = useRef(null);
  const onEndRef = useRef(null);
  // el handler real se crea context-safe dentro de useGSAP
  const apiRef = useRef({});

  useEffect(() => {
    onEndRef.current = onEnd;
  });

  useGSAP((_, contextSafe) => {
    apiRef.current.fadeOut = contextSafe(() => {
      gsap.to(containerRef.current, {
        opacity: 0,
        scale: 1.06,
        duration: 1.5,
        ease: 'power2.inOut',
        onComplete: () => {
          containerRef.current.style.display = 'none';
          onEndRef.current?.();
        },
      });
    });

    return () => {
      apiRef.current = {};
    };
  }, { scope: containerRef });

  const handleVideoEnd = () => apiRef.current.fadeOut?.();

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
