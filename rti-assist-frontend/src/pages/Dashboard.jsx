import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
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
  ArrowUpRight,
  Filter,
  Copy,
  Check,
  X,
  Scale,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { api } from '../lib/api.js';
import { useCaseStore } from '../lib/store.js';
import { formatDeadline } from '../lib/deadlineUtils';

// Urgency configuration helper: red < 3 days, yellow < 7 days, green otherwise
function getUrgencyConfig(daysRemaining) {
  if (daysRemaining === undefined || daysRemaining === null) {
    return {
      level: 'green',
      color: 'emerald',
      label: 'On Track',
      badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold',
      textClass: 'text-emerald-700',
      dotClass: 'bg-emerald-500',
      barClass: 'bg-emerald-500',
      bgGradient: 'from-emerald-500 to-teal-500',
      borderClass: 'border-slate-200 hover:border-slate-300',
    };
  }

  if (daysRemaining < 3) {
    return {
      level: 'red',
      color: 'rose',
      label: daysRemaining <= 0 ? 'Overdue' : `${daysRemaining}d left (Action Due)`,
      badgeClass: 'bg-rose-50 text-rose-700 border border-rose-200 font-semibold',
      textClass: 'text-rose-700',
      dotClass: 'bg-rose-500',
      barClass: 'bg-rose-500',
      bgGradient: 'from-rose-500 to-red-600',
      borderClass: 'border-rose-200 hover:border-rose-300',
    };
  }

  if (daysRemaining < 7) {
    return {
      level: 'yellow',
      color: 'amber',
      label: `${daysRemaining}d left (Upcoming)`,
      badgeClass: 'bg-amber-50 text-amber-800 border border-amber-200 font-semibold',
      textClass: 'text-amber-800',
      dotClass: 'bg-amber-500',
      barClass: 'bg-amber-500',
      bgGradient: 'from-amber-500 to-amber-600',
      borderClass: 'border-amber-200 hover:border-amber-300',
    };
  }

  return {
    level: 'green',
    color: 'emerald',
    label: `${daysRemaining}d left (On Track)`,
    badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold',
    textClass: 'text-emerald-700',
    dotClass: 'bg-emerald-500',
    barClass: 'bg-emerald-500',
    bgGradient: 'from-emerald-500 to-teal-500',
    borderClass: 'border-slate-200 hover:border-slate-300',
  };
}

// Stage resolver mapping into the statutory stages
function getStageInfo(caseItem) {
  if (caseItem.status === 'second_appeal_pending') {
    return {
      stage: 'Second Appeal',
      sublabel: 'CIC / SIC Commission',
      badgeClass: 'bg-purple-50 text-purple-700 border border-purple-200 font-semibold',
      dotClass: 'bg-purple-500',
    };
  }
  if (caseItem.status === 'first_appeal_pending' || (caseItem.appeals && caseItem.appeals.length > 0)) {
    return {
      stage: 'First Appeal',
      sublabel: 'Sec 19(1) First Appellate Body',
      badgeClass: 'bg-amber-50 text-amber-800 border border-amber-200 font-semibold',
      dotClass: 'bg-amber-500',
    };
  }
  if (caseItem.status === 'pio_replied') {
    return {
      stage: 'Response Due',
      sublabel: 'PIO Replied (Under Review)',
      badgeClass: 'bg-teal-50 text-teal-700 border border-teal-200 font-semibold',
      dotClass: 'bg-teal-500',
    };
  }
  if (caseItem.status === 'response_due' || (caseItem.deadlines && caseItem.deadlines[0]?.daysRemaining < 30)) {
    return {
      stage: 'Response Due',
      sublabel: '30-Day PIO Window (Sec 7(1))',
      badgeClass: 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold',
      dotClass: 'bg-blue-500',
    };
  }
  return {
    stage: 'Filed',
    sublabel: 'Sec 6(1) Submitted',
    badgeClass: 'bg-sky-50 text-sky-700 border border-sky-200 font-semibold',
    dotClass: 'bg-sky-500',
  };
}

