import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  FileCheck2,
  Send,
  Zap,
} from 'lucide-react';
import { useCaseStore } from '../lib/store.js';

export const Home = () => {
  const { cases } = useCaseStore();

  const urgentCount = cases.filter(
    (c) => c.isLifeAndLiberty || c.deadlines?.some((d) => d.status === 'due_soon' || d.status === 'overdue')
  ).length;

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Right to Information Act, 2005 Automation</span>
            </div>
            {urgentCount > 0 && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-800/60 text-amber-400 text-xs font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>{urgentCount} Approaching Statutory Deadlines</span>
              </div>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Streamline RTI Requests, Track Statutory Deadlines, & Auto-Draft Appeals.
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Never miss a 30-day PIO reply deadline or the 48-hour life-and-liberty window.
            Organize queries, identify Central & State Public Information Officers, and generate legally rigorous First Appeals in seconds.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/intake"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-600/30 transition transform active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Draft New RTI Request</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-slate-200 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 transition"
            >
              <span>View Case Dashboard</span>
            </Link>

            <Link
              to="/directory"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-cyan-400 transition"
            >
              <Building2 className="w-4 h-4" />
              <span>Browse Public Authorities</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition group">
          <div className="w-10 h-10 rounded-lg bg-cyan-950 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Automated Statutory Deadlines</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Auto-calculated 30-day response clocks under Sec 7(1), 48-hour life & liberty alarms, and 30-day First Appeal countdowns.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition group">
          <div className="w-10 h-10 rounded-lg bg-indigo-950 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">First & Second Appeal Drafter</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Instant appeal generator citing Section 7(2) deemed refusal, Section 7(6) free information entitlement, and Section 19(1) prayers.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition group">
          <div className="w-10 h-10 rounded-lg bg-emerald-950 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
            <Building2 className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Public Authority Directory</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Pre-configured directory of Central & State Ministries, CPIO contacts, First Appellate Authorities, and fee payment modes.
          </p>
        </div>
      </section>

      {/* Active Pipeline Preview */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              <span>Active RTI Filings & Deadlines</span>
            </h2>
            <p className="text-xs text-slate-400">Recent applications tracked in your workspace</p>
          </div>

          <Link
            to="/dashboard"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>See all {cases.length} cases</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cases.slice(0, 3).map((c) => {
            const nearestDeadline = c.deadlines?.[0];
            return (
              <div
                key={c.id}
                className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs text-cyan-400 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800/40">
                      {c.trackingNumber}
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                        c.status === 'submitted'
                          ? 'bg-blue-950 text-blue-400 border border-blue-800/50'
                          : c.status === 'first_appeal_pending'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800/50'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                      }`}
                    >
                      {c.status?.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h3 className="font-semibold text-sm text-slate-100 line-clamp-2 mb-1">
                    {c.title}
                  </h3>

                  <p className="text-xs text-slate-400 mb-3">{c.authority?.name || 'Public Authority'}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  {nearestDeadline ? (
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{nearestDeadline.daysRemaining} days remaining</span>
                    </div>
                  ) : (
                    <span className="text-slate-500">No pending deadline</span>
                  )}

                  <Link
                    to={`/cases/${c.id}`}
                    className="text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1"
                  >
                    Details &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Statutory RTI Stages Guide */}
      <section className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <span>Statutory RTI Workflow at a Glance</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="font-bold text-cyan-400 mb-1">1. Section 6(1) Filing</div>
            <p className="text-slate-300">
              Submit precise, numbered questions with ₹10 fee (exempt for BPL applicants).
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="font-bold text-cyan-400 mb-1">2. Section 7(1) Response</div>
            <p className="text-slate-300">
              Mandatory 30-day response window (or 48-hours if involving life or liberty).
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="font-bold text-amber-400 mb-1">3. Section 19(1) First Appeal</div>
            <p className="text-slate-300">
              File before First Appellate Authority within 30 days of non-reply or denial.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="font-bold text-purple-400 mb-1">4. Section 19(3) Second Appeal</div>
            <p className="text-slate-300">
              File before Central or State Information Commission within 90 days.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
