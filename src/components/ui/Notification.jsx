import { useEffect, useState } from 'react';
import { Star, Trophy, X } from 'lucide-react';

export default function Notification({ notification, onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(notification.id), 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);

  const icon = notification.type === 'achievement'
    ? <Trophy className="w-5 h-5 text-xp" />
    : <Star className="w-5 h-5 text-xp fill-xp" />;

  const bgColor = notification.type === 'achievement'
    ? 'from-accent-600/90 to-primary-700/90'
    : 'from-primary-700/90 to-primary-800/90';

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r ${bgColor} border border-primary-500/30 shadow-xl backdrop-blur-sm transition-all duration-300 ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      {icon}
      <span className="text-sm font-medium text-white flex-1">{notification.message}</span>
      <button
        onClick={() => onDismiss(notification.id)}
        className="text-primary-300 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
