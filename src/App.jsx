import { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

import VideoIntro from './components/VideoIntro/VideoIntro';
import FlowerCanvas from './components/FlowerCanvas/FlowerCanvas';
import HeroSection from './components/HeroSection/HeroSection';
import CircularGallery from './components/CircularGallery/CircularGallery';
import Confetti from './components/Confetti/Confetti';
import GiftBox from './components/GiftBox/GiftBox';

import './App.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const COLLAGE_SRC = '/proyectoAlpha/images/girasol1.png';
const COLLAGE_COUNT = 6;

function App() {
  const collageRef = useRef(null);
  const [videoEnded, setVideoEnded] = useState(false);

  useGSAP((_, contextSafe) => {
    const startFloating = contextSafe(() => {
      const photos = collageRef.current.querySelectorAll('.collage-photo');
      photos.forEach((el, i) => {
        gsap.to(el, {
          y: `+=${5 + (i % 3) * 2}`,
          duration: 2.4 + i * 0.28,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: i * 0.18,
        });
      });
    });

    gsap.timeline({ onComplete: startFloating })
      .from('.collage-photo', {
        y: -140,
        opacity: 0,
        rotation: (i) => i % 2 === 0 ? -28 : 28,
        duration: 1.2,
        stagger: 0.16,
        ease: 'back.out(1.5)',
        delay: 0.4,
      });
  }, { scope: collageRef });

  return (
    <>
      <Confetti />
      <VideoIntro onEnd={() => setVideoEnded(true)} />
      <FlowerCanvas />
      <main className="main-content">
        <div ref={collageRef} className="page-collage" aria-hidden="true">
          {Array.from({ length: COLLAGE_COUNT }, (_, i) => (
            <img
              key={i}
              src={COLLAGE_SRC}
              className={`collage-photo collage-photo--${i + 1}`}
              alt=""
            />
          ))}
        </div>
        <HeroSection videoEnded={videoEnded} />
        <section className="gallery-section" aria-label="Galería de fotos">
          <div className="gallery-section__header">
            <p className="gallery-section__eyebrow">✦ Momentos especiales ✦</p>
            <h2 className="gallery-section__title">Recuerdos que guardamos</h2>
            <p className="gallery-section__hint">Arrastra o desplázate para explorar</p>
          </div>
          <div className="gallery-canvas-wrapper">
            <CircularGallery
              items={[
                { image: '/proyectoAlpha/images/Espacio1.jpg', text: 'Nebulosa de Orión' },
                { image: '/proyectoAlpha/images/Espacio2.jpg', text: 'Senda de la Vía Láctea' },
                { image: '/proyectoAlpha/images/Espacio3.jpg', text: 'Lluvia de Estrellas' },
                { image: '/proyectoAlpha/images/Espacio4.jpg', text: 'Galaxia de Andrómeda' },
                { image: '/proyectoAlpha/images/Espacio5.jpg', text: 'Polvo Cósmico' },
                { image: '/proyectoAlpha/images/Espacio6.jpg', text: 'Aurora Estelar' },
              ]}
              bend={3}
              textColor="#FFE135"
              borderRadius={0.05}
              scrollEase={0.03}
              font="bold 26px 'Playfair Display', Georgia, serif"
              fontUrl="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap"
            />
          </div>
        </section>
        <GiftBox />
      </main>
    </>
  );
}

export default App;
