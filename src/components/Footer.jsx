import { Link } from 'react-router-dom';
import {
  FileText,
  Shield,
  ExternalLink,
  Scale,
  Sparkles,
  ArrowUpRight,
  Clock,
  HeartHandshake
} from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t-2 border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-sm">
      {/* Upper Footer Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8">
          {/* Brand Info (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-10 h-10 border-2 border-[var(--border)] bg-[var(--primary)] flex items-center justify-center text-[var(--primary-foreground)] shadow-[2px_2px_0px_0px_var(--shadow-color)] group-hover:bg-[var(--accent)] transition-all">
                <Scale className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-[var(--foreground)] tracking-tight group-hover:text-[var(--primary)] transition-colors">
                  RTI Assist
                </span>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 border border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)]">
                  Act 2005
                </span>
              </div>
            </Link>

            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed max-w-sm">
              Modern Right to Information drafting, statutory deadline monitoring, and appeal assistance designed to make public information accessible to every citizen.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-[var(--foreground)]">
              <span className="inline-block w-2.5 h-2.5 bg-[var(--secondary)] border border-[var(--border)]"></span>
              <span>Sec 7(1) 30-Day Response & 48h Life/Liberty Tracking</span>
            </div>
          </div>

          {/* Column 1: Product */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--foreground)] border-b-2 border-[var(--border)] pb-1 inline-block">Product</h4>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <Link to="/intake" className="hover:text-[var(--primary)] transition flex items-center gap-1.5">
                  <span>Create RTI</span>
                  <span className="text-[10px] font-bold px-1 border border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)]">AI</span>
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-[var(--primary)] transition">
                  Track Applications
                </Link>
              </li>
              <li>
                <a href="/#features" className="hover:text-[var(--primary)] transition">
                  Features
                </a>
              </li>
              <li>
                <Link to="/directory" className="hover:text-[var(--primary)] transition">
                  Public Authorities
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--foreground)] border-b-2 border-[var(--border)] pb-1 inline-block">Resources</h4>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <a href="/#resources" className="hover:text-[var(--primary)] transition">
                  RTI Guides
                </a>
              </li>
              <li>
                <a href="/#faqs" className="hover:text-[var(--primary)] transition">
                  FAQs
                </a>
              </li>
              <li>
                <a href="/#resources" className="hover:text-[var(--primary)] transition">
                  First Appeal Guide
                </a>
              </li>
              <li>
                <a
                  href="https://rtionline.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-[var(--primary)] transition"
                >
                  <span>Central RTI Portal</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--foreground)] border-b-2 border-[var(--border)] pb-1 inline-block">Company</h4>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <Link to="/about" className="hover:text-[var(--primary)] transition">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[var(--primary)] transition">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-[var(--primary)] transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-[var(--primary)] transition">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--foreground)] border-b-2 border-[var(--border)] pb-1 inline-block">Legal</h4>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <Link to="/disclaimer" className="hover:text-[var(--primary)] transition">
                  Disclaimer
                </Link>
              </li>
              <li>
                <a
                  href="https://cic.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-[var(--primary)] transition"
                >
                  <span>Central Info Commission</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </li>
              <li>
                <Link to="/rti-act" className="inline-flex items-center gap-1 hover:text-[var(--primary)] transition">
                  <span>RTI Act, 2005 Text</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
              <li>
                <Link to="/rti-act#filing" className="text-xs text-[var(--muted-foreground)] hover:text-[var(--primary)] transition block">
                  Filing & Appeal Rules
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Legal Notice & Copyright */}
      <div id="disclaimer" className="border-t-2 border-[var(--border)] bg-[var(--background)] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed text-justify sm:text-left">
            <strong className="text-[var(--foreground)]">Legal Disclaimer:</strong> RTI Assist is an independent legal-technology assistance platform created to help citizens research, draft, and track Right to Information applications. RTI Assist does not provide formal legal representation, advocacy, or formal legal advice, and is not affiliated with, endorsed by, or an agency of any government ministry, department, Public Authority, or Information Commission. Users are encouraged to verify specific authority contact details, fee amounts, and statutory requirements before filing their applications on official government portals (such as rtionline.gov.in) or via registered post.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs text-[var(--foreground)] border-t border-[var(--border)]">
            <div className="flex items-center gap-2 font-medium">
              <span>© {new Date().getFullYear()} RTI Assist. All rights reserved.</span>
              <span>•</span>
              <span>Built for Transparency & Civic Empowerment</span>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="text-[var(--muted-foreground)]">Made with care for citizens across India</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
