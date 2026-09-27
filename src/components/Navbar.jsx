import { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  FileText,
  PlusCircle,
  LayoutDashboard,
  Building2,
  Menu,
  X,
  Scale,
  Sparkles,
  LogIn,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { isMockEnabled } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const { user, isAuthenticated, logout } = useAuth();

  const navLinks = [
    { name: 'Home', path: '/', icon: Scale },
    { name: 'New Request', path: '/intake', icon: PlusCircle },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Directory', path: '/directory', icon: Building2 },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0c101c]/85 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-600 to-indigo-600 p-[1px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-[#0c101c] rounded-[11px] flex items-center justify-center group-hover:bg-[#111627] transition">
                <FileText className="w-5 h-5 text-cyan-400 transition-transform group-hover:scale-110" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                  RTI Assist
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                  Act 2005
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Legal Automation & Tracking</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-slate-800 text-cyan-400 shadow-inner shadow-black/30 border border-slate-700/60'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* Quick CTA & Status Indicator */}
          <div className="hidden md:flex items-center gap-3">
            <div
              className={`flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs ${
                isMockEnabled
                  ? 'bg-cyan-950/60 border-cyan-800/50 text-cyan-300'
                  : 'bg-emerald-950/60 border-emerald-800/40 text-emerald-400'
              }`}
              title={isMockEnabled ? 'Running with mockApi.js (VITE_USE_MOCK=true)' : 'Connecting to real backend API'}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isMockEnabled ? 'bg-cyan-400 animate-pulse' : 'bg-emerald-400 animate-pulse'
                }`}
              ></span>
              <span className="font-mono text-[11px]">
                {isMockEnabled ? 'Mock Mode' : 'Live API'}
              </span>
            </div>

            <Link
              to="/intake"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-md shadow-cyan-900/30 transition transform active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Draft RTI</span>
            </Link>

            {/* User Session Profile & Logout / Login */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                  <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-semibold max-w-[120px] truncate">{user?.name || 'Citizen'}</span>
                </div>

                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                  title="Logout Session"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
              >
                <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#0c101c]/95 backdrop-blur-xl px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium transition ${
                  isActive
                    ? 'bg-slate-800 text-cyan-400 border border-slate-700/60'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 text-slate-400" />
                {item.name}
              </NavLink>
            );
          })}
          <div className="pt-2">
            <Link
              to="/intake"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm text-white bg-gradient-to-r from-cyan-600 to-blue-600"
            >
              <PlusCircle className="w-4 h-4" />
              New RTI Request
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
