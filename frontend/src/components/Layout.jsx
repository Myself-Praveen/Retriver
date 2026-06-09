import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';
import { Search, Plus, MapPin, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

export const Layout = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#08060d] text-gray-100 font-sans selection:bg-[#aa3bff]/30">
      {/* Background ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-[#aa3bff]/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-[#08060d]/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#aa3bff] to-[#c084fc] flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(170,59,255,0.4)]">
                R
              </div>
              <span className="font-heading font-bold text-xl tracking-tight text-white">Retriever</span>
            </Link>

            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link to="/report" className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm font-medium">
                    <Plus size={16} />
                    Report Item
                  </Link>
                  <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-sm font-bold text-white uppercase">
                      {user?.email?.[0] || 'U'}
                    </div>
                    <button 
                      onClick={logout}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      title="Log out"
                    >
                      <LogOut size={18} />
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="px-5 py-2 rounded-full bg-[#aa3bff] hover:bg-[#912bd9] text-white font-medium text-sm transition-colors shadow-[0_0_20px_rgba(170,59,255,0.3)]"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-64px)]">
        <Outlet />
      </main>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};
