import { useState } from 'react';
import { Swords, Eye, EyeOff } from 'lucide-react';
import useStore from '../../store/useStore';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const { signup, login } = useStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (isLogin) {
      const success = login(email, password);
      if (!success) {
        setError('Invalid email or password');
      }
    } else {
      if (!name) {
        setError('Please enter your name');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      signup(email, password, name);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and title */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 mb-4 shadow-xl shadow-primary-500/30">
            <Swords className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-300 via-accent-400 to-xp bg-clip-text text-transparent">
            QuestCareer
          </h1>
          <p className="text-primary-400 mt-2">Level up your job search</p>
        </div>

        {/* Auth form */}
        <div className="bg-primary-900/60 backdrop-blur-sm rounded-2xl p-6 border border-primary-700/30 shadow-xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex mb-6 bg-primary-800/50 rounded-lg p-1">
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${
                !isLogin ? 'bg-primary-600 text-white shadow-md' : 'text-primary-400 hover:text-primary-300'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${
                isLogin ? 'bg-primary-600 text-white shadow-md' : 'text-primary-400 hover:text-primary-300'
              }`}
            >
              Log In
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-primary-300 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-primary-800/50 border border-primary-600/30 rounded-xl text-white placeholder-primary-500 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-all"
                  placeholder="Your name"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-primary-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-primary-800/50 border border-primary-600/30 rounded-xl text-white placeholder-primary-500 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-300 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-primary-800/50 border border-primary-600/30 rounded-xl text-white placeholder-primary-500 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-all pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-500 hover:text-primary-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-danger text-sm bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-400 hover:to-accent-400 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-primary-500/20 active:scale-[0.98]"
            >
              {isLogin ? 'Log In' : 'Start Your Quest'}
            </button>
          </form>

          {!isLogin && (
            <div className="mt-4 flex items-center gap-2 text-xs text-primary-500">
              <div className="flex items-center gap-1 bg-xp/10 text-xp px-2 py-1 rounded-full">
                <span className="font-bold">+100 XP</span>
              </div>
              <span>earned just for signing up!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
