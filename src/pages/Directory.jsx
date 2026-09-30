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
    <div className="space-y-8 pb-16 font-sans">
      {/* Top Banner & Header matching Navbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-2 border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 shadow-[6px_6px_0px_0px_var(--shadow-color)]">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-bold shadow-[2px_2px_0px_0px_var(--shadow-color)] uppercase tracking-wider">
            <Landmark className="w-3.5 h-3.5" />
            <span>Section 4(1)(b) Public Authority Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--foreground)] tracking-tight">
            Central & Delhi NCT Public Information Officers
          </h1>
          <p className="text-sm text-[var(--foreground)] font-medium leading-relaxed">
            Search verified ministries, departments, CPIO designations, official online portals, and category jurisdictions.
          </p>
        </div>

        {/* Primary CTA: "Recommend for my request" linking to /intake */}
        <div className="shrink-0 flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2.5">
          <Link
            to="/intake"
            className="inline-flex items-center gap-2.5 px-6 py-3 border-2 border-[var(--border)] text-sm font-bold text-[var(--primary-foreground)] bg-[var(--primary)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] shadow-[4px_4px_0px_0px_var(--shadow-color)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all group"
          >
            <Sparkles className="w-4 h-4 transition-transform group-hover:rotate-12" />
            <span>Recommend for my request</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <span className="text-[11px] font-bold text-[var(--muted-foreground)]">
            Unsure where to file? AI will match your issue
          </span>
        </div>
      </div>

      {/* Search Input and Jurisdiction Filter (Central / Delhi NCT) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-2 border-[var(--border)] bg-[var(--background)] p-4 shadow-[4px_4px_0px_0px_var(--shadow-color)]">
        {/* Search Input */}
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Search authority name, topic (e.g. UGC, Toll, Land), or officer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-[var(--card)] border-2 border-[var(--border)] text-xs sm:text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] font-medium focus:outline-none shadow-[2px_2px_0px_0px_var(--shadow-color)] transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Jurisdiction Filter: All / Central / Delhi NCT */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider hidden lg:inline mr-1">
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
                className={`px-3.5 py-2 border-2 border-[var(--border)] text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[2px_2px_0px_0px_var(--shadow-color)]'
                    : 'bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]'
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
        <div className="py-20 flex flex-col items-center justify-center space-y-3 text-[var(--muted-foreground)]">
          <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
          <p className="text-sm font-bold">Fetching verified public authorities...</p>
        </div>
      ) : error ? (
        <div className="p-8 border-2 border-[var(--border)] bg-rose-50 text-center space-y-3 max-w-lg mx-auto shadow-[4px_4px_0px_0px_var(--shadow-color)]">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
          <p className="text-sm font-bold text-rose-900">{error}</p>
          <button
            onClick={fetchAuthorities}
            className="px-4 py-2 border-2 border-[var(--border)] bg-[var(--background)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] text-xs font-bold transition shadow-[2px_2px_0px_0px_var(--shadow-color)]"
          >
            Retry Fetching
          </button>
        </div>
      ) : authorities.length === 0 ? (
        <div className="p-12 text-center border-2 border-[var(--border)] bg-[var(--card)] shadow-[4px_4px_0px_0px_var(--shadow-color)] space-y-3 max-w-md mx-auto">
          <Building2 className="w-8 h-8 text-[var(--muted-foreground)] mx-auto" />
          <h2 className="text-base font-black text-[var(--foreground)]">No Public Authorities Found</h2>
          <p className="text-xs font-medium text-[var(--muted-foreground)]">
            No authorities matched "{searchTerm}" under {jurisdictionFilter} jurisdiction.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setJurisdictionFilter('all');
            }}
            className="text-xs font-bold text-[var(--primary)] hover:underline cursor-pointer"
          >
            Clear Search & Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {authorities.map((auth) => (
            <div
              key={auth.id}
              className="p-6 border-2 border-[var(--border)] bg-[var(--card)] shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-all flex flex-col justify-between space-y-5 group"
            >
              <div className="space-y-3.5">
                {/* Jurisdiction & Portal Link Badges */}
                <div className="flex items-center justify-between gap-2 border-b-2 border-[var(--border)] pb-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border border-[var(--border)] ${
                        auth.jurisdiction === 'Delhi NCT'
                          ? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
                          : 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                      }`}
                    >
                      {auth.jurisdiction || (auth.level === 'central' ? 'Central' : 'Delhi NCT')}
                    </span>
                    <span className="text-[10px] text-[var(--muted-foreground)] font-mono font-bold">
                      {auth.code || auth.id}
                    </span>
                  </div>

                  {auth.portalUrl && (
                    <a
                      href={auth.portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-[var(--foreground)] hover:text-[var(--primary)] inline-flex items-center gap-1 transition"
                      title="Open official RTI portal"
                    >
                      <span>Official Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {/* Authority Title & Ministry */}
                <div>
                  <h2 className="text-lg font-black text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                    {auth.name}
                  </h2>
                  {auth.ministry && (
                    <p className="text-xs text-[var(--primary)] font-bold mt-0.5">{auth.ministry}</p>
                  )}
                  {auth.department && (
                    <p className="text-xs text-[var(--muted-foreground)] font-medium mt-0.5">Dept: {auth.department}</p>
                  )}
                </div>

                {/* Category Tags */}
                {auth.categoryTags && auth.categoryTags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    {auth.categoryTags.map((tag, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
                      >
                        <Tag className="w-2.5 h-2.5 text-[var(--muted-foreground)]" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* PIO Contact Card */}
                {auth.pio && (
                  <div className="p-4 border-2 border-[var(--border)] bg-[var(--background)] text-xs space-y-2 shadow-[2px_2px_0px_0px_var(--shadow-color)]">
                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                        Designated CPIO
                      </span>
                      <span className="text-[10px] text-[var(--secondary)] font-bold">Verified CPIO</span>
                    </div>

                    <div className="font-bold text-[var(--foreground)] text-sm">
                      {auth.pio.name}
                    </div>
                    <div className="text-[var(--muted-foreground)] font-medium">{auth.pio.designation}</div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-[var(--foreground)]">
                      {auth.pio.email && (
                        <a
                          href={`mailto:${auth.pio.email}`}
                          className="flex items-center gap-1.5 hover:text-[var(--primary)] transition font-mono"
                        >
                          <Mail className="w-3.5 h-3.5 text-[var(--primary)]" />
                          <span>{auth.pio.email}</span>
                        </a>
                      )}

                      {auth.pio.phone && (
                        <a
                          href={`tel:${auth.pio.phone}`}
                          className="flex items-center gap-1.5 hover:text-[var(--primary)] transition font-mono"
                        >
                          <Phone className="w-3.5 h-3.5 text-[var(--primary)]" />
                          <span>{auth.pio.phone}</span>
                        </a>
                      )}
                    </div>

                    {auth.pio.address && (
                      <div className="flex items-start gap-1.5 text-[var(--muted-foreground)] pt-1 border-t border-[var(--border)] font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[var(--muted-foreground)] shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{auth.pio.address}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Card Footer with Fee & Direct Draft Action */}
              <div className="pt-3 border-t-2 border-[var(--border)] flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--foreground)]">
                  <CreditCard className="w-3.5 h-3.5 text-[var(--secondary)]" />
                  <span>Fee: ₹{auth.applicationFee || 10}</span>
                </div>

                <Link
                  to={`/intake?authorityId=${auth.id}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border-2 border-[var(--border)] text-xs font-bold bg-[var(--background)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] text-[var(--foreground)] shadow-[2px_2px_0px_0px_var(--shadow-color)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition"
                >
                  <FileText className="w-3.5 h-3.5 text-[var(--primary)]" />
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
