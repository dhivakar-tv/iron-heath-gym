import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, ExternalLink, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole } from '../types';

const Login: React.FC = () => {
  const { user, login, loginWithGoogle, isLoggingIn } = useAuth();
  const [demoId, setDemoId] = React.useState('');
  const [error, setError] = React.useState('');
  const [showFixGuide, setShowFixGuide] = React.useState(false);

  if (user) {
    return <Navigate to="/" />;
  }

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(`Google login error: ${err.message || 'An error occurred during login.'}`);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const id = demoId.toLowerCase().trim();
    
    try {
      const role = demoId.split('@')[0] as UserRole;
      if (['admin', 'trainer', 'member'].includes(role)) {
        await login(role);
      } else {
        setError('Invalid Demo ID. Use "admin@demo", "trainer@demo", or "member@demo".');
      }
    } catch (err: any) {
      console.error('Full Login Error Object:', err);
      if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/admin-restricted-operation' || err.message?.includes('admin-restricted-operation')) {
        setError('Anonymous Auth is disabled in your Firebase Console.');
        setShowFixGuide(true);
      } else {
        setError(`Login error: ${err.message || 'An error occurred during login.'}`);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-orange-600" />
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20 rotate-3">
            <Dumbbell className="text-zinc-950 w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Iron Haven</h1>
          <p className="text-zinc-400 mt-2 text-center text-sm">Professional Gym Management</p>
        </div>

        <div className="space-y-4 mb-8">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            className="w-full bg-white hover:bg-zinc-100 text-zinc-950 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-800"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-900 px-2 text-zinc-500 font-bold tracking-widest">Or use Demo ID</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input 
              type="text"
              placeholder="e.g. admin@demo, trainer@demo"
              value={demoId}
              onChange={(e) => setDemoId(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-zinc-600"
              required
            />
            {error && (
              <div className="mt-2 space-y-2">
                <p className="text-red-500 text-xs font-medium">{error}</p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoggingIn || !demoId}
            className="w-full bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-800/50 disabled:text-zinc-600 disabled:cursor-not-allowed text-zinc-100 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 active:scale-95 border border-zinc-700"
          >
            {isLoggingIn ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                Accessing...
              </div>
            ) : (
              'Access with Demo ID'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-800">
          <p className="text-xs text-zinc-500 text-center mb-4">Available Demo Roles:</p>
          <div className="grid grid-cols-3 gap-2">
            {['admin@demo', 'trainer@demo', 'member@demo'].map(role => (
              <button 
                key={role}
                onClick={() => setDemoId(role)}
                className="text-[10px] font-bold uppercase tracking-wider py-2 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors border border-zinc-800"
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {showFixGuide && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl overflow-hidden"
            >
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-1">Action Required</p>
                  <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">
                    Firebase Anonymous Auth is disabled. You must enable it in your console to use the demo IDs.
                  </p>
                  <a 
                    href="https://console.firebase.google.com/project/gen-lang-client-0463864456/authentication/providers"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-orange-500 text-zinc-950 text-[10px] font-bold rounded-lg hover:bg-orange-400 transition-colors"
                  >
                    Open Firebase Console <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 text-center text-[10px] text-zinc-600 uppercase tracking-[0.2em] font-medium">
          Secure Demo Environment
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
