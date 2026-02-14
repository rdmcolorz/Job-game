import { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, MapPin, Briefcase, DollarSign, Filter, Zap, Check, Loader2, RefreshCw, Globe, ExternalLink } from 'lucide-react';
import useStore from '../store/useStore';
import { scoreJobForUser } from '../data/jobs';
import { fetchAllJobs } from '../services/jobApi';

// Source badge colors
const SOURCE_COLORS = {
  remotive: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  adzuna: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  mock: 'bg-primary-500/20 text-primary-400 border-primary-500/30',
};

const SOURCE_LABELS = {
  remotive: 'Remotive',
  adzuna: 'Adzuna',
  mock: 'Sample',
};

export default function JobsPage() {
  const { profile, applications, applyToJob, apiSettings } = useStore();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // debounced/submitted query for API
  const [filterType, setFilterType] = useState('all');
  const [filterSalaryMin, setFilterSalaryMin] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [appliedAnimation, setAppliedAnimation] = useState(null);

  // Fetch jobs from all sources
  const loadJobs = useCallback(async (query = '') => {
    setLoading(true);
    setError(null);
    try {
      const results = await fetchAllJobs({ search: query, apiSettings });
      setJobs(results);
    } catch (err) {
      setError('Failed to load jobs. Showing sample data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [apiSettings]);

  // Initial load
  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  // Search submission (Enter key or button)
  const handleSearch = (e) => {
    e?.preventDefault();
    setSearchQuery(searchInput);
    loadJobs(searchInput);
  };

  // Client-side filtering on top of fetched results
  const filteredJobs = useMemo(() => {
    let filtered = [...jobs];

    // Additional client-side text filter (for refining without re-fetching)
    if (searchInput && searchInput !== searchQuery) {
      const q = searchInput.toLowerCase();
      filtered = filtered.filter(
        j =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.skills.some(s => s.toLowerCase().includes(q)) ||
          j.location.toLowerCase().includes(q)
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(j => j.type === filterType);
    }

    // Salary filter
    if (filterSalaryMin) {
      const min = parseInt(filterSalaryMin);
      filtered = filtered.filter(j => j.salaryMax && j.salaryMax >= min);
    }

    // Sort: real jobs first, then by relevance score
    filtered.sort((a, b) => {
      // Real jobs before mock
      const aReal = a.source !== 'mock' ? 1 : 0;
      const bReal = b.source !== 'mock' ? 1 : 0;
      if (bReal !== aReal) return bReal - aReal;
      return scoreJobForUser(b, profile) - scoreJobForUser(a, profile);
    });

    return filtered;
  }, [jobs, searchInput, searchQuery, filterType, filterSalaryMin, profile]);

  const handleApply = (job) => {
    const success = applyToJob(job.id, job);
    if (success) {
      setAppliedAnimation(job.id);
      setTimeout(() => setAppliedAnimation(null), 1500);
    }
  };

  const isApplied = (jobId) => applications.some(a => a.jobId === jobId);

  const typeColors = {
    remote: 'bg-green-500/20 text-green-400 border-green-500/30',
    hybrid: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    onsite: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  };

  // Count real vs mock jobs
  const realCount = filteredJobs.filter(j => j.source !== 'mock').length;
  const mockCount = filteredJobs.filter(j => j.source === 'mock').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Quest Board</h1>
        <p className="text-primary-400">
          Find your next adventure. Each application earns +100 XP!
        </p>
      </div>

      {/* Search and filters */}
      <div className="space-y-3">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-500" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search jobs, skills, companies... (Enter to search APIs)"
              className="w-full pl-10 pr-4 py-3 bg-primary-800/50 border border-primary-600/30 rounded-xl text-white placeholder-primary-500 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          </button>
          <button
            type="button"
            onClick={() => loadJobs(searchQuery)}
            disabled={loading}
            className="px-4 py-3 rounded-xl bg-primary-800/50 border border-primary-600/30 text-primary-400 hover:text-white hover:border-primary-500/50 transition-all disabled:opacity-50"
            title="Refresh listings"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-xl border transition-all ${
              showFilters
                ? 'bg-primary-600 border-primary-500 text-white'
                : 'bg-primary-800/50 border-primary-600/30 text-primary-400 hover:text-white hover:border-primary-500/50'
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>
        </form>

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

      {/* Results count with source breakdown */}
      <div className="flex items-center gap-3 text-sm">
        <span className="text-primary-400">
          {filteredJobs.length} quest{filteredJobs.length !== 1 ? 's' : ''} available
        </span>
        {realCount > 0 && (
          <span className="flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">
            <Globe className="w-3 h-3" />
            {realCount} live
          </span>
        )}
        {mockCount > 0 && (
          <span className="text-xs bg-primary-500/10 text-primary-400 px-2 py-0.5 rounded-full">
            {mockCount} sample
          </span>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-danger/10 border border-danger/20 rounded-xl px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && jobs.length === 0 && (
        <div className="text-center py-16">
          <Loader2 className="w-12 h-12 text-primary-500 mx-auto mb-4 animate-spin" />
          <p className="text-primary-400">Fetching quests from the realm...</p>
        </div>
      )}

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
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-lg font-bold text-white truncate">{job.title}</h3>
                    {job.url && (
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-500 hover:text-primary-300 shrink-0"
                        title="View original listing"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  <p className="text-primary-400 text-sm">{job.company}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                  {matchScore > 0 && (
                    <div className="flex items-center gap-1 text-xs bg-primary-500/20 text-primary-300 px-2 py-1 rounded-full">
                      <Zap className="w-3 h-3" />
                      {matchScore}% match
                    </div>
                  )}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${SOURCE_COLORS[job.source]}`}>
                    {SOURCE_LABELS[job.source] || job.source}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`text-xs px-2.5 py-1 rounded-full border capitalize ${typeColors[job.type]}`}>
                  {job.type}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-primary-800/50 text-primary-300 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {job.location}
                </span>
                {job.salaryMin && job.salaryMax ? (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-primary-800/50 text-primary-300 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    {(job.salaryMin / 1000).toFixed(0)}k - {(job.salaryMax / 1000).toFixed(0)}k
                  </span>
                ) : job.salaryMax ? (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-primary-800/50 text-primary-300 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    Up to {(job.salaryMax / 1000).toFixed(0)}k
                  </span>
                ) : null}
              </div>

              <p className="text-sm text-primary-400 mb-3 line-clamp-2">{job.description}</p>

              {job.skills.length > 0 && (
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
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs text-primary-500">
                  {job.postedDays > 0
                    ? `Posted ${job.postedDays} day${job.postedDays !== 1 ? 's' : ''} ago`
                    : 'Posted today'}
                </span>

                {applied ? (
                  <div className="flex items-center gap-1.5 text-green-400 text-sm font-medium">
                    <Check className="w-4 h-4" />
                    Applied
                  </div>
                ) : (
                  <button
                    onClick={() => handleApply(job)}
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

      {!loading && filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="w-16 h-16 text-primary-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No quests found</h3>
          <p className="text-primary-400">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
