import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './HeroSection.css';

gsap.registerPlugin(ScrollTrigger);

export default function HeroSection() {
  const sectionRef = useRef(null);

  useGSAP((_, contextSafe) => {
    const startFloating = contextSafe(() => {
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
      .from('.hero__subtitle', {
        opacity: 0,
        y: 24,
        duration: 0.7,
        ease: 'power2.out',
      }, '-=0.4')
      .from('.hero__divider', {
        scaleX: 0,
        duration: 0.8,
        ease: 'power2.inOut',
        transformOrigin: 'center',
      }, '-=0.3')
      .from('.hero__message', {
        opacity: 0,
        y: 20,
        duration: 0.7,
        ease: 'power2.out',
      }, '-=0.4')
      .from('.hero__ornament', {
        opacity: 0,
        scale: 0,
        duration: 0.5,
        stagger: 0.12,
        ease: 'back.out(1.7)',
      }, '-=0.5');
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="hero-section" aria-label="Sección principal de cumpleaños">
      <div className="hero__content">
        <p className="hero__eyebrow">✦ Un día muy especial ✦</p>

        <h1 className="hero__title">
          <span className="hero__title-main">¡Feliz</span>
          <span className="hero__title-accent"> Cumpleaños!</span>
        </h1>

        <p className="hero__subtitle">
          Que este día esté lleno de alegría, amor y momentos que atesorar para siempre.
        </p>

        <div className="hero__divider" role="presentation" />

        <p className="hero__message">
          Cada momento contigo es un regalo. Que este cumpleaños marque el inicio de
          tu mejor año, lleno de aventuras, risas y todo lo que mereces.
        </p>

        <div className="hero__ornaments" aria-hidden="true">
          <span className="hero__ornament">🌻</span>
          <span className="hero__ornament">✨</span>
          <span className="hero__ornament">🌸</span>
          <span className="hero__ornament">🎂</span>
          <span className="hero__ornament">🌸</span>
          <span className="hero__ornament">✨</span>
          <span className="hero__ornament">🌻</span>
        </div>
      </div>

      <div className="hero__bg-glow" aria-hidden="true" />
    </section>
  );
}
