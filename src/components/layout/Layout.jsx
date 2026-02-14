import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';
import Notification from '../ui/Notification';
import LevelUpModal from '../ui/LevelUpModal';
import useStore from '../../store/useStore';

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { notifications, clearNotification, showLevelUp, levelUpData, dismissLevelUp } = useStore();

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 bg-primary-900/80 backdrop-blur-sm border-r border-primary-700/30 fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </aside>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-primary-900 border-r border-primary-700/30 animate-slide-up">
            <div className="flex justify-end p-4">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-primary-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <Sidebar mobile onClose={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content area */}
      <main className="flex-1 lg:ml-64">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-primary-900/80 backdrop-blur-sm border-b border-primary-700/30 sticky top-0 z-20">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="text-primary-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-white">QuestCareer</h1>
          <div className="w-6" /> {/* Spacer for centering */}
        </div>

        {/* Page content */}
        <div className="p-4 lg:p-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Notification toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2 w-80">
        {notifications.slice(0, 3).map((n) => (
          <Notification key={n.id} notification={n} onDismiss={clearNotification} />
        ))}
      </div>

      {/* Level-up modal */}
      {showLevelUp && (
        <LevelUpModal levelUpData={levelUpData} onDismiss={dismissLevelUp} />
      )}
    </div>
  );
}
