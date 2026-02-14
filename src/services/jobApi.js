// ============================================
// JOB API SERVICE
// Fetches real job listings from external APIs
// and normalizes them to our internal schema.
//
// Sources:
//   1. Remotive API  — Free, no key. Remote-focused jobs.
//   2. Adzuna API    — Free tier (requires app_id + app_key).
//   3. Mock data     — Always available fallback.
//
// All sources are normalized into the same shape used
// throughout the app (see normalizeJob below).
// ============================================

import MOCK_JOBS from '../data/jobs';

// --- Internal job schema ---
// Every job object in the app has this shape regardless of source:
// {
//   id:          string,   // Unique across all sources (prefixed by source)
//   title:       string,
//   company:     string,
//   location:    string,
//   type:        'remote' | 'hybrid' | 'onsite',
//   salaryMin:   number | null,
//   salaryMax:   number | null,
//   description: string,
//   skills:      string[],
//   category:    string,
//   postedDays:  number,
//   url:         string | null,  // External link to the real listing
//   source:      string,         // 'remotive' | 'adzuna' | 'mock'
// }

// ============================================
// NORMALIZERS
// Map each API's response shape → our internal schema
// ============================================

function daysSince(dateStr) {
  if (!dateStr) return 0;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.max(0, Math.floor(diff / 86400000));
}

// Guess job type from tags or title text
function inferJobType(text = '') {
  const lower = text.toLowerCase();
  if (lower.includes('remote')) return 'remote';
  if (lower.includes('hybrid')) return 'hybrid';
  return 'onsite';
}

// Extract likely skill tags from a description or tags array
function extractSkills(tags, title = '') {
  if (Array.isArray(tags) && tags.length > 0) {
    return tags.slice(0, 6);
  }
  // Fall back: pull common keywords from title
  const KNOWN_SKILLS = [
    'React', 'JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust',
    'Node.js', 'SQL', 'AWS', 'Docker', 'Kubernetes', 'CSS', 'HTML',
    'Figma', 'Swift', 'Kotlin', 'C++', 'Ruby', 'PHP', 'GraphQL',
    'Machine Learning', 'Data Science', 'DevOps', 'Vue', 'Angular',
    'Next.js', 'Django', 'Flask', 'Spring', 'PostgreSQL', 'MongoDB',
  ];
  return KNOWN_SKILLS.filter(s => title.toLowerCase().includes(s.toLowerCase()));
}

// Strip HTML tags from description strings
function stripHTML(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeRemotiveJob(job) {
  return {
    id: `remotive-${job.id}`,
    title: job.title || 'Untitled',
    company: job.company_name || 'Unknown Company',
    location: job.candidate_required_location || 'Remote',
    type: 'remote', // Remotive is all remote jobs
    salaryMin: job.salary ? parseSalaryRange(job.salary).min : null,
    salaryMax: job.salary ? parseSalaryRange(job.salary).max : null,
    description: stripHTML(job.description).slice(0, 500),
    skills: extractSkills(job.tags, job.title),
    category: job.category || 'Other',
    postedDays: daysSince(job.publication_date),
    url: job.url || null,
    source: 'remotive',
  };
}

function normalizeAdzunaJob(job) {
  return {
    id: `adzuna-${job.id}`,
    title: job.title || 'Untitled',
    company: job.company?.display_name || 'Unknown Company',
    location: job.location?.display_name || 'Unknown',
    type: inferJobType(`${job.title} ${job.description || ''} ${job.contract_type || ''}`),
    salaryMin: job.salary_min || null,
    salaryMax: job.salary_max || null,
    description: stripHTML(job.description).slice(0, 500),
    skills: extractSkills([], job.title),
    category: job.category?.label || 'Other',
    postedDays: daysSince(job.created),
    url: job.redirect_url || null,
    source: 'adzuna',
  };
}

function normalizeMockJob(job) {
  return {
    ...job,
    id: `mock-${job.id}`,
    url: null,
    source: 'mock',
  };
}

// Parse salary strings like "$80,000 - $120,000" or "80k-120k"
function parseSalaryRange(str) {
  if (!str) return { min: null, max: null };
  const numbers = str.match(/[\d,]+/g);
  if (!numbers || numbers.length === 0) return { min: null, max: null };

  const parsed = numbers.map(n => {
    let val = parseInt(n.replace(/,/g, ''));
    // If number looks like shorthand (e.g., "80" meaning "80k")
    if (val > 0 && val < 1000) val *= 1000;
    return val;
  });

  return {
    min: parsed[0] || null,
    max: parsed[1] || parsed[0] || null,
  };
}

// ============================================
// API FETCHERS
// Each returns normalized job arrays.
// Errors are caught so one failing source
// doesn't break the others.
// ============================================

const CACHE = new Map();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

function getCached(key) {
  const entry = CACHE.get(key);
  if (entry && Date.now() - entry.time < CACHE_TTL) return entry.data;
  return null;
}

function setCache(key, data) {
  CACHE.set(key, { data, time: Date.now() });
}

// --- Remotive API ---
// Docs: https://remotive.com/api/remote-jobs
// Free, no authentication, returns remote-only listings.
export async function fetchRemotiveJobs({ search = '', category = '', limit = 30 } = {}) {
  const cacheKey = `remotive:${search}:${category}:${limit}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    params.set('limit', String(limit));

    const res = await fetch(`https://remotive.com/api/remote-jobs?${params}`);
    if (!res.ok) throw new Error(`Remotive API: ${res.status}`);

    const data = await res.json();
    const jobs = (data.jobs || []).map(normalizeRemotiveJob);
    setCache(cacheKey, jobs);
    return jobs;
  } catch (err) {
    console.warn('Remotive fetch failed:', err.message);
    return [];
  }
}

