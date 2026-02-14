import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { getLevelTitle } from '../../utils/gamification';

export default function XPBar({ level, currentXP, xpToNext, progress, totalXP }) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(progress * 100), 100);
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className="bg-primary-900/50 rounded-xl p-4 border border-primary-700/30">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-xp to-xp-dark flex items-center justify-center font-bold text-primary-900 text-lg shadow-lg">
            {level}
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{getLevelTitle(level)}</div>
            <div className="text-xs text-primary-300">Level {level}</div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xp">
          <Star className="w-4 h-4 fill-xp" />
          <span className="text-sm font-bold">{totalXP.toLocaleString()} XP</span>
        </div>
      </div>

      <div className="relative h-4 bg-primary-800 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-xp-dark to-xp rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${animatedProgress}%` }}
        >
          <div className="absolute inset-0 animate-shimmer rounded-full" />
        </div>
      </div>

      <div className="flex justify-between mt-1 text-xs text-primary-400">
        <span>{currentXP} XP</span>
        <span>{xpToNext} XP to Level {level + 1}</span>
      </div>
    </div>
  );
}
