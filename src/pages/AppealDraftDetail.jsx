import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileCheck2,
  Copy,
  Check,
  Printer,
  ArrowLeft,
  Scale,
  Send,
  Loader2,
  AlertTriangle,
  Building2,
  ShieldAlert,
  Download,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Info,
} from 'lucide-react';
import { api } from '../lib/api.js';
import { useCaseStore } from '../lib/store.js';

export const AppealDraftDetail = () => {
  const { id } = useParams(); // Read id via useParams as required
  const { cases: storedCases, appeals } = useCaseStore();

  // State
  const [caseDetails, setCaseDetails] = useState(null);
  const [loadingCase, setLoadingCase] = useState(true);
  const [caseError, setCaseError] = useState('');

  // Appeal Type Toggle ('first' | 'second') as required
  const [appealType, setAppealType] = useState('first');

  // Draft Text & AI generation state
  const [draftText, setDraftText] = useState('');
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [draftError, setDraftError] = useState('');
  const [copied, setCopied] = useState(false);

  // Initial fetch: fetch case details via api.getCase(id) as required
  useEffect(() => {
    let isMounted = true;

    const fetchCaseDetails = async () => {
      setLoadingCase(true);
      setCaseError('');

      try {
        let fetchedCase = null;
        try {
          // 1. Call api.getCase(id) as requested
          fetchedCase = await api.getCase(id);
        } catch (err) {
          // If id was an appeal ID like 'appeal-201', resolve related case
          const matchingAppeal = appeals.find((a) => a.id === id);
          if (matchingAppeal?.caseId) {
            fetchedCase = await api.getCase(matchingAppeal.caseId);
          } else {
            const fallback = storedCases.find((c) => c.id === id);
            if (fallback) fetchedCase = fallback;
            else throw err;
          }
        }

        if (isMounted && fetchedCase) {
          setCaseDetails(fetchedCase);
        }
      } catch (err) {
        console.error('Failed to load case details', err);
        const fallback = storedCases.find((c) => c.id === id) || storedCases[0];
        if (isMounted) {
          if (fallback) {
            setCaseDetails(fallback);
          } else {
            setCaseError(`Unable to locate case record for ID "${id}".`);
          }
        }
      } finally {
        if (isMounted) setLoadingCase(false);
      }
    };

    fetchCaseDetails();

    return () => {
      isMounted = false;
    };
  }, [id, storedCases, appeals]);

  // Call api.draftAppeal(caseId, appealType, caseDetails) to get draft text as required
  const generateDraft = async (typeToDraft, currentCase) => {
    if (!currentCase) return;

    setLoadingDraft(true);
    setDraftError('');

    try {
      // Call api.draftAppeal(caseId, appealType, caseDetails) as required
      const response = await api.draftAppeal(
        currentCase.id,
        typeToDraft,
        currentCase
      );

      const generated =
        typeof response === 'string'
          ? response
          : response?.draftText || response?.draftContent || '';

      setDraftText(generated);
    } catch (err) {
      console.error('Failed to generate appeal draft', err);
      setDraftError('Failed to generate draft text from AI service. You can type or edit your appeal manually below.');
    } finally {
      setLoadingDraft(false);
    }
  };

  // Re-generate draft whenever caseDetails or appealType changes
  useEffect(() => {
    if (caseDetails) {
      generateDraft(appealType, caseDetails);
    }
  }, [caseDetails, appealType]);

  // Copy to clipboard handler
  const handleCopy = () => {
    if (!draftText) return;
    navigator.clipboard.writeText(draftText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  // Download Markdown file handler
  const handleDownloadMarkdown = () => {
    if (!draftText) return;
    const blob = new Blob([draftText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `${caseDetails?.trackingNumber || 'RTI'}_${appealType}_appeal_draft.md`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Loading state
  if (loadingCase) {
    return (
      <div className="py-24 text-center space-y-4">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
        <p className="text-sm text-slate-400">Fetching case particulars and appellate roster...</p>
      </div>
    );
  }

  // Error state
  if (caseError || !caseDetails) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-rose-950/80 text-rose-400 border border-rose-800/80 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Case Not Found</h2>
        <p className="text-sm text-slate-400">{caseError || `Case ID "${id}" could not be located.`}</p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-xl text-sm font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    );
  }

  const portalLink = caseDetails.authority?.portalUrl || 'https://rtionline.gov.in';

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Top Header & Breadcrumb */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Link
            to={`/cases/${caseDetails.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Case {caseDetails.trackingNumber}</span>
          </Link>

          <span className="text-xs font-semibold uppercase px-3 py-1 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/60">
            {appealType === 'first' ? 'Section 19(1) First Appeal' : 'Section 19(3) Second Appeal'}
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded border border-cyan-800/60">
                {caseDetails.trackingNumber}
              </span>
              <span className="text-xs text-slate-400">
                Filed on {new Date(caseDetails.filingDate).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Statutory RTI Appeal Drafter
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Generate and revise legally structured First or Second Appeals under Section 19 of the RTI Act, 2005.
            </p>
          </div>

          {/* Quick Actions (Copy, Print, Download) */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Copy-to-clipboard button as required */}
            <button
              onClick={handleCopy}
              disabled={loadingDraft || !draftText}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-md shadow-cyan-400/20 transition transform active:scale-95 disabled:opacity-50"
            >
              {copied ? <Check className="w-4 h-4 text-slate-950 stroke-[3]" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              disabled={loadingDraft || !draftText}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition disabled:opacity-50"
              title="Download as Markdown"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              onClick={handlePrint}
              disabled={loadingDraft || !draftText}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition disabled:opacity-50"
              title="Print Document"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          APPEAL TYPE TOGGLE ('first' | 'second') as required
         ======================================================== */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block mb-0.5">
              Appellate Forum Selector
            </span>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-cyan-400" />
              <span>Select Statutory Appeal Level</span>
            </h2>
          </div>

          {/* The Toggle control */}
          <div className="inline-flex p-1 rounded-xl bg-slate-950 border border-slate-800 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setAppealType('first')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                appealType === 'first'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              First Appeal (Sec 19(1))
            </button>

            <button
              type="button"
              onClick={() => setAppealType('second')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                appealType === 'second'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Second Appeal (Sec 19(3))
            </button>
          </div>
        </div>

        {/* Dynamic Context Card based on selected toggle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
            <span className="text-slate-400 block">Competent Appellate Authority:</span>
            <p className="font-bold text-white text-sm">
              {appealType === 'first'
                ? caseDetails.authority?.firstAppellateAuthority?.name || 'Designated First Appellate Authority'
                : 'Central Information Commission (CIC) / State Commission'}
            </p>
            <p className="text-[11px] text-cyan-400">
              {appealType === 'first'
                ? caseDetails.authority?.firstAppellateAuthority?.designation || 'Joint Secretary & FAA'
                : 'Autonomous Statutory Commission Tribunal under Sec 12/15'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
            <span className="text-slate-400 block">Statutory Window & Fees:</span>
            <p className="font-bold text-emerald-400 text-sm">
              ₹0 (No Filing Fee under Central Rules)
            </p>
            <p className="text-[11px] text-slate-300">
              {appealType === 'first'
                ? 'File within 30 days of PIO reply expiry. Disposal in 30-45 days.'
                : 'File within 90 days from the date of FAA decision or disposal expiry.'}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================
          MANDATORY DISCLAIMER BLOCK as required
         ======================================================== */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border border-amber-600/50 shadow-xl space-y-3">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-amber-300 tracking-tight">
              Official Filing Notice & Legal Disclaimer
            </h3>
            <p className="text-xs text-amber-100/90 leading-relaxed">
              <strong>You must file and submit this appeal yourself via the official government channel.</strong>{' '}
              RTI Assist generates this legally formatted statutory draft for your convenience based on the facts on record. Our software does not transmit petitions directly to government authorities.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>File online via the official portal</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>Or send a signed hardcopy via Registered Speed Post</span>
              </span>
              <a
                href={portalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2"
              >
                <span>Open {caseDetails.authority?.name || 'Official Portal'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          EDITABLE TEXTAREA as required
         ======================================================== */}
      <div className="p-6 sm:p-7 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-bold text-white">
              Editable Appeal Text
            </h2>
            {loadingDraft && (
              <span className="inline-flex items-center gap-1 text-xs text-cyan-400 font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>AI Structuring Draft...</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400 font-mono">
              {draftText.length} characters &bull; {draftText.trim().split(/\s+/).filter(Boolean).length} words
            </span>
            <button
              onClick={() => generateDraft(appealType, caseDetails)}
              disabled={loadingDraft}
              className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 disabled:opacity-50"
              title="Regenerate Draft with AI"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset AI Draft</span>
            </button>
          </div>
        </div>

        {draftError && (
          <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs">
            {draftError}
          </div>
        )}

        {/* Editable textarea containing draft text */}
        <div className="relative">
          <textarea
            id="appeal-textarea"
            rows={22}
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            disabled={loadingDraft}
            placeholder="AI is generating your statutory appeal draft..."
            className="w-full p-5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs leading-relaxed focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition resize-y shadow-inner disabled:opacity-50"
          />
        </div>

        {/* Textarea Bottom Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>You can revise or add personal details, case specific orders, or grievance notes directly in the box above.</span>
          </div>

          <button
            onClick={handleCopy}
            disabled={loadingDraft || !draftText}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition shadow-sm self-end sm:self-auto shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Appeal Text'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppealDraftDetail;
