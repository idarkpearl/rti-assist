import { FileText, Scale, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const TermsOfService = () => {
  return (
    <div className="space-y-10 py-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b-2 border-[var(--border)] pb-6 space-y-3">
        <span className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-black shadow-[2px_2px_0px_0px_var(--shadow-color)] uppercase tracking-wider">
          <FileText className="w-3.5 h-3.5" />
          <span>Statutory Terms</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[var(--foreground)] tracking-tight">
          Terms of Service
        </h1>
        <p className="text-xs sm:text-sm text-[var(--muted-foreground)] font-medium">
          Effective Date: September 2026 • Version 2.1
        </p>
      </div>

      {/* Critical Legal Disclaimer Notice */}
      <div className="p-6 border-2 border-[var(--border)] bg-[var(--card)] shadow-[4px_4px_0px_0px_var(--shadow-color)] space-y-3">
        <div className="flex items-center gap-2 text-xs font-black uppercase text-[var(--chart-1)]">
          <AlertTriangle className="w-4 h-4 text-[var(--chart-1)]" />
          <span>Notice Regarding Legal Representation & Government Non-Affiliation</span>
        </div>
        <p className="text-xs sm:text-sm text-[var(--foreground)] leading-relaxed font-medium">
          <strong>RTI Assist is an independent legal-technology assistance platform.</strong> We provide formatting, drafting, and deadline tracking software tools. RTI Assist does <strong>not</strong> provide formal legal representation, attorney-client advocacy, or binding legal advice, and is <strong>not affiliated with, operated by, or endorsed by any government ministry, department, Public Authority, or Information Commission</strong>.
        </p>
      </div>

      {/* Detailed Terms */}
      <div className="space-y-8 text-xs sm:text-sm text-[var(--foreground)] font-medium leading-relaxed">
        <section className="space-y-3 p-6 border-2 border-[var(--border)] bg-[var(--card)] shadow-[4px_4px_0px_0px_var(--shadow-color)]">
          <h2 className="text-base font-black uppercase tracking-wider text-[var(--foreground)]">
            1. Nature of the Service
          </h2>
          <p className="text-[var(--muted-foreground)]">
            RTI Assist assists citizens in structuring informal questions into formal information requests aligned with Section 6(1) and Section 19(1) of the Right to Information Act, 2005. The platform does not directly file petitions on government servers or collect official statutory application fees on behalf of public authorities.
          </p>
          <p className="text-[var(--muted-foreground)]">
            Once drafted, the citizen retains sole responsibility for submitting their signed petition through authorized government portals (e.g. <a href="https://rtionline.gov.in" target="_blank" rel="noopener noreferrer" className="underline font-bold text-[var(--primary)]">rtionline.gov.in</a>) or via registered post/speed post to the relevant Public Information Officer (PIO).
          </p>
        </section>

        <section className="space-y-3 p-6 border-2 border-[var(--border)] bg-[var(--card)] shadow-[4px_4px_0px_0px_var(--shadow-color)]">
          <h2 className="text-base font-black uppercase tracking-wider text-[var(--foreground)]">
            2. Citizen Responsibilities & Acceptable Use
          </h2>
          <p className="text-[var(--muted-foreground)]">
            By accessing or using RTI Assist, you agree to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[var(--foreground)] font-medium">
            <li>Verify all authority addresses, PIO contact details, and state-specific fee rules before final submission.</li>
            <li>Submit genuine, lawful requests for public records, and not use the platform for frivolous harassment, defamation, or malicious nuisance petitions.</li>
            <li>Pay the statutory filing fee (typically ₹10 under Central Government rules, with 100% waiver for BPL card holders) directly to the designated Public Authority.</li>
            <li>Respect statutory exemptions under Section 8 and Section 9 of the RTI Act regarding national security, cabinet papers, and protected personal privacy.</li>
          </ul>
        </section>

        <section className="space-y-3 p-6 border-2 border-[var(--border)] bg-[var(--card)] shadow-[4px_4px_0px_0px_var(--shadow-color)]">
          <h2 className="text-base font-black uppercase tracking-wider text-[var(--foreground)]">
            3. AI Drafting & Accuracy of Information
          </h2>
          <p className="text-[var(--muted-foreground)]">
            Our AI-assisted reformulation models are designed to maximize clarity and eliminate "why/opinion" questions. However, because public authorities, rules, and departmental jurisdictions evolve, <strong>you must review and edit all generated draft text before signing and filing</strong>.
          </p>
          <p className="text-[var(--muted-foreground)]">
            RTI Assist does not guarantee that a Public Information Officer will grant the information requested, as disclosure decisions rest solely with statutory authorities and Information Commissions under the RTI Act, 2005.
          </p>
        </section>

        <section className="space-y-3 p-6 border-2 border-[var(--border)] bg-[var(--card)] shadow-[4px_4px_0px_0px_var(--shadow-color)]">
          <h2 className="text-base font-black uppercase tracking-wider text-[var(--foreground)]">
            4. Statutory Deadline Calculations
          </h2>
          <p className="text-[var(--muted-foreground)]">
            The platform calculates statutory countdowns (such as the standard 30-day response window under Section 7(1) or the 48-hour life/liberty window) based on the filing date provided by the user. These calculations are provided for organizational and reminder purposes. Official legal computation of time begins upon receipt by the PIO's office pursuant to statutory rules.
          </p>
        </section>

        <section className="space-y-3 p-6 border-2 border-[var(--border)] bg-[var(--card)] shadow-[4px_4px_0px_0px_var(--shadow-color)]">
          <h2 className="text-base font-black uppercase tracking-wider text-[var(--foreground)]">
            5. Limitation of Liability
          </h2>
          <p className="text-[var(--muted-foreground)]">
            To the maximum extent permitted by applicable Indian law, RTI Assist and its contributors shall not be liable for any direct, indirect, incidental, or consequential damages resulting from rejected applications, missed appeal deadlines, or decisions issued by Public Information Officers, First Appellate Authorities, or Information Commissions.
          </p>
        </section>

        <section className="space-y-3 p-6 border-2 border-[var(--border)] bg-[var(--card)] shadow-[4px_4px_0px_0px_var(--shadow-color)]">
          <h2 className="text-base font-black uppercase tracking-wider text-[var(--foreground)]">
            6. Changes to Terms & Contact
          </h2>
          <p className="text-[var(--muted-foreground)]">
            We reserve the right to modify these terms as legislation or platform capabilities change. For any inquiries regarding our terms of service, please contact:
          </p>
          <p className="font-bold text-[var(--foreground)]">
            Legal & Compliance Desk — <a href="mailto:legal@rtiassist.org" className="text-[var(--primary)] underline">legal@rtiassist.org</a>
          </p>
        </section>
      </div>
    </div>
  );
};
export default TermsOfService;
