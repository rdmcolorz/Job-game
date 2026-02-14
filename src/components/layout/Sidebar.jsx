import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, ScrollText, User, LogOut, Swords, Star } from 'lucide-react';
import useStore from '../../store/useStore';
import { calculateLevel, getLevelTitle } from '../../utils/gamification';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/jobs', icon: Briefcase, label: 'Quest Board' },
  { to: '/applications', icon: ScrollText, label: 'Quest Log' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function Sidebar({ mobile = false, onClose }) {
  const { totalXP, profile, logout } = useStore();
  const levelInfo = calculateLevel(totalXP);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-primary-600/30 text-white border border-primary-500/30 shadow-lg shadow-primary-500/10'
        : 'text-primary-400 hover:text-white hover:bg-primary-800/50'
    }`;

  return (
    <div className={`flex flex-col h-full ${mobile ? 'p-4' : 'p-4'}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg">
          <Swords className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">QuestCareer</h1>
          <p className="text-[10px] text-primary-500">Level up your job search</p>
        </div>
      </div>

      {/* User mini-card */}
      <div className="mx-2 mb-6 bg-primary-800/30 rounded-xl p-3 border border-primary-700/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-xp to-xp-dark flex items-center justify-center font-bold text-primary-900 text-sm shadow-md">
            {levelInfo.level}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">{profile.name || 'Adventurer'}</div>
            <div className="text-[10px] text-primary-400">{getLevelTitle(levelInfo.level)}</div>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1 text-xs text-xp">
          <Star className="w-3 h-3 fill-xp" />
          <span className="font-medium">{totalXP.toLocaleString()} XP</span>
        </div>
        {/* Mini XP bar */}
        <div className="mt-1.5 h-1.5 bg-primary-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-xp-dark to-xp rounded-full transition-all duration-500"
            style={{ width: `${levelInfo.progress * 100}%` }}
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={linkClass}
            onClick={onClose}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={logout}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-primary-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 mt-4"
      >
        <LogOut className="w-5 h-5" />
        Log Out
      </button>
    </div>
  );
}
