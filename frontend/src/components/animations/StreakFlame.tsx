import React from 'react';
import { motion } from 'framer-motion';

interface StreakFlameProps {
  streak: number;
}

const StreakFlame: React.FC<StreakFlameProps> = ({ streak }) => {
  if (streak === 0) return null;
  return (
    <motion.span
      animate={{ scale: [1, 1.15, 1], rotate: [-3, 3, -3] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      style={{ display: 'inline-block', fontSize: '1.5rem', cursor: 'default' }}
      title={`${streak} day streak!`}
    >
      🔥 {streak}
    </motion.span>
  );
};

export default StreakFlame;