// --- Adzuna API ---
// Docs: https://developer.adzuna.com/overview
// Free tier: register for app_id + app_key.
// Broader coverage: multiple countries, categories, salary data.
export async function fetchAdzunaJobs({
  search = '',
  location = '',
  country = 'us',
  page = 1,
  resultsPerPage = 20,
  appId = '',
  appKey = '',
} = {}) {
  if (!appId || !appKey) return []; // Skip if no credentials

  const cacheKey = `adzuna:${search}:${location}:${country}:${page}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const params = new URLSearchParams({
      app_id: appId,
      app_key: appKey,
      results_per_page: String(resultsPerPage),
      what: search,
      content_type: 'application/json',
    });
    if (location) params.set('where', location);

    const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}?${params}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Adzuna API: ${res.status}`);

    const data = await res.json();
    const jobs = (data.results || []).map(normalizeAdzunaJob);
    setCache(cacheKey, jobs);
    return jobs;
  } catch (err) {
    console.warn('Adzuna fetch failed:', err.message);
    return [];
  }
}

// --- Mock data ---
export function getMockJobs() {
  return MOCK_JOBS.map(normalizeMockJob);
}

// ============================================
// UNIFIED FETCH
// Calls all enabled sources in parallel and
// merges the results. Deduplicates by title+company.
// ============================================
export async function fetchAllJobs({ search = '', apiSettings = {} } = {}) {
  const sources = [];

  // Always try Remotive (free, no key)
  sources.push(fetchRemotiveJobs({ search, limit: 30 }));

  // Adzuna: env vars (from .env) take priority, then fall back to
  // values entered on the Settings page. This lets you set credentials
  // once in .env without re-entering them in the UI.
  const adzunaAppId = import.meta.env.VITE_ADZUNA_APP_ID || apiSettings.adzunaAppId;
  const adzunaAppKey = import.meta.env.VITE_ADZUNA_APP_KEY || apiSettings.adzunaAppKey;

  if (adzunaAppId && adzunaAppKey) {
    sources.push(fetchAdzunaJobs({
      search,
      appId: adzunaAppId,
      appKey: adzunaAppKey,
    }));
  }

  // Fire all API calls in parallel
  const results = await Promise.all(sources);
  let allJobs = results.flat();

  // Always include mock data as a supplement (so new users see jobs immediately)
  const mockJobs = getMockJobs();

  // If we got real results, put them first, mock jobs at the end
  if (allJobs.length > 0) {
    allJobs = [...allJobs, ...mockJobs];
  } else {
    // API calls returned nothing — rely on mock data
    allJobs = mockJobs;
  }

  // Deduplicate by normalized title + company
  const seen = new Set();
  const deduped = [];
  for (const job of allJobs) {
    const key = `${job.title.toLowerCase().trim()}|${job.company.toLowerCase().trim()}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(job);
    }
  }

  return deduped;
}
