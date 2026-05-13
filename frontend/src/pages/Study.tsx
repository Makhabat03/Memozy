import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { studyApi, cardsApi, gamifyApi, Card } from '../hooks/useApi';
import { useSounds } from '../hooks/useSounds';
import DeckCompleteScreen from '../components/animations/DeckCompleteScreen';
import GlassButton from '../components/GlassButton';
import CardFlipParticles from '../components/animations/CardFlipParticles';
import RatingFeedback from '../components/animations/RatingFeedback';

type StudyMode = 'flashcard' | 'multiple-choice' | 'typing';

const shuffleArray = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

const updateDailyProgress = () => {
  const key = `memozy_daily_${new Date().toISOString().split('T')[0]}`;
  localStorage.setItem(key, String(parseInt(localStorage.getItem(key) || '0') + 1));
};

const Study: React.FC = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const [searchParams] = useSearchParams();
  const isPractice = searchParams.get('mode') === 'practice';
  const { theme } = useTheme();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { play } = useSounds();

  const [cards, setCards] = useState<Card[]>([]);
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  // Study modes & features
  const [mode, setMode] = useState<StudyMode>('flashcard');
  const [hearts, setHearts] = useState(5);
  const [heartsEmpty, setHeartsEmpty] = useState(false);
  const [mcOptions, setMcOptions] = useState<string[]>([]);
  const [mcSelected, setMcSelected] = useState<string | null>(null);
  const [mcRevealed, setMcRevealed] = useState(false);
  const [typingAnswer, setTypingAnswer] = useState('');
  const [typingResult, setTypingResult] = useState<'correct' | 'wrong' | null>(null);
  const startTimeRef = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);

  // Gamification state
  const [xpEarned, setXpEarned] = useState(0);
  const [showXP, setShowXP] = useState(false);
  const [levelUp, setLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(1);
  const [badges, setBadges] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lastRating, setLastRating] = useState<'easy' | 'good' | 'hard' | null>(null);
  const [ratingKey, setRatingKey] = useState(0);
  const [shaking, setShaking] = useState(false);
  const [flipTrigger, setFlipTrigger] = useState(0);

  // Load cards
  useEffect(() => {
    if (!deckId) return;
    const loader = isPractice ? studyApi.getAllCards(deckId) : studyApi.getDueCards(deckId);
    loader.then(r => { setCards(r.data.cards); setLoading(false); });
    cardsApi.getByDeck(deckId).then(r => setAllCards(r.data.cards));
  }, [deckId, isPractice]);

  // Timer
  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  // MC options when card or mode changes
  useEffect(() => {
    if (mode !== 'multiple-choice' || cards.length === 0 || allCards.length === 0) return;
    const cur = cards[index];
    const pool = allCards.filter(c => c.id !== cur?.id);
    const distractors = shuffleArray(pool).slice(0, 3).map(c => c.back);
    while (distractors.length < 3) distractors.push(pool[0]?.back ?? '—');
    setMcOptions(shuffleArray([cur.back, ...distractors]));
    setMcSelected(null);
    setMcRevealed(false);
  }, [index, mode, allCards]);

  // Reset typing state on card change
  useEffect(() => { setTypingAnswer(''); setTypingResult(null); }, [index]);

  const handleFlip = useCallback(() => {
    play('waterDrop');
    setFlipped(prev => { if (!prev) setFlipTrigger(t => t + 1); return !prev; });
  }, [play]);

  // Stable ref so keyboard handler always has latest rate()
  const rateRef = useRef<(q: number) => void>(() => {});
  const flippedRef = useRef(flipped);
  flippedRef.current = flipped;
  const modeRef = useRef(mode);
  modeRef.current = mode;

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (modeRef.current !== 'flashcard') return;
      if ((e.key === ' ' || e.key === 'ArrowRight') && !flippedRef.current) {
        e.preventDefault(); handleFlip();
      }
      if (flippedRef.current) {
        if (e.key === '1') rateRef.current(1);
        else if (e.key === '2') rateRef.current(3);
        else if (e.key === '3') rateRef.current(5);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleFlip]);

  const rate = useCallback(async (quality: number) => {
    const card = cards[index];
    updateDailyProgress();
    await studyApi.rateCard(card.id, quality);

    const isCorrect = quality >= 3;
    const newCorrect = correct + (isCorrect ? 1 : 0);
    const newCombo = isCorrect ? combo + 1 : 0;

    // Hearts system (skip in practice / unlimited mode)
    if (!isPractice && hearts <= 5) {
      if (!isCorrect) {
        const next = hearts - 1;
        setHearts(next);
        if (next <= 0) { setHeartsEmpty(true); return; }
      } else if (quality === 5) {
        setHearts(h => Math.min(5, h + 1));
      }
    }

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
    setRatingKey(k => k + 1);

    const next = index + 1;
    if (next >= cards.length) { await finishSession(newCorrect); }
    else { setIndex(next); setFlipped(false); }
  }, [cards, index, correct, combo, hearts, isPractice, play]); // eslint-disable-line

  useEffect(() => { rateRef.current = rate; });

  const handleMCSelect = useCallback((opt: string) => {
    if (mcSelected) return;
    setMcSelected(opt);
    setMcRevealed(true);
    const isCorrect = opt === cards[index]?.back;
    setTimeout(() => rate(isCorrect ? 3 : 1), 900);
  }, [mcSelected, cards, index, rate]);

  const handleTypingSubmit = useCallback(() => {
    const isCorrect = typingAnswer.trim().toLowerCase() === cards[index]?.back.trim().toLowerCase();
    setTypingResult(isCorrect ? 'correct' : 'wrong');
    setTimeout(() => rate(isCorrect ? 3 : 1), 1100);
  }, [typingAnswer, cards, index, rate]);

  const finishSession = async (finalCorrect: number) => {
    play('deckComplete');
    if (!user || !deckId) return setDone(true);
    try {
      const res = await gamifyApi.studyComplete({
        user_id: user.id, deck_id: deckId,
        cards_reviewed: cards.length, correct_count: finalCorrect,
      });
      setXpEarned(res.data.xp_earned);
      setShowXP(true); setTimeout(() => setShowXP(false), 1500);
      setStreak(res.data.streak);
      if (res.data.leveled_up) { play('levelUp'); setNewLevel(res.data.new_level); setLevelUp(true); }
      if (res.data.badges_earned.length > 0) { play('badgeEarned'); setBadges(res.data.badges_earned); }
      if (res.data.streak > 1) play('streakContinue');
    } catch (e) { console.error(e); }
    setDone(true);
  };

  const switchMode = (m: StudyMode) => {
    setMode(m); setFlipped(false); setMcSelected(null); setMcRevealed(false);
    setTypingAnswer(''); setTypingResult(null);
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', fontFamily: theme.font }}>
      Loading...
    </div>
  );

  if (cards.length === 0) return (
    <div style={{ maxWidth: '500px', margin: '4rem auto', textAlign: 'center', fontFamily: theme.font }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{isPractice ? '📚' : '✅'}</div>
      <h2 style={{ color: theme.text }}>{isPractice ? 'No cards in this deck' : 'All caught up!'}</h2>
      <p style={{ color: theme.textLight }}>
        {isPractice ? 'Add some cards first.' : 'No cards due for review right now.'}
      </p>
      <GlassButton onClick={() => navigate('/decks')} style={{ marginTop: '1rem' }}>Back to Decks</GlassButton>
    </div>
  );

  if (done) return (
    <DeckCompleteScreen
      correct={correct} total={cards.length}
      xpEarned={xpEarned} showXP={showXP}
      levelUp={levelUp} newLevel={newLevel}
      badges={badges} streak={streak}
      onLevelUpClose={() => setLevelUp(false)}
      onBadgeDismiss={() => setBadges([])}
      onStudyAgain={() => {
        setIndex(0); setFlipped(false); setDone(false);
        setCorrect(0); setCombo(0); setLastRating(null);
        setHearts(5); startTimeRef.current = Date.now(); setElapsed(0);
        setMcSelected(null); setMcRevealed(false); setTypingAnswer(''); setTypingResult(null);
      }}
      onBack={() => navigate('/decks')}
    />
  );

  const current = cards[index];
  const progress = (index / cards.length) * 100;
  const showHearts = !isPractice && hearts <= 5;

  return (
    <>
      <CardFlipParticles trigger={flipTrigger} />
      <RatingFeedback rating={lastRating} ratingKey={ratingKey} combo={combo} />

      {/* ── Hearts-empty overlay ── */}
      <AnimatePresence>
        {heartsEmpty && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.78)',
              backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div initial={{ scale: 0.82, y: 24 }} animate={{ scale: 1, y: 0 }}
              style={{ background: theme.card, borderRadius: theme.borderRadius, padding: '2.25rem',
                textAlign: 'center', maxWidth: '340px', boxShadow: theme.shadow }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>💔</div>
              <h2 style={{ color: theme.text, margin: '0 0 0.5rem', fontWeight: 900 }}>Out of Hearts!</h2>
              <p style={{ color: theme.textLight, margin: '0 0 1.5rem', fontSize: '0.88rem', lineHeight: 1.6 }}>
                Hard cards come back tomorrow. Keep going without limits, or call it a day.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <GlassButton variant="outline" onClick={() => navigate('/decks')} style={{ flex: 1 }}>End Session</GlassButton>
                <GlassButton onClick={() => { setHeartsEmpty(false); setHearts(999); }} style={{ flex: 1 }}>Continue ∞</GlassButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: theme.font }}>
        <div style={{ width: '100%', maxWidth: '580px' }}>

          {/* Mode selector */}
          <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1.1rem',
            background: `${theme.primary}0e`, borderRadius: theme.borderRadius, padding: '0.28rem' }}>
            {([
              ['flashcard', '🃏 Flashcard'],
              ['multiple-choice', '🎯 Multiple Choice'],
              ['typing', '⌨️ Typing'],
            ] as [StudyMode, string][]).map(([m, label]) => (
              <button key={m} onClick={() => switchMode(m)} style={{
                flex: 1, padding: '0.42rem 0.25rem', border: 'none', borderRadius: '8px',
                cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700,
                background: mode === m ? theme.primary : 'transparent',
                color: mode === m ? '#fff' : theme.textLight,
                transition: 'all 0.15s', fontFamily: theme.font,
              }}>
                {label}
              </button>
            ))}
          </div>

          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
            <span style={{ color: theme.textLight, fontSize: '0.84rem' }}>
              {index + 1} / {cards.length}
              {isPractice && <span style={{ marginLeft: '0.4rem', fontSize: '0.7rem', color: theme.secondary, fontWeight: 800 }}>PRACTICE</span>}
            </span>

            {/* Hearts */}
            {showHearts && (
              <div style={{ display: 'flex', gap: '1px' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.span key={i}
                    animate={i === hearts - 1 && hearts < 5 ? { scale: [1, 1.5, 1] } : {}}
                    style={{ fontSize: '0.92rem', opacity: i < hearts ? 1 : 0.18, transition: 'opacity 0.3s' }}>
                    ❤️
                  </motion.span>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <AnimatePresence>
                {combo >= 2 && (
                  <motion.span key={combo} initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    style={{ fontSize: '0.76rem', fontWeight: 800, color: combo >= 5 ? theme.accent : theme.primary,
                      background: `${theme.primary}15`, padding: '0.18rem 0.6rem',
                      borderRadius: '999px', border: `1px solid ${theme.primary}30` }}>
                    🔥 {combo}×
                  </motion.span>
                )}
              </AnimatePresence>
              <span style={{ color: theme.textLight, fontSize: '0.8rem', fontVariantNumeric: 'tabular-nums' }}>
                ⏱ {formatTime(elapsed)}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ background: `${theme.primary}22`, borderRadius: '999px', height: '6px', marginBottom: '1.4rem' }}>
            <motion.div animate={{ width: `${progress}%` }} transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              style={{ height: '100%', borderRadius: '999px',
                background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
                boxShadow: `0 0 8px ${theme.primary}55` }} />
          </div>

          {/* ════ FLASHCARD MODE ════ */}
          {mode === 'flashcard' && (
            <motion.div animate={shaking ? { x: [-13, 13, -9, 9, -4, 4, 0] } : { x: 0 }} transition={{ duration: 0.42 }}>
              <div style={{ perspective: '1200px', cursor: 'pointer', marginBottom: '1.4rem' }} onClick={handleFlip}>
                <motion.div animate={{ rotateY: flipped ? 180 : 0 }} transition={{ type: 'spring', stiffness: 370, damping: 28 }}
                  style={{ transformStyle: 'preserve-3d', position: 'relative', height: '250px' }}>
                  {/* Front */}
                  <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                    background: theme.card, borderRadius: theme.borderRadius, boxShadow: theme.shadow,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '2rem', border: `2px solid ${theme.primary}33` }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: theme.secondary, marginBottom: '1rem', letterSpacing: '0.1em' }}>QUESTION</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: theme.text, textAlign: 'center', lineHeight: 1.5 }}>{current.front}</div>
                    <div style={{ marginTop: '1.4rem', color: theme.textLight, fontSize: '0.8rem' }}>
                      {t('flipHint')} 💧 <span style={{ opacity: 0.4, fontSize: '0.68rem' }}>[Space]</span>
                    </div>
                  </div>
                  {/* Back */}
                  <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)',
                    background: `linear-gradient(135deg, ${theme.primary}14, ${theme.secondary}14)`,
                    borderRadius: theme.borderRadius, boxShadow: `${theme.shadow}, 0 0 24px ${theme.primary}33`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '2rem', border: `2px solid ${theme.primary}66`, overflow: 'hidden' }}>
                    <AnimatePresence>
                      {flipped && (
                        <motion.div key={`shimmer-${index}`} initial={{ x: '-110%', opacity: 0.7 }} animate={{ x: '110%', opacity: 0 }}
                          transition={{ duration: 0.52, ease: 'easeOut' }}
                          style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
                            background: `linear-gradient(90deg, transparent, ${theme.primary}55, transparent)`,
                            borderRadius: theme.borderRadius }} />
                      )}
                    </AnimatePresence>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: theme.accent, marginBottom: '1rem', letterSpacing: '0.1em' }}>ANSWER</div>
                    <div style={{ fontSize: '1.1rem', color: theme.text, textAlign: 'center', lineHeight: 1.6 }}>{current.back}</div>
                    <div style={{ marginTop: '1.2rem', color: theme.textLight, fontSize: '0.7rem', opacity: 0.5 }}>
                      [1] {t('hard')} · [2] {t('good')} · [3] {t('easy')}
                    </div>
                  </div>
                </motion.div>
              </div>

              <AnimatePresence>
                {flipped && (
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                    {current.hint && (
                      <div style={{ background: `${theme.primary}14`, border: `1px solid ${theme.primary}30`,
                        borderRadius: theme.borderRadius, padding: '0.8rem 1rem' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: theme.secondary, letterSpacing: '0.08em' }}>💡 REMEMBER IT</span>
                        <div style={{ marginTop: '0.25rem', fontSize: '0.9rem', color: theme.text }}>{current.hint}</div>
                      </div>
                    )}
                    {current.example && (
                      <div style={{ background: `${theme.accent}11`, border: `1px solid ${theme.accent}30`,
                        borderRadius: theme.borderRadius, padding: '0.7rem 1rem' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: theme.accent, letterSpacing: '0.08em' }}>📝 EXAMPLE</span>
                        <div style={{ marginTop: '0.25rem', fontSize: '0.88rem', color: theme.textLight, fontStyle: 'italic' }}>"{current.example}"</div>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      {([
                        { label: `😤 ${t('hard')}`, quality: 1, tintColor: '#dc2626' },
                        { label: `👍 ${t('good')}`, quality: 3, tintColor: theme.secondary },
                        { label: `😎 ${t('easy')}`, quality: 5, tintColor: '#059669' },
                      ]).map(({ label, quality, tintColor }) => (
                        <GlassButton key={quality} onClick={() => rate(quality)} tintColor={tintColor}
                          style={{ flex: 1, padding: '0.85rem', fontSize: '0.93rem' }}>
                          {label}
                        </GlassButton>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ════ MULTIPLE CHOICE MODE ════ */}
          {mode === 'multiple-choice' && (
            <div>
              <motion.div animate={shaking ? { x: [-13, 13, -9, 9, 0] } : { x: 0 }} transition={{ duration: 0.38 }}
                style={{ background: theme.card, borderRadius: theme.borderRadius, boxShadow: theme.shadow,
                  border: `2px solid ${theme.primary}33`, padding: '2rem', textAlign: 'center', marginBottom: '1.1rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: theme.secondary, marginBottom: '0.9rem', letterSpacing: '0.1em' }}>QUESTION</div>
                <div style={{ fontSize: '1.18rem', fontWeight: 700, color: theme.text, lineHeight: 1.5 }}>{current.front}</div>
              </motion.div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {mcOptions.map((opt, i) => {
                  const isCorrect = opt === current.back;
                  const isSelected = opt === mcSelected;
                  const revealed = mcRevealed;
                  const bg = revealed
                    ? isCorrect ? '#05966920' : isSelected ? '#dc262620' : `${theme.primary}08`
                    : `${theme.primary}0a`;
                  const border = revealed
                    ? isCorrect ? '1.5px solid #05966660' : isSelected ? '1.5px solid #dc262660' : `1.5px solid ${theme.primary}18`
                    : `1.5px solid ${theme.primary}28`;
                  const color = revealed
                    ? isCorrect ? '#059669' : isSelected ? '#dc2626' : theme.textLight
                    : theme.text;
                  return (
                    <motion.button key={i} whileHover={!mcSelected ? { scale: 1.02, x: 3 } : {}} whileTap={!mcSelected ? { scale: 0.98 } : {}}
                      onClick={() => !mcSelected && handleMCSelect(opt)}
                      style={{ width: '100%', padding: '0.95rem 1.2rem', textAlign: 'left', background: bg,
                        border, borderRadius: theme.borderRadius, cursor: mcSelected ? 'default' : 'pointer',
                        color, fontWeight: 600, fontSize: '0.93rem', fontFamily: theme.font,
                        display: 'flex', alignItems: 'center', gap: '0.8rem', transition: 'all 0.18s' }}>
                      <span style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800,
                        background: revealed && isCorrect ? '#059669' : revealed && isSelected ? '#dc2626' : `${theme.primary}20`,
                        color: revealed && (isCorrect || isSelected) ? '#fff' : theme.textLight }}>
                        {revealed ? (isCorrect ? '✓' : isSelected ? '✗' : String.fromCharCode(65 + i)) : String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ════ TYPING MODE ════ */}
          {mode === 'typing' && (
            <div>
              <div style={{ background: theme.card, borderRadius: theme.borderRadius, boxShadow: theme.shadow,
                border: `2px solid ${theme.primary}33`, padding: '2rem', textAlign: 'center', marginBottom: '1.1rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: theme.secondary, marginBottom: '0.9rem', letterSpacing: '0.1em' }}>QUESTION</div>
                <div style={{ fontSize: '1.18rem', fontWeight: 700, color: theme.text, lineHeight: 1.5 }}>{current.front}</div>
              </div>

              {typingResult ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  style={{ padding: '1.5rem', textAlign: 'center', borderRadius: theme.borderRadius,
                    background: typingResult === 'correct' ? '#05966918' : '#dc262618',
                    border: `2px solid ${typingResult === 'correct' ? '#05966650' : '#dc262650'}` }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{typingResult === 'correct' ? '✅' : '❌'}</div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: typingResult === 'correct' ? '#059669' : '#dc2626', marginBottom: typingResult === 'wrong' ? '0.5rem' : 0 }}>
                    {typingResult === 'correct' ? 'Correct!' : 'Not quite...'}
                  </div>
                  {typingResult === 'wrong' && (
                    <div style={{ fontSize: '0.9rem', color: theme.textLight }}>
                      Answer: <strong style={{ color: theme.text }}>{current.back}</strong>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div>
                  <input autoFocus value={typingAnswer}
                    onChange={e => setTypingAnswer(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && typingAnswer.trim()) handleTypingSubmit(); }}
                    placeholder="Type your answer and press Enter..."
                    style={{ width: '100%', padding: '0.95rem 1rem', boxSizing: 'border-box',
                      border: `2px solid ${theme.primary}44`, borderRadius: theme.borderRadius,
                      background: theme.card, color: theme.text, fontFamily: theme.font,
                      fontSize: '1rem', outline: 'none', marginBottom: '0.8rem' }} />
                  <GlassButton onClick={handleTypingSubmit} fullWidth disabled={!typingAnswer.trim()}>
                    Check Answer →
                  </GlassButton>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default Study;
