import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  Sparkles,
  KeyRound,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectPath = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please provide an email address.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail, demoName) => {
    setError('');
    setLoading(true);
    try {
      await login(demoEmail || 'vikram.roy@example.com', 'demo-password');
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError('Failed to log in with demo account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 font-sans">
      <div className="max-w-md w-full space-y-6">
        {/* Top Header Card */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 border-2 border-[var(--border)] bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[2px_2px_0px_0px_var(--shadow-color)]">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--foreground)] tracking-tight">
            Sign In to RTI Assist
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] font-medium max-w-sm mx-auto">
            Securely manage public records petitions, track 30-day deadlines, and generate First Appeals.
          </p>
        </div>

        {/* Login Form Container */}
        <div className="border-2 border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 shadow-[6px_6px_0px_0px_var(--shadow-color)] space-y-6">
          {error && (
            <div className="p-3.5 border-2 border-[var(--border)] bg-rose-50 text-rose-900 text-xs font-bold flex items-center gap-2 shadow-[2px_2px_0px_0px_var(--shadow-color)]">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="applicant@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none shadow-[2px_2px_0px_0px_var(--shadow-color)] font-medium transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none shadow-[2px_2px_0px_0px_var(--shadow-color)] font-medium transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 border-2 border-[var(--border)] text-sm font-bold text-[var(--primary-foreground)] bg-[var(--primary)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] shadow-[3px_3px_0px_0px_var(--shadow-color)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all disabled:opacity-50 mt-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Sign In Button */}
          <div className="pt-4 border-t-2 border-[var(--border)] space-y-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--muted-foreground)] block text-center">
              Or Sign In with Demo Account
            </span>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('vikram.roy@example.com', 'Vikramaditya Roy')}
              disabled={loading}
              className="w-full flex items-center justify-between p-3 border-2 border-[var(--border)] bg-[var(--background)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] text-xs shadow-[2px_2px_0px_0px_var(--shadow-color)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition group text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 border-2 border-[var(--border)] bg-[var(--secondary)] text-[var(--secondary-foreground)] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[var(--foreground)] group-hover:text-[var(--accent-foreground)] transition">
                    Vikramaditya Roy
                  </p>
                  <p className="text-[11px] text-[var(--muted-foreground)] group-hover:text-[var(--accent-foreground)]">vikram.roy@example.com (Active Filings)</p>
                </div>
              </div>
              <Sparkles className="w-4 h-4 text-[var(--primary)] group-hover:text-[var(--accent-foreground)] transition" />
            </button>
          </div>
        </div>

        {/* Security / JWT Note */}
        <div className="p-3.5 border-2 border-[var(--border)] bg-[var(--card)] text-[11px] font-medium text-[var(--foreground)] flex items-center gap-2.5 shadow-[2px_2px_0px_0px_var(--shadow-color)]">
          <ShieldCheck className="w-4 h-4 text-[var(--secondary)] shrink-0" />
          <span>
            Sessions use signed JWT authentication. Tokens are automatically attached as an <code className="font-mono font-bold text-[var(--primary)]">Authorization: Bearer &lt;token&gt;</code> header.
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
