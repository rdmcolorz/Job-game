import { useState } from 'react';
import { Clock, ChevronDown, Briefcase, MapPin, DollarSign, ArrowRight, ExternalLink } from 'lucide-react';
import useStore from '../store/useStore';

const STATUSES = [
  { value: 'all', label: 'All', color: 'bg-primary-500' },
  { value: 'applied', label: 'Applied', color: 'bg-blue-500' },
  { value: 'reviewing', label: 'Reviewing', color: 'bg-yellow-500' },
  { value: 'interview', label: 'Interview', color: 'bg-green-500' },
  { value: 'accepted', label: 'Accepted', color: 'bg-emerald-500' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-500' },
];

const STATUS_TRANSITIONS = {
  applied: ['reviewing', 'rejected'],
  reviewing: ['interview', 'rejected'],
  interview: ['accepted', 'rejected'],
  accepted: [],
  rejected: [],
};

export default function ApplicationsPage() {
  const { applications, updateApplicationStatus, jobSnapshots } = useStore();
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedApp, setExpandedApp] = useState(null);

  const filtered = filterStatus === 'all'
    ? applications
    : applications.filter(a => a.status === filterStatus);

  // Sort by most recent first
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.appliedAt) - new Date(a.appliedAt)
  );

  // Look up job from persisted snapshots
  const getJob = (jobId) => jobSnapshots[jobId] || null;

  const statusColors = {
    applied: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    reviewing: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    interview: 'bg-green-500/20 text-green-400 border-green-500/30',
    accepted: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Quest Log</h1>
        <p className="text-primary-400">Track your applications and their progress</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {STATUSES.map((status) => {
          const count = status.value === 'all'
            ? applications.length
            : applications.filter(a => a.status === status.value).length;
          return (
            <button
              key={status.value}
              onClick={() => setFilterStatus(status.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                filterStatus === status.value
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-primary-800/50 text-primary-400 hover:text-white border border-primary-700/30'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${status.color}`} />
              {status.label}
              <span className="text-xs opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Applications list */}
      <div className="space-y-3 stagger-children">
        {sorted.length === 0 ? (
          <div className="text-center py-16">
            <Briefcase className="w-16 h-16 text-primary-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No quests here yet</h3>
            <p className="text-primary-400">
              {filterStatus === 'all'
                ? "Start applying to jobs on the Quest Board to track them here!"
                : `No applications with status "${filterStatus}"`}
            </p>
          </div>
        ) : (
          sorted.map((app) => {
            const job = getJob(app.jobId);
            if (!job) {
              // Fallback for applications without a snapshot (legacy data)
              return (
                <div key={app.jobId} className="bg-primary-900/50 rounded-xl border border-primary-700/30 p-4">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-white">Job #{app.jobId}</h3>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border capitalize ${statusColors[app.status]}`}>
                      {app.status}
                    </span>
                  </div>
                  <p className="text-sm text-primary-500 mt-1">
                    Applied {new Date(app.appliedAt).toLocaleDateString()}
                  </p>
                </div>
              );
            }
            const isExpanded = expandedApp === app.jobId;
            const transitions = STATUS_TRANSITIONS[app.status] || [];

            return (
              <div
                key={app.jobId}
                className="bg-primary-900/50 rounded-xl border border-primary-700/30 overflow-hidden transition-all duration-200 hover:border-primary-500/30"
              >
                <button
                  onClick={() => setExpandedApp(isExpanded ? null : app.jobId)}
                  className="w-full flex items-center gap-4 p-4 text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-white truncate">{job.title}</h3>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border capitalize ${statusColors[app.status]}`}>
                        {app.status}
                      </span>
                      {job.source && job.source !== 'mock' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                          {job.source}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-primary-400">
                      <span>{job.company}</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {job.location}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right text-xs text-primary-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-primary-500 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-primary-800/50 animate-slide-up">
                    <div className="pt-4 space-y-4">
                      <p className="text-sm text-primary-300">{job.description}</p>

                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs px-2.5 py-1 rounded-full bg-primary-800/50 text-primary-300 capitalize flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          {job.type}
                        </span>
                        {(job.salaryMin || job.salaryMax) && (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-primary-800/50 text-primary-300 flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {job.salaryMin && job.salaryMax
                              ? `${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k`
                              : job.salaryMax
                                ? `Up to ${(job.salaryMax / 1000).toFixed(0)}k`
                                : ''}
                          </span>
                        )}
                        {job.url && (
                          <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-2.5 py-1 rounded-full bg-primary-800/50 text-primary-300 flex items-center gap-1 hover:text-white transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View original
                          </a>
                        )}
                      </div>

                      {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {job.skills.map((skill) => (
                            <span
                              key={skill}
                              className="text-xs px-2 py-0.5 rounded-md bg-primary-800/50 text-primary-500"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}

                      {transitions.length > 0 && (
                        <div>
                          <label className="text-xs text-primary-500 mb-2 block">Update Status</label>
                          <div className="flex gap-2">
                            {transitions.map((status) => (
                              <button
                                key={status}
                                onClick={() => updateApplicationStatus(app.jobId, status)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all border ${statusColors[status]} hover:opacity-80`}
                              >
                                <ArrowRight className="w-3 h-3" />
                                {status}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-primary-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Applied {new Date(app.appliedAt).toLocaleString()}
                        {app.updatedAt !== app.appliedAt && (
                          <span> · Updated {new Date(app.updatedAt).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
