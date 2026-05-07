import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import XPPopup from './XPPopup';
import LevelUpModal from './LevelUpModal';
import BadgeEarnedToast from './BadgeEarnedToast';
import ConfettiEffect from './ConfettiEffect';

export interface DeckCompleteScreenProps {
  correct: number;
  total: number;
  xpEarned: number;
  showXP: boolean;
  levelUp: boolean;
  newLevel: number;
  badges: string[];
  streak: number;
  onLevelUpClose: () => void;
  onBadgeDismiss: () => void;
  onStudyAgain: () => void;
  onBack: () => void;
}

const TIERS = [
  { pct: 100, emoji: '🌟', title: 'FLAWLESS!',   color: '#fbbf24' },
  { pct: 80,  emoji: '🔥', title: 'EXCELLENT!',  color: '#f97316' },
  { pct: 60,  emoji: '💪', title: 'GREAT WORK!', color: '#22c55e' },
  { pct: 0,   emoji: '📚', title: 'KEEP GOING!', color: '#6366f1' },
];

const DeckCompleteScreen: React.FC<DeckCompleteScreenProps> = ({
  correct, total, xpEarned, showXP, levelUp, newLevel, badges, streak,
  onLevelUpClose, onBadgeDismiss, onStudyAgain, onBack,
}) => {
  const { theme } = useTheme();
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const stars = pct === 100 ? 3 : pct >= 60 ? 2 : 1;
  const tier = TIERS.find((t) => pct >= t.pct) ?? TIERS[TIERS.length - 1];

  const [score, setScore]       = useState(0);
  const [xpDisp, setXpDisp]     = useState(0);
  const [starsShown, setStarsShown] = useState(0);
  const [barReady, setBarReady] = useState(false);

  useEffect(() => {
    for (let i = 1; i <= stars; i++) {
      setTimeout(() => setStarsShown(i), 280 + i * 360);
    }

    let v = 0;
    const scoreTimer = setInterval(() => {
      v = Math.min(v + Math.max(1, Math.ceil(correct / 22)), correct);
      setScore(v);
      if (v >= correct) clearInterval(scoreTimer);
    }, 38);

    setTimeout(() => {
      let xv = 0;
      const xpTimer = setInterval(() => {
        xv = Math.min(xv + Math.max(1, Math.ceil(xpEarned / 20)), xpEarned);
        setXpDisp(xv);
        if (xv >= xpEarned) clearInterval(xpTimer);
      }, 48);
    }, 900);

    setTimeout(() => setBarReady(true), 580);
    return () => clearInterval(scoreTimer);
  }, [correct, stars, xpEarned]);

  return (
    <>
      <ConfettiEffect active />
      <XPPopup xp={xpEarned} show={showXP} />
      <LevelUpModal show={levelUp} level={newLevel} onClose={onLevelUpClose} />
      <BadgeEarnedToast badges={badges} onDismiss={onBadgeDismiss} />

      <div style={{
        maxWidth: '460px', margin: '2.5rem auto', padding: '1rem 1rem 2rem',
        fontFamily: theme.font, textAlign: 'center',
      }}>
        {/* Performance header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.55, y: -12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          style={{ marginBottom: '0.85rem' }}
        >
          <motion.div
            animate={{ rotate: [0, -12, 12, -6, 6, 0], scale: [1, 1.18, 1] }}
            transition={{ duration: 0.65, delay: 0.1 }}
            style={{ fontSize: '3.5rem', lineHeight: 1, marginBottom: '0.4rem' }}
          >
            {tier.emoji}
          </motion.div>
          <div style={{
            fontSize: '2rem', fontWeight: 900, letterSpacing: '0.06em',
            background: `linear-gradient(135deg, ${tier.color}, ${theme.primary})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            {tier.title}
          </div>
        </motion.div>

        {/* Stars */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', marginBottom: '1.35rem' }}>
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={
                starsShown >= i
                  ? { scale: [0, 1.5, 1], rotate: [0, 24, 0], opacity: 1 }
                  : { scale: 0.25, opacity: 0.2 }
              }
              transition={{ type: 'spring', stiffness: 420, damping: 14, delay: starsShown >= i ? 0 : 0 }}
              style={{ fontSize: '2.4rem' }}
            >
              {starsShown >= i ? '⭐' : '☆'}
            </motion.div>
          ))}
        </div>

        {/* Stats card */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, type: 'spring', stiffness: 200, damping: 22 }}
          style={{
            background: theme.card, borderRadius: theme.borderRadius,
            padding: '1.75rem 1.5rem', boxShadow: theme.shadow, marginBottom: '1.25rem',
          }}
        >
          {/* Score */}
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.25rem', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '4.5rem', fontWeight: 900, color: theme.primary, lineHeight: 1 }}>
              {score}
            </span>
            <span style={{ fontSize: '1.8rem', color: theme.textLight, fontWeight: 700 }}>
              /{total}
            </span>
          </div>
          <div style={{ color: theme.textLight, fontSize: '0.88rem', marginBottom: '1.3rem' }}>
            cards correct
          </div>

          {/* Accuracy bar */}
          <div style={{ background: `${theme.primary}20`, borderRadius: '999px', height: '10px', marginBottom: '0.38rem' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: barReady ? `${pct}%` : 0 }}
              transition={{ duration: 0.95, delay: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
              style={{
                height: '100%',
                background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
                borderRadius: '999px',
                boxShadow: `0 0 10px ${theme.primary}66`,
              }}
            />
          </div>
          <div style={{ fontSize: '0.83rem', color: theme.textLight, marginBottom: '1.1rem' }}>
            {pct}% accuracy
          </div>

          {/* XP + Streak chips */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.88 }}
              style={{
                flex: 1, padding: '0.75rem', borderRadius: theme.borderRadius,
                background: `${theme.accent}16`, border: `1px solid ${theme.accent}33`,
              }}
            >
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: theme.accent }}>
                +{xpDisp}
              </div>
              <div style={{ fontSize: '0.72rem', color: theme.textLight }}>XP earned</div>
            </motion.div>

            {streak > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.75 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.05 }}
                style={{
                  flex: 1, padding: '0.75rem', borderRadius: theme.borderRadius,
                  background: '#fef3c722', border: '1px solid #fbbf2444',
                }}
              >
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#f97316' }}>
                  🔥 {streak}
                </div>
                <div style={{ fontSize: '0.72rem', color: theme.textLight }}>day streak</div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          style={{ display: 'flex', gap: '0.75rem' }}
        >
          <button
            onClick={onStudyAgain}
            style={{
              flex: 1, background: `${theme.primary}18`, color: theme.primary,
              border: `1.5px solid ${theme.primary}44`, borderRadius: theme.borderRadius,
              padding: '0.88rem', fontFamily: theme.font, fontWeight: 700,
              fontSize: '0.95rem', cursor: 'pointer',
            }}
          >
            🔄 Study Again
          </button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onBack}
            style={{
              flex: 1, background: theme.primary, color: '#fff', border: 'none',
              borderRadius: theme.borderRadius, padding: '0.88rem',
              fontFamily: theme.font, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
              boxShadow: `0 4px 18px ${theme.primary}44`,
            }}
          >
            ← Back to Decks
          </motion.button>
        </motion.div>
      </div>
    </>
  );
};

export default DeckCompleteScreen;
