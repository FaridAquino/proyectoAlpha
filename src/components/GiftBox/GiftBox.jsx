import { useRef, useState, useMemo, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TegakiRenderer } from 'tegaki/react';
import italianno from 'tegaki/fonts/italianno';
import './GiftBox.css';

gsap.registerPlugin(ScrollTrigger);

const PARAGRAPHS = [
  'Hola, como te va? Espero que todo vaya bien, felicidades por tus 19 anios. Querida Abigail, espero que este "regalo" no te de un disgusto en este dia. Esto lo hice con los recuerdos que aun conservo de ti, de las memorias que como tu bien me enseniaste ps aprendi a valorar. Estoy agradecido por el tiempo que me diste es por ello que hago esto. Pasalo bien, con tus amigos, seres queiridos, mascotas y los astros. Yo desde aqui te deseo lo mejor y no puedo negar el deseo de verte. Pero bueno, eso es cosa mia. Feliz cumple Abigail, te desea Farid...',
];

export default function GiftBox({ onOpen }) {
  const sectionRef = useRef(null);
  const isOpenRef = useRef(false);
  const onOpenRef = useRef(null);
  const openTlRef = useRef(null);
  const floatTweenRef = useRef(null);
  const [boxOpen, setBoxOpen] = useState(false);
  const [letterReady, setLetterReady] = useState(false);
  const [openCount, setOpenCount] = useState(0);

  const letterTime = useMemo(
    () => ({ mode: 'uncontrolled', playing: letterReady, speed: 3.5 }),
    [letterReady]
  );

  useEffect(() => {
    onOpenRef.current = onOpen;
  });

  useGSAP((_, contextSafe) => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Posiciona shine centrado antes de cualquier animación
    gsap.set('.gift-shine', { xPercent: -50, yPercent: -50, scale: 0, opacity: 0 });
    gsap.set('.letter-peek', { xPercent: -50 });

    // Entrada con ScrollTrigger
    gsap.from('.gift-wrapper', {
      opacity: 0,
      y: prefersReduced ? 0 : 70,
      duration: prefersReduced ? 0.4 : 1.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 80%',
      },
    });

    // Flotado idle
    if (!prefersReduced) {
      floatTweenRef.current = gsap.to('.gift-box-group', {
        y: -10,
        duration: 2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
    }

    // --- Open ---
    const openBox = contextSafe(() => {
      if (isOpenRef.current) return;
      isOpenRef.current = true;
      setBoxOpen(true);
      setLetterReady(false);
      setOpenCount((c) => c + 1);
      onOpenRef.current?.();

      floatTweenRef.current?.kill();
      gsap.set('.gift-box-group', { clearProps: 'y' });

      openTlRef.current = gsap.timeline({ onComplete: () => setLetterReady(true) })
        // Tapa se abre hacia atrás
        .to('.gift-lid', {
          rotateX: -130,
          transformPerspective: 700,
          duration: 0.65,
          ease: 'back.out(1.2)',
        })
        // Brillo desde dentro
        .to('.gift-shine', {
          opacity: 1,
          scale: 1.5,
          duration: 0.4,
          ease: 'power2.out',
        }, '-=0.3')
        // Carta asoma desde la caja
        .fromTo('.letter-peek',
          { y: 80, opacity: 0 },
          { y: -28, opacity: 1, duration: 0.55, ease: 'power2.out' },
          '-=0.2'
        )
        // Overlay aparece
        .to('.letter-overlay', {
          opacity: 1,
          pointerEvents: 'auto',
          duration: 0.35,
        }, '+=0.15')
        // Tarjeta entra con rebote
        .fromTo('.letter-card',
          { scale: 0.82, y: 40, opacity: 0 },
          { scale: 1, y: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.4)' },
          '-=0.2'
        )
        // Párrafos en cascada
        .fromTo('.letter-paragraph',
          { opacity: 0, y: 14 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.1,
            duration: 0.45,
            ease: 'power2.out',
          },
          '-=0.15'
        );
    });

    // --- Close ---
    const closeBox = contextSafe(() => {
      if (!isOpenRef.current || !openTlRef.current) return;
      setLetterReady(false);
      openTlRef.current.reverse().then(() => {
        isOpenRef.current = false;
        setBoxOpen(false);
        gsap.set('.letter-overlay', { pointerEvents: 'none' });
        if (!prefersReduced) {
          floatTweenRef.current = gsap.to('.gift-box-group', {
            y: -10,
            duration: 2,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
          });
        }
      });
    });

    const boxEl    = sectionRef.current.querySelector('.gift-box-group');
    const closeEl  = sectionRef.current.querySelector('.letter-close');
    const overlayEl = sectionRef.current.querySelector('.letter-overlay');

    const closeOnBackdrop = contextSafe((e) => {
      if (e.target === overlayEl) closeBox();
    });

    boxEl.addEventListener('click', openBox);
    closeEl.addEventListener('click', closeBox);
    overlayEl.addEventListener('click', closeOnBackdrop);

    return () => {
      boxEl.removeEventListener('click', openBox);
      closeEl.removeEventListener('click', closeBox);
      overlayEl.removeEventListener('click', closeOnBackdrop);
    };
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="gift-section">
      <div className="gift-wrapper">
        <p className="gift-eyebrow">✦ Para ti ✦</p>
        <h2 className="gift-title">Un regalo especial</h2>

        {/* Caja CSS */}
        <div className="gift-box-group">
          {/* Tapa */}
          <div className="gift-lid">
            <div className="gift-ribbon-h" />
            <div className="gift-bow">
              <div className="bow-left" />
              <div className="bow-right" />
              <div className="bow-center" />
            </div>
          </div>

          {/* Cuerpo */}
          <div className="gift-body">
            <div className="gift-ribbon-v" />
            <div className="gift-shine" />
          </div>

          {/* Carta que asoma — posición absoluta dentro del grupo */}
          <div className="letter-peek">
            <div className="letter-peek-lines">
              <span /><span /><span />
            </div>
          </div>
        </div>

        <p className="gift-hint">Haz clic para abrir 🎁</p>
      </div>

      {/* Overlay de la carta */}
      <div className="letter-overlay">
        <div className="letter-card">
          <button className="letter-close" aria-label="Cerrar carta">✕</button>
          <div className="letter-header">
            <div className="letter-seal">✦</div>
            <h3 className="letter-greeting">Para ti</h3>
          </div>
          <div className="letter-body-text">
            {PARAGRAPHS.map((p, i) => (
              // div, no <p>: Tegaki renderiza un <div> interno y anidarlo en <p> es HTML inválido
              <div key={i} className="letter-paragraph">
                {boxOpen && (
                  <TegakiRenderer key={openCount} font={italianno} time={letterTime} style={{ fontSize: '2.2rem', color: 'inherit' }}>
                    {p}
                  </TegakiRenderer>
                )}
              </div>
            ))}
          </div>
          <div className="letter-footer">
            <span className="letter-signature">Con aprecio :)</span>
          </div>
        </div>
      </div>
    </section>
  );
}
