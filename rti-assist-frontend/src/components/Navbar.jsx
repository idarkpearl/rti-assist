import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Scale,
  Sparkles,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  ArrowRight,
  LayoutDashboard,
  Building2,
  FileText,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { isMockEnabled } from '../lib/api.js';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'How It Works', href: '/#how-it-works' },
    { name: 'Features', href: '/#features' },
    { name: 'Resources', href: '/#resources' },
    { name: 'FAQs', href: '/#faqs' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 border-b-2 border-[var(--border)] ${
        scrolled
          ? 'bg-[var(--card)]/95 backdrop-blur-md shadow-[0px_4px_0px_0px_var(--shadow-color)]'
          : 'bg-[var(--card)] backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Left: Brand Identity */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="w-10 h-10 border-2 border-[var(--border)] bg-[var(--primary)] flex items-center justify-center text-[var(--primary-foreground)] shadow-[2px_2px_0px_0px_var(--shadow-color)] group-hover:bg-[var(--accent)] transition-all">
              <Scale className="w-5 h-5 transition-transform group-hover:scale-110" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                  RTI Assist
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 border border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)]">
                  Act 2005
                </span>
              </div>
              <p className="text-[11px] text-[var(--muted-foreground)] hidden sm:block font-medium">Right to Information Intelligence</p>
            </div>
          </Link>

          {/* Center: SaaS Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 px-3 py-1.5 border-2 border-[var(--border)] transition ${
                    location.pathname === '/dashboard'
                      ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[2px_2px_0px_0px_var(--shadow-color)]'
                      : 'bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--background)] shadow-[2px_2px_0px_0px_var(--shadow-color)]'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/directory"
                  className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 px-3 py-1.5 border-2 border-[var(--border)] transition ${
                    location.pathname === '/directory'
                      ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[2px_2px_0px_0px_var(--shadow-color)]'
                      : 'bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--background)] shadow-[2px_2px_0px_0px_var(--shadow-color)]'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                  <span>Authorities</span>
                </Link>

                <Link
                  to="/rti-act"
                  className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 px-3 py-1.5 border-2 border-[var(--border)] transition ${
                    location.pathname === '/rti-act'
                      ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[2px_2px_0px_0px_var(--shadow-color)]'
                      : 'bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--background)] shadow-[2px_2px_0px_0px_var(--shadow-color)]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                  <span>RTI Guide</span>
                </Link>
              </>
            ) : (
              <>
                {navLinks.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-sm font-semibold text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
                  >
                    {item.name}
                  </a>
                ))}
                <div className="h-4 w-px bg-[var(--border)]" />
                <Link
                  to="/directory"
                  className="text-sm font-semibold text-[var(--foreground)] hover:text-[var(--primary)] flex items-center gap-1.5 transition-colors"
                >
                  <Building2 className="w-4 h-4 text-[var(--muted-foreground)]" />
                  <span>Authorities</span>
                </Link>
              </>
            )}
          </nav>

          {/* Right: Actions, Theme Toggle & Primary CTA */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 border-2 border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition shadow-[2px_2px_0px_0px_var(--shadow-color)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-800" />
              )}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-3 py-1.5 border-2 border-[var(--border)] bg-[var(--background)] text-xs font-bold text-[var(--foreground)] shadow-[2px_2px_0px_0px_var(--shadow-color)] transition"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[var(--primary)]" />
                  <span className="max-w-[120px] truncate">{user?.name || 'Citizen'}</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-1.5 border-2 border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--destructive)] hover:bg-rose-50 transition cursor-pointer"
                  title="Logout Session"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-sm font-bold text-[var(--foreground)] hover:text-[var(--primary)] px-3.5 py-2 transition"
              >
                Sign In
              </Link>
            )}

            {/* Primary CTA: "Create an RTI" */}
            <Link
              to="/intake"
              className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-[var(--border)] text-sm font-bold text-[var(--primary-foreground)] bg-[var(--primary)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] shadow-[3px_3px_0px_0px_var(--shadow-color)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create an RTI</span>
            </Link>
          </div>

          {/* Mobile Menu Button + Mobile Theme Toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 border-2 border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-800" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 border-2 border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t-2 border-[var(--border)] bg-[var(--card)] px-4 pt-3 pb-6 space-y-3 shadow-[0px_4px_0px_0px_var(--shadow-color)]">
          <div className="space-y-1">
            {navLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 text-base font-bold text-[var(--foreground)] hover:bg-[var(--background)] transition"
              >
                {item.name}
              </a>
            ))}
            <Link
              to="/directory"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 text-base font-bold text-[var(--foreground)] hover:bg-[var(--background)] transition"
            >
              Public Authorities
            </Link>
            {isAuthenticated && (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 text-base font-bold text-[var(--primary)] hover:bg-[var(--background)] transition"
              >
                My Dashboard
              </Link>
            )}
          </div>

          <div className="pt-3 border-t-2 border-[var(--border)] space-y-2">
            <Link
              to="/intake"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-[var(--border)] font-bold text-sm text-[var(--primary-foreground)] bg-[var(--primary)] shadow-[3px_3px_0px_0px_var(--shadow-color)]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create an RTI</span>
            </Link>

            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-[var(--border)] font-bold text-sm text-[var(--destructive)] bg-[var(--card)]"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out ({user?.name || 'Citizen'})</span>
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-[var(--border)] font-bold text-sm text-[var(--foreground)] bg-[var(--background)] shadow-[2px_2px_0px_0px_var(--shadow-color)]"
              >
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
