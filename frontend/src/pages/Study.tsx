import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { studyApi, gamifyApi, Card } from '../hooks/useApi';
import { useSounds } from '../hooks/useSounds';
import DeckCompleteScreen from '../components/animations/DeckCompleteScreen';
import GlassButton from '../components/GlassButton';
import CardFlipParticles from '../components/animations/CardFlipParticles';
import RatingFeedback from '../components/animations/RatingFeedback';

const Study: React.FC = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { play } = useSounds();

  const [cards, setCards] = useState<Card[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  // Completion screen state
  const [xpEarned, setXpEarned] = useState(0);
  const [showXP, setShowXP] = useState(false);
  const [levelUp, setLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(1);
  const [badges, setBadges] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);

  // Gamification feedback
  const [combo, setCombo] = useState(0);
  const [lastRating, setLastRating] = useState<'easy' | 'good' | 'hard' | null>(null);
  const [ratingKey, setRatingKey] = useState(0);
  const [shaking, setShaking] = useState(false);
  const [flipTrigger, setFlipTrigger] = useState(0);

  useEffect(() => {
    if (!deckId) return;
    studyApi.getDueCards(deckId).then((r) => {
      setCards(r.data.cards.length > 0 ? r.data.cards : []);
      setLoading(false);
    });
  }, [deckId]);

  const handleFlip = () => {
    play('waterDrop');
    setFlipped((prev) => {
      if (!prev) setFlipTrigger((t) => t + 1); // particle burst only on reveal
      return !prev;
    });
  };

  const rate = async (quality: number) => {
    const card = cards[index];
    await studyApi.rateCard(card.id, quality);

    const isCorrect = quality >= 3;
    const newCorrect = correct + (isCorrect ? 1 : 0);
    const newCombo = isCorrect ? combo + 1 : 0;

    if (isCorrect) {
      play(quality === 5 ? 'easy' : 'good');
      setCorrect(newCorrect);
      setCombo(newCombo);
      if (newCombo >= 3) play('combo');
      setLastRating(quality === 5 ? 'easy' : 'good');
    } else {
      play('incorrect');
      setCombo(0);
      setLastRating('hard');
      setShaking(true);
      setTimeout(() => setShaking(false), 440);
    }
    setRatingKey((k) => k + 1);

    const next = index + 1;
    if (next >= cards.length) {
      await finishSession(newCorrect);
    } else {
      setIndex(next);
      setFlipped(false);
    }
  };

  const finishSession = async (finalCorrect: number) => {
    play('deckComplete');
    if (!user || !deckId) return setDone(true);
    try {
      const res = await gamifyApi.studyComplete({
        user_id: user.id,
        deck_id: deckId,
        cards_reviewed: cards.length,
        correct_count: finalCorrect,
      });
      setXpEarned(res.data.xp_earned);
      setShowXP(true);
      setTimeout(() => setShowXP(false), 1500);
      setStreak(res.data.streak);
      if (res.data.leveled_up) {
        play('levelUp');
        setNewLevel(res.data.new_level);
        setLevelUp(true);
      }
      if (res.data.badges_earned.length > 0) {
        play('badgeEarned');
        setBadges(res.data.badges_earned);
      }
      if (res.data.streak > 1) play('streakContinue');
    } catch (e) {
      console.error('study-complete failed:', e);
    }
    setDone(true);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', fontFamily: theme.font }}>
        Loading...
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div style={{ maxWidth: '500px', margin: '4rem auto', textAlign: 'center', fontFamily: theme.font }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
        <h2 style={{ color: theme.text }}>All caught up!</h2>
        <p style={{ color: theme.textLight }}>No cards due for review right now.</p>
        <GlassButton onClick={() => navigate('/decks')} style={{ marginTop: '1rem' }}>
          Back to Decks
        </GlassButton>
      </div>
    );
  }

  if (done) {
    return (
      <DeckCompleteScreen
        correct={correct}
        total={cards.length}
        xpEarned={xpEarned}
        showXP={showXP}
        levelUp={levelUp}
        newLevel={newLevel}
        badges={badges}
        streak={streak}
        onLevelUpClose={() => setLevelUp(false)}
        onBadgeDismiss={() => setBadges([])}
        onStudyAgain={() => {
          setIndex(0); setFlipped(false); setDone(false);
          setCorrect(0); setCombo(0); setLastRating(null);
        }}
        onBack={() => navigate('/decks')}
      />
    );
  }

  const current  = cards[index];
  const progress = (index / cards.length) * 100;

  return (
    <>
      <CardFlipParticles trigger={flipTrigger} />
      <RatingFeedback rating={lastRating} ratingKey={ratingKey} combo={combo} />

      <div style={{
        minHeight: 'calc(100vh - 60px)',
        background: theme.background,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '2rem 1rem', fontFamily: theme.font,
      }}>
        <div style={{ width: '100%', maxWidth: '580px' }}>

          {/* Progress header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ color: theme.textLight, fontSize: '0.85rem' }}>
              {index + 1} / {cards.length}
            </span>

            <AnimatePresence>
              {combo >= 2 && (
                <motion.span
                  key={combo}
                  initial={{ opacity: 0, scale: 0.7, y: 4 }}
                  animate={{ opacity: 1, scale: 1,   y: 0 }}
                  exit={{   opacity: 0, scale: 0.7,  y: -4 }}
                  style={{
                    fontSize: '0.78rem', fontWeight: 800,
                    color: combo >= 5 ? theme.accent : theme.primary,
                    background: `${theme.primary}15`,
                    padding: '0.2rem 0.65rem', borderRadius: '999px',
                    border: `1px solid ${theme.primary}33`,
                  }}
                >
                  🔥 {combo}× streak
                </motion.span>
              )}
            </AnimatePresence>

            <span style={{ color: theme.textLight, fontSize: '0.85rem' }}>
              {Math.round(progress)}%
            </span>
          </div>

          {/* Progress bar */}
          <div style={{ background: `${theme.primary}22`, borderRadius: '999px', height: '6px', marginBottom: '2rem' }}>
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              style={{
                height: '100%', borderRadius: '999px',
                background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
                boxShadow: `0 0 8px ${theme.primary}55`,
              }}
            />
          </div>

          {/* Card — with shake wrapper */}
          <motion.div
            animate={shaking ? { x: [-13, 13, -9, 9, -4, 4, 0] } : { x: 0 }}
            transition={{ duration: 0.42 }}
          >
            <div
              style={{ perspective: '1200px', cursor: 'pointer', marginBottom: '2rem' }}
              onClick={handleFlip}
            >
              <motion.div
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ type: 'spring', stiffness: 370, damping: 28 }}
                style={{ transformStyle: 'preserve-3d', position: 'relative', height: '280px' }}
              >
                {/* Front face */}
                <div style={{
                  position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                  background: theme.card, borderRadius: theme.borderRadius,
                  boxShadow: theme.shadow,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', padding: '2rem',
                  border: `2px solid ${theme.primary}33`,
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: theme.secondary, marginBottom: '1rem', letterSpacing: '0.1em' }}>
                    QUESTION
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, textAlign: 'center', lineHeight: 1.5 }}>
                    {current.front}
                  </div>
                  <div style={{ marginTop: '1.5rem', color: theme.textLight, fontSize: '0.85rem' }}>
                    {t('flipHint')} 💧
                  </div>
                </div>

                {/* Back face */}
                <div style={{
                  position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  background: `linear-gradient(135deg, ${theme.primary}14, ${theme.secondary}14)`,
                  borderRadius: theme.borderRadius,
                  boxShadow: `${theme.shadow}, 0 0 24px ${theme.primary}33`,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', padding: '2rem',
                  border: `2px solid ${theme.primary}66`,
                  overflow: 'hidden',
                }}>
                  {/* Shimmer sweep on reveal */}
                  <AnimatePresence>
                    {flipped && (
                      <motion.div
                        key={`shimmer-${index}`}
                        initial={{ x: '-110%', opacity: 0.7 }}
                        animate={{ x: '110%',  opacity: 0   }}
                        transition={{ duration: 0.52, ease: 'easeOut' }}
                        style={{
                          position: 'absolute', inset: 0, pointerEvents: 'none',
                          background: `linear-gradient(90deg, transparent, ${theme.primary}55, transparent)`,
                          borderRadius: theme.borderRadius,
                        }}
                      />
                    )}
                  </AnimatePresence>

                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: theme.accent, marginBottom: '1rem', letterSpacing: '0.1em' }}>
                    ANSWER
                  </div>
                  <div style={{ fontSize: '1.15rem', color: theme.text, textAlign: 'center', lineHeight: 1.6 }}>
                    {current.back}
                  </div>
                  <div style={{ marginTop: '1.5rem', color: theme.textLight, fontSize: '0.8rem' }}>
                    Tap to flip back 💧
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Extras + buttons (appear when flipped) */}
          <AnimatePresence>
            {flipped && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0  }}
                style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
              >
                {current.hint && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 }}
                    style={{
                      background: `linear-gradient(135deg, ${theme.primary}14, ${theme.secondary}14)`,
                      border: `1px solid ${theme.primary}33`, borderRadius: theme.borderRadius,
                      padding: '0.85rem 1rem', fontSize: '0.95rem', color: theme.text, lineHeight: 1.5,
                    }}
                  >
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: theme.secondary, letterSpacing: '0.08em' }}>
                      💡 REMEMBER IT
                    </span>
                    <br />
                    <span style={{ marginTop: '0.25rem', display: 'inline-block' }}>{current.hint}</span>
                  </motion.div>
                )}

                {current.example && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    style={{
                      background: `${theme.accent}11`, border: `1px solid ${theme.accent}33`,
                      borderRadius: theme.borderRadius, padding: '0.75rem 1rem',
                      fontSize: '0.88rem', color: theme.textLight, fontStyle: 'italic', lineHeight: 1.55,
                    }}
                  >
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: theme.accent, letterSpacing: '0.08em', fontStyle: 'normal' }}>
                      📝 EXAMPLE
                    </span>
                    <br />
                    <span style={{ marginTop: '0.25rem', display: 'inline-block' }}>"{current.example}"</span>
                  </motion.div>
                )}

                {/* Rating buttons */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {[
                    { label: `😤 ${t('hard')}`, quality: 1, tintColor: '#dc2626' },
                    { label: `👍 ${t('good')}`, quality: 3, tintColor: theme.secondary },
                    { label: `😎 ${t('easy')}`, quality: 5, tintColor: '#059669' },
                  ].map(({ label, quality, tintColor }) => (
                    <GlassButton
                      key={quality}
                      onClick={() => rate(quality)}
                      tintColor={tintColor}
                      style={{ flex: 1, padding: '0.88rem', fontSize: '0.95rem' }}
                    >
                      {label}
                    </GlassButton>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default Study;
