import { useState } from 'react';
import {
  Users,
  Mail,
  Code2,
  Terminal,
  Cpu,
  Database,
  GraduationCap,
  Award,
  ExternalLink,
  Laptop
} from 'lucide-react';
import MascotPortfolioHero from '@/components/ui/mascot-portfolio-hero';
import yashPhoto from '@/assets/creators/yash-sehgal.jpg';
import prachiPhoto from '@/assets/creators/prachi-mehra.jpg';

const GithubIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

export const About = () => {
  const [activeCreator, setActiveCreator] = useState('yash');

  return (
    <div className="space-y-12 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3 pt-2">
        <span className="inline-flex items-center gap-2 px-3.5 py-1 border-2 border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-black shadow-[2px_2px_0px_0px_var(--shadow-color)] uppercase tracking-wider">
          <Users className="w-3.5 h-3.5" />
          <span>Founders & Engineering Team</span>
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--foreground)] tracking-tight">
          Meet the Creators
        </h1>
        <p className="text-sm sm:text-base text-[var(--muted-foreground)] font-medium">
          Conceptualized, architected, and engineered by <strong>Yash Sehgal</strong> and <strong>Prachi Mehra</strong> — Computer Science undergraduates at <strong>Delhi Skill and Entrepreneurship University (DSEU)</strong>. Click on either avatar below to interact with their live mascot!
        </p>
      </div>

      {/* Creator Selection Switcher */}
      <div className="flex flex-wrap items-center justify-center gap-4 max-w-xl mx-auto">
        <button
          type="button"
          onClick={() => setActiveCreator('yash')}
          className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 transition-all cursor-pointer ${
            activeCreator === 'yash'
              ? 'border-[var(--primary)] bg-[var(--card)] shadow-[4px_4px_0px_0px_var(--shadow-color)] scale-105'
              : 'border-[var(--border)] bg-[var(--card)]/60 hover:bg-[var(--card)] text-[var(--muted-foreground)]'
          }`}
        >
          <img
            src={yashPhoto}
            alt="Yash Sehgal"
            className="w-10 h-10 rounded-full object-cover border-2 border-[var(--border)] shadow-sm"
          />
          <div className="text-left">
            <div className="text-xs font-black text-[var(--foreground)]">Yash Sehgal</div>
            <div className="text-[10px] font-bold text-[var(--primary)] uppercase">Full-Stack MERN Developer</div>
          </div>
          {activeCreator === 'yash' && (
            <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse ml-1" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveCreator('prachi')}
          className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 transition-all cursor-pointer ${
            activeCreator === 'prachi'
              ? 'border-emerald-600 dark:border-emerald-400 bg-[var(--card)] shadow-[4px_4px_0px_0px_var(--shadow-color)] scale-105'
              : 'border-[var(--border)] bg-[var(--card)]/60 hover:bg-[var(--card)] text-[var(--muted-foreground)]'
          }`}
        >
          <img
            src={prachiPhoto}
            alt="Prachi Mehra"
            className="w-10 h-10 rounded-full object-cover border-2 border-[var(--border)] shadow-sm"
          />
          <div className="text-left">
            <div className="text-xs font-black text-[var(--foreground)]">Prachi Mehra</div>
            <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Backend & Systems Engineer</div>
          </div>
          {activeCreator === 'prachi' && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1" />
          )}
        </button>
      </div>

      {/* Interactive Mascot Portfolio Hero Stage */}
      <div className="border-2 border-[var(--border)] bg-[var(--card)] rounded-2xl overflow-hidden shadow-[6px_6px_0px_0px_var(--shadow-color)] relative">
        <div className="p-3 bg-[var(--muted)]/50 border-b-2 border-[var(--border)] flex items-center justify-between text-xs font-mono font-bold px-5">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
            <span>INTERACTIVE AVATAR · {activeCreator === 'yash' ? 'YASH SEHGAL' : 'PRACHI MEHRA'}</span>
          </span>
          <span className="text-[11px] text-[var(--muted-foreground)]">
            CLICK AVATAR TO HEAR VOICE NOTES · MOVE CURSOR TO TRACK GAZE
          </span>
        </div>

        {activeCreator === 'yash' ? (
          <MascotPortfolioHero
            avatarPreset="yash"
            audioSrc="/audio/yash1.mp3"
            height="640px"
            minHeight="480px"
            index="DEV / 01"
            discipline="Full-Stack Web Development"
            tagline="MERN Stack · Modern Web Systems"
            collection={["Yash", "Sehgal"]}
            reel={["DSEU CSE @ 2027", "New Delhi, India"]}
            year="2026"
            initials="YS"
            badge="Co-Creator"
            line2="Yash"
            line3="Sehgal"
            word="Full-Stack"
            verticalTag="Developer"
            bracketed="MERN"
            seekingLabel="Specialization"
            seeking="Full-Stack MERN"
            href="https://github.com/idarkpearl"
            services={[
              "React.js & Vite",
              "Node.js & Express",
              "MongoDB & PostgreSQL",
              "RESTful APIs & Auth",
              "Frontend & UI Engineering"
            ]}
            greetings={[
              "Sab changa si! ✨",
              "I engineered our responsive frontend, auth & backend APIs!",
              "B.Tech CSE at DSEU Okhla-II — building impactful tech.",
              "Click anywhere on me to look around or inspect my skills!"
            ]}
            accent="#2563eb"
            paper="var(--card)"
            ink="var(--foreground)"
          />
        ) : (
          <MascotPortfolioHero
            avatarPreset="prachi"
            height="640px"
            minHeight="480px"
            index="DEV / 02"
            discipline="Backend & Systems Engineering"
            tagline="Java · Spring Boot · Data Architecture"
            collection={["Prachi", "Mehra"]}
            reel={["DSEU CSE @ 2026", "New Delhi, India"]}
            year="2026"
            initials="PM"
            badge="Co-Creator"
            line2="Prachi"
            line3="Mehra"
            word="Backend"
            verticalTag="Engineer"
            bracketed="JAVA"
            seekingLabel="Specialization"
            seeking="Spring Boot & Core CS"
            href="https://github.com/prachi"
            services={[
              "Java & Spring Boot",
              "Spring Security & OAuth2",
              "MySQL & PostgreSQL",
              "Data Analysis & Python",
              "RESTful API Systems"
            ]}
            greetings={[
              "Hi there! I'm Prachi Mehra, Backend & Systems Engineer.",
              "I specialize in Java, Spring Boot, high-reliability APIs & databases!",
              "B.Tech CSE at DSEU (CGPA 8.4) — precision in logic, elegance in design.",
              "Yash made sure my avatar looks as gorgeous as my clean code! ✨"
            ]}
            skin="#f6d7c2"
            accent="#10b981"
            paper="var(--card)"
            ink="var(--foreground)"
          />
        )}
      </div>

      {/* Dual Creator Profiles & Detailed Dossiers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
        {/* Yash Sehgal Profile */}
        <div className={`p-6 sm:p-8 border-2 rounded-2xl bg-[var(--card)] transition-all ${
          activeCreator === 'yash'
            ? 'border-[var(--primary)] shadow-[6px_6px_0px_0px_var(--shadow-color)] ring-2 ring-[var(--primary)]/20'
            : 'border-[var(--border)] shadow-[4px_4px_0px_0px_var(--shadow-color)]'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b-2 border-[var(--border)]">
            <div className="relative">
              <img
                src={yashPhoto}
                alt="Yash Sehgal"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-[var(--border)] shadow-[3px_3px_0px_0px_var(--shadow-color)]"
              />
              <span className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-[var(--primary)] text-[var(--primary-foreground)] text-[10px] font-black rounded border border-[var(--border)]">
                Lead
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-[var(--foreground)]">Yash Sehgal</h3>
              </div>
              <p className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">
                Full-Stack MERN Developer
              </p>
              <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1.5 font-medium">
                <GraduationCap className="w-3.5 h-3.5 text-[var(--primary)]" />
                <span>B.Tech CSE, 4th Year · DSEU Okhla-II (Expected 2027)</span>
              </p>
            </div>
          </div>

          <div className="py-6 space-y-5 border-b-2 border-[var(--border)]">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-[var(--muted-foreground)] mb-2 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-[var(--primary)]" />
                Technical Stack & Core Skills
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "JavaScript (ES6+)",
                  "React.js",
                  "Vite",
                  "Node.js",
                  "Express.js",
                  "MongoDB (Mongoose)",
                  "PostgreSQL",
                  "MySQL",
                  "Python",
                  "Java",
                  "C++",
                  "DSA & OOP",
                  "JWT Authentication",
                  "RESTful APIs",
                  "Swagger/OpenAPI",
                  "Git & GitHub"
                ].map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] shadow-xs"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-[var(--muted-foreground)] mb-2 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[var(--primary)]" />
                Experience & Leadership
              </h4>
              <ul className="space-y-2 text-xs text-[var(--foreground)] font-medium">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mt-1.5 shrink-0" />
                  <div>
                    <strong>Frontend Web Developer Intern</strong> — Zzeraa Marketing (Oct 2025 – Dec 2025)
                    <div className="text-[11px] text-[var(--muted-foreground)]">Developed responsive React components, lazy loading & code optimization.</div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mt-1.5 shrink-0" />
                  <div>
                    <strong>Management Head</strong> — Tech Spark, DSEU Okhla-II (Sep 2024 – Nov 2025)
                    <div className="text-[11px] text-[var(--muted-foreground)]">Led technical society, organized web dev hackathons & mentored students in DSA/C.</div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mt-1.5 shrink-0" />
                  <div>
                    <strong>Green Intern</strong> — 1M1B (1 Million for 1 Billion) (Aug 2025 – Oct 2025)
                    <div className="text-[11px] text-[var(--muted-foreground)]">Completed sustainability-tech internship program, earned Digital Badge.</div>
                  </div>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-[var(--muted-foreground)] mb-2 flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5 text-[var(--primary)]" />
                Featured Projects
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)]">
                  <div className="font-black text-[var(--foreground)]">Genki Grub</div>
                  <div className="text-[11px] text-[var(--muted-foreground)]">React, Vite, dynamic search & ingredient insights.</div>
                </div>
                <div className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)]">
                  <div className="font-black text-[var(--foreground)]">MoodLens</div>
                  <div className="text-[11px] text-[var(--muted-foreground)]">Face Recognition API & real-time emotion suggestions.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <a
                href="https://github.com/idarkpearl"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[var(--border)] rounded-md font-bold text-[var(--foreground)] hover:bg-[var(--muted)] transition"
              >
                <GithubIcon className="w-3.5 h-3.5" />
                <span>github.com/idarkpearl</span>
                <ExternalLink className="w-3 h-3 text-[var(--muted-foreground)]" />
              </a>
            </div>
            <a
              href="mailto:yashsehgal251103@gmail.com"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-[var(--border)] rounded-md font-black text-[var(--primary-foreground)] bg-[var(--primary)] hover:opacity-90 transition shadow-xs"
            >
              <Mail className="w-3.5 h-3.5" />
              Contact Yash
            </a>
          </div>
        </div>

        {/* Prachi Mehra Profile */}
        <div className={`p-6 sm:p-8 border-2 rounded-2xl bg-[var(--card)] transition-all ${
          activeCreator === 'prachi'
            ? 'border-emerald-500 shadow-[6px_6px_0px_0px_var(--shadow-color)] ring-2 ring-emerald-500/20'
            : 'border-[var(--border)] shadow-[4px_4px_0px_0px_var(--shadow-color)]'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b-2 border-[var(--border)]">
            <div className="relative">
              <img
                src={prachiPhoto}
                alt="Prachi Mehra"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-[var(--border)] shadow-[3px_3px_0px_0px_var(--shadow-color)]"
              />
              <span className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-black rounded border border-[var(--border)]">
                Core
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-[var(--foreground)]">Prachi Mehra</h3>
              </div>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Backend & Systems Engineer
              </p>
              <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1.5 font-medium">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
                <span>B.Tech CSE, 4th Year · DSEU (CGPA: 8.4)</span>
              </p>
            </div>
          </div>

          <div className="py-6 space-y-5 border-b-2 border-[var(--border)]">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-[var(--muted-foreground)] mb-2 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-emerald-500" />
                Technical Stack & Core Skills
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Java",
                  "Spring Boot",
                  "Spring Security",
                  "JPA / Hibernate",
                  "MySQL",
                  "PostgreSQL",
                  "RESTful APIs",
                  "JWT & OAuth2",
                  "C++",
                  "C",
                  "Python Data Analysis",
                  "React & HTML/CSS",
                  "DSA & DBMS",
                  "OS & Computer Networks",
                  "Postman & Swagger",
                  "Maven & IntelliJ IDEA"
                ].map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] shadow-xs"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-[var(--muted-foreground)] mb-2 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-500" />
                Experience & Contributions
              </h4>
              <ul className="space-y-2 text-xs text-[var(--foreground)] font-medium">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <div>
                    <strong>Data Analysis Intern</strong> — Edunet Foundation (Sep 2025 – Oct 2025)
                    <div className="text-[11px] text-[var(--muted-foreground)]">Performed data cleaning, Python analysis, and LLM-assisted dataset structuring.</div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <div>
                    <strong>Technical Team Member</strong> — Tech Spark, DSEU
                    <div className="text-[11px] text-[var(--muted-foreground)]">Organized technical webinars, online hackathons, and event planning.</div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <div>
                    <strong>Academic Excellence</strong> — CBSE XII: 91% (PCM) · CBSE X: 84%
                    <div className="text-[11px] text-[var(--muted-foreground)]">Maintained high distinction throughout secondary & engineering curriculum.</div>
                  </div>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-[var(--muted-foreground)] mb-2 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-500" />
                Featured Projects
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)]">
                  <div className="font-black text-[var(--foreground)]">College Management System</div>
                  <div className="text-[11px] text-[var(--muted-foreground)]">Java, Spring Boot, Spring Security, JPA/Hibernate, MySQL.</div>
                </div>
                <div className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)]">
                  <div className="font-black text-[var(--foreground)]">Flavor Twin — Foodoscope</div>
                  <div className="text-[11px] text-[var(--muted-foreground)]">10D flavor vectors, React, Vite, Hackathon Team Project.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <a
                href="https://github.com/prachi1862"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[var(--border)] rounded-md font-bold text-[var(--foreground)] hover:bg-[var(--muted)] transition"
              >
                <GithubIcon className="w-3.5 h-3.5" />
                <span>github.com/prachi1862</span>
                <ExternalLink className="w-3 h-3 text-[var(--muted-foreground)]" />
              </a>
            </div>
            <a
              href="mailto:prachimehra866@gmail.com"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-[var(--border)] rounded-md font-black text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-xs"
            >
              <Mail className="w-3.5 h-3.5" />
              Contact Prachi
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
