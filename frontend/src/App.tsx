import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AnimatedBackground from './components/AnimatedBackground';
import Navbar from './components/Navbar';
import FirstLaunch from './pages/FirstLaunch';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Create from './pages/Create';
import Study from './pages/Study';
import Decks from './pages/Decks';
import Social from './pages/Social';
import ProfilePage from './pages/Profile';

const hasLaunched = () => !!localStorage.getItem('flashai_launched');

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();
  const [launched, setLaunched] = React.useState(hasLaunched);

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
        {/* Animated background behind everything */}
        <AnimatedBackground />
        {/* All app content sits above the canvas */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <AppRoutes />
        </div>
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
