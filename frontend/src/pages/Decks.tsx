import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { decksApi, Deck } from '../hooks/useApi';
import { Share2, BookOpen, Trash2 } from 'lucide-react';

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

  const handleShare = async (deck: Deck) => {
    await decksApi.share(deck.id);
    const url = `${window.location.origin}/decks/public/${deck.id}`;
    navigator.clipboard.writeText(url);
    setCopied(deck.id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDelete = async (deckId: string) => {
    if (!window.confirm('Delete this deck and all its cards?')) return;
    await decksApi.delete(deckId);
    setDecks((d) => d.filter((deck) => deck.id !== deckId));
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', fontFamily: theme.font }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem', fontFamily: theme.font }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: theme.text, margin: 0 }}>My Decks</h1>
        <Link to="/create">
          <button style={{ background: theme.primary, color: '#fff', border: 'none', borderRadius: theme.borderRadius, padding: '0.65rem 1.25rem', fontFamily: theme.font, fontWeight: 700, cursor: 'pointer' }}>
            + New Deck
          </button>
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
              style={{ background: theme.card, borderRadius: theme.borderRadius, padding: '1.5rem', boxShadow: theme.shadow, border: `1px solid ${theme.primary}22` }}
            >
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: theme.text, marginBottom: '0.4rem' }}>{deck.title}</div>
              {deck.description && <div style={{ fontSize: '0.85rem', color: theme.textLight, marginBottom: '0.75rem' }}>{deck.description}</div>}

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ background: `${theme.secondary}22`, color: theme.secondary, borderRadius: '999px', padding: '0.2rem 0.75rem', fontSize: '0.8rem', fontWeight: 700 }}>
                  {deck.card_count} cards
                </span>
                {deck.is_public && (
                  <span style={{ background: `${theme.accent}22`, color: theme.accent, borderRadius: '999px', padding: '0.2rem 0.75rem', fontSize: '0.8rem', fontWeight: 700 }}>
                    Public
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link to={`/study/${deck.id}`} style={{ flex: 1, textDecoration: 'none' }}>
                  <button style={{ width: '100%', background: theme.primary, color: '#fff', border: 'none', borderRadius: theme.borderRadius, padding: '0.6rem', fontFamily: theme.font, fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
                    Study
                  </button>
                </Link>
                <button
                  onClick={() => handleShare(deck)}
                  title="Share"
                  style={{ background: copied === deck.id ? `${theme.accent}22` : `${theme.primary}11`, border: 'none', borderRadius: theme.borderRadius, padding: '0.6rem 0.75rem', cursor: 'pointer', color: copied === deck.id ? theme.accent : theme.primary }}
                >
                  <Share2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(deck.id)}
                  title="Delete"
                  style={{ background: '#fef2f2', border: 'none', borderRadius: theme.borderRadius, padding: '0.6rem 0.75rem', cursor: 'pointer', color: '#dc2626' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              {copied === deck.id && <div style={{ fontSize: '0.8rem', color: theme.accent, marginTop: '0.5rem', textAlign: 'center' }}>Link copied! ✓</div>}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Decks;
