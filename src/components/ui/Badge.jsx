import { ACHIEVEMENTS } from '../../utils/gamification';

export default function Badge({ achievementId, unlocked = false, size = 'md' }) {
  const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
  if (!achievement) return null;

  const sizes = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl',
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`${sizes[size]} rounded-xl flex items-center justify-center transition-all duration-300 ${
          unlocked
            ? 'bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-500/30 animate-pop-in'
            : 'bg-primary-800/50 grayscale opacity-40'
        }`}
      >
        <span className={unlocked ? '' : 'grayscale'}>{achievement.icon}</span>
      </div>
      <div className="text-center">
        <div className={`text-xs font-semibold ${unlocked ? 'text-white' : 'text-primary-500'}`}>
          {achievement.name}
        </div>
        <div className="text-[10px] text-primary-400 max-w-[80px] leading-tight">
          {achievement.description}
        </div>
      </div>
    </div>
  );
}
