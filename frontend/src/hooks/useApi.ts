import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 30000,
});

export interface Card {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  hint?: string;
  example?: string;
  difficulty: number;
  next_review: string | null;
  interval_days: number;
  ease_factor: number;
  created_at: string;
}

export interface Deck {
  id: string;
  user_id: string;
  title: string;
  description: string;
  is_public: boolean;
  card_count: number;
  created_at: string;
  cards?: Card[];
}

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  xp: number;
  level: number;
  streak_count: number;
  streak_last_date: string | null;
  max_streak: number;
  theme: string;
  created_at: string;
}

export interface Badge {
  id: string;
  user_id: string;
  badge_type: string;
  earned_at: string;
}

export interface StudyCompleteResponse {
  xp_earned: number;
  new_total_xp: number;
  leveled_up: boolean;
  new_level: number;
  streak: number;
  badges_earned: string[];
}

export const decksApi = {
  list: (userId: string) => api.get<{ decks: Deck[] }>('/decks/', { params: { user_id: userId } }),
  create: (data: { user_id: string; title: string; description?: string; is_public?: boolean }) =>
    api.post<{ deck: Deck }>('/decks/', data),
  get: (id: string) => api.get<{ deck: Deck }>(`/decks/${id}`),
  update: (id: string, data: Partial<Deck>) => api.put<{ deck: Deck }>(`/decks/${id}`, data),
  delete: (id: string) => api.delete(`/decks/${id}`),
  share: (id: string) => api.post<{ share_url: string }>(`/decks/${id}/share`),
  getPublic: (id: string) => api.get<{ deck: Deck }>(`/decks/public/${id}`),
};

export const cardsApi = {
  getByDeck: (deckId: string) => api.get<{ cards: Card[] }>(`/cards/${deckId}`),
  generateFromText: (data: { text: string; deck_id: string; num_cards: number }) =>
    api.post<{ cards: Card[]; count: number }>('/cards/generate/text', data),
  generateFromPdf: (formData: FormData) =>
    api.post<{ cards: Card[]; count: number }>('/cards/generate/pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  generateFromImage: (formData: FormData) =>
    api.post<{ cards: Card[]; count: number }>('/cards/generate/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: string, data: Partial<Card>) => api.put<{ card: Card }>(`/cards/${id}`, data),
};

export const studyApi = {
  getDueCards: (deckId: string) => api.get<{ cards: Card[]; count: number }>(`/study/due/${deckId}`),
  rateCard: (cardId: string, quality: number) =>
    api.post<{ card: Card; next_review: string }>('/study/rate', { card_id: cardId, quality }),
};

export const gamifyApi = {
  studyComplete: (data: {
    user_id: string;
    deck_id: string;
    cards_reviewed: number;
    correct_count: number;
  }) => api.post<StudyCompleteResponse>('/gamify/study-complete', data),
  getProfile: (userId: string) =>
    api.get<{ profile: Profile; badges: Badge[]; recent_sessions: any[] }>(`/gamify/profile/${userId}`),
};

export const socialApi = {
  leaderboard: (userId: string) => api.get('/social/leaderboard', { params: { user_id: userId } }),
  follow: (userId: string, targetId: string) =>
    api.post(`/social/follow/${targetId}`, null, { params: { user_id: userId } }),
  unfollow: (userId: string, targetId: string) =>
    api.delete(`/social/follow/${targetId}`, { params: { user_id: userId } }),
  feed: (userId: string) => api.get('/social/feed', { params: { user_id: userId } }),
  search: (q: string) => api.get('/social/search', { params: { q } }),
};

export default api;
