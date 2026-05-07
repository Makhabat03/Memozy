export type ThemeName = 'minimal' | 'cute' | 'darkFuturistic' | 'nature' | 'anime' | 'ocean' | 'cosmic';

export interface Theme {
  name: ThemeName;
  label: string;
  emoji: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  card: string;
  text: string;
  textLight: string;
  font: string;
  borderRadius: string;
  shadow: string;
}

export const themes: Record<ThemeName, Theme> = {
  minimal: {
    name: 'minimal',
    label: 'Minimal',
    emoji: '✦',
    primary: '#1e1b4b',
    secondary: '#6366f1',
    accent: '#10b981',
    background: '#fafafa',
    card: '#ffffff',
    text: '#111827',
    textLight: '#6b7280',
    font: "'Inter', sans-serif",
    borderRadius: '12px',
    shadow: '0 2px 12px rgba(0,0,0,0.08)',
  },
  cute: {
    name: 'cute',
    label: 'Cute',
    emoji: '🌸',
    primary: '#f472b6',
    secondary: '#a78bfa',
    accent: '#34d399',
    background: '#fff0f6',
    card: '#ffffff',
    text: '#4a0040',
    textLight: '#9d4edd',
    font: "'Nunito', sans-serif",
    borderRadius: '20px',
    shadow: '0 8px 32px rgba(244,114,182,0.18)',
  },
  darkFuturistic: {
    name: 'darkFuturistic',
    label: 'Dark Futuristic',
    emoji: '🌐',
    primary: '#00e5ff',
    secondary: '#7c4dff',
    accent: '#ff4081',
    background: '#050510',
    card: '#0d0d25',
    text: '#e0f0ff',
    textLight: '#6080aa',
    font: "'Inter', sans-serif",
    borderRadius: '8px',
    shadow: '0 0 24px rgba(0,229,255,0.2), 0 0 48px rgba(124,77,255,0.08)',
  },
  nature: {
    name: 'nature',
    label: 'Nature',
    emoji: '🌿',
    primary: '#2d6a4f',
    secondary: '#52b788',
    accent: '#d4a017',
    background: '#f1faf4',
    card: '#ffffff',
    text: '#1b4332',
    textLight: '#52796f',
    font: "'Nunito', sans-serif",
    borderRadius: '16px',
    shadow: '0 4px 20px rgba(45,106,79,0.15)',
  },
  anime: {
    name: 'anime',
    label: 'Anime',
    emoji: '⛩️',
    primary: '#e91e8c',
    secondary: '#9b27af',
    accent: '#ff9800',
    background: '#fdf0f8',
    card: '#fff5fb',
    text: '#2d0040',
    textLight: '#9b27af',
    font: "'Nunito', sans-serif",
    borderRadius: '20px',
    shadow: '0 8px 30px rgba(233,30,140,0.2)',
  },
  ocean: {
    name: 'ocean',
    label: 'Ocean',
    emoji: '🌊',
    primary: '#48cae4',
    secondary: '#0096c7',
    accent: '#ade8f4',
    background: '#03045e',
    card: '#0a1628',
    text: '#caf0f8',
    textLight: '#90e0ef',
    font: "'Inter', sans-serif",
    borderRadius: '14px',
    shadow: '0 4px 30px rgba(72,202,228,0.25)',
  },
  cosmic: {
    name: 'cosmic',
    label: 'Cosmic',
    emoji: '🌌',
    primary: '#e040fb',
    secondary: '#7c4dff',
    accent: '#69f0ae',
    background: '#03001c',
    card: '#0d0025',
    text: '#f0e6ff',
    textLight: '#ce93d8',
    font: "'Inter', sans-serif",
    borderRadius: '12px',
    shadow: '0 0 30px rgba(224,64,251,0.25)',
  },
};
