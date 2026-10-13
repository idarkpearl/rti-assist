import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  Building2,
  AlertTriangle,
  FileCheck2,
  CheckCircle2,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Edit3,
  Check,
  X,
  ExternalLink,
  Calendar,
  CreditCard,
  ShieldCheck,
  Send,
  Loader2,
  FileDown,
  ChevronRight,
  AlertCircle,
  HelpCircle,
  Scale,
} from 'lucide-react';
import { api } from '../lib/api.js';
import { useCaseStore } from '../lib/store.js';

// The 4 Statutory Stages in order as required:
// Filed → Response Due → First Appeal → Second Appeal
const STATUTORY_STAGES = [
  {
    id: 'filed',
    title: 'Filed',
    section: 'Sec 6(1)',
    description: 'RTI application & statutory fee registered on portal',
  },
  {
    id: 'response_due',
    title: 'Response Due',
    section: 'Sec 7(1)',
    description: '30-day mandatory window for PIO response (or 48h for life & liberty)',
  },
  {
    id: 'first_appeal',
    title: 'First Appeal',
    section: 'Sec 19(1)',
    description: 'Internal departmental appeal before First Appellate Authority',
  },
  {
    id: 'second_appeal',
    title: 'Second Appeal',
    section: 'Sec 19(3)',
    description: 'Independent adjudication before Central / State Information Commission',
  },
];

// Map case status to one of the 4 statutory stages
function getCurrentStageIndex(status, appealsCount = 0) {
  if (status === 'second_appeal_pending') return 3;
  if (status === 'first_appeal_pending' || appealsCount > 0) return 2;
  if (status === 'response_due' || status === 'pio_replied') return 1;
  return 0; // filed / submitted
}

