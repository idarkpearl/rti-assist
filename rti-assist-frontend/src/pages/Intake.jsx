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
    <div className="max-w-4xl mx-auto space-y-8 pb-16 font-sans">
      {/* Stepper Progress Indicator */}
      <div className="bg-[var(--card)] border-2 border-[var(--border)] p-4 sm:p-6 shadow-[4px_4px_0px_0px_var(--shadow-color)]">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: 'Plain Language Issue' },
            { num: 2, label: 'AI RTI Formulation' },
            { num: 3, label: 'Authority & Channel' },
          ].map((s, idx) => (
            <div key={s.num} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 border-2 border-[var(--border)] flex items-center justify-center font-black text-sm transition-all shadow-[2px_2px_0px_0px_var(--shadow-color)] ${
                    step === s.num
                      ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                      : step > s.num
                      ? 'bg-[var(--secondary)] text-[var(--secondary-foreground)]'
                      : 'bg-[var(--background)] text-[var(--muted-foreground)]'
                  }`}
                >
                  {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
                </div>
                <div className="hidden sm:block">
                  <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
                    Step 0{s.num}
                  </p>
                  <p
                    className={`text-xs font-bold ${
                      step === s.num ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'
                    }`}
                  >
                    {s.label}
                  </p>
                </div>
              </div>

              {idx < 2 && (
                <div className="flex-1 mx-3 sm:mx-6 h-1 bg-[var(--background)] border border-[var(--border)] relative">
                  <div
                    className={`h-full bg-[var(--primary)] transition-all duration-300 ${
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
        <div className="p-4 border-2 border-[var(--border)] bg-rose-50 text-rose-900 text-xs font-bold flex items-center gap-2 shadow-[3px_3px_0px_0px_var(--shadow-color)]">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ========================================================
          STEP 1: Plain Language Issue Description
         ======================================================== */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="bg-[var(--card)] border-2 border-[var(--border)] p-6 sm:p-8 space-y-6 shadow-[4px_4px_0px_0px_var(--shadow-color)]">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-bold shadow-[2px_2px_0px_0px_var(--shadow-color)] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Step 1: Intelligent Intake</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--foreground)]">
                Describe your issue in plain language
              </h1>
              <p className="text-sm text-[var(--foreground)] font-medium leading-relaxed">
                You do not need to cite legal sections or know government departments yet. Simply explain what happened, what information or records you need, or what public decision seems irregular.
              </p>
            </div>

            <div>
              <label htmlFor="issue-textarea" className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-2">
                Your Concern or Inquiry Details *
              </label>
              <textarea
                id="issue-textarea"
                rows={7}
                value={concern}
                onChange={(e) => setConcern(e.target.value)}
                placeholder="Example: I noticed that road resurfacing was done poorly on MG Road last month and it already has deep potholes. I want to see the contractor work order, how much money was paid from public funds, and who certified the inspection..."
                className="w-full p-4 border-2 border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] text-sm leading-relaxed focus:outline-none focus:bg-[var(--card)] shadow-[2px_2px_0px_0px_var(--shadow-color)] transition resize-y font-sans"
              />
              <div className="flex justify-between items-center text-[11px] font-bold text-[var(--muted-foreground)] mt-2">
                <span>Supports plain natural language inquiry</span>
                <span>{concern.length} characters</span>
              </div>
            </div>

            {/* Quick Sample Prompts */}
            <div className="space-y-2.5 pt-2">
              <span className="text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5 uppercase tracking-wide">
                <HelpCircle className="w-4 h-4 text-[var(--primary)]" />
                <span>Or load an example issue:</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {sampleConcerns.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setConcern(s.text)}
                    className="p-3 text-left border-2 border-[var(--border)] bg-[var(--background)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] shadow-[2px_2px_0px_0px_var(--shadow-color)] transition group active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
                  >
                    <p className="text-xs font-bold text-[var(--foreground)] group-hover:text-[var(--accent-foreground)]">
                      {s.title}
                    </p>
                    <p className="text-[11px] font-medium text-[var(--muted-foreground)] group-hover:text-[var(--accent-foreground)] line-clamp-2 mt-1">
                      {s.text}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t-2 border-[var(--border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--foreground)]">
                <Clock className="w-4 h-4 text-[var(--accent)]" />
                <span>AI will convert this into Section 6(1) legal format</span>
              </div>

              <button
                type="button"
                onClick={handleProceedToStep2}
                disabled={loadingDraft || !concern.trim()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-[var(--border)] text-sm font-bold text-[var(--primary-foreground)] bg-[var(--primary)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] disabled:opacity-50 disabled:cursor-not-allowed shadow-[3px_3px_0px_0px_var(--shadow-color)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
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
          <div className="bg-[var(--card)] border-2 border-[var(--border)] p-6 sm:p-8 space-y-6 shadow-[4px_4px_0px_0px_var(--shadow-color)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-bold shadow-[2px_2px_0px_0px_var(--shadow-color)] uppercase tracking-wider">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Step 2: Formal RTI Request Review</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-[var(--foreground)]">
                  AI-Suggested Structured RTI Request
                </h1>
                <p className="text-sm text-[var(--foreground)] font-medium">
                  Review and revise the draft text below. You can edit any questions, dates, or details directly in the textarea.
                </p>
              </div>

              <div className="p-2.5 border-2 border-[var(--border)] bg-[var(--background)] text-xs font-bold text-[var(--secondary)] self-start sm:self-auto flex items-center gap-2 shadow-[2px_2px_0px_0px_var(--shadow-color)]">
                <CheckCircle2 className="w-4 h-4 text-[var(--secondary)] shrink-0" />
                <span>Section 6(1) Compliant</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="draft-textarea" className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">
                  Editable RTI Application Body *
                </label>
                <span className="text-[11px] font-bold text-[var(--muted-foreground)]">
                  Feel free to customize questions before identifying authority
                </span>
              </div>

              <textarea
                id="draft-textarea"
                rows={16}
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                className="w-full p-4 border-2 border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] font-mono text-xs leading-relaxed focus:outline-none focus:bg-[var(--card)] shadow-[2px_2px_0px_0px_var(--shadow-color)] transition resize-y"
              />
            </div>

            <div className="p-4 border-2 border-[var(--border)] bg-[var(--background)] shadow-[2px_2px_0px_0px_var(--shadow-color)] space-y-1">
              <span className="font-bold text-xs uppercase tracking-wide text-[var(--primary)] block">Pro-tip under RTI Act, 2005:</span>
              <p className="text-xs font-medium text-[var(--foreground)] leading-relaxed">
                Ensure queries ask for specific certified records, work orders, inspection registers, or file notings rather than hypothetical explanations or questions starting with 'Why'.
              </p>
            </div>

            <div className="pt-4 border-t-2 border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-[var(--border)] text-xs font-bold bg-[var(--background)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] text-[var(--foreground)] shadow-[2px_2px_0px_0px_var(--shadow-color)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Issue Description</span>
              </button>

              <button
                type="button"
                onClick={handleProceedToStep3}
                disabled={loadingRecommendation || !draftText.trim()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-[var(--border)] text-sm font-bold text-[var(--primary-foreground)] bg-[var(--primary)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] disabled:opacity-50 disabled:cursor-not-allowed shadow-[3px_3px_0px_0px_var(--shadow-color)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
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
          <div className="bg-[var(--card)] border-2 border-[var(--border)] p-6 sm:p-8 space-y-6 shadow-[4px_4px_0px_0px_var(--shadow-color)]">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-bold shadow-[2px_2px_0px_0px_var(--shadow-color)] uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5" />
                <span>Step 3: Authority Recommendation</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--foreground)]">
                Recommended Public Authority & Filing Channel
              </h1>
              <p className="text-sm text-[var(--foreground)] font-medium">
                Based on your draft text, our system matched the appropriate ministry, designated CPIO, and statutory filing route.
              </p>
            </div>

            {/* Target Authority Card */}
            <div className="p-6 border-2 border-[var(--border)] bg-[var(--background)] shadow-[4px_4px_0px_0px_var(--shadow-color)] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[var(--border)] pb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)]">
                  {recommendation.authority?.level} Authority
                </span>
                <span className="text-xs text-[var(--secondary)] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Match Confidence: {Math.round(recommendation.confidenceScore * 100)}%
                </span>
              </div>

              <div>
                <h2 className="text-xl font-black text-[var(--foreground)]">
                  {recommendation.authority?.name}
                </h2>
                {recommendation.authority?.ministry && (
                  <p className="text-xs text-[var(--primary)] font-bold mt-1">
                    {recommendation.authority.ministry}
                  </p>
                )}
                {recommendation.authority?.department && (
                  <p className="text-xs text-[var(--muted-foreground)] font-semibold mt-0.5">
                    Department: {recommendation.authority.department}
                  </p>
                )}
              </div>

              {/* CPIO & Appellate Authority Details */}
              <div className="p-4 border-2 border-[var(--border)] bg-[var(--card)] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[var(--muted-foreground)] block mb-1 font-bold uppercase text-[10px] tracking-wider">
                    Designated CPIO:
                  </span>
                  <p className="font-bold text-[var(--foreground)]">
                    {recommendation.authority?.pio?.name}
                  </p>
                  <p className="text-[var(--muted-foreground)]">
                    {recommendation.authority?.pio?.designation}
                  </p>
                  <p className="text-[var(--foreground)] text-[11px] font-mono mt-1">
                    {recommendation.authority?.pio?.email}
                  </p>
                  <p className="text-[var(--muted-foreground)] text-[11px] line-clamp-2 mt-0.5">
                    {recommendation.authority?.pio?.address}
                  </p>
                </div>

                <div>
                  <span className="text-[var(--muted-foreground)] block mb-1 font-bold uppercase text-[10px] tracking-wider">
                    First Appellate Authority (FAA):
                  </span>
                  <p className="font-bold text-[var(--foreground)]">
                    {recommendation.authority?.firstAppellateAuthority?.name || 'Joint Secretary & FAA'}
                  </p>
                  <p className="text-[var(--muted-foreground)]">
                    {recommendation.authority?.firstAppellateAuthority?.designation || 'Appellate Body'}
                  </p>
                  <p className="text-[var(--foreground)] text-[11px] font-mono mt-1">
                    {recommendation.authority?.firstAppellateAuthority?.email || 'faa@gov.in'}
                  </p>
                </div>
              </div>

              {/* Rationale */}
              <div className="p-3.5 border-2 border-[var(--border)] bg-[var(--card)] text-xs">
                <span className="text-[var(--primary)] font-bold block mb-1 uppercase text-[10px] tracking-wider">Jurisdiction Rationale:</span>
                <p className="text-[var(--foreground)] font-medium leading-relaxed">{recommendation.rationale}</p>
              </div>
            </div>

            {/* Filing Channel Grid */}
            <div className="p-6 border-2 border-[var(--border)] bg-[var(--background)] shadow-[4px_4px_0px_0px_var(--shadow-color)] space-y-4">
              <h2 className="text-base font-black text-[var(--foreground)] flex items-center gap-2">
                <Send className="w-4 h-4 text-[var(--primary)]" />
                <span>Recommended Filing Channel & Statutory Window</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 border-2 border-[var(--border)] bg-[var(--card)] shadow-[2px_2px_0px_0px_var(--shadow-color)]">
                  <span className="text-[var(--muted-foreground)] font-bold block mb-1 uppercase text-[10px]">Primary Route:</span>
                  <span className="font-black text-[var(--foreground)] text-sm">
                    {recommendation.filingChannel?.type}
                  </span>
                  {recommendation.filingChannel?.portalUrl && (
                    <a
                      href={recommendation.filingChannel.portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--primary)] hover:underline inline-flex items-center gap-1 mt-1 text-[11px] font-bold"
                    >
                      <span>{recommendation.filingChannel.portalName}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="p-4 border-2 border-[var(--border)] bg-[var(--card)] shadow-[2px_2px_0px_0px_var(--shadow-color)]">
                  <span className="text-[var(--muted-foreground)] font-bold block mb-1 uppercase text-[10px]">Application Fee:</span>
                  <span className="font-black text-[var(--secondary)] text-sm">
                    ₹{recommendation.filingChannel?.fee}
                  </span>
                  <span className="text-[var(--muted-foreground)] text-[11px] font-medium block mt-1">
                    Modes: {recommendation.filingChannel?.paymentModes?.join(', ')}
                  </span>
                </div>

                <div className="p-4 border-2 border-[var(--border)] bg-[var(--card)] shadow-[2px_2px_0px_0px_var(--shadow-color)]">
                  <span className="text-[var(--muted-foreground)] font-bold block mb-1 uppercase text-[10px]">Statutory Clock:</span>
                  <span className="font-black text-[var(--accent)] text-sm flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    30 Calendar Days
                  </span>
                  <span className="text-[var(--muted-foreground)] text-[11px] font-medium block mt-1">
                    Under RTI Act Sec 7(1)
                  </span>
                </div>
              </div>
            </div>

            {/* Disclaimer Callout */}
            <div className="p-4 border-2 border-[var(--border)] bg-[var(--card)] text-xs text-[var(--foreground)] flex items-start gap-3 shadow-[2px_2px_0px_0px_var(--shadow-color)]">
              <ShieldAlert className="w-5 h-5 text-[var(--accent)] shrink-0 mt-0.5" />
              <div>
                <span className="font-black uppercase text-[10px] tracking-wide text-[var(--foreground)] block mb-0.5">Disclaimer:</span>
                <p className="leading-relaxed font-medium">
                  {recommendation.disclaimer ||
                    'This recommendation is an automated administrative suggestion based on keyword patterns and public authority records. It does not constitute formal legal advice. Please verify the designated Public Information Officer (CPIO) and departmental roster on the official portal prior to paying fees.'}
                </p>
              </div>
            </div>

            {/* Stepper Navigation Buttons */}
            <div className="pt-4 border-t-2 border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-[var(--border)] text-xs font-bold bg-[var(--background)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] text-[var(--foreground)] shadow-[2px_2px_0px_0px_var(--shadow-color)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Edit RTI Text</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmAuthority}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-[var(--border)] text-sm font-bold text-[var(--primary-foreground)] bg-[var(--primary)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] shadow-[3px_3px_0px_0px_var(--shadow-color)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
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
