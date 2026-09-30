import { BookOpen, FileText, Scale, Clock, ShieldCheck, Download, ExternalLink, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RtiActGuide = () => {
  return (
    <div className="space-y-12 py-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b-2 border-[var(--border)] pb-6 space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-black shadow-[2px_2px_0px_0px_var(--shadow-color)] uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Statutory Reference</span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]">
            Act No. 22 of 2005
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-[var(--foreground)] tracking-tight">
          Right to Information Act, 2005
        </h1>
        <p className="text-base sm:text-lg text-[var(--muted-foreground)] font-medium leading-relaxed">
          A citizen's guide to the landmark transparency legislation that empowers 1.4 billion Indians to inspect public works, access certified files, and hold government bodies accountable.
        </p>

        {/* Quick Action Download Button */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <a
            href="https://rti.gov.in/rti-act.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[var(--border)] bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-black shadow-[3px_3px_0px_0px_var(--shadow-color)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition"
          >
            <Download className="w-4 h-4" />
            <span>Download Official Gazette Act PDF</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <Link
            to="/intake"
            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-xs font-bold shadow-[3px_3px_0px_0px_var(--shadow-color)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition"
          >
            <span>Draft an RTI Application Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Quick Summary Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div className="p-4 border-2 border-[var(--border)] bg-[var(--card)] shadow-[3px_3px_0px_0px_var(--shadow-color)] space-y-1">
          <span className="text-2xl font-black text-[var(--primary)] block">30 Days</span>
          <span className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase">Standard Response Time</span>
        </div>
        <div className="p-4 border-2 border-[var(--border)] bg-[var(--card)] shadow-[3px_3px_0px_0px_var(--shadow-color)] space-y-1">
          <span className="text-2xl font-black text-[var(--secondary)] block">48 Hours</span>
          <span className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase">Life & Liberty Urgency</span>
        </div>
        <div className="p-4 border-2 border-[var(--border)] bg-[var(--card)] shadow-[3px_3px_0px_0px_var(--shadow-color)] space-y-1">
          <span className="text-2xl font-black text-[var(--foreground)] block">₹10</span>
          <span className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase">Application Fee (Free for BPL)</span>
        </div>
        <div className="p-4 border-2 border-[var(--border)] bg-[var(--card)] shadow-[3px_3px_0px_0px_var(--shadow-color)] space-y-1">
          <span className="text-2xl font-black text-[var(--chart-1)] block">₹25,000</span>
          <span className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase">Max PIO Delay Penalty</span>
        </div>
      </div>

      {/* Key Sections Explained in Plain English */}
      <div className="space-y-8">
        <div className="border-b-2 border-[var(--border)] pb-2">
          <h2 className="text-xl sm:text-2xl font-black text-[var(--foreground)]">
            Essential Sections of the RTI Act Explained
          </h2>
          <p className="text-xs text-[var(--muted-foreground)] font-medium">
            Plain-English breakdown of your statutory rights, timelines, and appeals.
          </p>
        </div>

        {/* Section 2(j): What is Information? */}
        <section className="p-6 border-2 border-[var(--border)] bg-[var(--card)] shadow-[4px_4px_0px_0px_var(--shadow-color)] space-y-3">
          <div className="flex items-center justify-between border-b-2 border-[var(--border)] pb-2">
            <h3 className="text-base font-black text-[var(--foreground)]">
              Section 2(j) — What Can You Request?
            </h3>
            <span className="text-xs font-bold text-[var(--secondary)] bg-[var(--background)] px-2 py-0.5 border border-[var(--border)]">
              Scope of Rights
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed font-medium">
            Under Section 2(j), your "Right to Information" is not limited to reading text. You have the legal authority to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[var(--foreground)] font-medium">
            <li><strong>Inspect Works, Documents, and Records:</strong> Physically visit the government office to inspect public records or public construction works.</li>
            <li><strong>Take Certified Copies:</strong> Obtain certified photocopies, notes, or extracts of official files and file notings.</li>
            <li><strong>Take Certified Samples:</strong> Demand certified physical samples of materials used in roads, buildings, or public supply.</li>
            <li><strong>Obtain Electronic Media:</strong> Request data in electronic formats such as emails, spreadsheets, CDs, or pendrives.</li>
          </ul>
        </section>

        {/* Section 6(1): Filing Procedure */}
        <section id="filing" className="p-6 border-2 border-[var(--border)] bg-[var(--card)] shadow-[4px_4px_0px_0px_var(--shadow-color)] space-y-3 scroll-mt-20">
          <div className="flex items-center justify-between border-b-2 border-[var(--border)] pb-2">
            <h3 className="text-base font-black text-[var(--foreground)]">
              Section 6(1) — How to File an RTI Application
            </h3>
            <span className="text-xs font-bold text-[var(--primary)] bg-[var(--background)] px-2 py-0.5 border border-[var(--border)]">
              Application Mandate
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed font-medium">
            Section 6(1) sets out the simple procedure for citizens to request public records:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-3 border border-[var(--border)] bg-[var(--background)] space-y-1">
              <span className="text-xs font-bold text-[var(--foreground)] block">No Reasons Required</span>
              <p className="text-xs text-[var(--muted-foreground)]">
                You do NOT need to give any reason for asking for the information, nor justify your personal connection to the file.
              </p>
            </div>
            <div className="p-3 border border-[var(--border)] bg-[var(--background)] space-y-1">
              <span className="text-xs font-bold text-[var(--foreground)] block">Nominal ₹10 Fee</span>
              <p className="text-xs text-[var(--muted-foreground)]">
                Payable via postal order, court fee stamp, or online payment. Citizens living Below the Poverty Line (BPL) are 100% exempt from all fees.
              </p>
            </div>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] italic pt-1">
            <strong>Key Tip:</strong> Frame your points around identifiable records ("Certified copy of the sanction order...") rather than asking "Why" questions, which officers can reject as seeking opinion.
          </p>
        </section>

        {/* Section 7: Statutory Timelines & Free Copies */}
        <section className="p-6 border-2 border-[var(--border)] bg-[var(--card)] shadow-[4px_4px_0px_0px_var(--shadow-color)] space-y-3">
          <div className="flex items-center justify-between border-b-2 border-[var(--border)] pb-2">
            <h3 className="text-base font-black text-[var(--foreground)]">
              Section 7 — Timelines, Deemed Refusal & Free Records
            </h3>
            <span className="text-xs font-bold text-[var(--accent-foreground)] bg-[var(--accent)] px-2 py-0.5 border border-[var(--border)]">
              Strict Clocks
            </span>
          </div>
          <div className="space-y-2 text-xs sm:text-sm font-medium">
            <p><strong>Section 7(1) [30-Day Window]:</strong> The Public Information Officer must provide information or reject the request with reasons within 30 days of receiving your application.</p>
            <p><strong>Section 7(1) Proviso [48-Hour Urgent Window]:</strong> If the information concerns the life or personal liberty of any person, it must be provided strictly within 48 hours.</p>
            <p><strong>Section 7(2) [Deemed Refusal]:</strong> If the PIO fails to give any response within the 30-day period, the law automatically treats it as a "Deemed Refusal", entitling you to file an appeal immediately.</p>
            <p className="p-3 border-2 border-[var(--secondary)] bg-[var(--secondary)]/10 text-[var(--foreground)]">
              <strong>Section 7(6) [Free Records Mandate]:</strong> If the public authority fails to comply with statutory timelines, the information <strong>must be provided completely free of charge</strong>, regardless of photocopying or document volume.
            </p>
          </div>
        </section>

        {/* Section 19(1) & 19(3): First and Second Appeals */}
        <section id="appeals" className="p-6 border-2 border-[var(--border)] bg-[var(--card)] shadow-[4px_4px_0px_0px_var(--shadow-color)] space-y-3 scroll-mt-20">
          <div className="flex items-center justify-between border-b-2 border-[var(--border)] pb-2">
            <h3 className="text-base font-black text-[var(--foreground)]">
              Section 19 — First and Second Appeals
            </h3>
            <span className="text-xs font-bold text-[var(--chart-1)] bg-[var(--background)] px-2 py-0.5 border border-[var(--border)]">
              Appellate Remedy
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed font-medium">
            If a PIO ignores your RTI, provides incomplete records, or wrongfully demands exorbitant copying charges:
          </p>
          <div className="space-y-3 pt-1">
            <div className="p-4 border border-[var(--border)] bg-[var(--background)] space-y-1.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-[var(--foreground)]">
                  First Appeal (Section 19(1))
                </h4>
                <span className="text-[10px] font-bold text-[var(--muted-foreground)]">30-Day Filing Window</span>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] font-medium">
                Filed before the First Appellate Authority (FAA), who is a senior departmental officer in the same public authority. The FAA is mandated to hear and dispose of the appeal within 30 to 45 days. No filing fee is charged under Central rules.
              </p>
            </div>

            <div className="p-4 border border-[var(--border)] bg-[var(--background)] space-y-1.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-[var(--foreground)]">
                  Second Appeal (Section 19(3))
                </h4>
                <span className="text-[10px] font-bold text-[var(--muted-foreground)]">90-Day Filing Window</span>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] font-medium">
                If the First Appellate Authority fails to decide or upholds an unjust denial, you can file a Second Appeal directly before the Central Information Commission (CIC) or your State Information Commission (SIC).
              </p>
            </div>
          </div>
        </section>

        {/* Section 20: Penalties on Officers */}
        <section className="p-6 border-2 border-[var(--border)] bg-[var(--card)] shadow-[4px_4px_0px_0px_var(--shadow-color)] space-y-3">
          <div className="flex items-center justify-between border-b-2 border-[var(--border)] pb-2">
            <h3 className="text-base font-black text-[var(--foreground)]">
              Section 20 — Penalties for Delay or Refusal
            </h3>
            <span className="text-xs font-bold text-[var(--secondary)] bg-[var(--background)] px-2 py-0.5 border border-[var(--border)]">
              Officer Accountability
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] font-medium leading-relaxed">
            The Information Commission has the statutory power to impose a personal penalty on any Public Information Officer who without reasonable cause refuses to receive an application, delays response beyond 30 days, or knowingly gives incorrect or misleading records:
          </p>
          <div className="p-3 border border-[var(--border)] bg-[var(--background)] flex items-center justify-between text-xs font-bold">
            <span>Penalty Rate: <strong className="text-[var(--chart-1)]">₹250 per day of delay</strong></span>
            <span>Maximum Fine: <strong className="text-[var(--chart-1)]">₹25,000 (Deducted from salary)</strong></span>
          </div>
        </section>
      </div>

      {/* Bottom CTA */}
      <div className="p-8 border-2 border-[var(--border)] bg-[var(--card)] shadow-[6px_6px_0px_0px_var(--shadow-color)] text-center space-y-4">
        <h3 className="text-xl sm:text-2xl font-black text-[var(--foreground)]">Put the RTI Act into Action</h3>
        <p className="text-xs sm:text-sm text-[var(--muted-foreground)] font-medium max-w-lg mx-auto">
          You don't need to memorize legal clauses. Our drafting studio automatically formats your concern into an airtight, record-based petition under Section 6(1).
        </p>
        <Link
          to="/intake"
          className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[var(--border)] text-xs font-black uppercase tracking-wider text-[var(--primary-foreground)] bg-[var(--primary)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] shadow-[3px_3px_0px_0px_var(--shadow-color)] transition"
        >
          <span>Start Your Free Draft</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
export default RtiActGuide;
