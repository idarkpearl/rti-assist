import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  ExternalLink,
  Calendar,
  FileCheck2,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ArrowLeft,
  Clock,
  ShieldCheck,
  CreditCard,
  Loader2,
  FileText,
} from 'lucide-react';
import { api } from '../lib/api.js';
import { useCaseStore } from '../lib/store.js';

export const CaseFiling = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addCase, authorities } = useCaseStore();

  // Load state from navigation or sessionStorage
  const [sessionData] = useState(() => {
    if (location.state && location.state.authority) {
      return location.state;
    }
    try {
      const stored = sessionStorage.getItem('pending_rti_filing');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return null;
  });

  // Authority and draft text
  const authority = sessionData?.authority || authorities[0] || {
    id: 'auth-1',
    name: 'Department of Higher Education',
    ministry: 'Ministry of Education',
    portalUrl: 'https://rtionline.gov.in',
    applicationFee: 10,
    pio: { name: 'CPIO', designation: 'Director & CPIO' },
  };

  const draftText = sessionData?.draftText || '';
  const concern = sessionData?.concern || 'Public Inquiry';

  // Form inputs
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [filingDate, setFilingDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [authorityConfirmed, setAuthorityConfirmed] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [applicantName, setApplicantName] = useState(sessionData?.applicant?.fullName || '');
  const [applicantEmail, setApplicantEmail] = useState(sessionData?.applicant?.email || '');

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formError, setFormError] = useState('');

  const handleCopyDraft = () => {
    if (!draftText) return;
    navigator.clipboard.writeText(draftText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!registrationNumber.trim()) {
      setFormError('Please enter the official RTI registration/acknowledgment number.');
      return;
    }

    if (!filingDate) {
      setFormError('Please select the date on which you filed the application.');
      return;
    }

    if (!authorityConfirmed) {
      setFormError('Please confirm that you filed this application with the specified authority.');
      return;
    }

    setSubmitting(true);

    try {
      const newCaseId = `case-${Date.now().toString().slice(-4)}`;
      const filingIso = new Date(filingDate).toISOString();

      // Build document array if user uploaded an acknowledgment file
      const documents = selectedFile
        ? [
            {
              id: `doc-${Date.now()}`,
              caseId: newCaseId,
              fileName: selectedFile.name,
              fileSize: selectedFile.size,
              mimeType: selectedFile.type || 'application/pdf',
              fileUrl: '#',
              category: 'acknowledgment',
              uploadedAt: new Date().toISOString(),
            },
          ]
        : [];

      // Call api.createCase() as requested
      const createdCase = await api.createCase({
        id: newCaseId,
        trackingNumber: registrationNumber.trim(),
        title: concern.slice(0, 80) || 'RTI Application',
        subjectCategory: authority?.department || 'Public Administration',
        summary: concern.slice(0, 160) || 'RTI application submitted on government portal.',
        description: draftText,
        queries: [
          'Certified copies of official file notings and sanction order.',
          'Statement of funds allocated, disbursed, and unutilized balances.',
          'Inspection logs, compliance reports, and complaint registers.',
          'Designation of officers responsible for execution and delay resolution.',
        ],
        applicant: {
          fullName: applicantName.trim() || 'RTI Applicant',
          email: applicantEmail.trim() || 'applicant@example.com',
        },
        authorityId: authority.id,
        authority: authority,
        status: 'submitted',
        isLifeAndLiberty: false,
        filingDate: filingIso,
        submissionMode: 'online_portal',
        feePaid: authority.applicationFee || 10,
        paymentReference: `REG-${registrationNumber.trim()}`,
        documents,
      });

      // Update store so dashboard & cache reflect the case immediately
      addCase(createdCase);

      // Clean up session storage
      try {
        sessionStorage.removeItem('pending_rti_filing');
      } catch (err) {
        // ignore
      }

      // Navigate to /cases/:id with the returned case id
      const targetId = createdCase?.id || newCaseId;
      navigate(`/cases/${targetId}`);
    } catch (err) {
      console.error('Failed to create case', err);
      setFormError(err?.message || 'Unable to register case. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const portalLink = authority?.portalUrl || 'https://rtionline.gov.in';
  const portalHostname = (() => {
    try {
      return new URL(portalLink).hostname;
    } catch {
      return 'official portal';
    }
  })();

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Breadcrumb & Navigation */}
      <div>
        <Link
          to="/intake"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-400 mb-3 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Intake Wizard</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Complete Official RTI Filing
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Record your portal acknowledgment to activate automatic 30-day statutory deadline tracking.
        </p>
      </div>

      {/* Recommended Authority Card with Official Portal Link (opens in new tab) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              Recommended Public Authority
            </span>
            <h2 className="text-xl font-bold text-white mt-1">
              {authority?.name}
            </h2>
            {authority?.ministry && (
              <p className="text-xs text-cyan-400 font-medium">
                {authority.ministry}
              </p>
            )}
            {authority?.department && (
              <p className="text-xs text-slate-400">
                Department: {authority.department}
              </p>
            )}
          </div>

          {/* Official Portal Link (opens in new tab) */}
          <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
            <a
              href={portalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-md shadow-cyan-400/20 transition transform active:scale-95"
            >
              <span>Open Official Portal</span>
              <ExternalLink className="w-4 h-4" />
            </a>
            <span className="text-[11px] text-slate-400">
              Opens {portalHostname} in a new tab
            </span>
          </div>
        </div>

        {/* Quick Copy Draft Assistant */}
        {draftText && (
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Copy your formatted RTI application to paste into the official portal:</span>
            </div>
            <button
              type="button"
              onClick={handleCopyDraft}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Application Text'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Mandatory Instruction Block */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 border border-cyan-800/50 shadow-lg space-y-3">
        <div className="flex items-center gap-2.5 text-cyan-300">
          <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
          <h3 className="text-base font-bold tracking-tight">
            File and pay on the official portal, then return here to record your details
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
            <span className="font-bold text-cyan-400 block mb-1">1. Open Official Portal</span>
            Click the portal button above to open the government website ({authority.name}) in a new tab.
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
            <span className="font-bold text-cyan-400 block mb-1">2. Submit & Pay Fee</span>
            Paste your questions, pay the ₹10 statutory fee, and receive your official registration number.
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
            <span className="font-bold text-cyan-400 block mb-1">3. Record Details Below</span>
            Input your registration number below to start statutory 30-day monitoring and appeal readiness.
          </div>
        </div>
      </div>

      {/* Form to Capture Details */}
      <form onSubmit={handleSubmit} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-cyan-400" />
            <span>Record Filing Particulars</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Fill in the registration details from your government portal receipt.
          </p>
        </div>

        {formError && (
          <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{formError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Registration Number */}
          <div className="space-y-1.5">
            <label htmlFor="reg-number" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Registration Number *
            </label>
            <input
              id="reg-number"
              type="text"
              required
              placeholder="e.g. DOHED/R/2026/60124 or RTI-2026-0042"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
            />
            <span className="text-[11px] text-slate-400 block">
              Found on your portal acknowledgment slip or SMS/email confirmation.
            </span>
          </div>

          {/* Filing Date */}
          <div className="space-y-1.5">
            <label htmlFor="filing-date" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Filing Date *
            </label>
            <div className="relative">
              <input
                id="filing-date"
                type="date"
                required
                value={filingDate}
                onChange={(e) => setFilingDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
              />
            </div>
            <span className="text-[11px] text-slate-400 block">
              The date the fee was paid and application registered.
            </span>
          </div>
        </div>

        {/* Optional Applicant Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
          <div className="space-y-1.5">
            <label htmlFor="app-name" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Applicant Full Name (Optional)
            </label>
            <input
              id="app-name"
              type="text"
              placeholder="e.g. Vikramaditya Roy"
              value={applicantName}
              onChange={(e) => setApplicantName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="app-email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Applicant Email (Optional)
            </label>
            <input
              id="app-email"
              type="email"
              placeholder="e.g. vikram.roy@example.com"
              value={applicantEmail}
              onChange={(e) => setApplicantEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>
        </div>

        {/* Optional File Input for Acknowledgment */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Upload Acknowledgment Receipt / Challan (Optional)
          </label>
          <div className="relative border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-xl p-5 text-center transition bg-slate-950/60 group">
            <input
              type="file"
              id="ack-file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center space-y-1.5 pointer-events-none">
              <UploadCloud className="w-7 h-7 text-slate-400 group-hover:text-cyan-400 transition-colors" />
              {selectedFile ? (
                <div className="text-xs">
                  <p className="font-semibold text-emerald-400">{selectedFile.name}</p>
                  <p className="text-[11px] text-slate-400">
                    {(selectedFile.size / 1024).toFixed(1)} KB — Click to change file
                  </p>
                </div>
              ) : (
                <div className="text-xs">
                  <span className="font-semibold text-cyan-400">Choose a file</span>{' '}
                  <span className="text-slate-400">or drag and drop</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    PDF, PNG, JPG up to 10MB
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Authority Confirmed Checkbox */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 flex items-start gap-3">
          <input
            type="checkbox"
            id="auth-confirmed"
            required
            checked={authorityConfirmed}
            onChange={(e) => setAuthorityConfirmed(e.target.checked)}
            className="mt-1 w-4 h-4 rounded text-cyan-600 bg-slate-900 border-slate-600 focus:ring-cyan-500 cursor-pointer"
          />
          <label htmlFor="auth-confirmed" className="cursor-pointer text-xs leading-relaxed text-slate-300">
            <span className="font-bold text-white block">
              Authority Confirmed *
            </span>
            I confirm that I have submitted and paid the RTI application with{' '}
            <strong className="text-cyan-300">{authority.name}</strong> on their official portal, and the registration number entered above is accurate.
          </label>
        </div>

        {/* Action Button: Calls api.createCase() and navigates to /cases/:id */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>30-Day Response Timer will start from {filingDate}</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 shadow-lg shadow-emerald-700/30 transition transform active:scale-95"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Recording Application...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Track Case</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
