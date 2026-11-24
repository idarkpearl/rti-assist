import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Calendar,
  Building2,
  FileText,
  UploadCloud,
  Loader2,
  Clock,
  FileCheck2,
} from 'lucide-react';
import { api } from '../lib/api.js';
import { useCaseStore } from '../lib/store.js';
import { useAuth } from '../context/AuthContext.jsx';

export const AddExistingRti = () => {
  const navigate = useNavigate();
  const { addCase, authorities, setAuthorities } = useCaseStore();
  const { user } = useAuth();

  const [trackingNumber, setTrackingNumber] = useState('');
  const [filingDate, setFilingDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [authorityId, setAuthorityId] = useState('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [status, setStatus] = useState('submitted');
  const [isLifeAndLiberty, setIsLifeAndLiberty] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [verifying, setVerifying] = useState(false);
  const [verification, setVerification] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authorities || authorities.length === 0) {
      api.getAuthorities()
        .then((list) => {
          if (Array.isArray(list) && list.length > 0) {
            setAuthorities(list);
            setAuthorityId(list[0].id);
          }
        })
        .catch(() => {});
    } else if (!authorityId) {
      setAuthorityId(authorities[0].id);
    }
  }, [authorities, authorityId, setAuthorities]);

  const selectedAuthority = (authorities || []).find((a) => a.id === authorityId) || authorities?.[0];

  const handleVerify = async () => {
    setError('');
    if (!trackingNumber.trim()) {
      setError('Please enter your official RTI registration / tracking number first.');
      return;
    }

    setVerifying(true);
    try {
      const res = await api.verifyExistingRti({
        trackingNumber: trackingNumber.trim(),
        filingDate,
        authorityId,
        isLifeAndLiberty,
      });
      setVerification(res);
      if (res?.recommendedStatus && status === 'submitted') {
        setStatus(res.recommendedStatus);
      }
    } catch (err) {
      setError(err?.message || 'Unable to verify RTI details right now.');
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!trackingNumber.trim() || !title.trim() || !filingDate) {
      setError('Registration number, RTI subject/title, and filing date are required.');
      return;
    }

    setSubmitting(true);
    try {
      let currentVerification = verification;
      if (!currentVerification || currentVerification.trackingNumber !== trackingNumber.trim()) {
        currentVerification = await api.verifyExistingRti({
          trackingNumber: trackingNumber.trim(),
          filingDate,
          authorityId,
          isLifeAndLiberty,
        });
        setVerification(currentVerification);
      }

      if (!currentVerification?.valid) {
        setError(
          currentVerification?.status === 'DUPLICATE'
            ? `This RTI (${trackingNumber.trim()}) is already in your account.`
            : 'Please fix the verification issues highlighted below before saving.'
        );
        setSubmitting(false);
        return;
      }

      const filingIso = new Date(filingDate + 'T00:00:00Z').toISOString();
      let createdCase = await api.createCase({
        trackingNumber: trackingNumber.trim(),
        title: title.trim(),
        subjectCategory: selectedAuthority?.department || 'Public Administration',
        summary: summary.trim() || `Already-filed RTI (${trackingNumber.trim()}) imported and verified.`,
        description: summary.trim() || `Existing RTI application ${trackingNumber.trim()} filed on ${filingDate}.`,
        applicant: {
          fullName: user?.name || 'RTI Applicant',
          email: user?.email || 'applicant@rtiassist.local',
        },
        authorityId: selectedAuthority?.id,
        authority: selectedAuthority,
        status,
        isLifeAndLiberty,
        filingDate: filingIso,
        submissionMode: 'online_portal',
        feePaid: selectedAuthority?.applicationFee || 10,
        paymentReference: `VERIFIED-${trackingNumber.trim()}`,
        tags: ['already_filed', 'verified'],
      });

      if (selectedFile && createdCase?.id) {
        try {
          const uploadRes = await api.uploadCaseDocument(createdCase.id, selectedFile, 'acknowledgment');
          if (uploadRes?.document) {
            createdCase = {
              ...createdCase,
              documents: [...(createdCase.documents || []), uploadRes.document],
            };
          }
        } catch (uploadErr) {
          console.warn('Acknowledgment upload failed:', uploadErr);
        }
      }

      addCase(createdCase);
      navigate(`/cases/${createdCase.id}`);
    } catch (err) {
      setError(err?.message || 'Failed to add verified RTI to your dashboard.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Import & Verify Existing Filing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Add Already-Filed RTI
          </h1>
          <p className="text-sm text-slate-600">
            Already filed an RTI on <span className="font-semibold">rtionline.gov.in</span> or a state/university portal? Enter its registration number to verify its format, check for duplicates, and track its 30-day statutory deadline.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Official Registration / Tracking Number *
              </label>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => {
                    setTrackingNumber(e.target.value);
                    setVerification(null);
                  }}
                  placeholder="e.g. DSAEU/R/2026/60207 or DOEAF/R/E/26/00123"
                  className="flex-1 px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={verifying || !trackingNumber.trim()}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm disabled:opacity-50 transition cursor-pointer shrink-0"
                >
                  {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>Verify RTI</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                <span className="inline-flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Date of Filing *</span>
              </label>
              <input
                type="date"
                value={filingDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  setFilingDate(e.target.value);
                  setVerification(null);
                }}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Current RTI Stage
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="submitted">Filed / Submitted (Sec 6(1))</option>
                <option value="response_due">Response Due / Overdue (Sec 7(1))</option>
                <option value="pio_replied">PIO Replied</option>
                <option value="first_appeal_pending">First Appeal Pending (Sec 19(1))</option>
                <option value="second_appeal_pending">Second Appeal Pending (Sec 19(3))</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                <span className="inline-flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> Public Authority / Department</span>
              </label>
              <select
                value={authorityId}
                onChange={(e) => {
                  setAuthorityId(e.target.value);
                  setVerification(null);
                }}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-500"
              >
                {(authorities || []).map((auth) => (
                  <option key={auth.id} value={auth.id}>
                    {auth.name} {auth.ministry ? `(${auth.ministry})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                <span className="inline-flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> RTI Subject / Title *</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Utilization of DSEU College Funds 2025-26"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Summary / Information Requested (Optional)
              </label>
              <textarea
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Paste your filed RTI queries or a brief summary for tracking & future appeal drafting..."
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-2.5">
              <input
                id="life-liberty"
                type="checkbox"
                checked={isLifeAndLiberty}
                onChange={(e) => {
                  setIsLifeAndLiberty(e.target.checked);
                  setVerification(null);
                }}
                className="w-4 h-4 rounded border-slate-300 text-blue-600"
              />
              <label htmlFor="life-liberty" className="text-sm font-medium text-slate-700">
                Urgent Life &amp; Liberty matter (48-hour statutory deadline under Sec 7(1) Proviso)
              </label>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Acknowledgment Receipt / Filed PDF (Optional)
              </label>
              <label className="flex items-center justify-center gap-2 px-4 py-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50 cursor-pointer text-sm font-medium text-slate-600 transition">
                <UploadCloud className="w-4 h-4 text-blue-600" />
                <span>{selectedFile ? selectedFile.name : 'Upload RTI acknowledgment PDF or screenshot'}</span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {verification && (
            <div
              className={`p-4 rounded-xl border-2 space-y-3 ${
                verification.valid
                  ? 'bg-emerald-50/70 border-emerald-200'
                  : 'bg-rose-50/70 border-rose-200'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {verification.valid ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600" />
                  )}
                  <span className="font-bold text-sm text-slate-900">
                    Verification Result: {verification.status}
                  </span>
                </div>
                {verification.portalType && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700">
                    {verification.portalType}
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                {(verification.checks || []).map((chk, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs">
                    {chk.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-bold text-slate-800">{chk.name}: </span>
                      <span className="text-slate-600">{chk.detail}</span>
                    </div>
                  </div>
                ))}
              </div>

              {verification.dueDate && (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/70 text-xs text-slate-700">
                  <span className="inline-flex items-center gap-1.5 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    {verification.isOverdue
                      ? `Statutory deadline passed (${Math.abs(verification.daysRemaining)} day(s) overdue — eligible for First Appeal)`
                      : `${verification.daysRemaining} day(s) remaining until statutory deadline`}
                  </span>
                  {verification.officialVerifyUrl && (
                    <a
                      href={verification.officialVerifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-blue-600 hover:underline"
                    >
                      <span>Cross-check on Official Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              to="/dashboard"
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm disabled:opacity-50 transition cursor-pointer"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck2 className="w-4 h-4" />}
              <span>{verification?.valid ? 'Add Verified RTI to Dashboard' : 'Verify & Add RTI'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExistingRti;
