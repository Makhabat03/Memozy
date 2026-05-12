import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { cardsApi, decksApi, Card } from '../hooks/useApi';
import { FileText, Image, File, Loader } from 'lucide-react';
import GlassButton from '../components/GlassButton';

type Tab = 'text' | 'pdf' | 'image';

const Create: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('text');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [numCards, setNumCards] = useState(10);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedCards, setGeneratedCards] = useState<Card[]>([]);
  const [editingCards, setEditingCards] = useState<Card[]>([]);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    if (!user || !title.trim()) {
      setError('Please enter a deck title');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const deckRes = await decksApi.create({ user_id: user.id, title, description: '' });
      const deckId = deckRes.data.deck.id;

      let cards: Card[] = [];
      if (tab === 'text') {
        if (!text.trim()) throw new Error('Please enter some text');
        const res = await cardsApi.generateFromText({ text, deck_id: deckId, num_cards: numCards });
        cards = res.data.cards;
      } else if (tab === 'pdf' || tab === 'image') {
        if (!file) throw new Error('Please select a file');
        const fd = new FormData();
        fd.append('file', file);
        fd.append('deck_id', deckId);
        fd.append('num_cards', String(numCards));
        const res = tab === 'pdf'
          ? await cardsApi.generateFromPdf(fd)
          : await cardsApi.generateFromImage(fd);
        cards = res.data.cards;
      }

      setGeneratedCards(cards);
      setEditingCards(cards.map((c) => ({ ...c })));
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    setSaved(true);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem 1rem',
    border: `1px solid ${theme.primary}44`,
    borderRadius: theme.borderRadius,
    fontFamily: theme.font,
    fontSize: '0.95rem',
    color: theme.text,
    background: theme.background,
    outline: 'none',
    boxSizing: 'border-box',
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '0.6rem 1.25rem',
    border: 'none',
    borderRadius: theme.borderRadius,
    fontFamily: theme.font,
    fontWeight: 700,
    fontSize: '0.9rem',
    cursor: 'pointer',
    background: active ? theme.primary : 'transparent',
    color: active ? '#fff' : theme.textLight,
    transition: 'all 0.15s',
  });

  if (saved) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', fontFamily: theme.font }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ color: theme.primary, fontWeight: 900 }}>Deck Created!</h2>
          <p style={{ color: theme.textLight }}>{editingCards.length} cards saved to "{title}"</p>
          <GlassButton
            onClick={() => { setSaved(false); setGeneratedCards([]); setTitle(''); setText(''); setFile(null); }}
            style={{ marginTop: '1.5rem' }}
          >
            Create Another
          </GlassButton>
        </motion.div>
      </div>
    );
  }

  if (generatedCards.length > 0) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem', fontFamily: theme.font }}>
        <h2 style={{ color: theme.text, fontWeight: 900, marginBottom: '0.5rem' }}>Preview Cards</h2>
        <p style={{ color: theme.textLight, marginBottom: '1.5rem' }}>{editingCards.length} cards generated. Edit any card inline.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          {editingCards.map((card, i) => (
            <motion.div
              key={card.id || i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              style={{ background: theme.card, borderRadius: theme.borderRadius, padding: '1.25rem', boxShadow: theme.shadow, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: theme.textLight, fontWeight: 600, marginBottom: '0.4rem' }}>FRONT</div>
                <textarea
                  value={card.front}
                  onChange={(e) => {
                    const updated = [...editingCards];
                    updated[i] = { ...updated[i], front: e.target.value };
                    setEditingCards(updated);
                  }}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '70px' }}
                />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: theme.textLight, fontWeight: 600, marginBottom: '0.4rem' }}>BACK</div>
                <textarea
                  value={card.back}
                  onChange={(e) => {
                    const updated = [...editingCards];
                    updated[i] = { ...updated[i], back: e.target.value };
                    setEditingCards(updated);
                  }}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '70px' }}
                />
              </div>
            </motion.div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <GlassButton variant="outline" onClick={() => setGeneratedCards([])} style={{ flex: 1 }}>
            Back
          </GlassButton>
          <GlassButton onClick={handleSave} style={{ flex: 2 }}>
            Save {editingCards.length} Cards ✓
          </GlassButton>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem 1rem', fontFamily: theme.font }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: theme.text, marginBottom: '1.5rem' }}>Create Flashcards</h1>

      <div data-tour="create-title" style={{ marginBottom: '1.25rem' }}>
        <label style={{ fontWeight: 700, color: theme.text, display: 'block', marginBottom: '0.5rem' }}>Deck Title</label>
        <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Biology Chapter 3" />
      </div>

      <div data-tour="create-tabs" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: `${theme.primary}11`, borderRadius: theme.borderRadius, padding: '0.35rem' }}>
        {([['text', 'Text', FileText], ['pdf', 'PDF', File], ['image', 'Image', Image]] as [Tab, string, any][]).map(([t, label, Icon]) => (
          <GlassButton key={t} onClick={() => setTab(t)} variant={tab === t ? 'primary' : 'outline'} size="sm" style={{ flex: 1 }}>
            <Icon size={15} /> {label}
          </GlassButton>
        ))}
      </div>

      {tab === 'text' && (
        <textarea
          data-tour="create-input"
          style={{ ...inputStyle, minHeight: '180px', resize: 'vertical', marginBottom: '1.25rem' }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your notes, textbook content, or any text here..."
        />
      )}

      {(tab === 'pdf' || tab === 'image') && (
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${theme.primary}55`,
            borderRadius: theme.borderRadius,
            padding: '3rem 1.5rem',
            textAlign: 'center',
            cursor: 'pointer',
            marginBottom: '1.25rem',
            background: file ? `${theme.accent}11` : 'transparent',
            transition: 'all 0.15s',
          }}
        >
          {file ? (
            <div>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{tab === 'pdf' ? '📄' : '🖼️'}</div>
              <div style={{ fontWeight: 700, color: theme.text }}>{file.name}</div>
              <div style={{ color: theme.textLight, fontSize: '0.85rem' }}>{(file.size / 1024).toFixed(1)} KB</div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{tab === 'pdf' ? '📄' : '🖼️'}</div>
              <div style={{ fontWeight: 700, color: theme.text }}>Drop your {tab === 'pdf' ? 'PDF' : 'image'} here</div>
              <div style={{ color: theme.textLight, fontSize: '0.85rem', marginTop: '0.25rem' }}>or click to browse</div>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept={tab === 'pdf' ? '.pdf' : 'image/*'}
            style={{ display: 'none' }}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>
      )}

      <div data-tour="create-num-cards" style={{ marginBottom: '1.5rem' }}>
        <label style={{ fontWeight: 700, color: theme.text, display: 'block', marginBottom: '0.5rem' }}>
          Number of Cards: {numCards}
        </label>
        <input
          type="range"
          min={5}
          max={30}
          value={numCards}
          onChange={(e) => setNumCards(Number(e.target.value))}
          style={{ width: '100%', accentColor: theme.primary }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: theme.textLight }}>
          <span>5</span><span>30</span>
        </div>
      </div>

      {error && <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

      <div data-tour="create-generate-btn">
      <GlassButton onClick={handleGenerate} loading={loading} fullWidth size="lg">
        {loading ? (
          <>
            <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8 }}>
              <Loader size={18} />
            </motion.span>
            Generating with AI...
          </>
        ) : (
          '⚡ Generate Flashcards'
        )}
      </GlassButton>
      </div>
    </div>
  );
};

export default Create;
