import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './GiftBox.css';

gsap.registerPlugin(ScrollTrigger);

const PARAGRAPHS = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae. Proin vel ante a orci tempus eleifend ut et magna. Curabitur venenatis pretium libero, id faucibus nulla scelerisque.',
];

export default function GiftBox() {
  const sectionRef = useRef(null);
  const isOpenRef = useRef(false);
  const openTlRef = useRef(null);
  const floatTweenRef = useRef(null);

  useGSAP((_, contextSafe) => {
    // Posiciona shine centrado antes de cualquier animación
    gsap.set('.gift-shine', { xPercent: -50, yPercent: -50, scale: 0, opacity: 0 });
    gsap.set('.letter-peek', { xPercent: -50 });

    // Entrada con ScrollTrigger
    gsap.from('.gift-wrapper', {
      opacity: 0,
      y: 70,
      duration: 1.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 80%',
      },
    });

    // Flotado idle
    floatTweenRef.current = gsap.to('.gift-box-group', {
      y: -10,
      duration: 2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    // --- Open ---
    const openBox = contextSafe(() => {
      if (isOpenRef.current) return;
      isOpenRef.current = true;

      floatTweenRef.current?.kill();
      gsap.set('.gift-box-group', { clearProps: 'y' });

      openTlRef.current = gsap.timeline()
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
        .from('.letter-paragraph', {
          opacity: 0,
          y: 14,
          stagger: 0.1,
          duration: 0.45,
          ease: 'power2.out',
        }, '-=0.15');
    });

    // --- Close ---
    const closeBox = contextSafe(() => {
      if (!isOpenRef.current || !openTlRef.current) return;
      openTlRef.current.reverse().then(() => {
        isOpenRef.current = false;
        gsap.set('.letter-overlay', { pointerEvents: 'none' });
        floatTweenRef.current = gsap.to('.gift-box-group', {
          y: -10,
          duration: 2,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        });
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
            <h3 className="letter-greeting">Para ti, con cariño</h3>
          </div>
          <div className="letter-body-text">
            {PARAGRAPHS.map((p, i) => (
              <p key={i} className="letter-paragraph">{p}</p>
            ))}
          </div>
          <div className="letter-footer">
            <span className="letter-signature">Con amor ♡</span>
          </div>
        </div>
      </div>
    </section>
  );
}
