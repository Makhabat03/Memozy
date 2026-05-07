import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { ThemeName, themes } from '../themes';

interface FirstLaunchProps {
  onComplete: () => void;
}

const FirstLaunch: React.FC<FirstLaunchProps> = ({ onComplete }) => {
  const { setTheme } = useTheme();
  const [hovered, setHovered] = useState<ThemeName | null>(null);

  const handleSelect = (name: ThemeName) => {
    setTheme(name);
    localStorage.setItem('flashai_launched', '1');
    onComplete();
  };

  const themeList = Object.values(themes);
  const preview = hovered ? themes[hovered] : null;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: preview
          ? `linear-gradient(135deg, ${preview.background} 0%, ${preview.primary}22 100%)`
          : 'linear-gradient(135deg, #0a0015 0%, #1e1b4b 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', sans-serif",
        padding: '2rem 1rem',
        transition: 'background 0.5s ease',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: '2.5rem' }}
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          style={{ fontSize: '3rem', marginBottom: '0.5rem' }}
        >
          ⚡
        </motion.div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', margin: '0 0 0.5rem', textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
          Welcome to FlashAI
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
          Choose your theme to get started
        </p>
      </motion.div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))',
          gap: '1rem',
          width: '100%',
          maxWidth: '900px',
        }}
      >
        {themeList.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.07 }}
            whileHover={{ scale: 1.06, y: -6 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => handleSelect(t.name)}
            onMouseEnter={() => setHovered(t.name)}
            onMouseLeave={() => setHovered(null)}
            style={{
              background: t.card,
              borderRadius: t.borderRadius,
              padding: '1.4rem 1rem',
              cursor: 'pointer',
              border: `2px solid ${hovered === t.name ? t.primary : t.primary + '44'}`,
              boxShadow: hovered === t.name ? t.shadow : '0 4px 16px rgba(0,0,0,0.2)',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              textAlign: 'center',
              fontFamily: t.font,
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.6rem' }}>{t.emoji}</div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: t.primary, marginBottom: '0.4rem' }}>
              {t.label}
            </div>

            {/* Mini card preview */}
            <div
              style={{
                background: t.background,
                borderRadius: t.borderRadius,
                padding: '0.6rem',
                margin: '0.5rem 0',
                border: `1px solid ${t.primary}33`,
              }}
            >
              <div style={{ fontSize: '0.6rem', fontWeight: 700, color: t.primary, marginBottom: '0.25rem' }}>
                Q: What is AI?
              </div>
              <div style={{ fontSize: '0.55rem', color: t.textLight, lineHeight: 1.4 }}>
                Artificial Intelligence...
              </div>
            </div>

            <div
              style={{
                display: 'inline-block',
                background: t.primary,
                color: '#fff',
                borderRadius: '999px',
                padding: '0.25rem 0.75rem',
                fontSize: '0.7rem',
                fontWeight: 700,
                marginTop: '0.4rem',
              }}
            >
              Select
            </div>
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: '2rem' }}
      >
        You can change your theme anytime in Profile
      </motion.p>
    </div>
  );
};

export default FirstLaunch;
