import { useEffect, useRef, useState } from 'react';
import { ModeShell } from '../components/ModeShell';
import { mediaUrl } from '../data';
import { useRound } from '../hooks/useRound';
import { useI18n } from '../i18n/I18nProvider';

function RoarPlayer({ src }: { src: string }) {
  const { t } = useI18n();
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (audio.current) audio.current.volume = volume;
  }, [volume]);

  const toggle = () => {
    const a = audio.current;
    if (!a) return;
    if (a.paused) a.play().catch(() => setPlaying(false));
    else a.pause();
  };

  return (
    <div className="player">
      <audio
        ref={audio}
        src={src}
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setProgress(0);
        }}
        onTimeUpdate={(e) => {
          const a = e.currentTarget;
          setProgress(a.duration ? a.currentTime / a.duration : 0);
        }}
      />
      <button type="button" className="player-btn" onClick={toggle} aria-label={t(playing ? 'roar.pause' : 'roar.play')}>
        <span aria-hidden="true">{playing ? '❚❚' : '▶'}</span>
      </button>
      <div className="player-track" role="progressbar" aria-label={t('roar.progress')} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
        <span style={{ inlineSize: `${progress * 100}%` }} />
      </div>
      <label className="player-volume">
        <span className="sr-only">{t('roar.volume')}</span>
        <span aria-hidden="true">🔈</span>
        <input type="range" min={0} max={1} step={0.05} value={volume} onChange={(e) => setVolume(Number(e.target.value))} />
      </label>
    </div>
  );
}

export function RoarPage() {
  const api = useRound('roar');
  const src = api.answer ? mediaUrl('audio', api.answer.id) : null;
  return <ModeShell mode="roar" api={api} clue={src && <RoarPlayer key={src} src={src} />} />;
}
