import type { ModeId } from '../games/modes';

/** Line-art quest icons, drawn for this project (no game assets). */
const PATHS: Record<ModeId, string> = {
  classic: 'M20 4 18.6 9.2 10 17.8 6.2 14 14.8 5.4Z M4.8 12.4l6.8 6.8 M8.1 15.9 3.6 20.4',
  compendium: 'M3 5.6c3-1.1 6-1 9 1 3-2 6-2.1 9-1v13c-3-1.1-6-1-9 1-3-2-6-2.1-9-1Z M12 6.6v13 M5.6 9.2c1.6-.3 3.1-.1 4.4.5 M5.6 12.4c1.6-.3 3.1-.1 4.4.5 M18.4 9.2c-1.6-.3-3.1-.1-4.4.5',
  surveyor: 'M2 12s3.6-6.2 10-6.2S22 12 22 12s-3.6 6.2-10 6.2S2 12 2 12Z M12 8.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Z',
  roar: 'M3.5 9.2v5.6h3.8l5 4.2V5l-5 4.2Z M15.6 8.6a4.8 4.8 0 0 1 0 6.8 M18.4 5.8a8.8 8.8 0 0 1 0 12.4',
};

export function ModeIcon({ mode, className }: { mode: ModeId; className?: string }) {
  return (
    <svg className={className ? `mode-icon ${className}` : 'mode-icon'} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={PATHS[mode]} />
    </svg>
  );
}
