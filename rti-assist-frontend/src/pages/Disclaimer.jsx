import { AlertTriangle, Scale, ShieldAlert, Building2, HelpCircle, FileCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Disclaimer = () => {
  return (
    <div className="space-y-10 py-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b-2 border-[var(--border)] pb-6 space-y-3">
        <span className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[var(--border)] bg-[var(--chart-1)] text-white text-xs font-black shadow-[2px_2px_0px_0px_var(--shadow-color)] uppercase tracking-wider">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Legal & Statutory Notice</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[var(--foreground)] tracking-tight">
          Disclaimer & Non-Affiliation Notice
        </h1>
        <p className="text-xs sm:text-sm text-[var(--muted-foreground)] font-medium">
          Last Updated: September 2026 • Governed by Indian Law
        </p>
      </div>

      {/* Primary Highlight Alert */}
      <div className="p-6 border-2 border-[var(--border)] bg-[var(--card)] shadow-[6px_6px_0px_0px_var(--shadow-color)] space-y-4">
        <div className="flex items-center gap-2.5 text-sm font-black uppercase text-[var(--chart-1)]">
          <ShieldAlert className="w-5 h-5 text-[var(--chart-1)] shrink-0" />
          <span>Important Declaration for All Users</span>
        </div>
        <p className="text-xs sm:text-sm text-[var(--foreground)] leading-relaxed font-medium">
          <strong>RTI Assist is an independent civic-technology assistive platform.</strong> It is <strong>NOT</strong> an official government website, is <strong>NOT</strong> affiliated with, operated by, sponsored by, or endorsed by any Government Ministry, Public Authority, or Information Commission in India.
        </p>
      </div>

      {/* Core Disclaimer Clauses */}
      <div className="space-y-6 text-xs sm:text-sm text-[var(--foreground)] font-medium leading-relaxed">
        {/* Clause 1 */}
        <section className="p-6 border-2 border-[var(--border)] bg-[var(--card)] shadow-[4px_4px_0px_0px_var(--shadow-color)] space-y-3">
          <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-[var(--foreground)] flex items-center gap-2">
            <span>1. No Legal Advice or Attorney Representation</span>
          </h2>
          <p className="text-[var(--muted-foreground)]">
            The materials, draft formulations, AI reframing suggestions, and templates provided on RTI Assist are intended strictly for informational, educational, and formatting assistance.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[var(--foreground)]">
            <li>Nothing on this platform constitutes formal legal advice, legal counsel, or creates an attorney-client relationship.</li>
            <li>Users seeking legal representation or specialized statutory advice for complex court proceedings should consult a qualified legal professional or advocate.</li>
          </ul>
        </section>

        {/* Clause 2 */}
        <section className="p-6 border-2 border-[var(--border)] bg-[var(--card)] shadow-[4px_4px_0px_0px_var(--shadow-color)] space-y-3">
          <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-[var(--foreground)] flex items-center gap-2">
            <span>2. Independent Filing Requirement</span>
          </h2>
          <p className="text-[var(--muted-foreground)]">
            RTI Assist assists citizens in <strong>structuring and drafting</strong> RTI applications and appeal petitions. <strong>We do not file applications on your behalf directly to government servers, nor do we collect official government RTI application fees.</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[var(--foreground)]">
            <li>After downloading or printing your drafted RTI application, you are responsible for submitting it to the appropriate Public Information Officer (PIO).</li>
            <li>Submission must be done via the official Central Government portal (<a href="https://rtionline.gov.in" target="_blank" rel="noopener noreferrer" className="underline font-bold text-[var(--primary)]">rtionline.gov.in</a>), state-specific RTI portals, or via registered/speed post.</li>
            <li>Statutory application fees (e.g. ₹10, or ₹0 for Below Poverty Line applicants) must be paid directly to the designated Public Authority.</li>
          </ul>
        </section>

        {/* Clause 3 */}
        <section className="p-6 border-2 border-[var(--border)] bg-[var(--card)] shadow-[4px_4px_0px_0px_var(--shadow-color)] space-y-3">
          <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-[var(--foreground)] flex items-center gap-2">
            <span>3. Accuracy of Public Authority Directory & PIO Details</span>
          </h2>
          <p className="text-[var(--muted-foreground)]">
            While we strive to keep our mapped directory of 1,200+ Central and State public authorities, PIO designations, and departmental addresses current:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[var(--foreground)]">
            <li>Public authorities periodically transfer officers and reassign PIO or First Appellate Authority (FAA) designations.</li>
            <li>Users must verify the exact postal address, designated officer, and fee payment details from the authority's official public website before posting physical documents.</li>
          </ul>
        </section>

        {/* Clause 4 */}
        <section className="p-6 border-2 border-[var(--border)] bg-[var(--card)] shadow-[4px_4px_0px_0px_var(--shadow-color)] space-y-3">
          <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-[var(--foreground)] flex items-center gap-2">
            <span>4. Advisory Nature of Deadline Countdown Clocks</span>
          </h2>
          <p className="text-[var(--muted-foreground)]">
            Our deadline tracking features (including the 30-day response window and 48-hour life/liberty clock) are computed from the filing date entered by the user for internal planning and reminder purposes.
          </p>
          <p className="text-[var(--muted-foreground)]">
            Under the RTI Act, official statutory computation begins from the exact calendar date of physical receipt or electronic registration by the Public Authority. RTI Assist does not warrant that an authority will acknowledge identical calculation dates.
          </p>
        </section>

        {/* Clause 5 */}
        <section className="p-6 border-2 border-[var(--border)] bg-[var(--card)] shadow-[4px_4px_0px_0px_var(--shadow-color)] space-y-3">
          <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-[var(--foreground)] flex items-center gap-2">
            <span>5. No Guarantee of Information Disclosure</span>
          </h2>
          <p className="text-[var(--muted-foreground)]">
            RTI Assist formulates queries to request identifiable records rather than opinions, significantly increasing the probability of acceptance. However, final disclosure decisions rest exclusively with the designated Public Information Officer, First Appellate Authority, or Information Commission (CIC / SIC) in accordance with the provisions of the RTI Act, 2005.
          </p>
        </section>
      </div>

      {/* Direct Government Resources */}
      <div className="p-6 border-2 border-[var(--border)] bg-[var(--background)] shadow-[4px_4px_0px_0px_var(--shadow-color)] space-y-3">
        <h3 className="text-sm font-black uppercase tracking-wider text-[var(--foreground)]">Official Government Gateways</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <a
            href="https://rtionline.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition text-xs font-bold flex items-center justify-between"
          >
            <span>Central RTI Online Portal (rtionline.gov.in)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://cic.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition text-xs font-bold flex items-center justify-between"
          >
            <span>Central Information Commission (cic.gov.in)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
export default Disclaimer;
