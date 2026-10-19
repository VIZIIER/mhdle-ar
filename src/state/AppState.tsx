import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { dayKey } from '../utils/day';
import { installedModes, type ModeId } from '../games/modes';
import { loadSettings, saveSettings, type Settings } from '../persistence/settings';

type Dialog = null | 'games' | 'stats';

interface AppState {
  settings: Settings;
  setGames: (games: string[]) => void;
  /** The local day the game is showing (YYYY-MM-DD). */
  day: string;
  /** True once the clock has passed midnight but the page still shows the previous day. */
  dayStale: boolean;
  refreshDay: () => void;
  modes: ModeId[];
  dialog: Dialog;
  openDialog: (d: Dialog) => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [day, setDay] = useState(() => dayKey());
  const [now, setNow] = useState(() => dayKey());
  // First visit: ask for the game selection, unless a share link already carries one (?s=).
  const [dialog, setDialog] = useState<Dialog>(() =>
    loadSettings().configured || /[?&]s=/.test(window.location.hash) ? null : 'games',
  );

  // Watch the clock: once midnight passes, offer the new day instead of swapping it under the player.
  useEffect(() => {
    const tick = () => setNow(dayKey());
    const id = window.setInterval(tick, 15_000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, []);

  const setGames = useCallback((games: string[]) => {
    const next = { games, configured: true };
    setSettings(next);
    saveSettings(next);
  }, []);

  const refreshDay = useCallback(() => setDay(dayKey()), []);
  const modes = useMemo(() => installedModes(), []);

  const value = useMemo<AppState>(
    () => ({ settings, setGames, day, dayStale: now !== day, refreshDay, modes, dialog, openDialog: setDialog }),
    [settings, setGames, day, now, refreshDay, modes, dialog],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAppState must be used inside AppStateProvider');
  return ctx;
}
