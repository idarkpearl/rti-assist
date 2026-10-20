import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Send,
  RotateCcw,
  Check,
  KeyRound,
  UserPlus,
  LogIn,
  Eye,
  EyeOff,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, sendOtp, verifyOtp, setPassword } = useAuth();

  // Mode: 'password_login' | 'otp_register'
  const [activeTab, setActiveTab] = useState('password_login');

  // OTP Sub-Step: 'request' | 'verify' | 'set_password'
  const [otpStep, setOtpStep] = useState('request');

  // Form Fields
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');

  // Password Visibility Toggles
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Timers
  const [resendCooldown, setResendCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Determine redirection destination
  const redirectPath = location.state?.from?.pathname || '/dashboard';
  const isDraftingRedirect = location.state?.from?.pathname === '/intake';

  // Cooldown countdown timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Switch tab helper
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setError('');
    setSuccessMsg('');
    if (tab === 'otp_register' && otpStep === 'set_password') {
      // Keep password setup if in progress, else reset
    } else if (tab === 'otp_register') {
      setOtpStep('request');
    }
  };

  // =========================================================================
  // HANDLER 1: Direct Email & Password Sign In
  // =========================================================================
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email || !loginPassword) {
      setError('Please provide both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, loginPassword);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      const errMsg = err?.message || 'Authentication error';
      // If user hasn't set password or is not found, offer OTP setup
      if (errMsg.includes('not found') || errMsg.includes('not created a password') || errMsg.includes('PASSWORD_NOT_SET')) {
        setError(
          'No account with a password found for this email. Please verify with Email OTP once to create your password.'
        );
      } else {
        setError(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // HANDLER 2: Request 6-Digit OTP via Brevo
  // =========================================================================
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address to receive your OTP code.');
      return;
    }

    setLoading(true);
    try {
      const res = await sendOtp(email, name);
      if (res.success) {
        setOtpStep('verify');
        setResendCooldown(60);
        setSuccessMsg(`Verification code sent to ${email}. Please check your inbox!`);
      } else {
        setError(res.message || 'Failed to dispatch verification code.');
      }
    } catch (err) {
      setError(err?.message || 'Could not send verification OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // HANDLER 3: Verify OTP Code
  // =========================================================================
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setError('Please enter the full 6-digit verification code sent to your email.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtp(email, cleanOtp, name);

      // If user needs to set a password (first-time citizen account setup)
      if (res.requiresPasswordSetup) {
        setOtpStep('set_password');
        setSuccessMsg('Email verified! Now set a password so you can log in directly next time without OTP.');
      } else {
        // User already has a password set; logged in directly!
        navigate(redirectPath, { replace: true });
      }
    } catch (err) {
      setError(err?.message || 'Invalid or expired OTP. Please check your email and try again.');
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // HANDLER 4: Set Account Password
  // =========================================================================
  const handleSetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter carefully.');
      return;
    }

    setLoading(true);
    try {
      await setPassword(newPassword, email);
      setSuccessMsg('Account and password created successfully! Redirecting...');
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 700);
    } catch (err) {
      setError(err?.message || 'Failed to save password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4 font-sans">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 border-2 border-[var(--border)] bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[2px_2px_0px_0px_var(--shadow-color)]">
            {otpStep === 'set_password' ? <KeyRound className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--foreground)] tracking-tight">
            {otpStep === 'set_password'
              ? 'Create Account Password'
              : activeTab === 'password_login'
              ? 'Sign In to RTI Assist'
              : 'Register / Verify via Email OTP'}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] font-medium max-w-sm mx-auto">
            {isDraftingRedirect
              ? 'Authentication required to draft and file RTI applications.'
              : otpStep === 'set_password'
              ? 'Set a permanent password so you can sign in anytime without waiting for an OTP.'
              : activeTab === 'password_login'
              ? 'Enter your email and password to access your citizen dashboard.'
              : 'Verify your email with a one-time passcode to create your account and set a password.'}
          </p>
        </div>

        {/* Intention banner if redirected from /intake */}
        {isDraftingRedirect && (
          <div className="p-3.5 border-2 border-[var(--border)] bg-blue-50 text-blue-900 text-xs font-bold flex items-center gap-2.5 shadow-[2px_2px_0px_0px_var(--shadow-color)]">
            <ShieldCheck className="w-4 h-4 shrink-0 text-blue-600" />
            <span>Sign-in required: You will be redirected immediately to the RTI drafter once verified.</span>
          </div>
        )}

        {/* Authentication Card */}
        <div className="border-2 border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 shadow-[6px_6px_0px_0px_var(--shadow-color)] space-y-6">
          {/* Mode Switcher Tabs (Only show when not in the middle of setting password) */}
          {otpStep !== 'set_password' && (
            <div className="grid grid-cols-2 gap-2 p-1 border-2 border-[var(--border)] bg-[var(--background)]">
              <button
                type="button"
                onClick={() => handleTabSwitch('password_login')}
                className={`py-2 px-3 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'password_login'
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[2px_2px_0px_0px_var(--shadow-color)]'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Password Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => handleTabSwitch('otp_register')}
                className={`py-2 px-3 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'otp_register'
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[2px_2px_0px_0px_var(--shadow-color)]'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register with OTP</span>
              </button>
            </div>
          )}

          {/* Feedback Banners */}
          {error && (
            <div className="p-3.5 border-2 border-[var(--border)] bg-rose-50 text-rose-900 text-xs font-bold flex items-start gap-2 shadow-[2px_2px_0px_0px_var(--shadow-color)]">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="space-y-1">
                <p>{error}</p>
                {activeTab === 'password_login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('otp_register');
                      setOtpStep('request');
                      setError('');
                    }}
                    className="underline text-[11px] text-rose-950 font-black hover:text-black block mt-1 cursor-pointer"
                  >
                    Click here to verify email via OTP & create your password &rarr;
                  </button>
                )}
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 border-2 border-[var(--border)] bg-emerald-50 text-emerald-950 text-xs font-bold flex items-center gap-2 shadow-[2px_2px_0px_0px_var(--shadow-color)]">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* =========================================================================
              VIEW 1: STANDARD EMAIL & PASSWORD SIGN IN
              ========================================================================= */}
          {activeTab === 'password_login' && otpStep !== 'set_password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="login-email" className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border-2 border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none shadow-[2px_2px_0px_0px_var(--shadow-color)] font-medium transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="login-password" className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('otp_register');
                      setOtpStep('request');
                      setError('');
                      setSuccessMsg('');
                    }}
                    className="text-[11px] font-bold text-[var(--primary)] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                  <input
                    id="login-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 border-2 border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none shadow-[2px_2px_0px_0px_var(--shadow-color)] font-medium transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
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
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In with Password</span>
                  </>
                )}
              </button>

              {/* Helpful footer */}
              <div className="pt-4 border-t-2 border-[var(--border)] text-center space-y-2">
                <p className="text-xs text-[var(--muted-foreground)] font-medium">
                  First time here or haven't created a password yet?
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('otp_register');
                    setOtpStep('request');
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="w-full py-2.5 px-4 border-2 border-[var(--border)] bg-[var(--background)] hover:bg-[var(--card)] text-xs font-bold text-[var(--foreground)] shadow-[2px_2px_0px_0px_var(--shadow-color)] transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-[var(--primary)]" />
                  <span>Register with Email OTP & Set Password</span>
                </button>
              </div>
            </form>
          )}

          {/* =========================================================================
              VIEW 2: OTP FLOW (REQUEST -> VERIFY -> SET PASSWORD)
              ========================================================================= */}
          {(activeTab === 'otp_register' || otpStep === 'set_password') && (
            <div>
              {/* Step A: Request OTP */}
              {otpStep === 'request' && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="otp-email" className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">
                      Your Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                      <input
                        id="otp-email"
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border-2 border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none shadow-[2px_2px_0px_0px_var(--shadow-color)] font-medium transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="otp-name" className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">
                      Full Name (Optional)
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                      <input
                        id="otp-name"
                        type="text"
                        placeholder="e.g. Yash Sehgal"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
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
                        <span>Sending 6-Digit Code...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send 6-Digit OTP via Brevo Email</span>
                      </>
                    )}
                  </button>

                  <div className="pt-3 border-t-2 border-[var(--border)] text-center">
                    <button
                      type="button"
                      onClick={() => handleTabSwitch('password_login')}
                      className="text-xs font-bold text-[var(--primary)] hover:underline cursor-pointer"
                    >
                      &larr; Already have a password? Sign In directly
                    </button>
                  </div>
                </form>
              )}

              {/* Step B: Verify 6-Digit OTP */}
              {otpStep === 'verify' && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-3 border-2 border-[var(--border)] bg-[var(--background)] flex items-center justify-between text-xs font-medium">
                    <div>
                      <span className="text-[var(--muted-foreground)] block">Code sent to:</span>
                      <strong className="text-[var(--foreground)] font-mono">{email}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpStep('request');
                        setOtp('');
                        setError('');
                      }}
                      className="text-xs font-bold text-[var(--primary)] hover:underline cursor-pointer"
                    >
                      Change
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="otp-code" className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider text-center">
                      Enter 6-Digit Verification Code
                    </label>
                    <input
                      id="otp-code"
                      type="text"
                      maxLength={6}
                      autoFocus
                      required
                      placeholder="• • • • • •"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full py-3 text-center border-2 border-[var(--border)] bg-[var(--background)] text-2xl font-black font-mono tracking-[8px] text-[var(--primary)] placeholder:text-[var(--muted-foreground)] focus:outline-none shadow-[2px_2px_0px_0px_var(--shadow-color)] transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 border-2 border-[var(--border)] text-sm font-bold text-[var(--primary-foreground)] bg-[var(--primary)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] shadow-[3px_3px_0px_0px_var(--shadow-color)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all disabled:opacity-50 mt-1 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying Code...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Verify Code & Continue</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between pt-2 text-xs">
                    <span className="text-[var(--muted-foreground)] font-medium">Didn't receive code?</span>
                    <button
                      type="button"
                      disabled={resendCooldown > 0 || loading}
                      onClick={handleSendOtp}
                      className="font-bold text-[var(--primary)] hover:underline disabled:opacity-50 disabled:hover:no-underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Step C: Set Account Password (THE CRITICAL STEP REQUESTED BY USER) */}
              {otpStep === 'set_password' && (
                <form onSubmit={handleSetPassword} className="space-y-4">
                  <div className="p-3 border-2 border-[var(--border)] bg-emerald-50 text-emerald-950 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Email verified! Create a password so you can log in directly next time without OTP.</span>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="new-password" className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">
                      Create Password (Min 6 characters) *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                      <input
                        id="new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 border-2 border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none shadow-[2px_2px_0px_0px_var(--shadow-color)] font-medium transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
                        aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="confirm-password" className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                      <input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 border-2 border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none shadow-[2px_2px_0px_0px_var(--shadow-color)] font-medium transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {newPassword && confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-[11px] text-rose-600 font-bold">Passwords do not match.</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || newPassword.length < 6 || newPassword !== confirmPassword}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 border-2 border-[var(--border)] text-sm font-bold text-[var(--primary-foreground)] bg-[var(--primary)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] shadow-[3px_3px_0px_0px_var(--shadow-color)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all disabled:opacity-50 mt-1 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving Password & Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Save Password & Complete Registration</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-[var(--muted-foreground)] text-center leading-relaxed">
                    Once saved, you can log in directly using your email and this password anytime without needing an OTP code.
                  </p>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Security / Notice */}
        <div className="p-3.5 border-2 border-[var(--border)] bg-[var(--card)] text-[11px] font-medium text-[var(--foreground)] flex items-center gap-2.5 shadow-[2px_2px_0px_0px_var(--shadow-color)]">
          <ShieldCheck className="w-4 h-4 text-[var(--secondary)] shrink-0" />
          <span>
            Secure authentication for the Right to Information Act, 2005 Citizen Portal. Protected with cryptographic JWT sessions.
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
