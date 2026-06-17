import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';
import { Search, Plus, MapPin, LogOut, Star, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export const Layout = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen text-[var(--color-text)] font-sans relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-20 left-10 text-[var(--color-primary)] opacity-20 animate-pulse pointer-events-none">
        <Star size={48} strokeWidth={3} className="rotate-12" />
      </div>
      <div className="absolute top-40 right-20 text-[var(--color-secondary)] opacity-20 animate-bounce pointer-events-none">
        <Zap size={64} strokeWidth={3} className="-rotate-12" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-[var(--color-accent)] border-b-4 border-black shadow-[0_4px_0_0_#000]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24">
            <Link to="/" className="flex items-center gap-3 group relative">
              {/* Pop decoration */}
              <Star size={24} strokeWidth={3} fill="white" className="absolute -top-3 -left-3 text-black z-10 opacity-0 group-hover:opacity-100 transition-opacity rotate-12" />
              
              <div className="w-14 h-14 rounded-full bg-[var(--color-secondary)] border-4 border-black flex items-center justify-center font-black text-black text-3xl shadow-[4px_4px_0_0_#000] group-hover:-translate-y-1 group-hover:shadow-[6px_6px_0_0_#000] transition-all -rotate-6">
                R
              </div>
              <div className="relative">
                <span className="font-heading font-black text-4xl tracking-tight text-black drop-shadow-[3px_3px_0_#fff]">Retriever</span>
                <span className="absolute -bottom-2 -right-6 bg-[var(--color-primary)] text-white text-[10px] font-black px-2 py-0.5 border-2 border-black rounded-lg shadow-[2px_2px_0_0_#000] rotate-12">
                  BETA!
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link to="/report" className="hidden sm:flex items-center gap-2 px-5 py-3 comic-button bg-[var(--color-secondary)] text-black">
                    <Plus size={24} strokeWidth={4} />
                    <span className="text-lg">Report Item</span>
                  </Link>
                  <div className="flex items-center gap-3 pl-4 border-l-4 border-black h-12 ml-2">
                    <div className="w-12 h-12 rounded-full bg-[var(--color-primary)] border-4 border-black flex items-center justify-center text-xl font-black text-white shadow-[3px_3px_0_0_#000] rotate-3">
                      {user?.email?.[0] || 'U'}
                    </div>
                    <button 
                      onClick={logout}
                      className="p-2 text-black hover:bg-black hover:text-white rounded-xl transition-colors border-2 border-transparent hover:border-black"
                      title="Log out"
                    >
                      <LogOut size={28} strokeWidth={3} />
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="px-8 py-3 comic-button text-xl bg-white text-black -rotate-2 hover:rotate-0"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[calc(100vh-96px)]">
        <Outlet />
      </main>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};
