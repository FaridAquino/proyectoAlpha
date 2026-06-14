import { useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './CandlesSection.css';

gsap.registerPlugin(ScrollTrigger);

const CANDLE_HEIGHTS = [52, 42, 60, 42, 52];
const BLOW_DURATION = 1.5; // segundos manteniendo presionado

export default function CandlesSection({ onAllOut }) {
  const sectionRef = useRef(null);
  const onAllOutRef = useRef(null);
  // los handlers reales se crean dentro de useGSAP (context-safe);
  // aquí solo viven wrappers estables para el JSX
  const apiRef = useRef({});

  useEffect(() => {
    onAllOutRef.current = onAllOut;
  });

  useGSAP((_, contextSafe) => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const q = gsap.utils.selector(sectionRef.current);
    const flames = gsap.utils.toArray(q('.candle__flame'));

    // estado imperativo de la interacción (no provoca re-renders)
    const state = { holding: false, allOut: false, busy: false };
    let progressTween = null;
    let flickerTweens = [];

    const stopFlickers = () => {
      flickerTweens.forEach((t) => t.kill());
      flickerTweens = [];
    };

    const startFlickers = contextSafe(() => {
      stopFlickers();
      if (prefersReduced) return;
      flickerTweens = flames.map((flame, i) =>
        gsap.to(flame, {
          scaleY: 0.82 + Math.random() * 0.12,
          scaleX: 0.92,
          skewX: i % 2 ? 4 : -4,
          transformOrigin: '50% 100%',
          duration: 0.14 + Math.random() * 0.1,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: Math.random() * 0.3,
        })
      );
    });

    const extinguish = contextSafe(() => {
      state.busy = true;
      state.holding = false;
      stopFlickers();

      gsap.timeline({
        onComplete: () => {
          state.allOut = true;
          state.busy = false;
        },
      })
        .to(q('.candle__flame'), {
          scaleY: 0,
          scaleX: 0.4,
          autoAlpha: 0,
          transformOrigin: '50% 100%',
          duration: 0.18,
          stagger: 0.12,
          ease: 'power1.in',
        })
        .add(() => onAllOutRef.current?.(), '-=0.1')
        .fromTo(q('.candle__smoke'),
          { autoAlpha: 0.85, y: 0, scale: 0.5 },
          { y: -48, scale: 1.6, autoAlpha: 0, duration: 1.3, stagger: 0.12, ease: 'power1.out' },
          '-=0.7'
        )
        .to(q('.candles-hint'), { autoAlpha: 0, duration: 0.3 }, '<')
        .to(q('.candles-wish'), { autoAlpha: 1, y: 0, duration: 0.6, ease: 'back.out(1.6)' }, '-=0.8')
        .to(q('.candles-relight'), { autoAlpha: 1, y: 0, duration: 0.4 }, '-=0.3');
    });

    const startBlow = contextSafe(() => {
      if (state.holding || state.allOut || state.busy) return;
      state.holding = true;

      stopFlickers();
      // las llamas se doblan como con viento
      gsap.to(q('.candle__flame'), {
        rotation: -24,
        scaleY: 0.72,
        transformOrigin: '50% 100%',
        duration: 0.25,
        ease: 'power2.out',
      });

      progressTween?.kill();
      progressTween = gsap.to(q('.blow-progress__fill'), {
        scaleX: 1,
        duration: BLOW_DURATION,
        ease: 'none',
        onComplete: extinguish,
      });
    });

    const cancelBlow = contextSafe(() => {
      if (!state.holding || state.allOut || state.busy) return;
      state.holding = false;

      progressTween?.kill();
      gsap.to(q('.blow-progress__fill'), { scaleX: 0, duration: 0.4, ease: 'power2.out' });
      gsap.to(q('.candle__flame'), {
        rotation: 0,
        scaleY: 1,
        scaleX: 1,
        duration: 0.3,
        ease: 'power2.out',
        onComplete: startFlickers,
      });
    });

    const relight = contextSafe(() => {
      if (!state.allOut || state.busy) return;
      state.allOut = false;

      gsap.set(q('.candle__smoke'), { autoAlpha: 0 });
      gsap.set(q('.blow-progress__fill'), { scaleX: 0 });
      gsap.to(q('.candles-wish'), { autoAlpha: 0, y: 14, duration: 0.25 });
      gsap.to(q('.candles-relight'), { autoAlpha: 0, y: 8, duration: 0.25 });
      gsap.to(q('.candles-hint'), { autoAlpha: 1, duration: 0.4, delay: 0.2 });
      gsap.fromTo(q('.candle__flame'),
        { scaleY: 0, scaleX: 0.4, autoAlpha: 1, rotation: 0 },
        {
          scaleY: 1,
          scaleX: 1,
          transformOrigin: '50% 100%',
          duration: 0.4,
          stagger: 0.1,
          ease: 'back.out(2)',
          onComplete: startFlickers,
        }
      );
    });

    apiRef.current = { startBlow, cancelBlow, relight };

    // estados iniciales
    gsap.set(q('.candles-wish'), { autoAlpha: 0, y: 14 });
    gsap.set(q('.candles-relight'), { autoAlpha: 0, y: 8 });
    gsap.set(q('.candle__smoke'), { autoAlpha: 0 });
    gsap.set(q('.blow-progress__fill'), { scaleX: 0, transformOrigin: 'left center' });

    // entrada con scroll
    gsap.from(q('.candles-wrapper'), {
      opacity: 0,
      y: prefersReduced ? 0 : 70,
      duration: prefersReduced ? 0.4 : 1.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 80%',
      },
    });

    startFlickers();

    return () => {
      stopFlickers();
      apiRef.current = {};
    };
  }, { scope: sectionRef });

  const startBlow = () => apiRef.current.startBlow?.();
  const cancelBlow = () => apiRef.current.cancelBlow?.();
  const relight = () => apiRef.current.relight?.();

  const onKeyDown = (e) => {
    if (e.repeat) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      startBlow();
    }
  };

  const onKeyUp = (e) => {
    if (e.key === ' ' || e.key === 'Enter') cancelBlow();
  };

  return (
    <section ref={sectionRef} className="candles-section" aria-label="Sopla las velas del pastel">
      <div className="candles-wrapper">
        <p className="candles-eyebrow">✦ Cierra los ojos ✦</p>
        <h2 className="candles-title">Sopla las velas</h2>

        <div
          className="candles-stage"
          role="button"
          tabIndex={0}
          aria-label="Mantén presionado para soplar las velas"
          onPointerDown={startBlow}
          onPointerUp={cancelBlow}
          onPointerLeave={cancelBlow}
          onPointerCancel={cancelBlow}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
        >
          <div className="cake" aria-hidden="true">
            <div className="cake__candles">
              {CANDLE_HEIGHTS.map((h, i) => (
                <div key={i} className="candle" style={{ '--candle-h': `${h}px` }}>
                  <div className="candle__smoke" />
                  <div className="candle__flame" />
                  <div className="candle__wick" />
                  <div className="candle__body" />
                </div>
              ))}
            </div>
            <div className="cake__tier cake__tier--top" />
            <div className="cake__tier cake__tier--bottom" />
            <div className="cake__plate" />
          </div>

          <div className="blow-progress" aria-hidden="true">
            <div className="blow-progress__fill" />
          </div>
        </div>

        <p className="candles-hint">Mantén presionado para soplar </p>
        <p className="candles-wish">¡Pide un deseo! ✨</p>
        <button className="candles-relight" onClick={relight}>Volver a encender 🔥</button>
      </div>
    </section>
  );
}
