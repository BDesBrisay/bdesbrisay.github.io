import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { FeedPage } from './features/feed/FeedPage';
import { RecapPage } from './features/session/RecapPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { PacksPage } from './features/packs/PacksPage';
import { UpdateBanner } from './components/UpdateBanner';
import { triggerAppUpdate } from './pwa';
import { useSessionStore } from './store/sessionStore';

const navClass = ({ isActive }: { isActive: boolean }): string => {
  return isActive ? 'app-nav__link app-nav__link--active' : 'app-nav__link';
};

const App = () => {
  const updateAvailable = useSessionStore((state) => state.updateAvailable);

  return (
    <div className="app-shell">
      <UpdateBanner
        visible={updateAvailable}
        onReload={async () => {
          await triggerAppUpdate();
        }}
      />

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/feed" replace />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/recap" element={<RecapPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/packs" element={<PacksPage />} />
        </Routes>
      </main>

      <nav className="app-nav" aria-label="Primary">
        <NavLink to="/feed" className={navClass}>
          Feed
        </NavLink>
        <NavLink to="/recap" className={navClass}>
          Recap
        </NavLink>
        <NavLink to="/packs" className={navClass}>
          Packs
        </NavLink>
        <NavLink to="/settings" className={navClass}>
          Settings
        </NavLink>
      </nav>
    </div>
  );
};

export default App;