// Helper to extract next deadline and days remaining
function getDeadlineInfo(caseItem) {
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [viewMode, setViewMode] = useState('card'); // 'card' | 'list'
  const [copiedId, setCopiedId] = useState(null);

  // Fetch all cases using api.listCases()
  const fetchCases = async () => {
    setLoading(true);
    try {
      const data = await api.listCases();
      if (Array.isArray(data)) {
        const idMap = new Map();
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

  const handleCopy = (trackingNumber, e) => {
    e.stopPropagation();
    e.preventDefault();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(trackingNumber);
      setCopiedId(trackingNumber);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Metrics for Stat Cards
  const totalCases = cases.length;
  const redUrgentCount = cases.filter((c) => getDeadlineInfo(c).daysRemaining < 3).length;
  const yellowUrgentCount = cases.filter((c) => {
    const days = getDeadlineInfo(c).daysRemaining;
    return days >= 3 && days < 7;
  }).length;
  const onTrackCount = cases.filter((c) => getDeadlineInfo(c).daysRemaining >= 7).length;
  const pendingAppeals = cases.filter(
    (c) => c.status === 'first_appeal_pending' || c.status === 'second_appeal_pending' || (c.appeals && c.appeals.length > 0)
  ).length;

  // Stage counts for segmented control
  const countFiled = cases.filter((c) => getStageInfo(c).stage === 'Filed').length;
  const countResponseDue = cases.filter((c) => getStageInfo(c).stage === 'Response Due').length;
  const countFirstAppeal = cases.filter((c) => getStageInfo(c).stage === 'First Appeal').length;
  const countSecondAppeal = cases.filter((c) => getStageInfo(c).stage === 'Second Appeal').length;

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

  const isFilteringActive = searchTerm || statusFilter !== 'all' || urgencyFilter !== 'all';

  return (
    <div className="space-y-6 pb-20 font-sans">
      {/* 1. Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Live Compliance Monitor
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Case Tracking & Deadlines
          </h1>
          <p className="text-sm text-slate-600 font-medium mt-1 max-w-2xl">
            Monitor public authority response timelines, track 30-day statutory windows, and manage appeals.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
          <button
            onClick={fetchCases}
            disabled={loading}
            className="p-2.5 rounded-xl border-2 border-slate-200 bg-white text-slate-700 hover:text-blue-600 hover:border-blue-300 transition shadow-sm disabled:opacity-50 cursor-pointer"
            title="Refresh Cases"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to="/intake"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New RTI Request</span>
          </Link>
        </div>
      </div>

      {/* 2. Sleek Metric Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Filings */}
        <div
          onClick={() => { setUrgencyFilter('all'); setStatusFilter('all'); }}
          className="cursor-pointer p-5 rounded-2xl bg-white border-2 border-slate-200 hover:border-slate-300 transition-all shadow-sm hover:shadow-md group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Total Applications
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-3">{totalCases}</div>
          <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
            <span>All submitted RTI cases</span>
          </p>
        </div>

        {/* Card 2: Critical Urgency */}
        <div
          onClick={() => setUrgencyFilter(urgencyFilter === 'red' ? 'all' : 'red')}
          className={`cursor-pointer p-5 rounded-2xl bg-white border-2 transition-all shadow-sm hover:shadow-md group relative overflow-hidden ${
            urgencyFilter === 'red'
              ? 'border-rose-400 ring-2 ring-rose-200 bg-rose-50/40'
              : 'border-slate-200 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
              Action Due (&lt; 3 Days)
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-600 mt-3">{redUrgentCount}</div>
          <p className="text-xs text-rose-700/80 font-medium mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
            <span>Immediate response or appeal</span>
          </p>
        </div>

        {/* Card 3: Impending Reply */}
        <div
          onClick={() => setUrgencyFilter(urgencyFilter === 'yellow' ? 'all' : 'yellow')}
          className={`cursor-pointer p-5 rounded-2xl bg-white border-2 transition-all shadow-sm hover:shadow-md group relative overflow-hidden ${
            urgencyFilter === 'yellow'
              ? 'border-amber-400 ring-2 ring-amber-200 bg-amber-50/40'
              : 'border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Upcoming (&lt; 7 Days)
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-600 mt-3">{yellowUrgentCount}</div>
          <p className="text-xs text-amber-800/80 font-medium mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
            <span>Approaching statutory reply</span>
          </p>
        </div>

        {/* Card 4: Active Appeals */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'first_appeal' ? 'all' : 'first_appeal')}
          className={`cursor-pointer p-5 rounded-2xl bg-white border-2 transition-all shadow-sm hover:shadow-md group relative overflow-hidden ${
            statusFilter === 'first_appeal'
              ? 'border-purple-400 ring-2 ring-purple-200 bg-purple-50/40'
              : 'border-slate-200 hover:border-purple-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
              Appeals Active
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-purple-600 mt-3">{pendingAppeals}</div>
          <p className="text-xs text-purple-700/80 font-medium mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500 inline-block"></span>
            <span>Sec 19 First/Second Appeals</span>
          </p>
        </div>
      </div>

      {/* 3. Sleek Unified Toolbar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by tracking ID, department, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-sm transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Urgency Quick Chips & View Switcher */}
          <div className="flex items-center gap-2 self-start md:self-auto overflow-x-auto w-full md:w-auto">
            {/* Urgency Filter Chips */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setUrgencyFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  urgencyFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Urgency
              </button>
              <button
                onClick={() => setUrgencyFilter(urgencyFilter === 'red' ? 'all' : 'red')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  urgencyFilter === 'red'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-rose-600'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${urgencyFilter === 'red' ? 'bg-white' : 'bg-rose-500'}`}></span>
                <span>Critical ({redUrgentCount})</span>
              </button>
              <button
                onClick={() => setUrgencyFilter(urgencyFilter === 'yellow' ? 'all' : 'yellow')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  urgencyFilter === 'yellow'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-600 hover:text-amber-600'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${urgencyFilter === 'yellow' ? 'bg-slate-950' : 'bg-amber-500'}`}></span>
                <span>&lt; 7d ({yellowUrgentCount})</span>
              </button>
              <button
                onClick={() => setUrgencyFilter(urgencyFilter === 'green' ? 'all' : 'green')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  urgencyFilter === 'green'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-emerald-600'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${urgencyFilter === 'green' ? 'bg-white' : 'bg-emerald-500'}`}></span>
                <span>On Track ({onTrackCount})</span>
              </button>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs shrink-0">
              <button
                onClick={() => setViewMode('card')}
                className={`p-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer ${
                  viewMode === 'card'
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Table View"
              >
                <ListIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Stage Segmented Bar */}
        <div className="flex items-center justify-between gap-3 pt-1 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto text-xs py-0.5">
            {[
              { key: 'all', label: 'All Cases', count: totalCases },
              { key: 'filed', label: 'Filed', count: countFiled },
              { key: 'response_due', label: 'Response Due', count: countResponseDue },
              { key: 'first_appeal', label: 'First Appeal', count: countFirstAppeal },
              { key: 'second_appeal', label: 'Second Appeal', count: countSecondAppeal },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition cursor-pointer ${
                  statusFilter === tab.key
                    ? 'bg-blue-50 text-blue-700 border-2 border-blue-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  statusFilter === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {isFilteringActive && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setUrgencyFilter('all');
              }}
              className="text-xs font-bold text-blue-600 hover:underline shrink-0 cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 4. Main Case Content */}
      {cases.length === 0 ? (
        <div className="p-16 text-center rounded-2xl border-2 border-slate-200 bg-white space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 mx-auto flex items-center justify-center">
            <FileText className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900">No RTI Cases Filed Yet</h3>
            <p className="text-xs text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
              You currently have no active or archived RTI applications. Use our AI draft generator to draft and track your first RTI application under Section 6(1).
            </p>
          </div>
          <Link
            to="/intake"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>File Your First RTI Application</span>
          </Link>
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="p-16 text-center rounded-2xl border-2 border-slate-200 bg-white space-y-3 shadow-sm">
          <FileText className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-black text-slate-900">No RTI cases match your filters</h3>
          <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
            Try adjusting your search query, stage selection, or urgency filter.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setUrgencyFilter('all');
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : viewMode === 'card' ? (
        /* ================= PREMIUM CARD VIEW ================= */
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

            // Calculate progress bar percentage
            const allowedDays = c.isLifeAndLiberty ? 2 : 30;
            const daysLeft = deadline.daysRemaining;
            const daysElapsed = Math.max(0, allowedDays - daysLeft);
            const progressPercent = Math.min(100, Math.max(8, Math.round((daysElapsed / allowedDays) * 100)));

            return (
              <div
                key={c.id}
                className="flex flex-col justify-between rounded-2xl bg-white border-2 border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200 group overflow-hidden"
              >
                {/* Top Subtle Urgency Gradient Bar */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${urgency.bgGradient}`} />

                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3.5">
                    {/* Top Row: Mono Tracking Number & Stage */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                        <span>{c.trackingNumber}</span>
                        <button
                          onClick={(e) => handleCopy(c.trackingNumber, e)}
                          className="text-slate-400 hover:text-blue-600 transition cursor-pointer"
                          title="Copy tracking number"
                        >
                          {copiedId === c.trackingNumber ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </span>

                      <div className="flex items-center gap-1.5">
                        {c.isLifeAndLiberty && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                            48h Priority
                          </span>
                        )}
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${stageInfo.badgeClass}`}>
                          {stageInfo.stage}
                        </span>
                      </div>
                    </div>

                    {/* Case Title */}
                    <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                      <Link to={`/cases/${c.id}`}>{c.title}</Link>
                    </h2>

                    {/* Last Response Classification Indicator (if present) */}
                    {(c.responseClassification?.status || c.lastResponseStatus) && (
                      <div className="pt-0.5">
                        <Link
                          to={`/cases/${c.id}/response`}
                          className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full border transition hover:opacity-85 ${
                            (c.responseClassification?.status || c.lastResponseStatus) === 'DENIED' ||
                            (c.responseClassification?.status || c.lastResponseStatus) === 'EVASIVE_VAGUE'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : (c.responseClassification?.status || c.lastResponseStatus) === 'FULLY_ANSWERED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          <span>Last response: {(c.responseClassification?.status || c.lastResponseStatus).replace(/_/g, ' ')}</span>
                        </Link>
                      </div>
                    )}

                    {/* Authority Information */}
                    <div className="flex items-start gap-2.5 text-xs text-slate-700 pt-1">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">
                          {c.authority?.name || 'Public Authority'}
                        </p>
                        {c.authority?.ministry && (
                          <p className="text-[11px] text-slate-500 truncate font-medium">{c.authority.ministry}</p>
                        )}
                      </div>
                    </div>

                    {/* Sleek Statutory Progress Bar */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 mt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-semibold truncate">
                          {deadline.title}
                        </span>
                        <span className={`font-bold text-[11px] px-2 py-0.5 rounded-full ${urgency.badgeClass}`}>
                          {urgency.label}
                        </span>
                      </div>

                      {/* Slim Visual Progress Track */}
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${urgency.barClass}`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Filed: {filingDateFormatted}</span>
                        </span>
                        <span>Due: {new Date(deadline.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="pt-3.5 mt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                      <span className={`w-2 h-2 rounded-full ${c.status === 'pio_replied' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      <span className="capitalize">{c.status?.replace(/_/g, ' ')}</span>
                      <span className="text-slate-300">•</span>
                      <span>{c.queries?.length || 1} {c.queries?.length === 1 ? 'Query' : 'Queries'}</span>
                    </span>

                    <Link
                      to={`/cases/${c.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 group/btn transition"
                    >
                      <span>View Details</span>
                      <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= SLEEK TABLE VIEW ================= */
        <div className="border-2 border-slate-200 bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b-2 border-slate-200 text-slate-600 uppercase tracking-wider text-[11px] font-bold">
                  <th className="py-3.5 px-4">Tracking ID & Title</th>
                  <th className="py-3.5 px-4">Authority</th>
                  <th className="py-3.5 px-4">Filed Date</th>
                  <th className="py-3.5 px-4">Current Stage</th>
                  <th className="py-3.5 px-4">Next Deadline</th>
                  <th className="py-3.5 px-4 text-center">Urgency</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
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
                      className="hover:bg-slate-50/80 transition group"
                    >
                      {/* Tracking ID & Title */}
                      <td className="py-3.5 px-4 min-w-[220px]">
                        <div className="space-y-1">
                          <span className="font-mono text-[11px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block">
                            {c.trackingNumber}
                          </span>
                          <Link
                            to={`/cases/${c.id}`}
                            className="block text-sm font-bold text-slate-900 group-hover:text-blue-600 transition truncate max-w-xs"
                          >
                            {c.title}
                          </Link>
                          {(c.responseClassification?.status || c.lastResponseStatus) && (
                            <Link
                              to={`/cases/${c.id}/response`}
                              className={`inline-block text-[10px] font-bold uppercase px-2 py-0.2 rounded-full border transition hover:opacity-85 ${
                                (c.responseClassification?.status || c.lastResponseStatus) === 'DENIED' ||
                                (c.responseClassification?.status || c.lastResponseStatus) === 'EVASIVE_VAGUE'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : (c.responseClassification?.status || c.lastResponseStatus) === 'FULLY_ANSWERED'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              Last: {(c.responseClassification?.status || c.lastResponseStatus).replace(/_/g, ' ')}
                            </Link>
                          )}
                        </div>
                      </td>

                      {/* Authority */}
                      <td className="py-3.5 px-4 min-w-[200px]">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900">{c.authority?.name || 'Public Authority'}</p>
                          {c.authority?.ministry && (
                            <p className="text-[11px] text-slate-500 font-medium">{c.authority.ministry}</p>
                          )}
                        </div>
                      </td>

                      {/* Filed Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-medium">
                        {filingDateFormatted}
                      </td>

                      {/* Current Stage */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${stageInfo.badgeClass}`}>
                          {stageInfo.stage}
                        </span>
                      </td>

                      {/* Next Deadline */}
                      <td className="py-3.5 px-4 min-w-[180px]">
                        <div>
                          <p className="font-bold text-slate-900 truncate">{deadline.title}</p>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Due: {new Date(deadline.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </td>

                      {/* Urgency */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${urgency.badgeClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${urgency.dotClass}`} />
                          <span>{deadline.daysRemaining <= 0 ? 'Overdue' : `${deadline.daysRemaining}d`}</span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <Link
                          to={`/cases/${c.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 transition"
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
