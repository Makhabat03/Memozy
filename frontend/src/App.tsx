import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AnimatedBackground from './components/AnimatedBackground';
import CursorEffect from './components/CursorEffect';
import Navbar from './components/Navbar';
import FirstLaunch from './pages/FirstLaunch';
import Auth from './pages/Auth';
import TourOverlay from './components/TourOverlay';
import { TourProvider, useTour } from './context/TourContext';
import Dashboard from './pages/Dashboard';
import Create from './pages/Create';
import Study from './pages/Study';
import Decks from './pages/Decks';
import Social from './pages/Social';
import ProfilePage from './pages/Profile';

const hasLaunched  = () => !!localStorage.getItem('memozy_launched');
const hasOnboarded = () => !!localStorage.getItem('memozy_onboarded');

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();
  const { startTour }     = useTour();
  const [launched, setLaunched] = React.useState(hasLaunched);

  // Auto-start tour on first sign-in
  React.useEffect(() => {
    if (user && !hasOnboarded()) {
      const t = setTimeout(startTour, 900);
      return () => clearTimeout(t);
    }
  }, [user]); // eslint-disable-line

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
        ⚡
      </div>
    );
  }

  if (!launched) {
    return <FirstLaunch onComplete={() => setLaunched(true)} />;
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <>
      <Navbar />
      <TourOverlay />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create" element={<Create />} />
        <Route path="/study/:deckId" element={<Study />} />
        <Route path="/decks" element={<Decks />} />
        <Route path="/social" element={<Social />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

const App: React.FC = () => (
  <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <TourProvider>
        {/* Animated background behind everything */}
        <AnimatedBackground />
        <CursorEffect />
        {/* All app content sits above the canvas */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <AppRoutes />
        </div>
        </TourProvider>
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
