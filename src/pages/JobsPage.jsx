import { useState, useMemo } from 'react';
import { Search, MapPin, Briefcase, DollarSign, Filter, X, Zap, Check } from 'lucide-react';
import useStore from '../store/useStore';
import JOBS, { scoreJobForUser } from '../data/jobs';

export default function JobsPage() {
  const { profile, applications, applyToJob } = useStore();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSalaryMin, setFilterSalaryMin] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [appliedAnimation, setAppliedAnimation] = useState(null); // jobId currently animating

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    let jobs = [...JOBS];

    // Text search
    if (search) {
      const q = search.toLowerCase();
      jobs = jobs.filter(
        j =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.skills.some(s => s.toLowerCase().includes(q)) ||
          j.location.toLowerCase().includes(q)
      );
    }

    // Type filter
    if (filterType !== 'all') {
      jobs = jobs.filter(j => j.type === filterType);
    }

    // Salary filter
    if (filterSalaryMin) {
      const min = parseInt(filterSalaryMin);
      jobs = jobs.filter(j => j.salaryMax >= min);
    }

    // Sort by relevance score (matching user profile)
    jobs.sort((a, b) => scoreJobForUser(b, profile) - scoreJobForUser(a, profile));

    return jobs;
  }, [search, filterType, filterSalaryMin, profile]);

  const handleApply = (jobId) => {
    const success = applyToJob(jobId);
    if (success) {
      setAppliedAnimation(jobId);
      setTimeout(() => setAppliedAnimation(null), 1500);
    }
  };

  const isApplied = (jobId) => applications.some(a => a.jobId === jobId);

  const typeColors = {
    remote: 'bg-green-500/20 text-green-400 border-green-500/30',
    hybrid: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    onsite: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Quest Board</h1>
        <p className="text-primary-400">Find your next adventure. Each application earns +100 XP!</p>
      </div>

      {/* Search and filters */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs, skills, companies..."
              className="w-full pl-10 pr-4 py-3 bg-primary-800/50 border border-primary-600/30 rounded-xl text-white placeholder-primary-500 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-xl border transition-all ${
              showFilters
                ? 'bg-primary-600 border-primary-500 text-white'
                : 'bg-primary-800/50 border-primary-600/30 text-primary-400 hover:text-white hover:border-primary-500/50'
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {showFilters && (
          <div className="bg-primary-900/50 rounded-xl p-4 border border-primary-700/30 flex flex-wrap gap-4 animate-slide-up">
            <div>
              <label className="text-xs text-primary-400 mb-1 block">Job Type</label>
              <div className="flex gap-2">
                {['all', 'remote', 'hybrid', 'onsite'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                      filterType === type
                        ? 'bg-primary-500 text-white'
                        : 'bg-primary-800/50 text-primary-400 hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-primary-400 mb-1 block">Min Salary</label>
              <input
                type="number"
                value={filterSalaryMin}
                onChange={(e) => setFilterSalaryMin(e.target.value)}
                placeholder="e.g. 80000"
                className="w-36 px-3 py-1.5 bg-primary-800/50 border border-primary-600/30 rounded-lg text-white text-sm placeholder-primary-500 focus:outline-none focus:border-primary-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="text-sm text-primary-400">
        {filteredJobs.length} quest{filteredJobs.length !== 1 ? 's' : ''} available
      </div>

      {/* Job cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
        {filteredJobs.map((job) => {
          const applied = isApplied(job.id);
          const matchScore = scoreJobForUser(job, profile);

          return (
            <div
              key={job.id}
              className={`bg-primary-900/50 rounded-xl p-5 border transition-all duration-200 hover:shadow-lg hover:shadow-primary-500/5 ${
                applied
                  ? 'border-green-500/30'
                  : 'border-primary-700/30 hover:border-primary-500/30'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">{job.title}</h3>
                  <p className="text-primary-400 text-sm">{job.company}</p>
                </div>
                {matchScore > 0 && (
                  <div className="flex items-center gap-1 text-xs bg-primary-500/20 text-primary-300 px-2 py-1 rounded-full">
                    <Zap className="w-3 h-3" />
                    {matchScore}% match
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`text-xs px-2.5 py-1 rounded-full border capitalize ${typeColors[job.type]}`}>
                  {job.type}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-primary-800/50 text-primary-300 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {job.location}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-primary-800/50 text-primary-300 flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  {(job.salaryMin / 1000).toFixed(0)}k - {(job.salaryMax / 1000).toFixed(0)}k
                </span>
              </div>

              <p className="text-sm text-primary-400 mb-3 line-clamp-2">{job.description}</p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {job.skills.map((skill) => {
                  const isMatch = profile.skills?.some(
                    s => s.toLowerCase() === skill.toLowerCase()
                  );
                  return (
                    <span
                      key={skill}
                      className={`text-xs px-2 py-0.5 rounded-md ${
                        isMatch
                          ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
                          : 'bg-primary-800/50 text-primary-500'
                      }`}
                    >
                      {skill}
                    </span>
                  );
                })}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-primary-500">
                  Posted {job.postedDays} day{job.postedDays !== 1 ? 's' : ''} ago
                </span>

                {applied ? (
                  <div className="flex items-center gap-1.5 text-green-400 text-sm font-medium">
                    <Check className="w-4 h-4" />
                    Applied
                  </div>
                ) : (
                  <button
                    onClick={() => handleApply(job.id)}
                    className="relative px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-400 hover:to-accent-400 text-white text-sm font-bold rounded-lg transition-all duration-200 active:scale-95"
                  >
                    Apply (+100 XP)
                    {appliedAnimation === job.id && (
                      <span className="absolute -top-2 -right-2 text-xp font-bold text-sm animate-xp-float">
                        +100 XP
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="w-16 h-16 text-primary-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No quests found</h3>
          <p className="text-primary-400">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
