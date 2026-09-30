import { Shield, Lock, EyeOff, Database, Server, RefreshCw } from 'lucide-react';

export const PrivacyPolicy = () => {
  return (
    <div className="space-y-10 py-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b-2 border-[var(--border)] pb-6 space-y-3">
        <span className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-black shadow-[2px_2px_0px_0px_var(--shadow-color)] uppercase tracking-wider">
          <Shield className="w-3.5 h-3.5" />
          <span>Citizen Data Protection</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[var(--foreground)] tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-[var(--muted-foreground)] font-medium">
          Effective Date: September 2026 • Version 2.4
        </p>
      </div>

      {/* Highlights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 border-2 border-[var(--border)] bg-[var(--card)] shadow-[3px_3px_0px_0px_var(--shadow-color)] space-y-2">
          <div className="w-8 h-8 border border-[var(--border)] bg-[var(--secondary)] text-[var(--secondary-foreground)] flex items-center justify-center font-bold">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-black text-[var(--foreground)] uppercase">No Data Monetization</h3>
          <p className="text-xs text-[var(--muted-foreground)] font-medium">
            We never sell, rent, or trade your personal information or RTI inquiries to any third party or advertisers.
          </p>
        </div>

        <div className="p-4 border-2 border-[var(--border)] bg-[var(--card)] shadow-[3px_3px_0px_0px_var(--shadow-color)] space-y-2">
          <div className="w-8 h-8 border border-[var(--border)] bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center font-bold">
            <EyeOff className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-black text-[var(--foreground)] uppercase">Confidential Drafting</h3>
          <p className="text-xs text-[var(--muted-foreground)] font-medium">
            Your draft petitions, concerns, and correspondence details remain private to you.
          </p>
        </div>

        <div className="p-4 border-2 border-[var(--border)] bg-[var(--card)] shadow-[3px_3px_0px_0px_var(--shadow-color)] space-y-2">
          <div className="w-8 h-8 border border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)] flex items-center justify-center font-bold">
            <Database className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-black text-[var(--foreground)] uppercase">Local-First Storage</h3>
          <p className="text-xs text-[var(--muted-foreground)] font-medium">
            Saved petitions, case histories, and drafted files can be cleared from your browser cache at any time.
          </p>
        </div>
      </div>

      {/* Detailed Legal Text Sections */}
      <div className="space-y-8 text-xs sm:text-sm text-[var(--foreground)] font-medium leading-relaxed">
        <section className="space-y-3 p-6 border-2 border-[var(--border)] bg-[var(--card)] shadow-[4px_4px_0px_0px_var(--shadow-color)]">
          <h2 className="text-base font-black uppercase tracking-wider text-[var(--foreground)] flex items-center gap-2">
            <span>1. Information We Collect</span>
          </h2>
          <p className="text-[var(--muted-foreground)]">
            We only collect information necessary to help you draft, organize, and track your RTI applications:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[var(--foreground)] font-medium">
            <li><strong>Draft Queries & Concerns:</strong> Plain-language descriptions you enter into the drafting studio to formulate RTI applications and appeals.</li>
            <li><strong>Filing Tracking Data:</strong> Application registration numbers, filing dates, and Public Authority names entered to calculate statutory 30-day deadlines.</li>
            <li><strong>Account Credentials:</strong> If you register an account, we collect an email address and hashed authentication password. We do NOT ask for or store sensitive national identifiers like Aadhaar or PAN.</li>
          </ul>
        </section>

        <section className="space-y-3 p-6 border-2 border-[var(--border)] bg-[var(--card)] shadow-[4px_4px_0px_0px_var(--shadow-color)]">
          <h2 className="text-base font-black uppercase tracking-wider text-[var(--foreground)] flex items-center gap-2">
            <span>2. How AI & LLM Processing Works</span>
          </h2>
          <p className="text-[var(--muted-foreground)]">
            When you use the AI assistant to reframe a question:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[var(--foreground)] font-medium">
            <li>Your input concern is transmitted via secure, encrypted TLS (HTTPS) to our isolated drafting microservice.</li>
            <li>The model analyzes your query solely to identify the legal records needed, classify the subject category, and structure the draft under RTI Act 2005 rules.</li>
            <li>Your private concerns are <strong>never used to train public foundation models</strong>.</li>
          </ul>
        </section>

        <section className="space-y-3 p-6 border-2 border-[var(--border)] bg-[var(--card)] shadow-[4px_4px_0px_0px_var(--shadow-color)]">
          <h2 className="text-base font-black uppercase tracking-wider text-[var(--foreground)] flex items-center gap-2">
            <span>3. Cookies & Local Browser Storage</span>
          </h2>
          <p className="text-[var(--muted-foreground)]">
            RTI Assist uses browser local storage (`localStorage`) and session cookies strictly for core functionality:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[var(--foreground)] font-medium">
            <li>Persisting your theme preference (Light / Dark mode).</li>
            <li>Retaining offline case drafts so work is not lost if your browser is refreshed.</li>
            <li>Authenticating your active session without requiring constant re-login.</li>
          </ul>
          <p className="text-[var(--muted-foreground)] pt-1">
            We do not use tracking pixels, fingerprinting scripts, or third-party behavioral advertising cookies.
          </p>
        </section>

        <section className="space-y-3 p-6 border-2 border-[var(--border)] bg-[var(--card)] shadow-[4px_4px_0px_0px_var(--shadow-color)]">
          <h2 className="text-base font-black uppercase tracking-wider text-[var(--foreground)] flex items-center gap-2">
            <span>4. Your Data Rights & Deletion</span>
          </h2>
          <p className="text-[var(--muted-foreground)]">
            As a citizen utilizing this platform, you have complete control over your records:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[var(--foreground)] font-medium">
            <li><strong>Right to Erase:</strong> You can purge all stored local cases at any time from your dashboard or browser settings.</li>
            <li><strong>Right to Export:</strong> Download your drafted applications and appeal letters as text or PDF documents for your personal offline archives.</li>
            <li><strong>Account Deletion:</strong> You may request complete account and data removal by contacting <a href="mailto:privacy@rtiassist.org" className="underline font-bold text-[var(--primary)]">privacy@rtiassist.org</a>.</li>
          </ul>
        </section>

        <section className="space-y-3 p-6 border-2 border-[var(--border)] bg-[var(--card)] shadow-[4px_4px_0px_0px_var(--shadow-color)]">
          <h2 className="text-base font-black uppercase tracking-wider text-[var(--foreground)] flex items-center gap-2">
            <span>5. Contact Our Privacy Officer</span>
          </h2>
          <p className="text-[var(--muted-foreground)]">
            For questions regarding this privacy policy or how your data is handled, please reach out to:
          </p>
          <p className="font-bold text-[var(--foreground)]">
            Privacy & Civic Rights Team — <a href="mailto:privacy@rtiassist.org" className="text-[var(--primary)] underline">privacy@rtiassist.org</a>
          </p>
        </section>
      </div>
    </div>
  );
};
export default PrivacyPolicy;
