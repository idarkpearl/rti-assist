import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  Loader2,
  Scale,
  Check,
  FileCheck2,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { api } from '../lib/api.js';
import { useCaseStore } from '../lib/store.js';

export const ResponseClassification = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cases: storedCases, updateCase: updateStoreCase } = useCaseStore();

  const [caseItem, setCaseItem] = useState(null);
  const [loadingCase, setLoadingCase] = useState(true);

  // Form State
  const [responseText, setResponseText] = useState('');
  const [loadingClassification, setLoadingClassification] = useState(false);
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Result State
  const [result, setResult] = useState(null);

  // Realistic sample government replies for quick testing
  const sampleResponses = [
    {
      title: 'Section 8(1)(j) Privacy Denial',
      text: 'With reference to your RTI query regarding selection committee minutes and score sheets, disclosure is hereby denied as it contains personal information of individuals exempted under Section 8(1)(j) of the RTI Act, 2005. No larger public interest is warranted.',
    },
    {
      title: 'Denial Without Section Cited',
      text: 'Your application dated 14th August 2026 has been reviewed by the competent authority. Regret to inform you that the requested documents cannot be provided under administrative policy and departmental circulars.',
    },
    {
      title: 'Transferred under Section 6(3)',
      text: 'The subject matter of your RTI inquiry does not pertain to this department. The application is therefore transferred to Directorate of Education under Section 6(3) of RTI Act, 2005 for further necessary action.',
    },
    {
      title: 'Evasive / Voluminous Records',
      text: 'The information sought by the applicant is spread across 45 branch offices and is voluminous. Compilation of the same would disproportionately divert public resources under Section 7(9). Hence information is not compiled.',
    },
    {
      title: 'Information Enclosed in Full',
      text: 'In reference to your application under Section 6(1), point-wise certified copies of sanctioned faculty roaster positions and lottery admission lists are enclosed herewith (Pages 1 to 14).',
    },
  ];

  // Load Case Details
  useEffect(() => {
    let isMounted = true;

    const fetchCase = async () => {
      setLoadingCase(true);
      try {
        const data = await api.getCase(id);
        if (isMounted && data) {
          setCaseItem(data);
          if (data.responseClassification) {
            setResult(data.responseClassification);
          }
        }
      } catch (err) {
        console.warn('api.getCase failed, trying stored cases:', err);
        const fallback = storedCases.find((c) => c.id === id);
        if (isMounted && fallback) {
          setCaseItem(fallback);
          if (fallback.responseClassification) {
            setResult(fallback.responseClassification);
          }
        }
      } finally {
        if (isMounted) setLoadingCase(false);
      }
    };

    fetchCase();
    return () => {
      isMounted = false;
    };
  }, [id, storedCases]);

  // Handle Classification Submission
  const handleClassify = async (e) => {
    if (e) e.preventDefault();
    if (!responseText.trim()) {
      setError('Please enter or paste the official response received from the authority.');
      return;
    }

    if (responseText.trim().length > 5000) {
      setError('Response text cannot exceed 5,000 characters.');
      return;
    }

    setError('');
    setLoadingClassification(true);
    setSaveSuccess(false);

    try {
      const requestContext = {
        originalRequestText: Array.isArray(caseItem?.queries)
          ? caseItem.queries.join('\n')
          : caseItem?.description || caseItem?.title || '',
        filingDate: caseItem?.filingDate || '',
        authorityName: caseItem?.authority?.name || caseItem?.authorityName || '',
      };

      const classification = await api.classifyResponse(responseText.trim(), requestContext);
      setResult(classification);

      // Persist to backend and local store
      await api.saveResponseClassification(id, classification);
      updateStoreCase(id, {
        responseClassification: classification,
        lastResponseStatus: classification.status,
        pioResponseSummary: classification.reason,
        pioResponseDate: new Date().toISOString(),
        status: classification.status === 'DENIED' || classification.status === 'EVASIVE_VAGUE'
          ? 'pio_replied'
          : caseItem?.status || 'pio_replied',
      });

      setSaveSuccess(true);
    } catch (err) {
      console.error('Classification error:', err);
      setError(err?.message || 'Unable to evaluate response at this moment. Please check the network.');
    } finally {
      setLoadingClassification(false);
    }
  };

  // Status Styling Configuration (Clean institutional civic theme)
  const getStatusConfig = (status) => {
    switch (status) {
      case 'DENIED':
        return {
          bannerBg: 'bg-rose-50 border-2 border-rose-300 text-rose-950',
          badgeClass: 'bg-rose-100 text-rose-800 border border-rose-300',
          dotColor: 'bg-rose-600',
          label: 'Disclosure Denied / Refused',
          icon: AlertTriangle,
        };
      case 'EVASIVE_VAGUE':
        return {
          bannerBg: 'bg-orange-50 border-2 border-orange-300 text-orange-950',
          badgeClass: 'bg-orange-100 text-orange-800 border border-orange-300',
          dotColor: 'bg-orange-600',
          label: 'Evasive / Non-Substantive Reply',
          icon: AlertTriangle,
        };
      case 'PARTIALLY_ANSWERED':
        return {
          bannerBg: 'bg-amber-50 border-2 border-amber-300 text-amber-950',
          badgeClass: 'bg-amber-100 text-amber-850 border border-amber-300',
          dotColor: 'bg-amber-600',
          label: 'Partially Answered',
          icon: Clock,
        };
      case 'TRANSFERRED':
        return {
          bannerBg: 'bg-sky-50 border-2 border-sky-300 text-sky-950',
          badgeClass: 'bg-sky-100 text-sky-800 border border-sky-300',
          dotColor: 'bg-sky-600',
          label: 'Transferred to Other Authority (Sec 6(3))',
          icon: Building2,
        };
      case 'FULLY_ANSWERED':
        return {
          bannerBg: 'bg-emerald-50 border-2 border-emerald-300 text-emerald-950',
          badgeClass: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
          dotColor: 'bg-emerald-600',
          label: 'Information Fully Furnished',
          icon: CheckCircle2,
        };
      default:
        return {
          bannerBg: 'bg-slate-50 border-2 border-slate-300 text-slate-900',
          badgeClass: 'bg-slate-100 text-slate-800 border border-slate-300',
          dotColor: 'bg-slate-600',
          label: status || 'Under Evaluation',
          icon: Scale,
        };
    }
  };

  if (loadingCase) {
    return (
      <div className="py-24 text-center space-y-4 max-w-4xl mx-auto">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading case records...</p>
      </div>
    );
  }

  const isAppealRecommended =
    result?.suggestedNextStep &&
    result.suggestedNextStep.toLowerCase().includes('appeal');

  const statusConfig = result ? getStatusConfig(result.status) : null;
  const StatusIcon = statusConfig?.icon || Scale;

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto font-sans">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          to={`/cases/${id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 mb-3 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Case Detail</span>
        </Link>

        {/* Case Context Header Card */}
        <div className="p-6 sm:p-7 rounded-2xl bg-white border-2 border-slate-200 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg border-2 border-blue-200">
                {caseItem?.trackingNumber || id}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                &bull; {caseItem?.authority?.name || 'Public Authority'}
              </span>
            </div>

            <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-300">
              Statutory Response Evaluation
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Review Government RTI Response
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
            Paste the communication, letter text, or status remarks furnished by the Public Information Officer (PIO). The system assesses whether statutory exemptions were lawfully cited under Section 8(1) and guides you on appellate remedies.
          </p>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white border-2 border-slate-200 shadow-sm space-y-6">
        {/* Sample Reply Quick Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-750 flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Select Sample Response (For Testing):</span>
            </span>
            <span className="text-slate-400 text-[11px]">Click to auto-populate</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sampleResponses.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setResponseText(sample.text);
                  setError('');
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold transition"
              >
                {sample.title}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleClassify} className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="responseText" className="font-bold text-slate-900">
                Official Response Text <span className="text-rose-500">*</span>
              </label>
              <span className="text-slate-500 font-mono text-[11px]">
                {responseText.length} / 5,000 characters
              </span>
            </div>

            <textarea
              id="responseText"
              rows={6}
              value={responseText}
              onChange={(e) => {
                setResponseText(e.target.value);
                if (error) setError('');
              }}
              placeholder="Paste the written reply, email response, or portal remarks received from the PIO..."
              className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-300 focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600 text-slate-900 text-xs sm:text-sm font-sans placeholder:text-slate-400 leading-relaxed transition shadow-inner resize-y"
            />
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="submit"
              disabled={loadingClassification || !responseText.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loadingClassification ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Evaluating Response...</span>
                </>
              ) : (
                <>
                  <Scale className="w-4 h-4" />
                  <span>Evaluate Response</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>

            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>Assessment recorded on case record</span>
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Assessment Result Card */}
      {result && (
        <div className="p-6 sm:p-7 rounded-2xl bg-white border-2 border-slate-200 shadow-sm space-y-6">
          {/* Header Banner */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${statusConfig.bannerBg}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/80 shrink-0 shadow-2xs">
                <StatusIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
                  Statutory Finding
                </span>
                <span className="text-sm sm:text-base font-bold">
                  {statusConfig.label}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-full ${statusConfig.badgeClass}`}>
                Code: {result.status}
              </span>
            </div>
          </div>

          {/* Section Cited Inspection Row */}
          <div className="p-4 rounded-xl bg-slate-50 border-2 border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">
                Exemption Section Cited:
              </span>
              <span className="font-mono font-bold text-slate-900 px-2.5 py-0.5 rounded bg-white border border-slate-300">
                {result.sectionCited ? `Section ${result.sectionCited}` : 'Not cited in reply'}
              </span>
            </div>

            {/* Legal Warning Notice if Denied without Section */}
            {!result.sectionCited && result.status === 'DENIED' && (
              <div className="mt-2.5 p-3 rounded-lg bg-amber-50 border border-amber-300 text-amber-950 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Procedural Defect:</strong> Under the RTI Act, 2005, any denial of information is legally required to cite a specific exemption under Section 8(1). Rejection on general departmental grounds is unlawful and provides strong merit for a First Appeal.
                </div>
              </div>
            )}
          </div>

          {/* Evaluation Reason */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Legal Summary & Reason
            </h3>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-xl border-2 border-slate-200 font-medium">
              {result.reason}
            </p>
          </div>

          {/* Recommended Statutory Next Step */}
          <div className="p-5 rounded-xl bg-blue-50/70 border-2 border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                Recommended Action
              </span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {result.suggestedNextStep}
              </p>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                Remedy prescribed under Section 19(1) of the Right to Information Act, 2005.
              </p>
            </div>

            {isAppealRecommended && (
              <button
                type="button"
                onClick={() => navigate(`/appeals/${id}`)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm shrink-0 cursor-pointer"
              >
                <span>Draft First Appeal</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Institutional Disclaimer */}
          <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{result.disclaimer || 'Statutory analysis advisory. Please verify details before filing an appeal.'}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponseClassification;
