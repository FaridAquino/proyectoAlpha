import { useRef, useMemo } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { TegakiRenderer } from 'tegaki/react';
import caveat from 'tegaki/fonts/caveat';
import './HeroSection.css';

gsap.registerPlugin(ScrollTrigger, SplitText);

export default function HeroSection({ videoEnded = false }) {
  const sectionRef = useRef(null);

  const titleTime = useMemo(
    () => ({ mode: 'uncontrolled', playing: videoEnded, speed: 1.3 }),
    [videoEnded]
  );

  useGSAP((_, contextSafe) => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const startFloating = contextSafe(() => {
      if (prefersReduced) return;
      const ornaments = sectionRef.current.querySelectorAll('.hero__ornament');
      ornaments.forEach((el, i) => {
        gsap.to(el, {
          y: -(8 + (i % 3) * 5),
          rotation: i % 2 === 0 ? 10 : -10,
          duration: 2.0 + i * 0.22,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: i * 0.13,
        });
      });
    });

    // subtítulo y mensaje aparecen palabra por palabra
    let subtitleSplit = null;
    let messageSplit = null;
    if (!prefersReduced) {
      subtitleSplit = new SplitText(sectionRef.current.querySelector('.hero__subtitle'), { type: 'words' });
      messageSplit = new SplitText(sectionRef.current.querySelector('.hero__message'), { type: 'words' });
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 75%',
        toggleActions: 'play none none none',
      },
      onComplete: startFloating,
    });

    tl.from('.hero__eyebrow', {
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: 'power2.out',
    })
      .from('.hero__title-main', {
        opacity: 0,
        y: 50,
        duration: 0.9,
        ease: 'power3.out',
      }, '-=0.3')
      .from('.hero__title-accent', {
        opacity: 0,
        y: 40,
        duration: 0.9,
        ease: 'power3.out',
      }, '-=0.6')
      .from(subtitleSplit ? subtitleSplit.words : '.hero__subtitle', {
        opacity: 0,
        y: subtitleSplit ? 22 : 0,
        duration: subtitleSplit ? 0.55 : 0.5,
        stagger: subtitleSplit ? 0.045 : 0,
        ease: 'power2.out',
      }, '-=0.4')
      .from('.hero__divider', {
        scaleX: 0,
        duration: 0.8,
        ease: 'power2.inOut',
        transformOrigin: 'center',
      }, '-=0.3')
      .from(messageSplit ? messageSplit.words : '.hero__message', {
        opacity: 0,
        y: messageSplit ? 16 : 0,
        duration: messageSplit ? 0.45 : 0.5,
        stagger: messageSplit ? 0.025 : 0,
        ease: 'power2.out',
      }, '-=0.4')
      .from('.hero__ornament', {
        opacity: 0,
        scale: prefersReduced ? 1 : 0,
        duration: 0.5,
        stagger: prefersReduced ? 0 : 0.12,
        ease: 'back.out(1.7)',
      }, '-=0.5');

    return () => {
      subtitleSplit?.revert();
      messageSplit?.revert();
    };
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="hero-section" aria-label="Sección principal de cumpleaños">
      <div className="hero__content">
        <p className="hero__eyebrow">✦ Un día muy especial ✦</p>

        <h1 className="hero__title">
          <span className="hero__title-main">
            <TegakiRenderer font={caveat} time={titleTime} style={{ fontSize: 'inherit', color: 'inherit' }}>
              Feliz
            </TegakiRenderer>
          </span>
          <span className="hero__title-accent">
            <TegakiRenderer font={caveat} time={titleTime} style={{ fontSize: 'inherit', color: 'inherit' }}>
              cumple!
            </TegakiRenderer>
          </span>
        </h1>

        <p className="hero__subtitle">
          Un día más, un año más.... espero la pases bien junto a tus cercanos :)
        </p>

        <div className="hero__divider" role="presentation" />

        <p className="hero__message">
          Ya sabrás quien soy, quizás veas esto y quizás no.
          Deseo que te valle bien, que disfrutes de este día a pesar de no ser un feriado.
          Deberían hacerlo feriado... 
        </p>

        <div className="hero__ornaments" aria-hidden="true">
          <span className="hero__ornament">🌻</span>
          <span className="hero__ornament">🌑</span>
          <span className="hero__ornament">🌸</span>
          <span className="hero__ornament">🎂</span>
          <span className="hero__ornament">🌸</span>
          <span className="hero__ornament">🌑</span>
          <span className="hero__ornament">🌻</span>
        </div>
      </div>

      <div className="hero__bg-glow" aria-hidden="true" />
    </section>
  );
}
