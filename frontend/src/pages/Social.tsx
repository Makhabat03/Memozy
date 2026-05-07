import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { socialApi, Deck } from '../hooks/useApi';
import { Search, UserPlus } from 'lucide-react';

const RANK_BADGES = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

const Social: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [feed, setFeed] = useState<Deck[]>([]);
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      socialApi.leaderboard(user.id).then((r: any) => setLeaderboard(r.data.leaderboard || [])),
      socialApi.feed(user.id).then((r: any) => setFeed(r.data.decks || [])),
    ]).finally(() => setLoading(false));
  }, [user]);

  const handleSearch = async () => {
    if (!searchQ.trim()) return;
    const res = await socialApi.search(searchQ);
    setSearchResults((res.data as any).users || []);
  };

  const handleFollow = async (targetId: string) => {
    if (!user) return;
    await socialApi.follow(user.id, targetId);
    setSearchResults((prev) => prev.filter((u) => u.id !== targetId));
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', fontFamily: theme.font }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem', fontFamily: theme.font }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: theme.text, marginBottom: '2rem' }}>Social</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: theme.text, marginBottom: '1rem' }}>🏆 Weekly Leaderboard</h2>
          {leaderboard.length === 0 ? (
            <div style={{ color: theme.textLight, fontSize: '0.9rem', padding: '1rem', background: theme.card, borderRadius: theme.borderRadius }}>
              Follow people to see the leaderboard!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {leaderboard.map((entry: any, i: number) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  style={{
                    background: theme.card,
                    borderRadius: theme.borderRadius,
                    padding: '0.9rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    boxShadow: i === 0 ? `0 4px 16px ${theme.primary}33` : theme.shadow,
                    border: i === 0 ? `2px solid ${theme.primary}` : `1px solid ${theme.primary}22`,
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>{RANK_BADGES[i]}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: theme.text }}>{entry.username}</div>
                    <div style={{ fontSize: '0.8rem', color: theme.textLight }}>Level {entry.level}</div>
                  </div>
                  <div style={{ fontWeight: 800, color: theme.primary }}>{entry.weekly_xp} XP</div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: theme.text, marginBottom: '1rem' }}>🔍 Find People</h2>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by username..."
              style={{
                flex: 1,
                padding: '0.65rem 1rem',
                border: `1px solid ${theme.primary}44`,
                borderRadius: theme.borderRadius,
                fontFamily: theme.font,
                background: theme.background,
                color: theme.text,
                outline: 'none',
              }}
            />
            <button onClick={handleSearch} style={{ background: theme.primary, border: 'none', borderRadius: theme.borderRadius, padding: '0.65rem 1rem', cursor: 'pointer', color: '#fff' }}>
              <Search size={18} />
            </button>
          </div>
          {searchResults.map((u: any) => (
            <div key={u.id} style={{ background: theme.card, borderRadius: theme.borderRadius, padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', boxShadow: theme.shadow }}>
              <div>
                <div style={{ fontWeight: 700, color: theme.text }}>{u.username}</div>
                <div style={{ fontSize: '0.8rem', color: theme.textLight }}>Level {u.level}</div>
              </div>
              <button onClick={() => handleFollow(u.id)} style={{ background: theme.primary, color: '#fff', border: 'none', borderRadius: theme.borderRadius, padding: '0.5rem 0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: theme.font, fontWeight: 700, fontSize: '0.85rem' }}>
                <UserPlus size={14} /> Follow
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '2.5rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: theme.text, marginBottom: '1rem' }}>📚 Friends' Public Decks</h2>
        {feed.length === 0 ? (
          <div style={{ color: theme.textLight, fontSize: '0.9rem', padding: '1.5rem', background: theme.card, borderRadius: theme.borderRadius, textAlign: 'center' }}>
            Follow people to see their public decks here.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            {feed.map((deck: any, i: number) => (
              <motion.div
                key={deck.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{ background: theme.card, borderRadius: theme.borderRadius, padding: '1.25rem', boxShadow: theme.shadow, border: `1px solid ${theme.primary}22` }}
              >
                <div style={{ fontWeight: 700, color: theme.text, marginBottom: '0.35rem' }}>{deck.title}</div>
                <div style={{ fontSize: '0.8rem', color: theme.textLight, marginBottom: '0.75rem' }}>
                  by {deck.profiles?.username || 'unknown'}
                </div>
                <span style={{ background: `${theme.secondary}22`, color: theme.secondary, borderRadius: '999px', padding: '0.2rem 0.75rem', fontSize: '0.8rem', fontWeight: 700 }}>
                  {deck.card_count} cards
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Social;
