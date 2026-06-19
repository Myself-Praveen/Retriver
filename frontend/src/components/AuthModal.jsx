import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User, AlertCircle } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!email.endsWith('.edu')) {
          throw new Error('Must use a valid .edu college email address');
        }
        await register(email, password, fullName);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md p-8 overflow-hidden rounded-2xl comic-panel bg-[var(--color-accent)]"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-[var(--color-text)] hover:bg-black/10 transition-colors rounded-full border-2 border-transparent hover:border-[var(--color-border)]"
            >
              <X size={24} strokeWidth={3} />
            </button>

            <div className="mb-8 text-center mt-2">
              <h2 className="text-3xl font-black text-[var(--color-text)] mb-2 uppercase tracking-wide">
                {isLogin ? 'Welcome Back!' : 'Join Retriever!'}
              </h2>
              <p className="text-[var(--color-text)]/70 font-bold">
                {isLogin 
                  ? 'Sign in to report or claim lost items.' 
                  : 'Use your .edu email to verify your campus identity.'}
              </p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-2 p-3 mb-6 text-sm font-bold text-[var(--color-text)] bg-[var(--color-primary)] border-4 border-[var(--color-border)] rounded-xl shadow-[2px_2px_0_0_var(--color-shadow)]"
              >
                <AlertCircle size={20} strokeWidth={3} className="shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="relative">
                  <User size={20} strokeWidth={3} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text)]" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 comic-input font-bold placeholder-black/50 text-lg"
                  />
                </div>
              )}
              
              <div className="relative">
                <Mail size={20} strokeWidth={3} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text)]" />
                <input
                  type="email"
                  placeholder="College Email (.edu)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 comic-input font-bold placeholder-black/50 text-lg"
                />
              </div>

              <div className="relative">
                <Lock size={20} strokeWidth={3} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text)]" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full pl-12 pr-4 py-3 comic-input font-bold placeholder-black/50 text-lg"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-6 font-black text-white text-xl comic-button bg-[var(--color-primary)] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-6 h-6 border-4 border-[var(--color-border)]/30 border-t-black rounded-full mx-auto"
                  />
                ) : (
                  isLogin ? "LET'S GO!" : 'CREATE ACCOUNT!'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="text-[var(--color-text)] font-bold hover:underline decoration-4 underline-offset-4 transition-all"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
