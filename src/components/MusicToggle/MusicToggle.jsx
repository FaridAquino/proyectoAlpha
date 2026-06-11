import { useRef, useState, useEffect } from 'react';
import './MusicToggle.css';

const AUDIO_SRC = '/proyectoAlpha/audio/BajoElAgua.mp3';

export default function MusicToggle({ autoStart = false }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [available, setAvailable] = useState(true);
  const [needsTap, setNeedsTap] = useState(false);

  // intenta arrancar cuando termina el video; si el navegador
  // bloquea el autoplay, el botón invita al click con un pulso
  useEffect(() => {
    if (!autoStart || !available) return;
    const audio = audioRef.current;
    if (!audio || !audio.paused) return;
    audio.volume = 0.55;
    audio.play()
      .then(() => setPlaying(true))
      .catch(() => setNeedsTap(true));
  }, [autoStart, available]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    audio.volume = 0.55;
    audio.play()
      .then(() => {
        setPlaying(true);
        setNeedsTap(false);
      })
      .catch(() => setAvailable(false));
  };

  if (!available) return null;

  return (
    <>
      <audio
        ref={audioRef}
        src={AUDIO_SRC}
        loop
        preload="auto"
        onError={() => setAvailable(false)}
      />
      <button
        className={`music-toggle${playing ? ' is-playing' : ''}${needsTap ? ' is-inviting' : ''}`}
        onClick={toggle}
        aria-label={playing ? 'Pausar música' : 'Reproducir música'}
        aria-pressed={playing}
      >
        <span className="music-toggle__bars" aria-hidden="true">
          <i /><i /><i />
        </span>
      </button>
    </>
  );
}
