import { getLevelTitle } from '../../utils/gamification';
import { Sparkles } from 'lucide-react';

export default function LevelUpModal({ levelUpData, onDismiss }) {
  if (!levelUpData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      {/* Confetti particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-10%',
              backgroundColor: ['#facc15', '#ec4899', '#6366f1', '#22c55e', '#f59e0b'][i % 5],
              animation: `confetti-fall ${2 + Math.random() * 2}s linear ${Math.random() * 0.5}s forwards`,
            }}
          />
        ))}
      </div>

      <div className="animate-pop-in bg-gradient-to-br from-primary-800 to-primary-900 rounded-2xl p-8 border border-primary-500/50 shadow-2xl shadow-primary-500/20 max-w-sm mx-4 text-center">
        <div className="animate-float mb-4">
          <Sparkles className="w-16 h-16 text-xp mx-auto" />
        </div>

        <h2 className="text-3xl font-bold text-white mb-2">Level Up!</h2>

        <div className="flex items-center justify-center gap-4 my-6">
          <div className="text-4xl font-bold text-primary-400">{levelUpData.oldLevel}</div>
          <div className="text-2xl text-primary-500">→</div>
          <div className="text-5xl font-bold text-xp animate-pulse-glow rounded-xl px-4 py-2">
            {levelUpData.newLevel}
          </div>
        </div>

        <p className="text-primary-300 mb-1">You are now a</p>
        <p className="text-xl font-bold text-accent-400 mb-6">
          {getLevelTitle(levelUpData.newLevel)}
        </p>

        <button
          onClick={onDismiss}
          className="w-full py-3 px-6 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-400 hover:to-accent-400 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Continue Quest
        </button>
      </div>
    </div>
  );
}
