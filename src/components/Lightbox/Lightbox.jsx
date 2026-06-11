import { useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import './Lightbox.css';

export default function Lightbox({ item, onClose }) {
  const overlayRef = useRef(null);
  // el handler real se crea context-safe dentro de useGSAP
  const apiRef = useRef({});

  useGSAP((_, contextSafe) => {
    if (!item) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const overlay = overlayRef.current;

    gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });
    gsap.fromTo('.lightbox__figure',
      { scale: prefersReduced ? 1 : 0.88, y: prefersReduced ? 0 : 28, opacity: 0 },
      { scale: 1, y: 0, opacity: 1, duration: prefersReduced ? 0.2 : 0.5, ease: 'back.out(1.4)' }
    );

    apiRef.current.close = contextSafe(() => {
      gsap.to('.lightbox__figure', { scale: 0.92, y: 16, opacity: 0, duration: 0.25, ease: 'power2.in' });
      gsap.to(overlay, { opacity: 0, duration: 0.28, ease: 'power2.in', onComplete: onClose });
    });

    return () => {
      apiRef.current = {};
    };
  }, { scope: overlayRef, dependencies: [item, onClose] });

  useEffect(() => {
    if (!item) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') apiRef.current.close?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [item]);

  if (!item) return null;

  const handleClose = () => apiRef.current.close?.();

  return (
    <div
      ref={overlayRef}
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={item.text}
      onClick={(e) => {
        if (e.target === overlayRef.current) handleClose();
      }}
    >
      <figure className="lightbox__figure">
        <button className="lightbox__close" aria-label="Cerrar imagen" onClick={handleClose}>✕</button>
        <img className="lightbox__image" src={item.image} alt={item.text} />
        <figcaption className="lightbox__caption">{item.text}</figcaption>
      </figure>
    </div>
  );
}
