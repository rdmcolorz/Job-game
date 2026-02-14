import { Flame, Send, Trophy, TrendingUp, Star, Clock } from 'lucide-react';
import useStore from '../store/useStore';
import XPBar from '../components/ui/XPBar';
import ProgressRing from '../components/ui/ProgressRing';
import Badge from '../components/ui/Badge';
import { ACHIEVEMENTS, calculateProfileCompletion } from '../utils/gamification';

export default function DashboardPage() {
  const { profile, achievements, xpHistory, getStats } = useStore();
  const stats = getStats();
  const profileCompletion = calculateProfileCompletion(profile);

  const statCards = [
    { label: 'Applications', value: stats.totalApplications, icon: Send, color: 'from-primary-500 to-primary-600' },
    { label: 'Interviews', value: stats.interviewCount, icon: Trophy, color: 'from-accent-500 to-accent-600' },
    { label: 'Day Streak', value: stats.streak, icon: Flame, color: 'from-orange-500 to-red-500' },
    { label: 'Level', value: stats.level, icon: TrendingUp, color: 'from-xp-dark to-xp' },
  ];

  return (
    <div className="space-y-6 stagger-children">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-primary-800/80 to-primary-900/60 rounded-2xl p-6 border border-primary-700/30">
        <h1 className="text-2xl font-bold text-white mb-1">
          Welcome back, {profile.name || 'Adventurer'}!
        </h1>
        <p className="text-primary-300">Your quest for the perfect job continues.</p>
      </div>

      {/* XP Progress */}
      <XPBar
        level={stats.level}
        currentXP={stats.currentXP}
        xpToNext={stats.xpToNext}
        progress={stats.progress}
        totalXP={stats.totalXP}
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-primary-900/50 rounded-xl p-4 border border-primary-700/30 hover:border-primary-500/30 transition-all duration-200"
          >
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-bold text-white">{card.value}</div>
            <div className="text-sm text-primary-400">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile completion */}
        <div className="bg-primary-900/50 rounded-xl p-6 border border-primary-700/30">
          <h2 className="text-lg font-bold text-white mb-4">Profile Completion</h2>
          <div className="flex items-center gap-6">
            <ProgressRing progress={profileCompletion} size={100} strokeWidth={8}>
              <div className="text-center">
                <div className="text-xl font-bold text-white">{profileCompletion}%</div>
                <div className="text-[10px] text-primary-400">Complete</div>
              </div>
            </ProgressRing>
            <div className="flex-1">
              <p className="text-sm text-primary-300 mb-2">
                {profileCompletion < 100
                  ? 'Complete your profile to earn XP and get better job matches!'
                  : 'Your profile is complete! Great job!'}
              </p>
              {profileCompletion < 100 && (
                <div className="flex items-center gap-1 text-xs text-xp">
                  <Star className="w-3 h-3 fill-xp" />
                  <span>+50 XP per section completed</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Application status */}
        <div className="bg-primary-900/50 rounded-xl p-6 border border-primary-700/30">
          <h2 className="text-lg font-bold text-white mb-4">Application Pipeline</h2>
          <div className="space-y-3">
            {[
              { label: 'Applied', count: stats.appliedCount, color: 'bg-blue-500' },
              { label: 'Reviewing', count: stats.reviewingCount, color: 'bg-yellow-500' },
              { label: 'Interview', count: stats.interviewCount, color: 'bg-green-500' },
              { label: 'Accepted', count: stats.acceptedCount, color: 'bg-emerald-500' },
              { label: 'Rejected', count: stats.rejectedCount, color: 'bg-red-500' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="text-sm text-primary-300 flex-1">{item.label}</span>
                <span className="text-sm font-bold text-white">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-primary-900/50 rounded-xl p-6 border border-primary-700/30">
        <h2 className="text-lg font-bold text-white mb-4">Achievements</h2>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
          {ACHIEVEMENTS.map((achievement) => (
            <Badge
              key={achievement.id}
              achievementId={achievement.id}
              unlocked={achievements.includes(achievement.id)}
              size="sm"
            />
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-primary-900/50 rounded-xl p-6 border border-primary-700/30">
        <h2 className="text-lg font-bold text-white mb-4">Recent Activity</h2>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {xpHistory.length === 0 ? (
            <p className="text-sm text-primary-500">No activity yet. Start applying to earn XP!</p>
          ) : (
            xpHistory.slice(0, 10).map((entry, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-primary-800/50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-xp/10 flex items-center justify-center">
                    <Star className="w-4 h-4 text-xp fill-xp" />
                  </div>
                  <div>
                    <div className="text-sm text-white">{entry.reason}</div>
                    <div className="text-xs text-primary-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <span className="text-sm font-bold text-xp">+{entry.amount} XP</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
