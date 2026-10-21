import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import type { ModeId } from './games/modes';
import { I18nProvider } from './i18n/I18nProvider';
import { About, NotFound } from './pages/About';
import { ClassicPage } from './pages/ClassicPage';
import { CompendiumPage } from './pages/CompendiumPage';
import { Home } from './pages/Home';
import { RoarPage } from './pages/RoarPage';
import { SurveyorPage } from './pages/SurveyorPage';
import { AppStateProvider, useAppState } from './state/AppState';
import { ScrollToTop } from './components/ScrollToTop';

/** Modes without their media (Surveyor needs pictures, Roar needs sounds) redirect to the home page. */
function Guard({ mode, children }: { mode: ModeId; children: React.ReactNode }) {
  const { modes } = useAppState();
  return modes.includes(mode) ? <>{children}</> : <Navigate to="/" replace />;
}

function Routed() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="classic" element={<ClassicPage />} />
        <Route path="compendium" element={<CompendiumPage />} />
        <Route path="surveyor" element={<Guard mode="surveyor"><SurveyorPage /></Guard>} />
        <Route path="roar" element={<Guard mode="roar"><RoarPage /></Guard>} />
        <Route path="about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  // Hash routing (#/classic) works on GitHub Pages without any server-side rewrites:
  // refreshing or opening a deep link always loads index.html.
  return (
    <I18nProvider>
      <AppStateProvider>
        <HashRouter>
          <ScrollToTop />
          <Routed />
        </HashRouter>
      </AppStateProvider>
    </I18nProvider>
  );
}
