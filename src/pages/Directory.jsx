import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Search,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Tag,
  CreditCard,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle,
  X,
  FileText,
  Landmark,
} from 'lucide-react';
import { api } from '../lib/api.js';

export const Directory = () => {
  const [authorities, setAuthorities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [jurisdictionFilter, setJurisdictionFilter] = useState('all'); // 'all' | 'Central' | 'Delhi NCT'

  // Fetch authorities using api.getAuthorities()
  const fetchAuthorities = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAuthorities({
        search: searchTerm.trim() || undefined,
        jurisdiction: jurisdictionFilter !== 'all' ? jurisdictionFilter : undefined,
      });
      setAuthorities(data || []);
    } catch (err) {
      console.error('Failed to load public authorities', err);
      setError('Unable to fetch authorities directory. Please verify API connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search/filter calls slightly for smooth typing
    const timer = setTimeout(() => {
      fetchAuthorities();
    }, 150);

    return () => clearTimeout(timer);
  }, [searchTerm, jurisdictionFilter]);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-xs font-semibold">
            <Landmark className="w-3.5 h-3.5 text-cyan-400" />
            <span>Section 4(1)(b) Public Authority Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Central & Delhi NCT Public Information Officers
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Search verified ministries, departments, CPIO designations, official online portals, and category jurisdictions.
          </p>
        </div>

        {/* Primary CTA: "Recommend for my request" linking to /intake */}
        <div className="shrink-0 flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2.5">
          <Link
            to="/intake"
            className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-lg shadow-cyan-600/30 transition transform active:scale-95 group"
          >
            <Sparkles className="w-4 h-4 text-cyan-200 group-hover:rotate-12 transition-transform" />
            <span>Recommend for my request</span>
            <ArrowRight className="w-4 h-4 text-cyan-200 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <span className="text-[11px] text-slate-400">
            Unsure where to file? AI will match your issue
          </span>
        </div>
      </div>

      {/* Search Input and Jurisdiction Filter (Central / Delhi NCT) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-xl shadow-md">
        {/* Search Input */}
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search authority name, topic (e.g. UGC, Toll, Land), or officer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Jurisdiction Filter: All / Central / Delhi NCT */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:inline mr-1">
            Jurisdiction:
          </span>
          {[
            { key: 'all', label: 'All Jurisdictions' },
            { key: 'Central', label: 'Central Ministries' },
            { key: 'Delhi NCT', label: 'Delhi NCT' },
          ].map((tab) => {
            const isActive = jurisdictionFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setJurisdictionFilter(tab.key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition shadow-sm ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-cyan-500/20'
                    : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700/90 hover:text-white border border-slate-700/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-400">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-sm">Fetching verified public authorities...</p>
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-center space-y-3 max-w-lg mx-auto">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <p className="text-sm text-rose-200">{error}</p>
          <button
            onClick={fetchAuthorities}
            className="px-4 py-2 bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-xs font-semibold rounded-lg transition"
          >
            Retry Fetching
          </button>
        </div>
      ) : authorities.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3 max-w-md mx-auto">
          <Building2 className="w-8 h-8 text-slate-500 mx-auto" />
          <h2 className="text-base font-bold text-white">No Public Authorities Found</h2>
          <p className="text-xs text-slate-400">
            No authorities matched "{searchTerm}" under {jurisdictionFilter} jurisdiction.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setJurisdictionFilter('all');
            }}
            className="text-xs text-cyan-400 hover:underline"
          >
            Clear Search & Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {authorities.map((auth) => (
            <div
              key={auth.id}
              className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-5 shadow-lg group"
            >
              <div className="space-y-3.5">
                {/* Jurisdiction & Portal Link Badges */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        auth.jurisdiction === 'Delhi NCT'
                          ? 'bg-purple-950/80 text-purple-300 border-purple-800/60'
                          : 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60'
                      }`}
                    >
                      {auth.jurisdiction || (auth.level === 'central' ? 'Central' : 'Delhi NCT')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {auth.code || auth.id}
                    </span>
                  </div>

                  {auth.portalUrl && (
                    <a
                      href={auth.portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-400 hover:text-cyan-400 inline-flex items-center gap-1 font-medium transition"
                      title="Open official RTI portal"
                    >
                      <span>Official Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {/* Authority Title & Ministry */}
                <div>
                  <h2 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {auth.name}
                  </h2>
                  {auth.ministry && (
                    <p className="text-xs text-cyan-400 font-medium mt-0.5">{auth.ministry}</p>
                  )}
                  {auth.department && (
                    <p className="text-xs text-slate-400 mt-0.5">Dept: {auth.department}</p>
                  )}
                </div>

                {/* Category Tags */}
                {auth.categoryTags && auth.categoryTags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    {auth.categoryTags.map((tag, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60"
                      >
                        <Tag className="w-2.5 h-2.5 text-slate-400" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* PIO Contact Card */}
                {auth.pio && (
                  <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800/80 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Designated CPIO
                      </span>
                      <span className="text-[10px] text-emerald-400 font-medium">Verified CPIO</span>
                    </div>

                    <div className="font-semibold text-white text-sm">
                      {auth.pio.name}
                    </div>
                    <div className="text-slate-400">{auth.pio.designation}</div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-slate-300">
                      {auth.pio.email && (
                        <a
                          href={`mailto:${auth.pio.email}`}
                          className="flex items-center gap-1.5 hover:text-cyan-400 transition"
                        >
                          <Mail className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{auth.pio.email}</span>
                        </a>
                      )}

                      {auth.pio.phone && (
                        <a
                          href={`tel:${auth.pio.phone}`}
                          className="flex items-center gap-1.5 hover:text-cyan-400 transition"
                        >
                          <Phone className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{auth.pio.phone}</span>
                        </a>
                      )}
                    </div>

                    {auth.pio.address && (
                      <div className="flex items-start gap-1.5 text-slate-400 pt-1 border-t border-slate-800/60">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{auth.pio.address}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Card Footer with Fee & Direct Draft Action */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Fee: ₹{auth.applicationFee || 10}</span>
                </div>

                <Link
                  to={`/intake?authorityId=${auth.id}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 transition group-hover:border-cyan-500/60"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Draft RTI to this Authority</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
