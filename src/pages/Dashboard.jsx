import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Clock,
  AlertTriangle,
  FileText,
  Search,
  Building2,
  ChevronRight,
  PlusCircle,
  FileCheck2,
  LayoutGrid,
  List as ListIcon,
  RefreshCw,
  Calendar,
  ShieldAlert,
  CheckCircle2,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { api } from '../lib/api.js';
import { useCaseStore } from '../lib/store.js';
import { formatDeadline } from '../lib/deadlineUtils';

// Urgency color helper as required: red < 3 days, yellow < 7 days, green otherwise
export function getUrgencyConfig(daysRemaining) {
  if (daysRemaining === undefined || daysRemaining === null) {
    return {
      level: 'green',
      color: 'emerald',
      label: 'On Track (≥ 7d)',
      badgeClass: 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80',
      textClass: 'text-emerald-400',
      pillClass: 'bg-emerald-500',
      borderClass: 'border-emerald-800/50',
    };
  }

  if (daysRemaining < 3) {
    return {
      level: 'red',
      color: 'rose',
      label: daysRemaining <= 0 ? 'Overdue / Critical' : 'Critical Urgency (< 3d)',
      badgeClass: 'bg-rose-950/90 text-rose-300 border border-rose-800/90 ring-1 ring-rose-500/40',
      textClass: 'text-rose-400',
      pillClass: 'bg-rose-500',
      borderClass: 'border-rose-800/80',
    };
  }

  if (daysRemaining < 7) {
    return {
      level: 'yellow',
      color: 'amber',
      label: 'Impending (< 7d)',
      badgeClass: 'bg-amber-950/90 text-amber-300 border border-amber-800/90 ring-1 ring-amber-500/40',
      textClass: 'text-amber-400',
      pillClass: 'bg-amber-500',
      borderClass: 'border-amber-800/80',
    };
  }

  return {
    level: 'green',
    color: 'emerald',
    label: 'On Track (≥ 7d)',
    badgeClass: 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80',
    textClass: 'text-emerald-400',
    pillClass: 'bg-emerald-500',
    borderClass: 'border-emerald-800/50',
  };
}

// Stage resolver mapping into the 4 statutory stages: Filed → Response Due → First Appeal → Second Appeal
export function getStageInfo(caseItem) {
  if (caseItem.status === 'second_appeal_pending') {
    return {
      stage: 'Second Appeal',
      sublabel: 'CIC / SIC Commission',
      badgeClass: 'bg-purple-950/80 text-purple-300 border-purple-800/60',
    };
  }
  if (caseItem.status === 'first_appeal_pending' || (caseItem.appeals && caseItem.appeals.length > 0)) {
    return {
      stage: 'First Appeal',
      sublabel: 'Sec 19(1) First Appellate Body',
      badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-800/60',
    };
  }
  if (caseItem.status === 'pio_replied') {
    return {
      stage: 'Response Due',
      sublabel: 'PIO Replied (Under Review)',
      badgeClass: 'bg-teal-950/80 text-teal-300 border-teal-800/60',
    };
  }
  if (caseItem.status === 'response_due' || (caseItem.deadlines && caseItem.deadlines[0]?.daysRemaining < 30)) {
    return {
      stage: 'Response Due',
      sublabel: '30-Day PIO Window (Sec 7(1))',
      badgeClass: 'bg-blue-950/80 text-blue-300 border-blue-800/60',
    };
  }
  return {
    stage: 'Filed',
    sublabel: 'Sec 6(1) Submitted',
    badgeClass: 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60',
  };
}

// Helper to extract next deadline and days remaining using pure deadlineUtils
export function getDeadlineInfo(caseItem) {
  const d = caseItem.deadlines?.[0];
  const filingTime = new Date(caseItem.filingDate || Date.now()).getTime();
  const allowedDays = caseItem.isLifeAndLiberty ? 2 : 30;
  const fallbackDueDate = new Date(filingTime + allowedDays * 86400000).toISOString();

  try {
    const formatted = formatDeadline({
      type: d?.type || (caseItem.isLifeAndLiberty ? 'life_liberty' : 'response'),
      dueDate: d?.dueDate || fallbackDueDate,
    });

    return {
      title: d?.title || formatted.typeLabel,
      dueDate: d?.dueDate || fallbackDueDate,
      daysRemaining: formatted.daysRemaining,
      actSection: d?.actSectionReference || formatted.sectionReference,
      urgencyColor: formatted.urgencyColor,
      timeRemainingText: formatted.timeRemainingText,
    };
  } catch {
    return {
      title: d?.title || 'Statutory Response Window',
      dueDate: d?.dueDate || fallbackDueDate,
      daysRemaining: 30,
      actSection: 'Sec 7(1)',
      urgencyColor: 'green',
      timeRemainingText: '30 days left',
    };
  }
}

