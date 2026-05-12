import React, { createContext, useContext, useState, useCallback } from 'react';

export interface TourStep {
  target: string | null;
  route: string;
  title: string;
  desc: string;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
  emoji?: string;
}

export const TOUR_STEPS: TourStep[] = [
  // ── Dashboard ──
  { target: null,                  route: '/',        placement: 'center', emoji: '🌸', title: 'Welcome to Memozy!',            desc: "I'll walk you through every feature so you have zero questions. Ready? Let's go!" },
  { target: 'dashboard-header',   route: '/',        placement: 'bottom',             title: 'Your Profile',                  desc: 'Your username, current level, and total XP. You level up every 500 XP you earn from studying.' },
  { target: 'xp-bar',             route: '/',        placement: 'bottom',             title: 'XP Progress Bar',               desc: 'This bar fills as you earn XP. The number below tells you how much XP you need to reach the next level.' },
  { target: 'streak-display',     route: '/',        placement: 'bottom',             title: 'Daily Streak 🔥',               desc: 'Study at least one card every day to keep your streak alive. Miss a day and it resets to 0. Build the habit!' },
  { target: 'new-deck-btn',       route: '/',        placement: 'bottom',             title: 'Create a New Deck',             desc: 'Click here to make a flashcard deck. Use AI to generate cards from text, a PDF, or an image in seconds.' },
  { target: 'decks-grid',         route: '/',        placement: 'top',                title: 'Your Decks',                    desc: 'All your flashcard decks appear here. Click any deck to jump straight into a study session.' },

  // ── Create Page ──
  { target: null,                  route: '/create',  placement: 'center', emoji: '✨', title: 'Creating Flashcards',          desc: "Now let's explore the Create page — where any content becomes smart flashcards." },
  { target: 'create-title',       route: '/create',  placement: 'bottom',             title: 'Deck Title',                    desc: "Give your deck a clear name like 'Biology Ch. 3' or 'Spanish Verbs'. Keep it specific — you'll thank yourself later." },
  { target: 'create-tabs',        route: '/create',  placement: 'bottom',             title: 'Three Input Methods',           desc: 'Text: paste notes. PDF: upload a document. Image: upload a photo of handwritten notes. All three use AI to generate cards.' },
  { target: 'create-input',       route: '/create',  placement: 'top',                title: 'Your Content',                  desc: 'Paste your notes or upload a file here. The AI reads it and generates question-and-answer flashcard pairs automatically.' },
  { target: 'create-num-cards',   route: '/create',  placement: 'top',                title: 'Number of Cards',               desc: 'Drag to pick between 5 and 30 cards. More cards = more detail. Fewer = focused key concepts only.' },
  { target: 'create-generate-btn',route: '/create',  placement: 'top',                title: 'Generate with AI ⚡',            desc: 'Click this to send your content to the AI. In seconds, your cards appear — and you can edit any of them before saving.' },

  // ── Study Mode (no live deck, so center modals) ──
  { target: null,                  route: '/',        placement: 'center', emoji: '📖', title: 'Studying — The Basics',        desc: 'When you open a deck, cards appear one at a time. Each card shows a question on the front.' },
  { target: null,                  route: '/',        placement: 'center', emoji: '↕️', title: 'Flip the Card',                desc: 'Tap the card (or press Space) to flip it and reveal the answer on the back. Read it carefully before rating yourself.' },
  { target: null,                  route: '/',        placement: 'center', emoji: '🧠', title: 'Rate Your Memory',             desc: 'After seeing the answer, rate yourself honestly — Hard (struggled), Good (got it), or Easy (knew it instantly).' },
  { target: null,                  route: '/',        placement: 'center', emoji: '⏱️', title: 'Spaced Repetition (SM-2)',     desc: 'Memozy uses the SM-2 algorithm. Hard cards come back sooner; Easy cards come back in days or weeks. You only review what you actually need.' },
  { target: null,                  route: '/',        placement: 'center', emoji: '🔥', title: 'Combos & XP',                 desc: 'Rate 3+ cards correctly in a row to trigger a combo banner. Each study session earns XP — more correct answers = more XP.' },

  // ── Decks Page ──
  { target: 'decks-page-header',  route: '/decks',   placement: 'bottom',             title: 'My Decks Page',                desc: 'Shows all your decks with card counts and three quick actions per deck.' },
  { target: 'decks-actions',      route: '/decks',   placement: 'top',                title: 'Deck Actions',                 desc: 'Study → start a session. Share → copies a public link anyone can use. Delete → removes the deck and all its cards.' },

  // ── Social Page ──
  { target: 'social-leaderboard', route: '/social',  placement: 'right',              title: 'Weekly Leaderboard 🏆',        desc: 'Ranks everyone you follow by XP earned this week. The board resets every Monday — compete for the top spot!' },
  { target: 'social-search',      route: '/social',  placement: 'bottom',             title: 'Find & Follow People',         desc: 'Search by username to find friends. Follow them to see their public decks and compete on the leaderboard together.' },
  { target: 'social-feed',        route: '/social',  placement: 'top',                title: "Friends' Public Decks",        desc: "Decks that people you follow have made public appear here. Browse and study them to explore new topics for free." },

  // ── Profile Page ──
  { target: 'profile-card',       route: '/profile', placement: 'bottom',             title: 'Your Profile Card',            desc: 'Username, level, and total XP. The bar fills toward your next level — 500 XP per level, no cap.' },
  { target: 'profile-streak-section', route: '/profile', placement: 'bottom',         title: 'Streak Details',               desc: 'Deep-dive: current streak, best-ever streak, total days studied, and a progress bar toward your next milestone.' },
  { target: 'profile-activity',   route: '/profile', placement: 'top',                title: 'Activity Grid',                desc: "A 90-day calendar of your study days — like GitHub's contribution graph. Every colored square is a day you studied." },
  { target: 'profile-badges',     route: '/profile', placement: 'top',                title: 'Badges 🏅',                    desc: 'Earn badges by hitting milestones: first deck, 7-day streak, Level 5, 100 cards studied, and more. Grayed-out = locked.' },
  { target: 'theme-picker',       route: '/profile', placement: 'top',                title: 'Change Your Theme 🎨',         desc: 'Choose from 5 animated themes: Minimal, Dark Futuristic, Nature, Pink, and Cosmic. Switch anytime — your choice is saved.' },

  // ── Done ──
  { target: null,                  route: '/',        placement: 'center', emoji: '🚀', title: "You're all set!",             desc: "That's every feature covered! Create your first deck, study it daily, and watch that streak grow. Good luck!" },
];

interface TourCtx {
  isActive: boolean;
  step: number;
  total: number;
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  endTour: () => void;
}

const TourContext = createContext<TourCtx>({
  isActive: false, step: 0, total: TOUR_STEPS.length,
  startTour: () => {}, nextStep: () => {}, prevStep: () => {}, endTour: () => {},
});

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [step, setStep] = useState(0);

  const startTour = useCallback(() => { setStep(0); setIsActive(true); }, []);
  const endTour   = useCallback(() => {
    setIsActive(false);
    localStorage.setItem('memozy_onboarded', '1');
  }, []);
  const nextStep  = useCallback(() => setStep(s => Math.min(s + 1, TOUR_STEPS.length - 1)), []);
  const prevStep  = useCallback(() => setStep(s => Math.max(s - 1, 0)), []);

  return (
    <TourContext.Provider value={{ isActive, step, total: TOUR_STEPS.length, startTour, nextStep, prevStep, endTour }}>
      {children}
    </TourContext.Provider>
  );
};

export const useTour = () => useContext(TourContext);
