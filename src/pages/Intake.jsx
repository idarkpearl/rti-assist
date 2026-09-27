import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Loader2,
  HelpCircle,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { api } from '../lib/api.js';

export const Intake = () => {
  const navigate = useNavigate();

  // Wizard state: 1, 2, or 3
  const [step, setStep] = useState(1);

  // Form states
  const [concern, setConcern] = useState('');
  const [draftText, setDraftText] = useState('');
  const [recommendation, setRecommendation] = useState(null);

  // Loading states
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sample prompt chips for fast testing
  const sampleConcerns = [
    {
      title: 'University Faculty Vacancies',
      text: 'Central universities have not filled sanctioned faculty positions across reserved categories for over 2 years despite multiple advertisements. I want official vacancy rosters, category breakdown, and funds spent on temporary staff.',
    },
    {
      title: 'Highway Toll & Pothole Audits',
      text: 'NHAI concessionaire on the highway stretch is continuously charging toll fees despite severe surface damage and potholes. I want copies of safety inspection audit reports, fine notices issued to the contractor, and 24-month revenue accounts.',
    },
    {
      title: 'Municipal Drain De-silting',
      text: 'Chronic flooding occurred in our municipal ward during rains. I want certified copies of the pre-monsoon storm water drain cleaning tender, weighbridge slips of silt removed, and total funds disbursed to the contractor.',
    },
  ];

  // Step 1 -> Step 2: Call api.draftRequest(concern)
  const handleProceedToStep2 = async () => {
    if (!concern.trim()) {
      setErrorMessage('Please describe your concern or question before proceeding.');
      return;
    }

    setErrorMessage('');
    setLoadingDraft(true);

    try {
      const response = await api.draftRequest(concern);
      const generatedText =
        typeof response === 'string'
          ? response
          : response?.draftText || response?.sampleLetterDraft || String(response);

      setDraftText(generatedText);
      setStep(2);
    } catch (err) {
      console.error('Failed to generate draft request', err);
      setErrorMessage('Unable to generate structured draft right now. Please try again.');
    } finally {
      setLoadingDraft(false);
    }
  };

  // Step 2 -> Step 3: Call api.recommendAuthority(draftText)
  const handleProceedToStep3 = async () => {
    if (!draftText.trim()) {
      setErrorMessage('RTI draft cannot be empty.');
      return;
    }

    setErrorMessage('');
    setLoadingRecommendation(true);

    try {
      const result = await api.recommendAuthority(draftText);
      setRecommendation(result);
      setStep(3);
    } catch (err) {
      console.error('Failed to recommend authority', err);
      setErrorMessage('Unable to determine authority recommendation. Please try again.');
    } finally {
      setLoadingRecommendation(false);
    }
  };

  // Step 3 Confirmation: Navigate to /cases/new/filing
  const handleConfirmAuthority = () => {
    const payload = {
      concern,
      draftText,
      authority: recommendation?.authority,
      filingChannel: recommendation?.filingChannel,
      statutoryTimeframe: recommendation?.statutoryTimeframe,
      confirmedAt: new Date().toISOString(),
    };

    // Store in session storage for persistence during filing
    try {
      sessionStorage.setItem('pending_rti_filing', JSON.stringify(payload));
    } catch (e) {
      console.warn('Session storage write failed', e);
    }

    navigate('/cases/new/filing', { state: payload });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Stepper Progress Indicator */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: 'Plain Language Issue' },
            { num: 2, label: 'AI RTI Formulation' },
            { num: 3, label: 'Authority & Channel' },
          ].map((s, idx) => (
            <div key={s.num} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-all shadow-md ${
                    step === s.num
                      ? 'bg-cyan-500 text-slate-950 ring-4 ring-cyan-500/20 shadow-cyan-500/30'
                      : step > s.num
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                  }`}
                >
                  {step > s.num ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : s.num}
                </div>
                <div className="hidden sm:block">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Step 0{s.num}
                  </p>
                  <p
                    className={`text-xs font-bold ${
                      step === s.num ? 'text-white' : step > s.num ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    {s.label}
                  </p>
                </div>
              </div>

              {idx < 2 && (
                <div className="flex-1 mx-3 sm:mx-6 h-0.5 bg-slate-800 relative">
                  <div
                    className={`h-full bg-cyan-500 transition-all duration-300 ${
                      step > s.num ? 'w-full' : 'w-0'
                    }`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ========================================================
          STEP 1: Plain Language Issue Description
         ======================================================== */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Step 1: Intelligent Intake</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Describe your issue in plain language
              </h1>
              <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">
                You do not need to cite legal sections or know government departments yet. Simply explain what happened, what information or records you need, or what public decision seems irregular.
              </p>
            </div>

            <div>
              <label htmlFor="issue-textarea" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Your Concern or Inquiry Details *
              </label>
              <textarea
                id="issue-textarea"
                rows={7}
                value={concern}
                onChange={(e) => setConcern(e.target.value)}
                placeholder="Example: I noticed that road resurfacing was done poorly on MG Road last month and it already has deep potholes. I want to see the contractor work order, how much money was paid from public funds, and who certified the inspection..."
                className="w-full p-4 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-sm leading-relaxed focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition resize-y"
              />
              <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1.5">
                <span>Supports natural language inquiry</span>
                <span>{concern.length} characters</span>
              </div>
            </div>

            {/* Quick Sample Prompts */}
            <div className="space-y-2.5 pt-2">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                <span>Or load an example issue:</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {sampleConcerns.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setConcern(s.text)}
                    className="p-3 text-left rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-cyan-500/40 transition group"
                  >
                    <p className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                      {s.title}
                    </p>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                      {s.text}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>AI will convert this into Section 6(1) legal format</span>
              </div>

              <button
                type="button"
                onClick={handleProceedToStep2}
                disabled={loadingDraft || !concern.trim()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-600/30 transition transform active:scale-95"
              >
                {loadingDraft ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Structuring RTI Questions...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Structured RTI</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 2: Review and Edit AI-Structured RTI Draft
         ======================================================== */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-xs font-semibold mb-2">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Step 2: Formal RTI Request Review</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  AI-Suggested Structured RTI Request
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Review and revise the draft text below. You can edit any questions, dates, or details directly in the textarea.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-xs text-cyan-300 self-start sm:self-auto flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Section 6(1) Compliant</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="draft-textarea" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Editable RTI Application Body *
                </label>
                <span className="text-[11px] text-slate-400">
                  Feel free to customize questions before identifying authority
                </span>
              </div>

              <textarea
                id="draft-textarea"
                rows={16}
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                className="w-full p-4 rounded-xl bg-slate-950 border border-slate-700/80 text-white font-mono text-xs leading-relaxed focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition resize-y shadow-inner"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs text-slate-300 space-y-1">
              <span className="font-semibold text-amber-300 block">Pro-tip under RTI Act, 2005:</span>
              <p className="text-slate-400 leading-relaxed">
                Ensure queries ask for specific certified records, work orders, inspection registers, or file notings rather than hypothetical explanations or questions starting with 'Why'.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Issue Description</span>
              </button>

              <button
                type="button"
                onClick={handleProceedToStep3}
                disabled={loadingRecommendation || !draftText.trim()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-600/30 transition transform active:scale-95"
              >
                {loadingRecommendation ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Finding Public Authority & Channel...</span>
                  </>
                ) : (
                  <>
                    <span>Recommend Public Authority</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 3: Recommended Public Authority + Filing Channel
         ======================================================== */}
      {step === 3 && recommendation && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-xs font-semibold mb-2">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Step 3: Authority Recommendation</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Recommended Public Authority & Filing Channel
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Based on your draft text, our system matched the appropriate ministry, designated CPIO, and statutory filing route.
              </p>
            </div>

            {/* Target Authority Card */}
            <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                  {recommendation.authority?.level} Authority
                </span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Match Confidence: {Math.round(recommendation.confidenceScore * 100)}%
                </span>
              </div>

              <div>
                <h2 className="text-xl font-bold text-white">
                  {recommendation.authority?.name}
                </h2>
                {recommendation.authority?.ministry && (
                  <p className="text-xs text-cyan-400 font-medium mt-0.5">
                    {recommendation.authority.ministry}
                  </p>
                )}
                {recommendation.authority?.department && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    Department: {recommendation.authority.department}
                  </p>
                )}
              </div>

              {/* CPIO & Appellate Authority Details */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1 font-semibold uppercase text-[10px] tracking-wider">
                    Designated CPIO:
                  </span>
                  <p className="font-semibold text-white">
                    {recommendation.authority?.pio?.name}
                  </p>
                  <p className="text-slate-400">
                    {recommendation.authority?.pio?.designation}
                  </p>
                  <p className="text-slate-300 text-[11px] mt-1">
                    {recommendation.authority?.pio?.email}
                  </p>
                  <p className="text-slate-400 text-[11px] line-clamp-2 mt-0.5">
                    {recommendation.authority?.pio?.address}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1 font-semibold uppercase text-[10px] tracking-wider">
                    First Appellate Authority (FAA):
                  </span>
                  <p className="font-semibold text-white">
                    {recommendation.authority?.firstAppellateAuthority?.name || 'Joint Secretary & FAA'}
                  </p>
                  <p className="text-slate-400">
                    {recommendation.authority?.firstAppellateAuthority?.designation || 'Appellate Body'}
                  </p>
                  <p className="text-slate-300 text-[11px] mt-1">
                    {recommendation.authority?.firstAppellateAuthority?.email || 'faa@gov.in'}
                  </p>
                </div>
              </div>

              {/* Rationale */}
              <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800/80 text-xs">
                <span className="text-cyan-300 font-semibold block mb-0.5">Jurisdiction Rationale:</span>
                <p className="text-slate-400 leading-relaxed">{recommendation.rationale}</p>
              </div>
            </div>

            {/* Filing Channel Grid */}
            <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-cyan-400" />
                <span>Recommended Filing Channel & Statutory Window</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Primary Route:</span>
                  <span className="font-bold text-white text-sm">
                    {recommendation.filingChannel?.type}
                  </span>
                  {recommendation.filingChannel?.portalUrl && (
                    <a
                      href={recommendation.filingChannel.portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 mt-1 text-[11px]"
                    >
                      <span>{recommendation.filingChannel.portalName}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Application Fee:</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    ₹{recommendation.filingChannel?.fee}
                  </span>
                  <span className="text-slate-400 text-[11px] block mt-1">
                    Modes: {recommendation.filingChannel?.paymentModes?.join(', ')}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Statutory Response Clock:</span>
                  <span className="font-bold text-amber-400 text-sm flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    30 Calendar Days
                  </span>
                  <span className="text-slate-400 text-[11px] block mt-1">
                    Under RTI Act Sec 7(1)
                  </span>
                </div>
              </div>
            </div>

            {/* Disclaimer Callout (Essential Requirement) */}
            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/60 text-xs text-amber-200/90 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300 block mb-0.5">Disclaimer:</span>
                <p className="leading-relaxed">
                  {recommendation.disclaimer ||
                    'This recommendation is an automated administrative suggestion based on keyword patterns and public authority records. It does not constitute formal legal advice. Please verify the designated Public Information Officer (CPIO) and departmental roster on the official portal prior to paying fees.'}
                </p>
              </div>
            </div>

            {/* Stepper Navigation Buttons */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Edit RTI Text</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmAuthority}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-700/30 transition transform active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Authority & Proceed to Filing</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
