import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar.jsx';
import { ShieldCheck, ExternalLink, BookOpen, Clock } from 'lucide-react';

export const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-800/80 bg-[#080b13] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Right to Information Act, 2005 Compliant System</span>
              <span className="text-slate-600">|</span>
              <span className="flex items-center gap-1 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Sec 7(1) Statutory 30d & 48h Life & Liberty Timers
              </span>
            </div>

            <div className="flex items-center gap-6">
              <a
                href="https://rtionline.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-cyan-400 transition"
              >
                <span>Central RTI Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://cic.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-cyan-400 transition"
              >
                <span>CIC Appellate Authority</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <div className="flex items-center gap-1 text-slate-500">
                <BookOpen className="w-3.5 h-3.5" />
                <span>RTI Assist v1.0</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
