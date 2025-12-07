import React from 'react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'public' | 'workspace';
  onNavigate: (tab: 'public' | 'workspace') => void;
  user: User | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onNavigate, user, onLogout }) => {
  if (!user) return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center cursor-pointer group" onClick={() => onNavigate('public')}>
                <div className="h-9 w-9 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center mr-2.5 shadow-lg shadow-indigo-200 group-hover:shadow-indigo-300 transition-all group-hover:scale-105">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-900 to-violet-800">ScaleNotes</span>
              </div>
              <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
                <button
                  onClick={() => onNavigate('public')}
                  className={`${
                    activeTab === 'public'
                      ? 'border-indigo-500 text-indigo-900'
                      : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold transition-colors duration-200`}
                >
                  Public Directory
                </button>
                <button
                  onClick={() => onNavigate('workspace')}
                  className={`${
                    activeTab === 'workspace'
                      ? 'border-indigo-500 text-indigo-900'
                      : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold transition-colors duration-200`}
                >
                  My Workspaces
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-500 rounded hidden md:block border border-slate-200">
                v1.0.0
              </span>
              <div className="flex items-center space-x-3 pl-6 border-l border-slate-100">
                <div className="relative group">
                  <div className="flex items-center gap-3 cursor-pointer">
                    <img
                        className="h-9 w-9 rounded-full border-2 border-white shadow-md ring-1 ring-slate-100"
                        src={user.avatar}
                        alt={user.name}
                    />
                    <div className="hidden md:block text-xs text-right">
                        <p className="font-bold text-slate-700">{user.name}</p>
                        <p className="text-slate-400 font-medium">Pro Plan</p>
                    </div>
                  </div>
                  {/* Dropdown for Logout */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                      <button 
                        onClick={onLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        Sign out
                      </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm font-medium">
            &copy; 2024 ScaleNotes SaaS Inc.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">Privacy</a>
            <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">Terms</a>
            <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
