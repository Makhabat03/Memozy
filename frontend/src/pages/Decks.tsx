import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { decksApi, Deck } from '../hooks/useApi';
import { Link2, BookOpen, Trash2, Globe, Lock } from 'lucide-react';
import GlassButton from '../components/GlassButton';

const Decks: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    decksApi.list(user.id).then((r) => {
      setDecks(r.data.decks);
      setLoading(false);
    });
  }, [user]);

  const handleCopyLink = (deck: Deck) => {
    const url = `${window.location.origin}/decks/public/${deck.id}`;
    navigator.clipboard.writeText(url);
    setCopied(deck.id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleToggleVisibility = async (deck: Deck) => {
    const newValue = !deck.is_public;
    await decksApi.setVisibility(deck.id, newValue);
    setDecks(prev => prev.map(d => d.id === deck.id ? { ...d, is_public: newValue } : d));
  };

  const handleDelete = async (deckId: string) => {
    if (!window.confirm('Delete this deck and all its cards?')) return;
    await decksApi.delete(deckId);
    setDecks((d) => d.filter((deck) => deck.id !== deckId));
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', fontFamily: theme.font }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem', fontFamily: theme.font }}>
      <div data-tour="decks-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: theme.text, margin: 0 }}>My Decks</h1>
        <Link to="/create">
          <GlassButton size="sm">+ New Deck</GlassButton>
        </Link>
      </div>

      {decks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: theme.textLight }}>
          <BookOpen size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
          <p>No decks yet. Create your first one!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {decks.map((deck, i) => (
            <motion.div
              key={deck.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass-card"
              style={{ background: theme.card, borderRadius: theme.borderRadius, padding: '1.5rem', boxShadow: theme.shadow, border: `1px solid ${theme.primary}28` }}
            >
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: theme.text, marginBottom: '0.4rem' }}>{deck.title}</div>
              {deck.description && <div style={{ fontSize: '0.85rem', color: theme.textLight, marginBottom: '0.75rem' }}>{deck.description}</div>}

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ background: `${theme.secondary}22`, color: theme.secondary, borderRadius: '999px', padding: '0.2rem 0.75rem', fontSize: '0.8rem', fontWeight: 700 }}>
                  {deck.card_count} cards
                </span>
              </div>

              {/* Visibility toggle row */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: `${theme.primary}0d`, borderRadius: '10px',
                padding: '0.5rem 0.75rem', marginBottom: '0.75rem',
                border: `1px solid ${theme.primary}18`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
                  {deck.is_public
                    ? <Globe size={13} style={{ color: theme.primary }} />
                    : <Lock size={13} style={{ color: theme.textLight }} />}
                  <span style={{ color: deck.is_public ? theme.primary : theme.textLight, fontWeight: 700 }}>
                    {deck.is_public ? 'Public' : 'Private'}
                  </span>
                  <span style={{ color: theme.textLight, fontSize: '0.72rem' }}>
                    — {deck.is_public ? 'in social feed' : 'link only'}
                  </span>
                </div>
                <button
                  onClick={() => handleToggleVisibility(deck)}
                  style={{
                    width: 36, height: 20, borderRadius: 999, border: 'none', cursor: 'pointer',
                    background: deck.is_public ? theme.primary : `${theme.primary}33`,
                    position: 'relative', transition: 'background 0.22s', flexShrink: 0,
                  }}
                >
                  <span style={{
                    position: 'absolute', top: 2, left: deck.is_public ? 18 : 2,
                    width: 16, height: 16, borderRadius: '50%', background: '#fff',
                    transition: 'left 0.22s', boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                  }} />
                </button>
              </div>

              <div data-tour={i === 0 ? 'decks-actions' : undefined} style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link to={`/study/${deck.id}`} style={{ flex: 1, textDecoration: 'none' }}>
                    <GlassButton fullWidth size="sm">Study</GlassButton>
                  </Link>
                  <Link to={`/study/${deck.id}?mode=practice`} style={{ flex: 1, textDecoration: 'none' }}>
                    <GlassButton fullWidth size="sm" variant="outline">Practice All</GlassButton>
                  </Link>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <GlassButton
                    onClick={() => handleCopyLink(deck)}
                    title="Copy share link"
                    variant="outline"
                    size="sm"
                    tintColor={copied === deck.id ? theme.accent : theme.primary}
                    style={{ flex: 1, padding: '0.5rem' }}
                  >
                    <Link2 size={15} />
                    <span style={{ fontSize: '0.75rem' }}>Copy Link</span>
                  </GlassButton>
                  <GlassButton
                    onClick={() => handleDelete(deck.id)}
                    title="Delete"
                    variant="danger"
                    size="sm"
                    style={{ padding: '0.5rem 0.75rem' }}
                  >
                    <Trash2 size={15} />
                  </GlassButton>
                </div>
              </div>
              {copied === deck.id && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  style={{ fontSize: '0.78rem', color: theme.accent, marginTop: '0.5rem', textAlign: 'center', fontWeight: 700 }}
                >
                  Link copied! ✓
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Decks;
