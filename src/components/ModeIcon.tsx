import type { ModeId } from '../types';

const BASE = `${import.meta.env.BASE_URL}media/ui/`;
const ICONS: Record<ModeId, { open: string; cleared: string }> = {
  classic: { open: 'hunter-dle.svg', cleared: 'hunter-dle-success.svg' },
  compendium: { open: 'description.svg', cleared: 'compendium-success.svg' },
  surveyor: { open: 'photomatou.svg', cleared: 'surveyor-success.svg' },
  roar: { open: 'son.svg', cleared: 'roar-success.svg' },
};

/** The mode's emblem (public/media/ui/). `cleared` switches to the completed variant, as on the original's home page. */
export function ModeIcon({ mode, cleared = false, size = 24 }: { mode: ModeId; cleared?: boolean; size?: number }) {
  const file = ICONS[mode][cleared ? 'cleared' : 'open'];
  return <img className="mode-icon" src={BASE + file} alt="" aria-hidden="true" width={size} height={size} draggable={false} />;
}