export const CaseDetail = () => {
  const { id } = useParams(); // Read the id via useParams as required
  const navigate = useNavigate();
  const { cases: storedCases, updateCase: updateStoreCase, addAppeal } = useCaseStore();

  const [caseItem, setCaseItem] = useState(() => storedCases.find((c) => c.id === id) || null);
  const [loading, setLoading] = useState(!caseItem);
  const [error, setError] = useState('');

  // Editable Status state
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(caseItem?.status || 'submitted');
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [statusSuccessMessage, setStatusSuccessMessage] = useState('');

  // PIO Response Log modal
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [responseSummary, setResponseSummary] = useState('');

  // Simulated deadline expiry for interactive testing
  const [simulatePassed, setSimulatePassed] = useState(false);

  // Fetch case detail using api.getCase(id) as required
  useEffect(() => {
    let isMounted = true;
    const loadCase = async () => {
      try {
        setLoading(true);
        setError('');
        // Call api.getCase(id) as required
        const fetched = await api.getCase(id);
        if (isMounted) {
          setCaseItem(fetched);
          setSelectedStatus(fetched.status || 'submitted');
        }
      } catch (err) {
        console.warn(`api.getCase('${id}') error, checking stored cases fallback`, err);
        const fallback = storedCases.find((c) => c.id === id);
        if (isMounted) {
          if (fallback) {
            setCaseItem(fallback);
            setSelectedStatus(fallback.status || 'submitted');
          } else {
            setError(`RTI Case ID "${id}" could not be located.`);
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadCase();
    return () => {
      isMounted = false;
    };
  }, [id, storedCases]);

  // Loading state
  if (loading) {
    return (
      <div className="py-24 text-center space-y-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
        <p className="text-sm text-slate-500 font-medium">Loading RTI case particulars from repository...</p>
      </div>
    );
  }

  // Error / Not Found state
  if (!caseItem || error) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border-2 border-rose-200 flex items-center justify-center mx-auto shadow-xs">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Case Not Found</h2>
        <p className="text-sm text-slate-500">
          The requested RTI case id <span className="font-mono text-slate-900 font-bold">"{id}"</span> does not exist or has been removed.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    );
  }

  // Calculate whether the PIO response deadline has passed
  const filingTimestamp = new Date(caseItem.filingDate || Date.now()).getTime();
  const allowedDays = caseItem.isLifeAndLiberty ? 2 : 30;
  const deadlineTimestamp = filingTimestamp + allowedDays * 86400000;
  const daysDiff = Math.ceil((deadlineTimestamp - Date.now()) / 86400000);

  // Check nearest deadline object if present
  const explicitDeadline = caseItem.deadlines?.[0];
  const daysRemaining = explicitDeadline?.daysRemaining !== undefined ? explicitDeadline.daysRemaining : daysDiff;

  // Deadline is passed if daysRemaining <= 0, or Date is past deadline, or status is first_appeal, or simulation enabled
  const isResponseDeadlinePassed =
    simulatePassed ||
    daysRemaining <= 0 ||
    Date.now() >= deadlineTimestamp ||
    caseItem.status === 'first_appeal_pending' ||
    caseItem.status === 'second_appeal_pending' ||
    (caseItem.appeals && caseItem.appeals.length > 0);

  // Handle editable status save
  const handleSaveStatus = async (newStatus) => {
    setStatusUpdateLoading(true);
    setStatusSuccessMessage('');
    try {
      // Call api.updateCase if available or patch via casesApi
      let updated;
      if (typeof api.updateCase === 'function') {
        updated = await api.updateCase(caseItem.id, { status: newStatus });
      } else {
        updated = { ...caseItem, status: newStatus };
      }

      // Sync state and store
      setCaseItem(updated);
      setSelectedStatus(newStatus);
      updateStoreCase(caseItem.id, { status: newStatus });
      setIsEditingStatus(false);
      setStatusSuccessMessage(`Status updated to "${newStatus.replace(/_/g, ' ')}"`);
      setTimeout(() => setStatusSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Failed to update status', err);
      // Optimistic update
      setCaseItem((prev) => ({ ...prev, status: newStatus }));
      setSelectedStatus(newStatus);
      updateStoreCase(caseItem.id, { status: newStatus });
      setIsEditingStatus(false);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  // Generate Appeal Draft handler
  const handleGenerateAppeal = async () => {
    const appealId = `appeal-${Date.now().toString().slice(-4)}`;
    const newAppeal = {
      id: appealId,
      caseId: caseItem.id,
      type: 'first_appeal',
      appealNumber: `FAA-2026-${caseItem.authority?.code || 'AUTH'}-${Math.floor(1000 + Math.random() * 9000)}`,
      authorityId: caseItem.authorityId,
      authorityName: caseItem.authority?.name || 'Public Authority',
      appellateAuthorityName: caseItem.authority?.firstAppellateAuthority?.name || 'First Appellate Authority',
      appellateAuthorityDesignation: caseItem.authority?.firstAppellateAuthority?.designation || 'Joint Secretary & FAA',
      appellant: {
        fullName: caseItem.applicant?.fullName || 'Appellant',
        email: caseItem.applicant?.email || 'appellant@example.com',
        phone: caseItem.applicant?.phone || '',
        address: caseItem.applicant?.address || '',
      },
      originalApplicationDate: caseItem.filingDate,
      originalPioName: caseItem.authority?.pio?.name || 'CPIO',
      groundOfAppeal: 'no_response',
      groundsSummary: `Statutory ${allowedDays}-day period expired without information or order from CPIO under Sec 7(1). Deemed refusal established under Sec 7(2).`,
      detailedGrounds: [
        `The Appellant submitted an RTI application on ${new Date(caseItem.filingDate).toLocaleDateString()} regarding "${caseItem.title}".`,
        `Under Section 7(1) of the RTI Act, 2005, the Public Information Officer was obligated to supply information within ${allowedDays} days.`,
        'No information, interim reply, or transfer notice under Section 6(3) was received from the CPIO.',
        'Deemed refusal of request is established under Section 7(2).',
        'As per Section 7(6), all requested records must now be supplied completely free of cost to the Appellant.',
      ],
      reliefSought:
        'Direct the CPIO to immediately furnish certified copies of all requested documents without fees under Sec 7(6), and initiate action under Sec 20.',
      status: 'ready_to_send',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (typeof api.createAppealDraft === 'function') {
        await api.createAppealDraft(newAppeal);
      }
    } catch (e) {
      console.warn('api.createAppealDraft fallback', e);
    }

    addAppeal(newAppeal);
    const updatedCase = {
      ...caseItem,
      status: 'first_appeal_pending',
      appeals: [newAppeal, ...(caseItem.appeals || [])],
    };
    updateStoreCase(caseItem.id, {
      status: 'first_appeal_pending',
      appeals: updatedCase.appeals,
    });
    setCaseItem(updatedCase);
    navigate(`/appeals/${appealId}`);
  };

  // Handle logging PIO response
  const handleRecordPioResponse = () => {
    if (!responseSummary.trim()) return;
    const updated = {
      ...caseItem,
      status: 'pio_replied',
      pioResponseSummary: responseSummary.trim(),
      pioResponseDate: new Date().toISOString(),
    };
    setCaseItem(updated);
    updateStoreCase(caseItem.id, updated);
    setResponseModalOpen(false);
  };

  const currentStageIdx = getCurrentStageIndex(caseItem.status, caseItem.appeals?.length);
  const portalUrl = caseItem.authority?.portalUrl || 'https://rtionline.gov.in';

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Breadcrumb & Navigation */}
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-3 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>

        {/* Top Header Card */}
        <div className="p-6 sm:p-7 rounded-2xl bg-white border-2 border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded-md border-2 border-blue-200">
                  {caseItem.trackingNumber}
                </span>

                {caseItem.isLifeAndLiberty && (
                  <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border-2 border-rose-200 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>48h Life & Liberty (Sec 7(1) Proviso)</span>
                  </span>
                )}

                {(caseItem.responseClassification?.status || caseItem.lastResponseStatus) && (
                  <Link
                    to={`/cases/${caseItem.id}/response`}
                    className={`text-[11px] font-bold uppercase px-3 py-1 rounded-full border-2 flex items-center gap-1.5 transition hover:opacity-90 ${
                      (caseItem.responseClassification?.status || caseItem.lastResponseStatus) === 'DENIED' ||
                      (caseItem.responseClassification?.status || caseItem.lastResponseStatus) === 'EVASIVE_VAGUE'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : (caseItem.responseClassification?.status || caseItem.lastResponseStatus) === 'FULLY_ANSWERED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    <Scale className="w-3 h-3" />
                    <span>Last response: {(caseItem.responseClassification?.status || caseItem.lastResponseStatus).replace(/_/g, ' ')}</span>
                  </Link>
                )}

                {/* ========================================================
                    EDITABLE STATUS FIELD
                   ======================================================== */}
                <div className="flex items-center gap-2">
                  {!isEditingStatus ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-amber-50 text-amber-900 border-2 border-amber-300">
                        Status: {caseItem.status?.replace(/_/g, ' ')}
                      </span>
                      <button
                        onClick={() => setIsEditingStatus(true)}
                        className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer"
                        title="Edit Status"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border-2 border-blue-400 shadow-sm">
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="bg-slate-50 text-slate-900 text-xs font-semibold rounded-lg px-2.5 py-1 border border-slate-300 focus:outline-none focus:border-blue-500"
                        disabled={statusUpdateLoading}
                      >
                        <option value="submitted">Submitted (Waiting PIO)</option>
                        <option value="response_due">Response Due (In Window)</option>
                        <option value="pio_replied">PIO Replied</option>
                        <option value="first_appeal_pending">First Appeal Pending</option>
                        <option value="second_appeal_pending">Second Appeal Pending</option>
                        <option value="closed">Closed / Resolved</option>
                      </select>

                      <button
                        onClick={() => handleSaveStatus(selectedStatus)}
                        disabled={statusUpdateLoading}
                        className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-50 cursor-pointer"
                        title="Save Status"
                      >
                        {statusUpdateLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setSelectedStatus(caseItem.status);
                          setIsEditingStatus(false);
                        }}
                        disabled={statusUpdateLoading}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {statusSuccessMessage && (
                  <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{statusSuccessMessage}</span>
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug tracking-tight">
                {caseItem.title}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Subject Category: <span className="text-slate-800 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{caseItem.subjectCategory || 'Public Administration'}</span>
              </p>
            </div>

            {/* Header Actions */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Link
                to={`/cases/${caseItem.id}/response`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border-2 border-blue-200 transition shadow-xs cursor-pointer"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Classify Govt Response</span>
              </Link>

              <button
                onClick={() => setResponseModalOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 hover:border-slate-400 transition shadow-xs cursor-pointer"
              >
                Log PIO Reply
              </button>

              {/* ========================================================
                  "GENERATE APPEAL DRAFT" BUTTON
                 ======================================================== */}
              {isResponseDeadlinePassed ? (
                <button
                  onClick={handleGenerateAppeal}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition transform active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Generate Appeal Draft</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="text-right text-xs">
                    <span className="block font-bold text-amber-600">
                      {daysRemaining} days left in 30d window
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Appeal enabled on expiry</span>
                  </div>
                  <button
                    onClick={() => setSimulatePassed(true)}
                    className="text-[10px] font-semibold text-slate-400 hover:text-blue-600 underline cursor-pointer"
                    title="Simulate 30-day window expiry to test appeal generator immediately"
                  >
                    (Simulate expiry)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Statutory Overdue Banner if Response Deadline Has Passed */}
      {isResponseDeadlinePassed && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                <span>Statutory 30-Day Response Window Expired</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-400">
                  Section 7(2) Deemed Refusal
                </span>
              </h2>
              <p className="text-xs text-amber-900/90 leading-relaxed max-w-2xl">
                The Public Information Officer did not furnish replies within the statutory timeframe.
                You are legally empowered to file a First Appeal before the First Appellate Authority (FAA) under Section 19(1). All information must now be provided completely <strong>free of cost</strong> pursuant to Section 7(6).
              </p>
            </div>
          </div>

          <button
            onClick={handleGenerateAppeal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-sm transition transform active:scale-95 shrink-0"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>Generate Appeal Draft</span>
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
      )}

      {/* ========================================================
          TIMELINE OF STAGES: Filed → Response Due → First Appeal → Second Appeal
         ======================================================== */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white border-2 border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Statutory Progression Timeline</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Statutory trajectory under Right to Information Act, 2005: <strong>Filed &rarr; Response Due &rarr; First Appeal &rarr; Second Appeal</strong>
            </p>
            {(caseItem.responseClassification?.status || caseItem.lastResponseStatus) && (
              <div className="mt-2 text-xs flex items-center gap-2">
                <span className="text-slate-500 font-semibold">Last response:</span>
                <span className="font-mono text-slate-900 font-bold">
                  {(caseItem.responseClassification?.status || caseItem.lastResponseStatus).replace(/_/g, ' ')}
                </span>
                {caseItem.responseClassification?.sectionCited && (
                  <span className="text-blue-600 font-mono text-[11px]">
                    (Section {caseItem.responseClassification.sectionCited})
                  </span>
                )}
                <Link
                  to={`/cases/${caseItem.id}/response`}
                  className="text-blue-600 hover:underline text-[11px] font-medium ml-1"
                >
                  View Details &rarr;
                </Link>
              </div>
            )}
          </div>
          <span className="text-xs font-bold text-blue-800 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200 self-start sm:self-auto">
            Current Stage: {STATUTORY_STAGES[currentStageIdx].title}
          </span>
        </div>

        {/* 4-Stage Progressive Timeline Stepper */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {STATUTORY_STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStageIdx;
            const isCurrent = idx === currentStageIdx;
            const isUpcoming = idx > currentStageIdx;

            return (
              <div
                key={stage.id}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  isCurrent
                    ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                    : isCompleted
                    ? 'bg-emerald-50/60 border-emerald-300 text-slate-700'
                    : 'bg-slate-50/70 border-slate-200 text-slate-600'
                }`}
              >
                {/* Header: Stage Number & Status Badge */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCompleted
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-blue-600 text-white ring-2 ring-blue-400/40'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Stage 0{idx + 1}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : isCurrent
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 border border-slate-300'
                    }`}
                  >
                    {isCompleted ? 'Completed' : isCurrent ? 'Active Stage' : 'Upcoming'}
                  </span>
                </div>

                {/* Stage Title and Section Reference */}
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span>{stage.title}</span>
                  <span className="text-[11px] font-normal text-blue-600 font-mono">
                    ({stage.section})
                  </span>
                </h3>

                {/* Description */}
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  {stage.description}
                </p>

                {/* Stage-specific date metadata */}
                <div className="mt-3 pt-2 border-t border-slate-200 text-[11px]">
                  {idx === 0 && (
                    <span className="text-slate-600 font-medium">
                      Filed: {new Date(caseItem.filingDate).toLocaleDateString()}
                    </span>
                  )}
                  {idx === 1 && (
                    <span className={daysRemaining <= 0 ? 'text-rose-600 font-bold' : 'text-amber-700 font-bold'}>
                      {daysRemaining <= 0
                        ? '30-Day Limit Passed'
                        : `${daysRemaining} days remaining`}
                    </span>
                  )}
                  {idx === 2 && (
                    <span className="text-slate-600 font-medium">
                      {caseItem.appeals?.length > 0 ? 'Appeal Drafted' : 'Available if PIO defaults'}
                    </span>
                  )}
                  {idx === 3 && (
                    <span className="text-slate-500 font-medium">
                      Section 19(3) CIC / State Commission
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Case Particulars & Authority Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Formulated Queries, Documents, PIO Reply */}
        <div className="lg:col-span-2 space-y-6">
          {/* Queries Formulated under Section 6 */}
          <div className="p-6 rounded-2xl bg-white border-2 border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Formulated RTI Queries (Section 6(1))</span>
              </h2>
              <span className="text-xs font-mono text-blue-800 bg-blue-50 border border-blue-200 px-3 py-0.5 rounded-full font-bold">
                {caseItem.queries?.length || 0} questions
              </span>
            </div>

            <div className="space-y-3">
              {caseItem.queries?.map((queryText, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100/70 border-2 border-slate-200 flex items-start gap-3.5 transition"
                >
                  <span className="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-900 leading-relaxed font-semibold">
                    {queryText}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* PIO Reply Summary (if recorded) */}
          {caseItem.pioResponseSummary && (
            <div className="p-6 rounded-2xl bg-white border-2 border-emerald-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Public Information Officer (PIO) Response</span>
                </h2>
                {caseItem.pioResponseDate && (
                  <span className="text-xs text-slate-500 font-medium">
                    Received: {new Date(caseItem.pioResponseDate).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs sm:text-sm text-slate-900 leading-relaxed font-medium">
                {caseItem.pioResponseSummary}
              </div>
            </div>
          )}

          {/* Response Classification Analysis Card (if available) */}
          {caseItem.responseClassification && (
            <div className="p-6 rounded-2xl bg-white border-2 border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Official Response Evaluation
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase px-3 py-1 rounded-full border ${
                        caseItem.responseClassification.status === 'DENIED' || caseItem.responseClassification.status === 'EVASIVE_VAGUE'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : caseItem.responseClassification.status === 'FULLY_ANSWERED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-current" />
                      <span>{caseItem.responseClassification.status.replace(/_/g, ' ')}</span>
                    </span>
                  </div>
                </div>

                <Link
                  to={`/cases/${caseItem.id}/response`}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Re-evaluate / Update &rarr;
                </Link>
              </div>

              {/* Section Cited */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                <span className="font-semibold text-slate-600">Exemption Section Cited:</span>
                <span className="font-mono font-bold text-slate-900 px-2.5 py-0.5 rounded bg-white border border-slate-200">
                  {caseItem.responseClassification.sectionCited ? `Section ${caseItem.responseClassification.sectionCited}` : 'Not cited in reply'}
                </span>
              </div>

              {/* Legal Warning if Denied without section */}
              {!caseItem.responseClassification.sectionCited && caseItem.responseClassification.status === 'DENIED' && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Denials are required to cite a specific exemption under Section 8(1) — this failure provides strong merit for a First Appeal.
                  </span>
                </div>
              )}

              {/* Reason */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Evaluation Reason:</span>
                <p className="text-xs sm:text-sm text-slate-800 bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed font-medium">
                  {caseItem.responseClassification.reason}
                </p>
              </div>

              {/* Suggested Next Step Callout */}
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Recommended Action:</span>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                    {caseItem.responseClassification.suggestedNextStep}
                  </p>
                </div>

                {caseItem.responseClassification.suggestedNextStep?.toLowerCase().includes('appeal') && (
                  <button
                    onClick={handleGenerateAppeal}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm shrink-0"
                  >
                    <span>Draft First Appeal</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Attached Documents / Acknowledgment Files */}
          <div className="p-6 rounded-2xl bg-white border-2 border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileDown className="w-4 h-4 text-blue-600" />
              <span>Attached Documents & Filing Proofs</span>
            </h2>

            {caseItem.documents && caseItem.documents.length > 0 ? (
              <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                {caseItem.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 bg-slate-50 flex items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                      <div className="truncate">
                        <p className="font-semibold text-slate-900 truncate">{doc.fileName}</p>
                        <p className="text-[11px] text-slate-500">
                          {((doc.fileSize || 102400) / 1024).toFixed(1)} KB &bull;{' '}
                          {doc.category?.replace(/_/g, ' ') || 'Document'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 shrink-0">
                      Verified Receipt
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 font-medium">
                No acknowledgment file was uploaded during filing. You can retain your registration number for statutory monitoring.
              </div>
            )}
          </div>

          {/* Associated Appeal Drafts */}
          {caseItem.appeals && caseItem.appeals.length > 0 && (
            <div className="p-6 rounded-2xl bg-white border-2 border-amber-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-amber-900 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-amber-600" />
                <span>Associated Appeal Proceedings</span>
              </h2>

              <div className="space-y-3">
                {caseItem.appeals.map((appeal) => (
                  <div
                    key={appeal.id}
                    className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-900 uppercase">
                          {appeal.type?.replace('_', ' ')}
                        </span>
                        <span className="font-mono text-xs text-slate-700 font-semibold">
                          {appeal.appealNumber || appeal.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 leading-relaxed font-medium">
                        {appeal.groundsSummary}
                      </p>
                    </div>

                    <Link
                      to={`/appeals/${appeal.id}`}
                      className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition shadow-sm shrink-0"
                    >
                      <span>Open Appeal Drafter</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Public Authority & Contact Record */}
        <div className="space-y-6">
          {/* Target Authority Card */}
          <div className="p-6 rounded-2xl bg-white border-2 border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Target Public Authority</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 font-medium block mb-1">Authority Name:</span>
                <p className="font-bold text-slate-900 text-sm leading-snug">
                  {caseItem.authority?.name || 'Department of Public Authority'}
                </p>
                {caseItem.authority?.ministry && (
                  <p className="text-xs text-blue-700 mt-1 font-semibold">{caseItem.authority.ministry}</p>
                )}
                {caseItem.authority?.department && (
                  <p className="text-[11px] text-slate-600 mt-0.5 font-medium">
                    Dept: {caseItem.authority.department}
                  </p>
                )}
              </div>

              {/* Portal link button */}
              <div className="pt-2">
                <a
                  href={portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition"
                >
                  <span>Open Government Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Central Public Information Officer (CPIO) */}
              {caseItem.authority?.pio && (
                <div className="pt-3 border-t border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Designated CPIO
                  </span>
                  <p className="font-bold text-slate-900 text-xs">
                    {caseItem.authority.pio.name}
                  </p>
                  <p className="text-slate-600 text-[11px] font-medium">
                    {caseItem.authority.pio.designation}
                  </p>

                  <div className="space-y-1.5 pt-1 text-slate-700 text-[11px] font-medium">
                    {caseItem.authority.pio.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate">{caseItem.authority.pio.email}</span>
                      </div>
                    )}
                    {caseItem.authority.pio.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{caseItem.authority.pio.phone}</span>
                      </div>
                    )}
                    {caseItem.authority.pio.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{caseItem.authority.pio.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* First Appellate Authority */}
              {caseItem.authority?.firstAppellateAuthority && (
                <div className="pt-3 border-t border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    First Appellate Authority (FAA)
                  </span>
                  <p className="font-bold text-slate-900 text-xs">
                    {caseItem.authority.firstAppellateAuthority.name}
                  </p>
                  <p className="text-slate-600 text-[11px] font-medium">
                    {caseItem.authority.firstAppellateAuthority.designation}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Filing & Fee Record */}
          <div className="p-6 rounded-2xl bg-white border-2 border-slate-200 shadow-sm space-y-3 text-xs">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>Filing & Payment Record</span>
            </h2>

            <div className="space-y-2 text-slate-700 font-medium">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Applicant:</span>
                <span className="font-bold text-slate-900">{caseItem.applicant?.fullName || 'Anonymous'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-mono text-[11px] text-slate-800 font-semibold">{caseItem.applicant?.email || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Filing Date:</span>
                <span className="text-slate-800">{new Date(caseItem.filingDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Submission Mode:</span>
                <span className="capitalize text-slate-800">{caseItem.submissionMode?.replace(/_/g, ' ') || 'Online Portal'}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500">Statutory Fee:</span>
                <span className="font-bold text-emerald-700">₹{caseItem.feePaid || 10}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Receipt Ref:</span>
                <span className="font-mono text-slate-700 font-semibold">{caseItem.paymentReference || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PIO Reply Modal */}
      {responseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Log PIO Response or Decision</h3>
            <p className="text-xs text-slate-600">
              Record the decision summary, order number, or disclosure particulars received from the Public Information Officer.
            </p>
            <textarea
              rows={4}
              placeholder="e.g. PIO provided sanction order, however inspection logs were withheld citing Section 8(1)(j)..."
              value={responseSummary}
              onChange={(e) => setResponseSummary(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setResponseModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordPioResponse}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm"
              >
                Save & Update Case
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CaseDetail;
