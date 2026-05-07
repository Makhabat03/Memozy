import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { decksApi, gamifyApi, Deck, Profile } from '../hooks/useApi';
import StreakFlame from '../components/animations/StreakFlame';
import { PlusCircle, BookOpen } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      decksApi.list(user.id).then((r) => setDecks(r.data.decks)),
      gamifyApi.getProfile(user.id).then((r) => setProfile(r.data.profile)),
    ]).finally(() => setLoading(false));
  }, [user]);

  const xpToNextLevel = profile ? 500 - (profile.xp % 500) : 500;
  const xpProgress = profile ? (profile.xp % 500) / 500 : 0;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', fontFamily: theme.font }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
          ⚡
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem', fontFamily: theme.font }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: theme.text, margin: 0 }}>
              Hey, {profile?.username || 'there'}! 👋
            </h1>
            <p style={{ color: theme.textLight, marginTop: '0.25rem' }}>
              Level {profile?.level || 1} · {profile?.xp || 0} XP
            </p>
          </div>
          <StreakFlame streak={profile?.streak_count || 0} />
        </div>

        <div style={{ marginTop: '1rem', background: `${theme.primary}22`, borderRadius: '999px', height: '10px', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{ height: '100%', background: theme.primary, borderRadius: '999px' }}
          />
        </div>
        <div style={{ fontSize: '0.8rem', color: theme.textLight, marginTop: '0.25rem' }}>
          {xpToNextLevel} XP to level {(profile?.level || 1) + 1}
        </div>
      </motion.div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: theme.text, margin: 0 }}>Your Decks</h2>
        <Link to="/create">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            style={{
              background: theme.primary,
              color: '#fff',
              border: 'none',
              borderRadius: theme.borderRadius,
              padding: '0.6rem 1.25rem',
              fontFamily: theme.font,
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <PlusCircle size={16} /> New Deck
          </motion.button>
        </Link>
      </div>

      {decks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: theme.card,
            borderRadius: theme.borderRadius,
            boxShadow: theme.shadow,
          }}
        >
          <BookOpen size={48} style={{ color: theme.textLight, marginBottom: '1rem' }} />
          <p style={{ color: theme.textLight, fontSize: '1.1rem' }}>No decks yet. Create your first one!</p>
          <Link to="/create">
            <button
              style={{
                marginTop: '1rem',
                background: theme.primary,
                color: '#fff',
                border: 'none',
                borderRadius: theme.borderRadius,
                padding: '0.75rem 1.5rem',
                fontFamily: theme.font,
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              Create a Deck
            </button>
          </Link>
        </motion.div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {decks.map((deck, i) => (
            <motion.div
              key={deck.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -4, boxShadow: `0 12px 36px ${theme.primary}22` }}
            >
              <Link to={`/study/${deck.id}`} style={{ textDecoration: 'none' }}>
                <div
                  style={{
                    background: theme.card,
                    borderRadius: theme.borderRadius,
                    padding: '1.5rem',
                    boxShadow: theme.shadow,
                    border: `1px solid ${theme.primary}22`,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: theme.text, marginBottom: '0.5rem' }}>
                    {deck.title}
                  </div>
                  {deck.description && (
                    <div style={{ fontSize: '0.85rem', color: theme.textLight, marginBottom: '0.75rem' }}>
                      {deck.description}
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        background: `${theme.secondary}22`,
                        color: theme.secondary,
                        borderRadius: '999px',
                        padding: '0.2rem 0.75rem',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                      }}
                    >
                      {deck.card_count} cards
                    </span>
                    <span style={{ fontSize: '0.8rem', color: theme.textLight }}>Study →</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
