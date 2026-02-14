import { useState } from 'react';
import { User, CheckCircle, Circle, Plus, X, Save, Star } from 'lucide-react';
import useStore from '../store/useStore';
import ProgressRing from '../components/ui/ProgressRing';
import { calculateProfileCompletion, getProfileSections } from '../utils/gamification';

const SKILL_SUGGESTIONS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'Go',
  'SQL', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'Git',
  'CSS', 'HTML', 'Figma', 'UI Design', 'UX Design', 'Agile', 'Scrum',
  'Machine Learning', 'Data Analysis', 'Project Management', 'Communication',
  'React Native', 'Swift', 'Kotlin', 'C++', 'Rust', 'GraphQL', 'REST APIs',
];

const EXPERIENCE_LEVELS = ['Entry Level', 'Junior', 'Mid-Level', 'Senior', 'Lead', 'Principal'];
const JOB_TYPES = ['remote', 'hybrid', 'onsite'];

export default function ProfilePage() {
  const { profile, updateProfile } = useStore();
  const [newSkill, setNewSkill] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [saved, setSaved] = useState(false);

  const completion = calculateProfileCompletion(profile);
  const sections = getProfileSections(profile);

  const handleSave = (field, value) => {
    updateProfile({ [field]: value });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addSkill = (skill) => {
    const trimmed = skill.trim();
    if (trimmed && !profile.skills.includes(trimmed)) {
      handleSave('skills', [...profile.skills, trimmed]);
    }
    setNewSkill('');
    setShowSuggestions(false);
  };

  const removeSkill = (skill) => {
    handleSave('skills', profile.skills.filter(s => s !== skill));
  };

  const filteredSuggestions = SKILL_SUGGESTIONS.filter(
    s => s.toLowerCase().includes(newSkill.toLowerCase()) && !profile.skills.includes(s)
  );

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header with completion ring */}
      <div className="bg-gradient-to-r from-primary-800/80 to-primary-900/60 rounded-2xl p-6 border border-primary-700/30">
        <div className="flex items-center gap-6">
          <ProgressRing progress={completion} size={100} strokeWidth={8}>
            <div className="text-center">
              <div className="text-xl font-bold text-white">{completion}%</div>
              <div className="text-[10px] text-primary-400">Complete</div>
            </div>
          </ProgressRing>
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Your Profile</h1>
            <p className="text-primary-400 text-sm mb-3">
              Complete your profile to get better job matches and earn XP!
            </p>
            <div className="flex items-center gap-1 text-xs text-xp">
              <Star className="w-3 h-3 fill-xp" />
              <span>+50 XP for each section completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Completion checklist */}
      <div className="bg-primary-900/50 rounded-xl p-6 border border-primary-700/30">
        <h2 className="text-lg font-bold text-white mb-4">Completion Checklist</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {sections.map((section) => (
            <div
              key={section.key}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                section.complete
                  ? 'bg-green-500/10 text-green-400'
                  : 'bg-primary-800/50 text-primary-400'
              }`}
            >
              {section.complete ? (
                <CheckCircle className="w-4 h-4 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 shrink-0" />
              )}
              {section.name}
            </div>
          ))}
        </div>
      </div>

      {/* Profile form */}
      <div className="bg-primary-900/50 rounded-xl p-6 border border-primary-700/30 space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-primary-300 mb-1">Full Name</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => handleSave('name', e.target.value)}
            className="w-full px-4 py-3 bg-primary-800/50 border border-primary-600/30 rounded-xl text-white placeholder-primary-500 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-all"
            placeholder="Your full name"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-primary-300 mb-1">Bio</label>
          <textarea
            value={profile.bio || ''}
            onChange={(e) => handleSave('bio', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-primary-800/50 border border-primary-600/30 rounded-xl text-white placeholder-primary-500 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-all resize-none"
            placeholder="Tell us about yourself..."
          />
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-primary-300 mb-1">Skills</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="flex items-center gap-1 px-3 py-1.5 bg-primary-600/30 text-primary-200 rounded-lg text-sm border border-primary-500/30"
              >
                {skill}
                <button
                  onClick={() => removeSkill(skill)}
                  className="text-primary-400 hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
          <div className="relative">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => { setNewSkill(e.target.value); setShowSuggestions(true); }}
              onKeyDown={(e) => e.key === 'Enter' && newSkill.trim() && addSkill(newSkill)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="w-full px-4 py-3 bg-primary-800/50 border border-primary-600/30 rounded-xl text-white placeholder-primary-500 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-all"
              placeholder="Add a skill..."
            />
            {showSuggestions && newSkill && filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-primary-800 border border-primary-600/30 rounded-xl shadow-xl max-h-48 overflow-y-auto z-10">
                {filteredSuggestions.slice(0, 8).map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => addSkill(suggestion)}
                    className="w-full px-4 py-2.5 text-left text-sm text-primary-200 hover:bg-primary-700 transition-colors first:rounded-t-xl last:rounded-b-xl"
                  >
                    <Plus className="w-3.5 h-3.5 inline mr-2 text-primary-500" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Experience Level */}
        <div>
          <label className="block text-sm font-medium text-primary-300 mb-1">Experience Level</label>
          <div className="flex flex-wrap gap-2">
            {EXPERIENCE_LEVELS.map((level) => (
              <button
                key={level}
                onClick={() => handleSave('experienceLevel', level)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  profile.experienceLevel === level
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-primary-800/50 text-primary-400 hover:text-white hover:bg-primary-700/50 border border-primary-600/30'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Preferred Location */}
        <div>
          <label className="block text-sm font-medium text-primary-300 mb-1">Preferred Location</label>
          <input
            type="text"
            value={profile.preferredLocation || ''}
            onChange={(e) => handleSave('preferredLocation', e.target.value)}
            className="w-full px-4 py-3 bg-primary-800/50 border border-primary-600/30 rounded-xl text-white placeholder-primary-500 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-all"
            placeholder="e.g. San Francisco, Remote, etc."
          />
        </div>

        {/* Job Type Preference */}
        <div>
          <label className="block text-sm font-medium text-primary-300 mb-1">Job Type Preference</label>
          <div className="flex gap-3">
            {JOB_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => handleSave('preferredJobType', type)}
                className={`flex-1 py-3 rounded-xl text-sm font-medium capitalize transition-all ${
                  profile.preferredJobType === type
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-primary-800/50 text-primary-400 hover:text-white border border-primary-600/30'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Salary Range */}
        <div>
          <label className="block text-sm font-medium text-primary-300 mb-1">Salary Range</label>
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500 text-sm">$</span>
              <input
                type="number"
                value={profile.salaryRange?.min || ''}
                onChange={(e) => handleSave('salaryRange', { ...profile.salaryRange, min: parseInt(e.target.value) || null })}
                className="w-full pl-7 pr-4 py-3 bg-primary-800/50 border border-primary-600/30 rounded-xl text-white placeholder-primary-500 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-all"
                placeholder="Min"
              />
            </div>
            <span className="text-primary-500">to</span>
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500 text-sm">$</span>
              <input
                type="number"
                value={profile.salaryRange?.max || ''}
                onChange={(e) => handleSave('salaryRange', { ...profile.salaryRange, max: parseInt(e.target.value) || null })}
                className="w-full pl-7 pr-4 py-3 bg-primary-800/50 border border-primary-600/30 rounded-xl text-white placeholder-primary-500 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-all"
                placeholder="Max"
              />
            </div>
          </div>
        </div>

        {/* Save indicator */}
        {saved && (
          <div className="flex items-center gap-2 text-green-400 text-sm animate-slide-up">
            <Save className="w-4 h-4" />
            Changes saved automatically
          </div>
        )}
      </div>
    </div>
  );
}
