import { Link } from 'react-router-dom';
import {
  Scale,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  Building2,
  FileCheck2,
  HelpCircle
} from 'lucide-react';

export const About = () => {
  return (
    <div className="space-y-12 py-4">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-flex items-center gap-2 px-3.5 py-1 border-2 border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-black shadow-[2px_2px_0px_0px_var(--shadow-color)] uppercase tracking-wider">
          <Scale className="w-3.5 h-3.5" />
          <span>About RTI Assist</span>
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-[var(--foreground)] tracking-tight">
          Democratizing transparency for every Indian citizen.
        </h1>
        <p className="text-base sm:text-lg text-[var(--muted-foreground)] font-medium leading-relaxed">
          The Right to Information Act, 2005 is one of India's most powerful democratic instruments. RTI Assist is built to ensure procedural complexity and legal jargon never stand between citizens and public records.
        </p>
      </div>

      {/* The Problem & Our Mission */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 sm:p-8 border-2 border-[var(--border)] bg-[var(--card)] shadow-[4px_4px_0px_0px_var(--shadow-color)] space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-[var(--chart-1)]">The Challenge</span>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--foreground)]">Why RTI Applications Fail</h2>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed font-medium">
              Over 70% of first-time RTI applications are rejected, delayed, or stonewalled. The primary reason? Citizens ask interrogative questions ("Why was my street not paved?") rather than requesting identifiable, certified official records, measurement books, or tender registers.
            </p>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed font-medium">
              Furthermore, Public Information Officers (PIOs) frequently exploit citizens' lack of awareness regarding statutory 30-day deadlines, Section 7(2) Deemed Refusal provisions, and Section 19(1) First Appeals.
            </p>
          </div>
          <div className="pt-4 border-t-2 border-[var(--border)] flex items-center gap-2 text-xs font-bold text-[var(--foreground)]">
            <span className="w-2.5 h-2.5 bg-[var(--chart-1)] border border-[var(--border)]" />
            <span>Eliminating bureaucratic roadblocks with structured guidance</span>
          </div>
        </div>

        <div className="p-6 sm:p-8 border-2 border-[var(--border)] bg-[var(--card)] shadow-[4px_4px_0px_0px_var(--shadow-color)] space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-[var(--secondary)]">Our Mission</span>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--foreground)]">A Record-Centric Platform</h2>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed font-medium">
              RTI Assist bridges the gap between everyday citizen questions and airtight legal petitions. We leverage modern technology and statutory intelligence to translate informal grievances into legally precise, record-based applications that officials cannot ignore.
            </p>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed font-medium">
              From college students inquiring about approved fee structures to residents auditing public infrastructure, we provide the tools to draft, verify authorities, and enforce statutory response clocks.
            </p>
          </div>
          <div className="pt-4 border-t-2 border-[var(--border)] flex items-center gap-2 text-xs font-bold text-[var(--foreground)]">
            <span className="w-2.5 h-2.5 bg-[var(--secondary)] border border-[var(--border)]" />
            <span>Empowering 1.4 billion citizens with actionable transparency</span>
          </div>
        </div>
      </div>

      {/* Core Pillars */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-[var(--muted-foreground)]">Our Core Architecture</span>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--foreground)]">How RTI Assist Protects You</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 border-2 border-[var(--border)] bg-[var(--card)] shadow-[4px_4px_0px_0px_var(--shadow-color)] space-y-3">
            <div className="w-10 h-10 border-2 border-[var(--border)] bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center font-bold shadow-[2px_2px_0px_0px_var(--shadow-color)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-black text-sm text-[var(--foreground)]">AI Precision Drafting</h3>
            <p className="text-xs text-[var(--muted-foreground)] font-medium leading-relaxed">
              Reformulates conversational questions into certified record requests without legal jargon, strictly asking for tangible documents.
            </p>
          </div>

          <div className="p-5 border-2 border-[var(--border)] bg-[var(--card)] shadow-[4px_4px_0px_0px_var(--shadow-color)] space-y-3">
            <div className="w-10 h-10 border-2 border-[var(--border)] bg-[var(--secondary)] text-[var(--secondary-foreground)] flex items-center justify-center font-bold shadow-[2px_2px_0px_0px_var(--shadow-color)]">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-black text-sm text-[var(--foreground)]">Statutory Deadline Clocks</h3>
            <p className="text-xs text-[var(--muted-foreground)] font-medium leading-relaxed">
              Tracks the mandatory 30-day PIO countdown, 48-hour life & liberty clocks, and alerts you when deemed refusal entitles you to free records.
            </p>
          </div>

          <div className="p-5 border-2 border-[var(--border)] bg-[var(--card)] shadow-[4px_4px_0px_0px_var(--shadow-color)] space-y-3">
            <div className="w-10 h-10 border-2 border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)] flex items-center justify-center font-bold shadow-[2px_2px_0px_0px_var(--shadow-color)]">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-black text-sm text-[var(--foreground)]">1,200+ Authority Directory</h3>
            <p className="text-xs text-[var(--muted-foreground)] font-medium leading-relaxed">
              Mapped database of Central and State public authorities with exact PIO designations, fees, accepted payment modes, and portal links.
            </p>
          </div>

          <div className="p-5 border-2 border-[var(--border)] bg-[var(--card)] shadow-[4px_4px_0px_0px_var(--shadow-color)] space-y-3">
            <div className="w-10 h-10 border-2 border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center font-bold shadow-[2px_2px_0px_0px_var(--shadow-color)]">
              <ShieldCheck className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <h3 className="font-black text-sm text-[var(--foreground)]">Privacy by Design</h3>
            <p className="text-xs text-[var(--muted-foreground)] font-medium leading-relaxed">
              Your applications belong solely to you. We do not sell user data, track personal identity, or require sensitive Aadhaar/PAN details.
            </p>
          </div>
        </div>
      </div>

      {/* Independence Statement */}
      <div className="p-6 sm:p-8 border-2 border-[var(--border)] bg-[var(--card)] shadow-[4px_4px_0px_0px_var(--shadow-color)] space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 border-2 border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)] flex items-center justify-center font-bold shadow-[2px_2px_0px_0px_var(--shadow-color)] shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-[var(--foreground)]">Independent Civic Technology</h3>
            <p className="text-xs text-[var(--muted-foreground)] font-medium">Transparency you can trust</p>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed font-medium">
          RTI Assist is an independent civic-tech initiative. We are <strong>not affiliated with, operated by, or funded by any government ministry, Public Authority, or Information Commission</strong>. Our sole objective is to equip citizens with open tools to hold public institutions accountable.
        </p>
      </div>

      {/* Bottom CTA */}
      <div className="p-8 border-2 border-[var(--border)] bg-[var(--card)] shadow-[6px_6px_0px_0px_var(--shadow-color)] text-center space-y-4">
        <h2 className="text-2xl sm:text-3xl font-black text-[var(--foreground)]">Ready to exercise your democratic right?</h2>
        <p className="text-xs sm:text-sm text-[var(--muted-foreground)] font-medium max-w-xl mx-auto">
          Start drafting your RTI application in plain language today. It takes less than 2 minutes and is completely free.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/intake"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[var(--border)] text-xs font-black uppercase tracking-wider text-[var(--primary-foreground)] bg-[var(--primary)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] shadow-[3px_3px_0px_0px_var(--shadow-color)] transition active:translate-x-[1px] active:translate-y-[1px]"
          >
            <span>Draft Your RTI Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/directory"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[var(--border)] text-xs font-black uppercase tracking-wider text-[var(--foreground)] bg-[var(--background)] hover:bg-[var(--card)] shadow-[3px_3px_0px_0px_var(--shadow-color)] transition"
          >
            <span>Browse Authorities</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default About;