export const Dashboard = () => {
  const { cases: storedCases } = useCaseStore();
  const [cases, setCases] = useState(storedCases || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [viewMode, setViewMode] = useState('card'); // 'card' | 'list'

  // Fetch all cases using api.listCases() as requested
  const fetchCases = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.listCases();
      // Merge with stored cases to guarantee newly created local cases are reflected immediately
      if (Array.isArray(data)) {
        const idMap = new Map();
        // Priority to storedCases for local additions/edits
        storedCases.forEach((c) => idMap.set(c.id, c));
        data.forEach((c) => {
          if (!idMap.has(c.id)) {
            idMap.set(c.id, c);
          }
        });
        setCases(Array.from(idMap.values()));
      } else {
        setCases(storedCases);
      }
    } catch (err) {
      console.warn('api.listCases() failed, falling back to local store', err);
      setCases(storedCases);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [storedCases]);

  // Metrics for KPI Cards
  const totalCases = cases.length;
  const redUrgentCount = cases.filter((c) => getDeadlineInfo(c).daysRemaining < 3).length;
  const yellowUrgentCount = cases.filter((c) => {
    const days = getDeadlineInfo(c).daysRemaining;
    return days >= 3 && days < 7;
  }).length;
  const pendingAppeals = cases.filter(
    (c) => c.status === 'first_appeal_pending' || c.status === 'second_appeal_pending' || (c.appeals && c.appeals.length > 0)
  ).length;

  // Filtered cases
  const filteredCases = cases.filter((c) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      c.title.toLowerCase().includes(q) ||
      c.trackingNumber.toLowerCase().includes(q) ||
      (c.authority?.name && c.authority.name.toLowerCase().includes(q)) ||
      (c.authority?.ministry && c.authority.ministry.toLowerCase().includes(q));

    const stage = getStageInfo(c).stage;
    let matchesStatus = true;
    if (statusFilter === 'filed') matchesStatus = stage === 'Filed';
    else if (statusFilter === 'response_due') matchesStatus = stage === 'Response Due';
    else if (statusFilter === 'first_appeal') matchesStatus = stage === 'First Appeal';
    else if (statusFilter === 'second_appeal') matchesStatus = stage === 'Second Appeal';

    const urgency = getUrgencyConfig(getDeadlineInfo(c).daysRemaining).level;
    const matchesUrgency = urgencyFilter === 'all' ? true : urgency === urgencyFilter;

    return matchesSearch && matchesStatus && matchesUrgency;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <LayoutDashboard className="w-4 h-4" />
            <span>RTI Operations Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Case Tracking & Deadlines
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitor public authority compliance, statutory 30-day PIO deadlines, and appellate milestones.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={fetchCases}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition disabled:opacity-50"
            title="Refresh Cases"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to="/intake"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-md shadow-cyan-900/30 transition transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New RTI Request</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Filings</span>
            <div className="w-8 h-8 rounded-lg bg-blue-950 text-blue-400 flex items-center justify-center border border-blue-800/40">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-3">{totalCases}</div>
          <p className="text-[11px] text-slate-400 mt-1">Under RTI Act 2005</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-rose-900/40 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider">Critical (&lt; 3 Days)</span>
            <div className="w-8 h-8 rounded-lg bg-rose-950 text-rose-400 flex items-center justify-center border border-rose-800/40">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-400 mt-3">{redUrgentCount}</div>
          <p className="text-[11px] text-rose-300/80 mt-1">Immediate action / Appeal due</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-amber-900/40 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Impending (&lt; 7 Days)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-950 text-amber-400 flex items-center justify-center border border-amber-800/40">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-400 mt-3">{yellowUrgentCount}</div>
          <p className="text-[11px] text-amber-300/80 mt-1">Upcoming statutory response</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-purple-900/40 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Appeals Pending</span>
            <div className="w-8 h-8 rounded-lg bg-purple-950 text-purple-400 flex items-center justify-center border border-purple-800/40">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-purple-400 mt-3">{pendingAppeals}</div>
          <p className="text-[11px] text-purple-300/80 mt-1">Section 19 First/Second Appeals</p>
        </div>
      </div>

      {/* Urgency Color Legend Banner */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-semibold">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Statutory Urgency Legend:</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setUrgencyFilter(urgencyFilter === 'red' ? 'all' : 'red')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition ${
              urgencyFilter === 'red'
                ? 'bg-rose-950 text-rose-300 border-rose-500 ring-2 ring-rose-500/30'
                : 'bg-rose-950/40 text-rose-300 border-rose-800/60 hover:bg-rose-950/80'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="font-bold">Red (&lt; 3 Days)</span>
            <span className="text-[10px] text-rose-400 bg-rose-900/50 px-1.5 py-0.2 rounded-full">
              {redUrgentCount}
            </span>
          </button>

          <button
            onClick={() => setUrgencyFilter(urgencyFilter === 'yellow' ? 'all' : 'yellow')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition ${
              urgencyFilter === 'yellow'
                ? 'bg-amber-950 text-amber-300 border-amber-500 ring-2 ring-amber-500/30'
                : 'bg-amber-950/40 text-amber-300 border-amber-800/60 hover:bg-amber-950/80'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="font-bold">Yellow (&lt; 7 Days)</span>
            <span className="text-[10px] text-amber-400 bg-amber-900/50 px-1.5 py-0.2 rounded-full">
              {yellowUrgentCount}
            </span>
          </button>

          <button
            onClick={() => setUrgencyFilter(urgencyFilter === 'green' ? 'all' : 'green')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition ${
              urgencyFilter === 'green'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-500 ring-2 ring-emerald-500/30'
                : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60 hover:bg-emerald-950/80'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="font-bold">Green (≥ 7 Days)</span>
            <span className="text-[10px] text-emerald-400 bg-emerald-900/50 px-1.5 py-0.2 rounded-full">
              {totalCases - redUrgentCount - yellowUrgentCount}
            </span>
          </button>

          {urgencyFilter !== 'all' && (
            <button
              onClick={() => setUrgencyFilter('all')}
              className="text-[11px] text-cyan-400 hover:underline ml-1"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Search, Stage Tabs & View Switcher */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by tracking #, title, or authority..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        {/* Stage Filters & View Mode Toggle */}
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-3">
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl overflow-x-auto">
            {[
              { key: 'all', label: 'All Stages' },
              { key: 'filed', label: 'Filed' },
              { key: 'response_due', label: 'Response Due' },
              { key: 'first_appeal', label: 'First Appeal' },
              { key: 'second_appeal', label: 'Second Appeal' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  statusFilter === tab.key
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* View Mode Switcher (Card / List View) */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                viewMode === 'card'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                viewMode === 'list'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <ListIcon className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Cases Content */}
      {filteredCases.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <FileText className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No RTI cases match your filters</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search keywords, stage selection, or urgency filter.
          </p>
        </div>
      ) : viewMode === 'card' ? (
        /* ================= CARD VIEW ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCases.map((c) => {
            const stageInfo = getStageInfo(c);
            const deadline = getDeadlineInfo(c);
            const urgency = getUrgencyConfig(deadline.daysRemaining);
            const filingDateFormatted = new Date(c.filingDate).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div
                key={c.id}
                className={`flex flex-col justify-between rounded-2xl bg-slate-900/90 border ${urgency.borderClass} p-5 shadow-xl hover:shadow-cyan-950/20 transition-all group`}
              >
                <div className="space-y-4">
                  {/* Top Bar: Tracking # & Urgency Pill */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-md border border-cyan-800/60">
                      {c.trackingNumber}
                    </span>

                    {/* Color-Coded Urgency Indicator */}
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${urgency.badgeClass}`}>
                      <span className={`w-2 h-2 rounded-full ${urgency.pillClass}`} />
                      <span>{deadline.daysRemaining}d remaining</span>
                    </div>
                  </div>

                  {/* Title & Stage */}
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${stageInfo.badgeClass}`}>
                        {stageInfo.stage}
                      </span>
                      {c.isLifeAndLiberty && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-800/60">
                          48h Priority
                        </span>
                      )}
                    </div>
                    <h2 className="text-base font-bold text-white group-hover:text-cyan-400 transition line-clamp-2">
                      <Link to={`/cases/${c.id}`}>{c.title}</Link>
                    </h2>
                  </div>

                  {/* Required Particulars: Authority & Filed Date */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                    <div className="flex items-start gap-2 text-slate-300">
                      <Building2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-200 truncate">{c.authority?.name || 'Public Authority'}</p>
                        {c.authority?.ministry && (
                          <p className="text-[11px] text-slate-400 truncate">{c.authority.ministry}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>Filed: {filingDateFormatted}</span>
                      </span>
                      <span className="text-slate-400">
                        {c.queries?.length || 1} {c.queries?.length === 1 ? 'Query' : 'Queries'}
                      </span>
                    </div>
                  </div>

                  {/* Next Deadline Block with Color-Coded Urgency */}
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">Next Statutory Deadline:</span>
                      <span className={`font-bold ${urgency.textClass}`}>
                        {deadline.daysRemaining <= 0 ? 'Overdue' : `${deadline.daysRemaining} days left`}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-200 truncate">{deadline.title}</p>
                    <p className="text-[10px] text-slate-500">
                      Due: {new Date(deadline.dueDate).toLocaleDateString()} ({deadline.actSection})
                    </p>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Status: <span className="text-slate-300 capitalize">{c.status?.replace(/_/g, ' ')}</span>
                  </span>

                  <Link
                    to={`/cases/${c.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-cyan-400 hover:text-white bg-slate-800 hover:bg-cyan-600 transition"
                  >
                    <span>View Detail</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= LIST VIEW ================= */
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/90 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px] font-semibold">
                  <th className="py-3.5 px-4">Tracking ID & Title</th>
                  <th className="py-3.5 px-4">Authority</th>
                  <th className="py-3.5 px-4">Filed Date</th>
                  <th className="py-3.5 px-4">Current Stage</th>
                  <th className="py-3.5 px-4">Next Deadline</th>
                  <th className="py-3.5 px-4 text-center">Urgency</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredCases.map((c) => {
                  const stageInfo = getStageInfo(c);
                  const deadline = getDeadlineInfo(c);
                  const urgency = getUrgencyConfig(deadline.daysRemaining);
                  const filingDateFormatted = new Date(c.filingDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-800/40 transition group"
                    >
                      {/* Tracking ID & Title */}
                      <td className="py-4 px-4 min-w-[220px]">
                        <div className="space-y-1">
                          <span className="font-mono text-[11px] font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60 inline-block">
                            {c.trackingNumber}
                          </span>
                          <Link
                            to={`/cases/${c.id}`}
                            className="block text-sm font-semibold text-white group-hover:text-cyan-400 transition truncate max-w-xs"
                          >
                            {c.title}
                          </Link>
                        </div>
                      </td>

                      {/* Authority */}
                      <td className="py-4 px-4 min-w-[200px]">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-200">{c.authority?.name || 'Public Authority'}</p>
                          {c.authority?.ministry && (
                            <p className="text-[11px] text-slate-400">{c.authority.ministry}</p>
                          )}
                        </div>
                      </td>

                      {/* Filed Date */}
                      <td className="py-4 px-4 whitespace-nowrap text-slate-300 font-medium">
                        {filingDateFormatted}
                      </td>

                      {/* Current Stage */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${stageInfo.badgeClass}`}>
                          {stageInfo.stage}
                        </span>
                      </td>

                      {/* Next Deadline */}
                      <td className="py-4 px-4 min-w-[180px]">
                        <div>
                          <p className="font-medium text-slate-200 truncate">{deadline.title}</p>
                          <p className="text-[11px] text-slate-400">
                            Due: {new Date(deadline.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </td>

                      {/* Days Remaining & Color-Coded Urgency */}
                      <td className="py-4 px-4 whitespace-nowrap text-center">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${urgency.badgeClass}`}>
                          <span className={`w-2 h-2 rounded-full ${urgency.pillClass}`} />
                          <span>{deadline.daysRemaining <= 0 ? 'Overdue' : `${deadline.daysRemaining}d`}</span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4 whitespace-nowrap text-right">
                        <Link
                          to={`/cases/${c.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-cyan-400 hover:text-white bg-slate-800 hover:bg-cyan-600 transition"
                        >
                          <span>Open</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
export default Dashboard;
