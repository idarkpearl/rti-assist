import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  FileText,
  FileCheck2,
  CheckCircle2,
  Building2,
  Search,
  Scale,
  Calendar,
  AlertTriangle,
  ChevronDown,
  Layers,
  GraduationCap,
  Users,
  Compass,
  Briefcase,
  HelpCircle,
  ExternalLink,
  BookOpen,
  ArrowUpRight,
  Check,
  X,
  Star,
  Quote,
  TrendingUp,
  Award,
  MessageSquare
} from 'lucide-react';

export const Home = () => {
  // Interactive mockup scenario switcher
  const [activeScenario, setActiveScenario] = useState('fees');

  // Interactive AI Assistant conversation sample
  const [aiActiveTab, setAiActiveTab] = useState(0);

  // FAQ Accordion open state
  const [openFaq, setOpenFaq] = useState(null);

  // Educational Guide Modal State
  const [activeGuide, setActiveGuide] = useState(null);

  // Testimonials Filter & Display Mode
  const [testimonialCategory, setTestimonialCategory] = useState('All');
  const [testimonialViewMode, setTestimonialViewMode] = useState('marquee'); // 'marquee' | 'grid'
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [storySubmitted, setStorySubmitted] = useState(false);

  // Persistent user-submitted community stories that dynamically replace mock data
  const [userStories, setUserStories] = useState(() => {
    try {
      const saved = localStorage.getItem('rti_community_stories');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [storyForm, setStoryForm] = useState({
    name: '',
    role: '',
    location: '',
    category: 'Education & Scholarships',
    authority: '',
    outcome: '',
    quote: ''
  });

  const handleStorySubmit = (e) => {
    e.preventDefault();
    if (!storyForm.name.trim() || !storyForm.quote.trim()) return;

    const names = storyForm.name.trim().split(' ');
    const initials = names.length > 1
      ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      : names[0].slice(0, 2).toUpperCase();

    const newStory = {
      id: `real-${Date.now()}`,
      name: storyForm.name.trim(),
      role: storyForm.role.trim() || 'Citizen Applicant',
      location: storyForm.location.trim() || 'India',
      category: storyForm.category || 'Education & Scholarships',
      authority: storyForm.authority.trim() || 'Public Authority',
      outcome: storyForm.outcome.trim() || 'Information Received',
      quote: storyForm.quote.trim(),
      rating: 5,
      avatarColor: 'bg-[var(--secondary)] text-[var(--secondary-foreground)]',
      initials,
      verified: true,
      isReal: true
    };

    const updated = [newStory, ...userStories];
    setUserStories(updated);
    try {
      localStorage.setItem('rti_community_stories', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save story:', err);
    }

    setStorySubmitted(true);
    setStoryForm({
      name: '',
      role: '',
      location: '',
      category: 'Education & Scholarships',
      authority: '',
      outcome: '',
      quote: ''
    });
  };

  const handleClearUserStories = () => {
    setUserStories([]);
    try {
      localStorage.removeItem('rti_community_stories');
    } catch (err) {
      console.error('Failed to clear stories:', err);
    }
  };

  // Scroll Progress Indicator
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scenarios = {
    fees: {
      title: 'College Fee Structure',
      userQuery: 'I want the officially approved fee structure for my degree course, including tuition, lab, exam, and development charges.',
      authority: 'College Principal / University Registrar (Finance)',
      category: 'College Fee Structure',
      records: [
        'Certified copy of the officially approved fee structure notification for the undergraduate/postgraduate batch, detailing tuition, examination, development, library, and laboratory fees.',
        'Component-wise breakdown and head-wise justification for all statutory and institutional charges collected from students.',
        'Certified copies of official orders, government resolutions, or syndicate approval notifications approving these charges and any recent fee revisions.'
      ]
    },
    expenditure: {
      title: 'College Fund Expenditure',
      userQuery: 'Where were the government and institutional funds spent that our college received for student amenities and campus development?',
      authority: 'College Finance & Accounts Branch / Directorate of Higher Education',
      category: 'College Fund Expenditure',
      records: [
        'Certified details of government grants (UGC, RUSA, State Grants) and institutional funds received for campus infrastructure and student amenities during the last 3 financial years.',
        'Itemized head-wise expenditure statements, audited balance sheets, and Utilization Certificates (UCs) submitted for laboratory and student facilities.',
        'Certified copies of official sanction orders, administrative approvals, passed contractor bills, and payment vouchers for completed infrastructure works.'
      ]
    },
    equipment: {
      title: 'Laboratory Equipment & Infrastructure',
      userQuery: 'Our computer and science labs have non-functional equipment. When was it purchased, how much did it cost, and what are the repair records?',
      authority: 'Public Information Officer (PIO) & Central Purchase / Stores Committee',
      category: 'Laboratory Procurement & Infrastructure',
      records: [
        'Certified copy of the stock register and purchase invoices for laboratory apparatus, computing equipment, and instruments purchased during the last 3 financial years.',
        'Itemized procurement details including vendor/supplier names, approved tender costs, purchase dates, and official installation/commissioning reports.',
        'Certified copies of Annual Maintenance Contracts (AMC), maintenance/repair logbooks, and records of reported non-functional equipment along with action taken.'
      ]
    }
  };

  const currentScenario = scenarios[activeScenario];

  const faqs = [
    {
      q: 'What is an RTI?',
      a: 'The Right to Information (RTI) Act, 2005 is a landmark Indian law that empowers citizens to request information, inspect public works, and obtain certified records from government bodies and public authorities. Its objective is to promote transparency, accountability, and contain corruption.'
    },
    {
      q: 'Who can file an RTI?',
      a: 'Any citizen of India can file an RTI request. You do not need to be a lawyer, journalist, or public official. You can ask for records regardless of whether you are personally affected, and public authorities are legally obligated to reply within statutory deadlines.'
    },
    {
      q: 'How much does an RTI application cost?',
      a: 'Under Central Government rules, the application fee is ₹10. Payment can be made online via debit/credit card, UPI, or net banking on the Central portal, or via Indian Postal Order (IPO) or court fee stamps for offline submissions. Citizens living Below the Poverty Line (BPL) are exempt from all application and copying fees.'
    },
    {
      q: 'How long does a public authority have to respond?',
      a: 'Under Section 7(1) of the RTI Act, a Public Information Officer (PIO) must furnish the requested information within 30 calendar days from receipt of application. Crucially, if the information sought concerns the life or liberty of a person, the statutory deadline is reduced to just 48 hours.'
    },
    {
      q: 'Can RTI Assist file an RTI for me?',
      a: 'RTI Assist is an intelligent drafting, structuring, and tracking platform. We help you turn plain-language questions into legally precise, record-based requests, suggest the proper authority, and organize your deadlines. Once drafted, you submit the application directly on the official government portal (such as rtionline.gov.in) or via speed post.'
    },
    {
      q: 'What happens if my RTI is rejected?',
      a: 'If your application is rejected or if 30 days pass without any response (known as "Deemed Refusal" under Section 7(2)), the law gives you the right to file an Appeal. You can file a First Appeal before the First Appellate Authority (FAA) within 30 days of the refusal.'
    },
    {
      q: 'What is a First Appeal?',
      a: 'A First Appeal is a statutory petition filed under Section 19(1) of the RTI Act against a PIO who failed to respond, delayed the response beyond 30 days, or wrongfully denied information under Section 8 exemptions without justification. As per Section 7(6), if information is delayed beyond statutory timelines, it must be provided completely free of charge.'
    },
    {
      q: 'Is RTI Assist affiliated with the government?',
      a: 'No. RTI Assist is an independent legal-technology assistance platform created to empower citizens. It is not affiliated with, operated by, or endorsed by any government ministry, Public Authority, or Information Commission.'
    }
  ];

  const guides = [
    {
      id: 'what-is-rti',
      title: 'What is RTI?',
      subtitle: 'Understand the basics of the Right to Information Act.',
      readTime: '4 min read',
      badge: 'Basics',
      summary: 'Learn the foundational principles of the RTI Act 2005, what constitutes public authority, and your fundamental right to inspect government records.',
      content: [
        'Enacted in 2005, the Right to Information Act covers all Central, State, and local government bodies, including public sector undertakings, universities, and government-aided institutions.',
        'Under Section 2(j), your right extends to inspecting public works, documents, and records; taking certified copies of documents; and taking certified samples of materials used in public infrastructure.',
        'You do not need to give reasons for seeking information or explain your personal interest in the requested files.'
      ]
    },
    {
      id: 'effective-rti',
      title: 'How to write an effective RTI',
      subtitle: 'Learn how to turn a broad question into a precise information request.',
      readTime: '6 min read',
      badge: 'Drafting Guide',
      summary: 'Avoid the common traps of asking "why" or asking for opinions. Master the technique of requesting identifiable, certified records.',
      content: [
        'The #1 reason RTIs are rejected or delayed is framing requests as interrogative questions ("Why did the department delay my scholarship?"). Under the RTI Act, PIOs are not required to generate answers, create new opinions, or justify administrative decisions.',
        'Always frame your points around identifiable records: "Certified copy of the file notings recorded regarding...", "Approved sanction order detailing...", or "Standard citizen charter prescribed for..."',
        'Keep your points numbered, concise, and specific to the relevant department and financial year.'
      ]
    },
    {
      id: 'after-filing',
      title: 'What happens after filing?',
      subtitle: 'Understand timelines, responses and possible next steps.',
      readTime: '5 min read',
      badge: 'Timelines',
      summary: 'A step-by-step roadmap of what happens between submission and receipt of records, including Section 6(3) department transfers.',
      content: [
        'Day 1 to 5: Your application is received and assigned an official registration number by the PIO.',
        'Section 6(3) Transfer: If the information relates to another public authority, the PIO must transfer your application within 5 days and immediately notify you.',
        'Day 30: Statutory deadline for reply under Section 7(1). If the PIO demands copying fees, they must explain the calculation.',
        'Life & Liberty: If the information impacts personal life or liberty, the response window is strictly 48 hours.'
      ]
    },
    {
      id: 'first-appeal',
      title: 'First Appeal explained',
      subtitle: 'Understand what to do when information is delayed or incomplete.',
      readTime: '7 min read',
      badge: 'Appeals',
      summary: 'How to challenge deemed refusal, invoke Section 7(6) free information entitlements, and file before the First Appellate Authority.',
      content: [
        'If the PIO fails to respond within 30 days, Section 7(2) deems this a refusal. You are entitled to file a First Appeal under Section 19(1) before the senior officer designated as First Appellate Authority (FAA).',
        'Crucial legal advantage: Section 7(6) mandates that where a public authority fails to give information within statutory timelines, all requested documents must be supplied free of cost.',
        'The First Appellate Authority must dispose of your appeal within 30 to 45 days. If dissatisfied, you may escalate to a Second Appeal before the Central or State Information Commission.'
      ]
    }
  ];

  // Expanded high-credibility testimonials with ratings, outcomes, and categories (Default Mock Data)
  const MOCK_TESTIMONIALS = [
    {
      id: 1,
      quote: "My post-matric scholarship was pending for 8 months. Every time I called the college, they said 'file under process'. Using RTI Assist, I requested certified file notings and fund release sanction ID under Section 6(1). Within 19 days, the nodal officer cleared the file and ₹48,000 was disbursed to my account.",
      name: "Pooja Sharma",
      role: "Ph.D Scholar & Student",
      location: "New Delhi",
      category: "Education & Scholarships",
      authority: "Dept of Higher Education & Social Welfare",
      outcome: "₹48,000 Disbursed in 19 Days",
      rating: 5,
      avatarColor: "bg-[var(--accent)] text-[var(--accent-foreground)]",
      initials: "PS",
      verified: true
    },
    {
      id: 2,
      quote: "Our colony main road developed massive craters within 3 months of construction. Complaints went unheard. We drafted an RTI asking for the Measurement Book (MB) entries and Defect Liability Period (DLP) terms. The municipal executive engineer inspected the site and the contractor repaired it under warranty at zero public cost.",
      name: "Arunachalam K.",
      role: "RWA Secretary & Civic Volunteer",
      location: "Bengaluru",
      category: "Civic & Roads",
      authority: "Bruhat Bengaluru Mahanagara Palike (BBMP)",
      outcome: "Road Repaired under Warranty",
      rating: 5,
      avatarColor: "bg-[var(--primary)] text-[var(--primary-foreground)]",
      initials: "AK",
      verified: true
    },
    {
      id: 3,
      quote: "In the State PSC Lecturer recruitment, the normalization cutoff was withheld and multiple candidates with lower raw scores were shortlisted. We requested our certified OMR photocopy and normalization formula. The commission was forced to publish the revised key and merit roster, correcting my rank by 42 positions.",
      name: "Dr. Shalini Sen",
      role: "Assistant Professor Aspirant",
      location: "Kolkata",
      category: "Recruitment & Exams",
      authority: "State Public Service Commission",
      outcome: "Rank Corrected by 42 Positions",
      rating: 5,
      avatarColor: "bg-[var(--secondary)] text-[var(--secondary-foreground)]",
      initials: "SS",
      verified: true
    },
    {
      id: 4,
      quote: "The district civil hospital's MRI scanner was out of service for 7 months, forcing poor patients to private diagnostic labs charging ₹6,000. Through RTI Assist, we sought copies of the annual maintenance contract (AMC) and repair downtime logs. The equipment was restored and commissioned within 10 days of filing.",
      name: "Rohan Deshmukh",
      role: "Investigative Reporter",
      location: "Hyderabad",
      category: "Healthcare & Public Services",
      authority: "State Directorate of Health Services",
      outcome: "Hospital MRI Restored in 10 Days",
      rating: 5,
      avatarColor: "bg-[var(--chart-1)] text-white",
      initials: "RD",
      verified: true
    },
    {
      id: 5,
      quote: "Tracking the 30-day statutory countdown gave us incredible leverage. When the PIO failed to respond on day 30, RTI Assist automatically flagged Section 7(2) Deemed Refusal and generated our First Appeal under Section 19(1). The First Appellate Authority ordered all university recruitment records provided to us completely free of cost under Section 7(6).",
      name: "Meera Vashisth",
      role: "Legal Researcher",
      location: "Pune",
      category: "Education & Scholarships",
      authority: "Central University Syndicate",
      outcome: "Sec 7(6) Free Records Order",
      rating: 5,
      avatarColor: "bg-[var(--accent)] text-[var(--accent-foreground)]",
      initials: "MV",
      verified: true
    },
    {
      id: 6,
      quote: "The local fair price shop was refusing subsidized grain claiming central quota shortage. We filed an RTI demanding the monthly opening/closing stock register and electronic POS upload records. The district food supply officer conducted an immediate audit and suspended the shop license for diverting 140 quintals.",
      name: "Manish Tiwari",
      role: "Civic Rights Activist",
      location: "Prayagraj",
      category: "Healthcare & Public Services",
      authority: "Food & Civil Supplies Department",
      outcome: "PDS Grain Supply Restored",
      rating: 5,
      avatarColor: "bg-[var(--secondary)] text-[var(--secondary-foreground)]",
      initials: "MT",
      verified: true
    },
    {
      id: 7,
      quote: "NHAI was collecting full toll on a stretch where two lanes were barricaded for bridge maintenance causing 45-minute jams daily. We requested the safety clearance notification and concessionaire agreement penalty terms. Toll rates were reduced by 50% until the bridge work was completed.",
      name: "Vikramaditya Roy",
      role: "Transport & Logistics Owner",
      location: "Jaipur",
      category: "Civic & Roads",
      authority: "National Highways Authority of India (NHAI)",
      outcome: "50% Toll Reduction Granted",
      rating: 5,
      avatarColor: "bg-[var(--primary)] text-[var(--primary-foreground)]",
      initials: "VR",
      verified: true
    },
    {
      id: 8,
      quote: "My University announced an unexpected ₹18,000 'Development & Infrastructure Fee' in our final year without syndicate notification. We drafted an RTI asking for the agenda notes and Finance Committee approval. When they couldn't produce official sanction, the fee hike was rescinded for the entire batch.",
      name: "Ananya Iyer",
      role: "Student Council Representative",
      location: "Chennai",
      category: "Education & Scholarships",
      authority: "State Technical University Registrar",
      outcome: "₹18,000 Fee Hike Rescinded",
      rating: 5,
      avatarColor: "bg-[var(--accent)] text-[var(--accent-foreground)]",
      initials: "AI",
      verified: true
    }
  ];

  const testimonialCategories = [
    'All',
    'Education & Scholarships',
    'Civic & Roads',
    'Recruitment & Exams',
    'Healthcare & Public Services'
  ];

  // Dynamically replace mock testimonials with real user-submitted stories
  const activeTestimonials = useMemo(() => {
    if (userStories.length === 0) return MOCK_TESTIMONIALS;
    if (userStories.length >= MOCK_TESTIMONIALS.length) {
      return userStories;
    }
    // Real user stories take precedence, replacing mock entries from index 0
    return [...userStories, ...MOCK_TESTIMONIALS.slice(userStories.length)];
  }, [userStories]);

  const filteredTestimonials = useMemo(() => {
    return testimonialCategory === 'All'
      ? activeTestimonials
      : activeTestimonials.filter((t) => t.category === testimonialCategory);
  }, [testimonialCategory, activeTestimonials]);

  const aiExamples = [
    {
      category: 'Education & Admissions',
      userRaw: 'I want to know how much my college charges SC students compared with General students.',
      aiResponse: 'Got it. I can help turn this into a precise RTI request. Let\'s identify the correct authority and the records you need.',
      transformedPoints: [
        'Certified copy of the sanctioned fee structure approved by University Senate/Academic Council for 2023–27.',
        'Departmental notification detailing category-wise fee concessions and reimbursements applicable to SC/ST students.',
        'Certified copy of total fee amount collected and audited for the academic year across both categories.'
      ]
    },
    {
      category: 'Public Works & Roads',
      userRaw: 'Why hasn\'t our street been repaired even after budget was passed last year?',
      aiResponse: 'Let\'s convert this into an audit trail request. Under RTI Act 2005, public authorities must provide copies of files, measurement books, and sanction orders.',
      transformedPoints: [
        'Certified copy of the work order and administrative approval issued for road resurfacing in Ward 14.',
        'Certified copy of the Measurement Book (MB) entries and quality control inspection certificates.',
        'Details of the contractor name, total funds disbursed, and active Defect Liability Period (DLP) duration.'
      ]
    },
    {
      category: 'Examination & Recruitment',
      userRaw: 'I think my exam marks were calculated wrong. Why did people with lower marks get selected?',
      aiResponse: 'Rather than asking for reasons, we will request your certified answer sheet, master question paper, and official normalization formula.',
      transformedPoints: [
        'Certified photocopy of evaluated OMR / descriptive answer sheet for Roll Number: 440192.',
        'Certified copy of the final official answer key and cut-off marks published category-wise.',
        'Certified copy of the normalization methodology adopted by the recruitment board.'
      ]
    }
  ];

  const tickerItems = [
    '⏱️ 30 DAYS — STANDARD RTI RESPONSE TIME',
    '⚡ 48 HOURS — LIFE & LIBERTY CASES',
    '💰 ₹10 — STANDARD APPLICATION FEE',
    '🆓 ₹0 — APPLICATION FEE FOR BPL APPLICANTS',
    '📤 5 DAYS — TIME TO TRANSFER AN RTI',
    '⚖️ ₹250/DAY — PIO PENALTY FOR DELAY',
    '🚨 ₹25,000 — MAXIMUM PIO PENALTY',
    '📋 FIRST APPEAL — IF NO/INCOMPLETE RESPONSE',
    '🏛️ CIC / SIC — SECOND APPEAL AUTHORITIES',
    '🇮🇳 INDIAN CITIZENS — ELIGIBLE TO FILE RTI'
  ];


  return (
    <div className="bg-[var(--background)] text-[var(--foreground)] font-sans relative">
      {/* 0. STICKY TOP SCROLL PROGRESS BAR */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-[var(--background)] pointer-events-none">
        <div
          className="h-full bg-[var(--primary)] transition-all duration-75"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* 1. HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 border-b-2 border-[var(--border)] bg-[var(--background)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill Badge matching Header */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 border-2 border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-black shadow-[2px_2px_0px_0px_var(--shadow-color)] uppercase tracking-wider">
              <span className="w-2 h-2 bg-[var(--accent-foreground)]" />
              <span>Right to Information Act, 2005 Intelligence</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-[72px] font-black text-[var(--foreground)] tracking-tight leading-[1.08]">
              Your questions <br className="hidden sm:inline" />
              <span className="bg-[var(--accent)] text-[var(--accent-foreground)] px-3 py-0.5 inline-block border-2 border-[var(--border)] shadow-[4px_4px_0px_0px_var(--shadow-color)] my-1">
                deserve answers.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-lg sm:text-xl text-[var(--foreground)] font-medium leading-relaxed max-w-2xl mx-auto">
              RTI Assist helps you understand, draft, and manage Right to Information requests — without the complexity.
            </p>

            {/* Primary & Secondary CTAs matching Header */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
              <Link
                to="/intake"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 border-2 border-[var(--border)] font-bold text-base text-[var(--primary-foreground)] bg-[var(--primary)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] shadow-[4px_4px_0px_0px_var(--shadow-color)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Create an RTI</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 border-2 border-[var(--border)] font-bold text-base text-[var(--foreground)] bg-[var(--card)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] shadow-[4px_4px_0px_0px_var(--shadow-color)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
              >
                <span>See How It Works</span>
              </a>
            </div>

            {/* Micro Trust Bullets */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-3 text-xs font-bold text-[var(--foreground)]">
              <span className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-[var(--border)] bg-[var(--card)] shadow-[2px_2px_0px_0px_var(--shadow-color)]">
                <CheckCircle2 className="w-4 h-4 text-[var(--secondary)]" />
                <span>Free to draft</span>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-[var(--border)] bg-[var(--card)] shadow-[2px_2px_0px_0px_var(--shadow-color)]">
                <CheckCircle2 className="w-4 h-4 text-[var(--secondary)]" />
                <span>No legal jargon required</span>
              </span>
            </div>
          </div>

          {/* Interactive Hero Product Mockup */}
          <div className="mt-14 max-w-5xl mx-auto">
            {/* Window Container */}
            <div className="border-2 border-[var(--border)] bg-[var(--card)] shadow-[6px_6px_0px_0px_var(--shadow-color)] overflow-hidden">
              {/* Window Titlebar */}
              <div className="px-5 py-3.5 bg-[var(--card)] border-b-2 border-[var(--border)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border border-[var(--border)] bg-[var(--primary)]" />
                  <div className="w-3.5 h-3.5 border border-[var(--border)] bg-[var(--accent)]" />
                  <div className="w-3.5 h-3.5 border border-[var(--border)] bg-[var(--secondary)]" />
                  <span className="ml-3 text-xs font-bold text-[var(--foreground)]">
                    RTI Assist Drafting Studio
                  </span>
                </div>

                {/* Scenario switcher tabs */}
                <div className="hidden sm:flex items-center gap-1.5 bg-[var(--background)] p-1 border-2 border-[var(--border)] text-xs">
                  <button
                    onClick={() => setActiveScenario('fees')}
                    className={`px-3 py-1 font-bold transition border-2 border-[var(--border)] cursor-pointer ${
                      activeScenario === 'fees'
                        ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[2px_2px_0px_0px_var(--shadow-color)]'
                        : 'bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]'
                    }`}
                  >
                    Fee Structure
                  </button>
                  <button
                    onClick={() => setActiveScenario('expenditure')}
                    className={`px-3 py-1 font-bold transition border-2 border-[var(--border)] cursor-pointer ${
                      activeScenario === 'expenditure'
                        ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[2px_2px_0px_0px_var(--shadow-color)]'
                        : 'bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]'
                    }`}
                  >
                    Fund Expenditure
                  </button>
                  <button
                    onClick={() => setActiveScenario('equipment')}
                    className={`px-3 py-1 font-bold transition border-2 border-[var(--border)] cursor-pointer ${
                      activeScenario === 'equipment'
                        ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[2px_2px_0px_0px_var(--shadow-color)]'
                        : 'bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]'
                    }`}
                  >
                    Lab Equipment
                  </button>
                </div>
              </div>

              {/* Mockup Body: Split view */}
              <div className="grid grid-cols-1 lg:grid-cols-12 divide-y-2 lg:divide-y-0 lg:divide-x-2 divide-[var(--border)]">
                {/* Left: Citizen Input */}
                <div className="lg:col-span-5 p-6 sm:p-8 bg-[var(--card)] space-y-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-[var(--muted-foreground)]">
                        Citizen Plain-Language Input
                      </span>
                      <span className="text-[11px] font-bold text-[var(--secondary)] border-2 border-[var(--border)] bg-[var(--background)] px-2 py-0.5 shadow-[2px_2px_0px_0px_var(--shadow-color)]">
                        Input Analyzed
                      </span>
                    </div>

                    {/* User speech bubble */}
                    <div className="bg-[var(--background)] p-4 border-2 border-[var(--border)] shadow-[3px_3px_0px_0px_var(--shadow-color)] space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-[var(--foreground)]">
                        <div className="w-6 h-6 border-2 border-[var(--border)] bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center text-[11px] font-black shadow-[1px_1px_0px_0px_var(--shadow-color)]">
                          U
                        </div>
                        <span>Citizen Concern</span>
                      </div>
                      <p className="text-sm font-semibold text-[var(--foreground)] italic">
                        "{currentScenario.userQuery}"
                      </p>
                    </div>

                    {/* AI Reframe Indicator */}
                    <div className="flex items-start gap-3 p-4 border-2 border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] shadow-[3px_3px_0px_0px_var(--shadow-color)]">
                      <div className="w-6 h-6 border-2 border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)] flex items-center justify-center shrink-0 shadow-[1px_1px_0px_0px_var(--shadow-color)]">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold">RTI Assist Formulation: </span>
                        <span className="font-medium">
                          Here's a clearer way to request that information under Section 6(1), asking for certified documents rather than explanations.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Authority Suggestion */}
                  <div className="p-4 border-2 border-[var(--border)] bg-[var(--background)] shadow-[3px_3px_0px_0px_var(--shadow-color)] space-y-1">
                    <span className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
                      Suggested Authority
                    </span>
                    <p className="text-xs font-bold text-[var(--foreground)] flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[var(--primary)] shrink-0" />
                      <span>{currentScenario.authority}</span>
                    </p>
                  </div>
                </div>

                {/* Right: Legal Document Presentation */}
                <div className="lg:col-span-7 p-6 sm:p-8 bg-[var(--background)] space-y-5">
                  <div className="flex items-center justify-between border-b-2 border-[var(--border)] pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 border-2 border-[var(--border)] bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center shadow-[1px_1px_0px_0px_var(--shadow-color)]">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-black text-[var(--foreground)] tracking-wide uppercase">
                        Formulated RTI Application (Ready to File)
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-[var(--accent-foreground)] bg-[var(--accent)] px-2 py-0.5 border border-[var(--border)]">
                      RTI Act 2005
                    </span>
                  </div>

                  {/* Document Preview Card */}
                  <div className="space-y-4 text-xs sm:text-sm text-[var(--foreground)] font-mono">
                    <div className="space-y-1 text-xs">
                      <p className="font-bold text-[var(--foreground)]">
                        To: Public Information Officer (PIO)
                      </p>
                      <p className="text-[var(--muted-foreground)] text-[11px]">
                        Subject: Request for certified records under Section 6(1) of RTI Act, 2005
                      </p>
                    </div>

                    <div className="space-y-2.5 pt-1">
                      <p className="font-bold text-xs text-[var(--foreground)]">
                        Particulars of Information Sought:
                      </p>
                      <ol className="space-y-2 pl-4 list-decimal marker:font-bold marker:text-[var(--primary)] text-xs sm:text-sm leading-relaxed font-sans">
                        {currentScenario.records.map((item, idx) => (
                          <li key={idx} className="text-[var(--foreground)] pl-1 font-medium">
                            {item}
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="pt-2 text-[11px] text-[var(--muted-foreground)] italic border-t-2 border-[var(--border)] flex items-center justify-between">
                      <span>Inspection requested pursuant to Section 2(j)(i) & (ii).</span>
                      <span className="font-bold text-[var(--secondary)]">30-day clock applies</span>
                    </div>
                  </div>

                  {/* Document Action footer */}
                  <div className="pt-3 border-t-2 border-[var(--border)] flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--foreground)]">
                      Standard fee: <strong className="text-[var(--primary)]">₹10</strong> (Free for BPL)
                    </span>
                    <Link
                      to="/intake"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border-2 border-[var(--border)] text-xs font-bold text-[var(--primary-foreground)] bg-[var(--primary)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] shadow-[2px_2px_0px_0px_var(--shadow-color)] transition"
                    >
                      <span>Draft Your Own RTI</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DYNAMIC SCROLLING STATUTORY MARQUEE TICKER */}
      <div className="border-b-2 border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)] py-2.5 overflow-hidden select-none">
        <div className="animate-marquee font-black text-xs uppercase tracking-wider flex items-center gap-8 whitespace-nowrap">
          {tickerItems.concat(tickerItems).map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <span>{item}</span>
              <span className="inline-block w-2 h-2 bg-[var(--accent-foreground)] opacity-70" />
            </div>
          ))}
        </div>
      </div>

      {/* 3. TRUST SECTION */}
      <section id="trust" className="border-b-2 border-[var(--border)] bg-[var(--card)] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-bold shadow-[2px_2px_0px_0px_var(--shadow-color)] uppercase tracking-wider">
              Statutory Integrity
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[var(--foreground)] tracking-tight">
              Built to make public information more accessible.
            </h2>
            <p className="text-sm sm:text-base text-[var(--foreground)] font-medium">
              Designed with legal clarity, privacy by design, and strict alignment with the Right to Information Act, 2005.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Trust Indicator 1 */}
            <div className="p-6 sm:p-7 border-2 border-[var(--border)] bg-[var(--background)] shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-all space-y-4">
              <div className="w-12 h-12 border-2 border-[var(--border)] bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center font-bold shadow-[2px_2px_0px_0px_var(--shadow-color)]">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-[var(--foreground)]">Guided RTI Drafting</h3>
              <p className="text-sm text-[var(--foreground)] font-medium leading-relaxed">
                Reframes everyday colloquial questions into legally actionable requests for official, certified public records.
              </p>
            </div>

            {/* Trust Indicator 2 */}
            <div className="p-6 sm:p-7 border-2 border-[var(--border)] bg-[var(--background)] shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-all space-y-4">
              <div className="w-12 h-12 border-2 border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)] flex items-center justify-center font-bold shadow-[2px_2px_0px_0px_var(--shadow-color)]">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-[var(--foreground)]">Clear Information Requests</h3>
              <p className="text-sm text-[var(--foreground)] font-medium leading-relaxed">
                Eliminates vague "why" inquiries that frequently lead to summary rejections or evasive replies from PIOs.
              </p>
            </div>

            {/* Trust Indicator 3 */}
            <div className="p-6 sm:p-7 border-2 border-[var(--border)] bg-[var(--background)] shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-all space-y-4">
              <div className="w-12 h-12 border-2 border-[var(--border)] bg-[var(--secondary)] text-[var(--secondary-foreground)] flex items-center justify-center font-bold shadow-[2px_2px_0px_0px_var(--shadow-color)]">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-[var(--foreground)]">Application Tracking</h3>
              <p className="text-sm text-[var(--foreground)] font-medium leading-relaxed">
                Monitors the mandatory 30-day Section 7(1) countdown and 48-hour life & liberty response windows automatically.
              </p>
            </div>

            {/* Trust Indicator 4 */}
            <div className="p-6 sm:p-7 border-2 border-[var(--border)] bg-[var(--background)] shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-all space-y-4">
              <div className="w-12 h-12 border-2 border-[var(--border)] bg-[var(--foreground)] text-[var(--background)] flex items-center justify-center font-bold shadow-[2px_2px_0px_0px_var(--shadow-color)]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-[var(--foreground)]">Secure User Experience</h3>
              <p className="text-sm text-[var(--foreground)] font-medium leading-relaxed">
                Your draft questions, tracking numbers, and case history remain confidential, private, and under your control.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="border-b-2 border-[var(--border)] bg-[var(--background)] py-16 sm:py-24 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-bold shadow-[2px_2px_0px_0px_var(--shadow-color)] uppercase tracking-wider">
              Step-by-Step Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--foreground)] tracking-tight">
              From question to RTI, made simple.
            </h2>
            <p className="text-base sm:text-lg text-[var(--foreground)] font-medium">
              A transparent 4-step journey that takes you from an everyday curiosity to a legally binding public records application.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="p-7 border-2 border-[var(--border)] bg-[var(--card)] shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 border-2 border-[var(--border)] bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[2px_2px_0px_0px_var(--shadow-color)] flex items-center justify-center text-xl font-black">
                  01
                </div>
                <h3 className="text-lg font-bold text-[var(--foreground)]">Tell us what you need</h3>
                <p className="text-sm text-[var(--foreground)] font-medium leading-relaxed">
                  Describe the information you're looking for in plain language. No legal expertise, section numbers, or formal phrasing required.
                </p>
              </div>
              <div className="pt-2 text-xs font-bold text-[var(--primary)] flex items-center gap-1 border-t border-[var(--border)]">
                <span>Plain language input</span>
                <span>→</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-7 border-2 border-[var(--border)] bg-[var(--card)] shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 border-2 border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)] shadow-[2px_2px_0px_0px_var(--shadow-color)] flex items-center justify-center text-xl font-black">
                  02
                </div>
                <h3 className="text-lg font-bold text-[var(--foreground)]">Refine your request</h3>
                <p className="text-sm text-[var(--foreground)] font-medium leading-relaxed">
                  RTI Assist helps turn your idea into precise, record-based questions asking for official circulars, registers, and certified copies.
                </p>
              </div>
              <div className="pt-2 text-xs font-bold text-[var(--primary)] flex items-center gap-1 border-t border-[var(--border)]">
                <span>AI question refinement</span>
                <span>→</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-7 border-2 border-[var(--border)] bg-[var(--card)] shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 border-2 border-[var(--border)] bg-[var(--secondary)] text-[var(--secondary-foreground)] shadow-[2px_2px_0px_0px_var(--shadow-color)] flex items-center justify-center text-xl font-black">
                  03
                </div>
                <h3 className="text-lg font-bold text-[var(--foreground)]">Review your application</h3>
                <p className="text-sm text-[var(--foreground)] font-medium leading-relaxed">
                  Review the suggested authority, questions, supporting details and formatted application before filing online or via post.
                </p>
              </div>
              <div className="pt-2 text-xs font-bold text-[var(--primary)] flex items-center gap-1 border-t border-[var(--border)]">
                <span>Authority guidance</span>
                <span>→</span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-7 border-2 border-[var(--border)] bg-[var(--card)] shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 border-2 border-[var(--border)] bg-[var(--foreground)] text-[var(--background)] shadow-[2px_2px_0px_0px_var(--shadow-color)] flex items-center justify-center text-xl font-black">
                  04
                </div>
                <h3 className="text-lg font-bold text-[var(--foreground)]">Track your RTI</h3>
                <p className="text-sm text-[var(--foreground)] font-medium leading-relaxed">
                  Keep your registration numbers, response countdowns, and 30-day statutory appeal deadlines organized in your dashboard.
                </p>
              </div>
              <div className="pt-2 text-xs font-bold text-[var(--primary)] flex items-center gap-1 border-t border-[var(--border)]">
                <span>Statutory deadline alarms</span>
                <span>→</span>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/intake"
              className="inline-flex items-center gap-2 px-7 py-3.5 border-2 border-[var(--border)] font-bold text-sm text-[var(--primary-foreground)] bg-[var(--primary)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] shadow-[4px_4px_0px_0px_var(--shadow-color)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            >
              <span>Start Step 1: Describe Your Issue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>


      {/* 6. FEATURE SECTION */}
      <section id="features" className="border-b-2 border-[var(--border)] bg-[var(--card)] py-16 sm:py-24 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-bold shadow-[2px_2px_0px_0px_var(--shadow-color)] uppercase tracking-wider">
              Comprehensive Platform
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--foreground)] tracking-tight">
              Everything you need to navigate an RTI.
            </h2>
            <p className="text-base sm:text-lg text-[var(--foreground)] font-medium">
              Every capability designed to guide Indian citizens, students, journalists, and researchers through the entire RTI lifecycle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <div className="p-8 border-2 border-[var(--border)] bg-[var(--background)] shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-all space-y-4">
              <div className="w-12 h-12 border-2 border-[var(--border)] bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center font-bold shadow-[2px_2px_0px_0px_var(--shadow-color)]">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[var(--foreground)]">AI-Assisted Drafting</h3>
              <p className="text-sm text-[var(--foreground)] font-medium leading-relaxed">
                Turn a simple plain-language description into a structured, formal RTI application formatted strictly to Section 6(1) standards.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 border-2 border-[var(--border)] bg-[var(--background)] shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-all space-y-4">
              <div className="w-12 h-12 border-2 border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)] flex items-center justify-center font-bold shadow-[2px_2px_0px_0px_var(--shadow-color)]">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[var(--foreground)]">Smart Question Refinement</h3>
              <p className="text-sm text-[var(--foreground)] font-medium leading-relaxed">
                Help users ask for specific records, documents, orders, notifications, and minutes rather than vague questions prone to dismissal.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 border-2 border-[var(--border)] bg-[var(--background)] shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-all space-y-4">
              <div className="w-12 h-12 border-2 border-[var(--border)] bg-[var(--secondary)] text-[var(--secondary-foreground)] flex items-center justify-center font-bold shadow-[2px_2px_0px_0px_var(--shadow-color)]">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[var(--foreground)]">Public Authority Guidance</h3>
              <p className="text-sm text-[var(--foreground)] font-medium leading-relaxed">
                Help users identify the appropriate authority based on their request, distinguishing between Central, State, and Municipal jurisdictions.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 border-2 border-[var(--border)] bg-[var(--background)] shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-all space-y-4">
              <div className="w-12 h-12 border-2 border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] flex items-center justify-center font-bold shadow-[2px_2px_0px_0px_var(--shadow-color)]">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[var(--foreground)]">Application Tracking</h3>
              <p className="text-sm text-[var(--foreground)] font-medium leading-relaxed">
                Keep RTI applications, registration numbers, filing dates, and response stages organized in one centralized, intuitive dashboard.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 border-2 border-[var(--border)] bg-[var(--background)] shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-all space-y-4">
              <div className="w-12 h-12 border-2 border-[var(--border)] bg-[var(--chart-1)] text-white flex items-center justify-center font-bold shadow-[2px_2px_0px_0px_var(--shadow-color)]">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[var(--foreground)]">Deadline Reminders</h3>
              <p className="text-sm text-[var(--foreground)] font-medium leading-relaxed">
                Show important statutory response deadlines, including the 30-day Section 7(1) clock and urgent 48-hour life & liberty countdowns.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 border-2 border-[var(--border)] bg-[var(--background)] shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-all space-y-4">
              <div className="w-12 h-12 border-2 border-[var(--border)] bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center font-bold shadow-[2px_2px_0px_0px_var(--shadow-color)]">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[var(--foreground)]">Appeals & Next Steps</h3>
              <p className="text-sm text-[var(--foreground)] font-medium leading-relaxed">
                Provide actionable guidance about what users can do if a response is delayed or incomplete, auto-drafting First Appeals under Section 19(1).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PRODUCT SHOWCASE */}
      <section className="border-b-2 border-[var(--border)] bg-[var(--background)] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-bold shadow-[2px_2px_0px_0px_var(--shadow-color)] uppercase tracking-wider">
              Unified Citizen Dashboard
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[var(--foreground)]">
              Your RTI, organized in one place.
            </h2>
            <p className="text-base sm:text-lg text-[var(--foreground)] font-medium">
              Experience the clarity of a modern legal dashboard designed specifically for managing Indian public records petitions.
            </p>
          </div>

          {/* Dashboard Mockup Component */}
          <div className="border-2 border-[var(--border)] bg-[var(--card)] shadow-[6px_6px_0px_0px_var(--shadow-color)] overflow-hidden">
            {/* Top Stat Counters Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x-2 divide-y-2 md:divide-y-0 divide-[var(--border)] border-b-2 border-[var(--border)] bg-[var(--card)]">
              <div className="p-4 sm:p-5">
                <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase">Active Applications</span>
                <p className="text-3xl font-black text-[var(--foreground)] mt-1">4</p>
              </div>
              <div className="p-4 sm:p-5">
                <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase">Awaiting PIO Reply</span>
                <p className="text-3xl font-black text-[var(--primary)] mt-1">2</p>
              </div>
              <div className="p-4 sm:p-5">
                <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase">Appeals Due Soon</span>
                <p className="text-3xl font-black text-[var(--accent)] mt-1">1</p>
              </div>
              <div className="p-4 sm:p-5">
                <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase">Information Received</span>
                <p className="text-3xl font-black text-[var(--secondary)] mt-1">7</p>
              </div>
            </div>

            {/* Application List & Active Detail Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y-2 lg:divide-y-0 lg:divide-x-2 divide-[var(--border)]">
              {/* Table of Active Petitions */}
              <div className="lg:col-span-8 p-6 sm:p-8 space-y-4 bg-[var(--background)]">
                <div className="flex items-center justify-between border-b-2 border-[var(--border)] pb-3">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-xs font-black text-[var(--foreground)] tracking-wide uppercase">
                      Active RTI Applications
                    </h3>
                    <span className="text-[10px] font-semibold text-[var(--muted-foreground)] px-2 py-0.5 border border-[var(--border)] bg-[var(--card)] shadow-[1px_1px_0px_0px_var(--shadow-color)]">
                      * Illustrative Mock Data
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[var(--primary)] font-mono">Live Deadline Tracking</span>
                </div>

                <div className="space-y-3">
                  {/* Case Item 1 */}
                  <div className="p-4 border-2 border-[var(--border)] bg-[var(--card)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[3px_3px_0px_0px_var(--shadow-color)]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[var(--primary)]">MHRD/R/2026/00142</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 border border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)]">
                          First Appeal Due
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-[var(--foreground)]">
                        Sanctioned vs Vacant Faculty Posts across Central Universities
                      </h4>
                      <p className="text-xs font-medium text-[var(--muted-foreground)]">
                        Dept of Higher Education • Filed: 14 Aug 2026
                      </p>
                    </div>

                    <div className="text-right sm:shrink-0">
                      <span className="text-xs font-black text-[var(--chart-1)] block">30d Elapsed</span>
                      <span className="text-[11px] font-bold text-[var(--muted-foreground)]">Sec 7(2) Deemed Refusal</span>
                    </div>
                  </div>

                  {/* Case Item 2 */}
                  <div className="p-4 border-2 border-[var(--border)] bg-[var(--card)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[3px_3px_0px_0px_var(--shadow-color)]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[var(--primary)]">NHAI/R/2026/88412</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 border border-[var(--border)] bg-[var(--primary)] text-[var(--primary-foreground)]">
                          PIO Review Active
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-[var(--foreground)]">
                        Highway Toll Concessionaire Safety & Surface Inspection Audit
                      </h4>
                      <p className="text-xs font-medium text-[var(--muted-foreground)]">
                        NHAI Headquarters • Filed: 02 Sep 2026
                      </p>
                    </div>

                    <div className="text-right sm:shrink-0">
                      <span className="text-xs font-black text-[var(--primary)] block">14 Days Left</span>
                      <span className="text-[11px] font-bold text-[var(--muted-foreground)]">Due: 02 Oct 2026</span>
                    </div>
                  </div>

                  {/* Case Item 3 */}
                  <div className="p-4 border-2 border-[var(--border)] bg-[var(--card)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[3px_3px_0px_0px_var(--shadow-color)]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[var(--primary)]">MCD/R/2026/19302</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 border border-[var(--border)] bg-[var(--secondary)] text-[var(--secondary-foreground)]">
                          Submitted
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-[var(--foreground)]">
                        Ward 12 Stormwater Drain Desilting Tender & Silt Disposal Records
                      </h4>
                      <p className="text-xs font-medium text-[var(--muted-foreground)]">
                        Municipal Corporation • Filed: 18 Sep 2026
                      </p>
                    </div>

                    <div className="text-right sm:shrink-0">
                      <span className="text-xs font-black text-[var(--secondary)] block">24 Days Left</span>
                      <span className="text-[11px] font-bold text-[var(--muted-foreground)]">Due: 18 Oct 2026</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel: Upcoming Statutory Deadline & Recent Activity */}
              <div className="lg:col-span-4 p-6 sm:p-8 space-y-6 bg-[var(--card)]">
                {/* Upcoming Deadline Box */}
                <div className="p-5 border-2 border-[var(--border)] bg-[var(--background)] shadow-[3px_3px_0px_0px_var(--shadow-color)] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black text-[var(--accent)] uppercase">
                    <AlertTriangle className="w-4 h-4 text-[var(--accent)]" />
                    <span>Statutory Deadline Alert</span>
                  </div>
                  <h4 className="text-sm font-bold text-[var(--foreground)]">
                    First Appeal window closes in 6 days
                  </h4>
                  <p className="text-xs font-medium text-[var(--muted-foreground)] leading-relaxed">
                    Under Section 19(1), appeals against deemed refusal must be filed within 30 days of the PIO deadline expiration.
                  </p>
                  <div className="pt-2">
                    <Link
                      to="/appeals/appeal-201"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--primary)] hover:underline"
                    >
                      <span>Draft First Appeal Document →</span>
                    </Link>
                  </div>
                </div>

                {/* Recent Activity Feed */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[var(--foreground)]">
                    Recent Activity
                  </h4>
                  <ul className="space-y-3 text-xs font-medium text-[var(--foreground)]">
                    <li className="flex items-start gap-2.5 p-2.5 border-2 border-[var(--border)] bg-[var(--background)] shadow-[2px_2px_0px_0px_var(--shadow-color)]">
                      <CheckCircle2 className="w-4 h-4 text-[var(--secondary)] shrink-0 mt-0.5" />
                      <span>PIO acknowledged NHAI toll query (Reg #88412).</span>
                    </li>
                    <li className="flex items-start gap-2.5 p-2.5 border-2 border-[var(--border)] bg-[var(--background)] shadow-[2px_2px_0px_0px_var(--shadow-color)]">
                      <Clock className="w-4 h-4 text-[var(--chart-1)] shrink-0 mt-0.5" />
                      <span>30-day response clock expired for University faculty posts.</span>
                    </li>
                    <li className="flex items-start gap-2.5 p-2.5 border-2 border-[var(--border)] bg-[var(--background)] shadow-[2px_2px_0px_0px_var(--shadow-color)]">
                      <Sparkles className="w-4 h-4 text-[var(--primary)] shrink-0 mt-0.5" />
                      <span>AI drafted new petition for Ward 12 stormwater drain.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. AI ASSISTANT SECTION */}
      <section className="border-b-2 border-[var(--border)] bg-[var(--card)] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading & Explanation */}
            <div className="lg:col-span-5 space-y-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-bold shadow-[2px_2px_0px_0px_var(--shadow-color)] uppercase tracking-wider">
                Conversational Formulation Engine
              </span>

              <h2 className="text-3xl sm:text-4xl font-black text-[var(--foreground)] tracking-tight leading-tight">
                Don't know how to phrase your RTI? <br className="hidden sm:inline" />
                <span className="bg-[var(--accent)] text-[var(--accent-foreground)] px-2.5 py-0.5 border-2 border-[var(--border)] shadow-[3px_3px_0px_0px_var(--shadow-color)] inline-block my-1">
                  Start with what you know.
                </span>
              </h2>

              <p className="text-base text-[var(--foreground)] font-medium leading-relaxed">
                Most RTIs fail because citizens ask "why" questions that officials easily deflect. RTI Assist acts as your legal drafting partner, converting informal concerns into requests for certified public records that the authority is legally compelled to provide.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 p-3.5 border-2 border-[var(--border)] bg-[var(--background)] shadow-[3px_3px_0px_0px_var(--shadow-color)]">
                  <div className="w-6 h-6 border-2 border-[var(--border)] bg-[var(--secondary)] text-[var(--secondary-foreground)] flex items-center justify-center shrink-0 mt-0.5 font-bold shadow-[1px_1px_0px_0px_var(--shadow-color)]">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    <strong>Identifies Identifiable Records:</strong> Asks for files, orders, rosters, and minutes instead of subjective explanations.
                  </p>
                </div>
                <div className="flex items-start gap-3 p-3.5 border-2 border-[var(--border)] bg-[var(--background)] shadow-[3px_3px_0px_0px_var(--shadow-color)]">
                  <div className="w-6 h-6 border-2 border-[var(--border)] bg-[var(--secondary)] text-[var(--secondary-foreground)] flex items-center justify-center shrink-0 mt-0.5 font-bold shadow-[1px_1px_0px_0px_var(--shadow-color)]">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    <strong>Authority Mapping:</strong> Automatically categorizes into scholarship, admissions, exam, or civic governance.
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  to="/intake"
                  className="inline-flex items-center gap-2 px-6 py-3.5 border-2 border-[var(--border)] font-bold text-sm text-[var(--primary-foreground)] bg-[var(--primary)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] shadow-[4px_4px_0px_0px_var(--shadow-color)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Try RTI Assist</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Column: Conversational AI Interface Card */}
            <div className="lg:col-span-7">
              <div className="border-2 border-[var(--border)] bg-[var(--card)] shadow-[6px_6px_0px_0px_var(--shadow-color)] overflow-hidden">
                {/* Category tabs */}
                <div className="px-5 py-3.5 bg-[var(--card)] border-b-2 border-[var(--border)] flex items-center gap-2 overflow-x-auto">
                  {aiExamples.map((ex, idx) => (
                    <button
                      key={idx}
                      onClick={() => setAiActiveTab(idx)}
                      className={`px-3 py-1.5 border-2 border-[var(--border)] text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                        aiActiveTab === idx
                          ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[2px_2px_0px_0px_var(--shadow-color)]'
                          : 'bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]'
                      }`}
                    >
                      {ex.category}
                    </button>
                  ))}
                </div>

                {/* Chat Thread */}
                <div className="p-6 sm:p-8 space-y-6 bg-[var(--background)]">
                  {/* User Message */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 border-2 border-[var(--border)] bg-[var(--foreground)] text-[var(--background)] flex items-center justify-center text-xs font-black shrink-0 shadow-[2px_2px_0px_0px_var(--shadow-color)]">
                      U
                    </div>
                    <div className="bg-[var(--card)] border-2 border-[var(--border)] p-4 text-sm text-[var(--foreground)] max-w-lg shadow-[3px_3px_0px_0px_var(--shadow-color)]">
                      <p className="font-bold text-xs text-[var(--muted-foreground)] mb-1">Citizen says:</p>
                      <p className="font-medium">"{aiExamples[aiActiveTab].userRaw}"</p>
                    </div>
                  </div>

                  {/* AI Assistant Message */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 border-2 border-[var(--border)] bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center text-xs font-black shrink-0 shadow-[2px_2px_0px_0px_var(--shadow-color)]">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="bg-[var(--card)] border-2 border-[var(--border)] p-5 text-sm text-[var(--foreground)] space-y-4 max-w-xl shadow-[4px_4px_0px_0px_var(--shadow-color)]">
                      <p className="font-bold">
                        {aiExamples[aiActiveTab].aiResponse}
                      </p>

                      {/* Transformed points */}
                      <div className="bg-[var(--background)] p-4 border-2 border-[var(--border)] shadow-[2px_2px_0px_0px_var(--shadow-color)] space-y-2">
                        <span className="text-[11px] font-black uppercase tracking-wider text-[var(--primary)] block">
                          Drafted RTI Points under Sec 6(1):
                        </span>
                        <ul className="space-y-2 text-xs sm:text-sm text-[var(--foreground)] font-mono">
                          {aiExamples[aiActiveTab].transformedPoints.map((pt, pIdx) => (
                            <li key={pIdx} className="flex items-start gap-2">
                              <span className="font-bold text-[var(--primary)] shrink-0">{pIdx + 1}.</span>
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center justify-between text-xs font-bold pt-1 border-t border-[var(--border)]">
                        <span>Authority: Public Information Officer</span>
                        <span className="text-[var(--secondary)]">Legally Actionable</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. EXPANDED CITIZEN TESTIMONIALS SECTION (WITH SCROLLING MARQUEE & CATEGORY FILTERS) */}
      <section className="border-b-2 border-[var(--border)] bg-[var(--background)] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header & Controls */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="flex items-center justify-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 border-2 border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-black shadow-[2px_2px_0px_0px_var(--shadow-color)] uppercase tracking-wider">
                <Award className="w-3.5 h-3.5" />
                <span>Real Citizen Impact</span>
              </span>
              <span className="text-[10px] font-semibold text-[var(--muted-foreground)] px-2 py-0.5 border border-[var(--border)] bg-[var(--card)] shadow-[1px_1px_0px_0px_var(--shadow-color)]">
                {userStories.length > 0
                  ? `* ${userStories.length} Real Submission${userStories.length > 1 ? 's' : ''} (Replaced ${Math.min(userStories.length, 8)} Mock)`
                  : '* Illustrative Mock Data (Replaced as users add real stories)'}
              </span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-[var(--foreground)] tracking-tight">
              Verified outcomes, unlocked by citizens.
            </h2>
            <p className="text-base sm:text-lg text-[var(--foreground)] font-medium leading-relaxed">
              Read how everyday students, researchers, and residents across India turned unanswered questions into certified public records.
            </p>

            {/* Filter Pills + View Mode Toggles */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              {testimonialCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setTestimonialCategory(cat);
                    if (cat !== 'All') {
                      setTestimonialViewMode('grid');
                    }
                  }}
                  className={`px-3.5 py-1.5 border-2 border-[var(--border)] text-xs font-bold transition shadow-[2px_2px_0px_0px_var(--shadow-color)] cursor-pointer ${
                    testimonialCategory === cat
                      ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                      : 'bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]'
                  }`}
                >
                  {cat}
                </button>
              ))}

              <div className="hidden sm:inline-block w-px h-6 bg-[var(--border)] mx-1" />

              <button
                onClick={() => setTestimonialViewMode(testimonialViewMode === 'marquee' ? 'grid' : 'marquee')}
                className="px-3.5 py-1.5 border-2 border-[var(--border)] text-xs font-bold bg-[var(--background)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition shadow-[2px_2px_0px_0px_var(--shadow-color)] cursor-pointer flex items-center gap-1.5"
              >
                <span>{testimonialViewMode === 'marquee' ? 'Switch to Grid View' : 'Switch to Auto-Scroll'}</span>
              </button>
            </div>
          </div>

          {/* View Mode 1: Dynamic Dual-Row Infinite Scrolling Marquee */}
          {testimonialViewMode === 'marquee' && testimonialCategory === 'All' ? (
            <div className="space-y-6 overflow-hidden select-none py-2">
              {/* Row 1: Scrolling Left */}
              <div className="animate-marquee flex items-center gap-6">
                {activeTestimonials.concat(activeTestimonials).map((t, idx) => (
                  <div
                    key={`row1-${idx}`}
                    className="w-[380px] sm:w-[420px] shrink-0 p-6 border-2 border-[var(--border)] bg-[var(--card)] shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Top Bar: Stars + Category + Real/Mock Badge */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(t.rating)].map((_, rIdx) => (
                            <Star key={rIdx} className="w-4 h-4 fill-[var(--accent)] text-[var(--accent)]" />
                          ))}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {t.isReal ? (
                            <span className="text-[10px] font-bold text-[var(--secondary)] px-1.5 py-0.5 border border-[var(--secondary)] bg-[var(--secondary)]/15">
                              Real Story
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-[var(--muted-foreground)] px-1.5 py-0.5 border border-[var(--border)] bg-[var(--background)]">
                              Mock Data
                            </span>
                          )}
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]">
                            {t.category.split(' ')[0]}
                          </span>
                        </div>
                      </div>

                      {/* Outcome Badge */}
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-bold shadow-[1px_1px_0px_0px_var(--shadow-color)]">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>{t.outcome}</span>
                      </div>

                      {/* Quote Text */}
                      <p className="text-xs sm:text-sm font-medium text-[var(--foreground)] leading-relaxed italic line-clamp-4">
                        "{t.quote}"
                      </p>
                    </div>

                    {/* Author & Verification */}
                    <div className="flex items-center justify-between pt-3 border-t-2 border-[var(--border)]">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 border-2 border-[var(--border)] ${t.avatarColor} flex items-center justify-center font-black text-xs shadow-[2px_2px_0px_0px_var(--shadow-color)]`}>
                          {t.initials}
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <h4 className="text-xs font-black text-[var(--foreground)]">{t.name}</h4>
                            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--secondary)]" />
                          </div>
                          <p className="text-[11px] text-[var(--muted-foreground)] font-medium">
                            {t.role} • {t.location}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Row 2: Scrolling Right (Reverse) */}
              <div className="animate-marquee-reverse flex items-center gap-6">
                {[...activeTestimonials].reverse().concat([...activeTestimonials].reverse()).map((t, idx) => (
                  <div
                    key={`row2-${idx}`}
                    className="w-[380px] sm:w-[420px] shrink-0 p-6 border-2 border-[var(--border)] bg-[var(--card)] shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Top Bar: Stars + Category + Real/Mock Badge */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(t.rating)].map((_, rIdx) => (
                            <Star key={rIdx} className="w-4 h-4 fill-[var(--accent)] text-[var(--accent)]" />
                          ))}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {t.isReal ? (
                            <span className="text-[10px] font-bold text-[var(--secondary)] px-1.5 py-0.5 border border-[var(--secondary)] bg-[var(--secondary)]/15">
                              Real Story
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-[var(--muted-foreground)] px-1.5 py-0.5 border border-[var(--border)] bg-[var(--background)]">
                              Mock Data
                            </span>
                          )}
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]">
                            {t.category.split(' ')[0]}
                          </span>
                        </div>
                      </div>

                      {/* Outcome Badge */}
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-bold shadow-[1px_1px_0px_0px_var(--shadow-color)]">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>{t.outcome}</span>
                      </div>

                      {/* Quote Text */}
                      <p className="text-xs sm:text-sm font-medium text-[var(--foreground)] leading-relaxed italic line-clamp-4">
                        "{t.quote}"
                      </p>
                    </div>

                    {/* Author & Verification */}
                    <div className="flex items-center justify-between pt-3 border-t-2 border-[var(--border)]">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 border-2 border-[var(--border)] ${t.avatarColor} flex items-center justify-center font-black text-xs shadow-[2px_2px_0px_0px_var(--shadow-color)]`}>
                          {t.initials}
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <h4 className="text-xs font-black text-[var(--foreground)]">{t.name}</h4>
                            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--secondary)]" />
                          </div>
                          <p className="text-[11px] text-[var(--muted-foreground)] font-medium">
                            {t.role} • {t.location}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* View Mode 2: Interactive Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredTestimonials.map((t) => (
                <div
                  key={t.id}
                  className="p-6 border-2 border-[var(--border)] bg-[var(--card)] shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(t.rating)].map((_, rIdx) => (
                          <Star key={rIdx} className="w-4 h-4 fill-[var(--accent)] text-[var(--accent)]" />
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {t.isReal ? (
                          <span className="text-[10px] font-bold text-[var(--secondary)] px-1.5 py-0.5 border border-[var(--secondary)] bg-[var(--secondary)]/15">
                            Real Story
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-[var(--muted-foreground)] px-1.5 py-0.5 border border-[var(--border)] bg-[var(--background)]">
                            Mock Data
                          </span>
                        )}
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]">
                          {t.category.split(' ')[0]}
                        </span>
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-bold shadow-[1px_1px_0px_0px_var(--shadow-color)]">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>{t.outcome}</span>
                    </div>

                    <p className="text-xs sm:text-sm font-medium text-[var(--foreground)] leading-relaxed italic">
                      "{t.quote}"
                    </p>
                  </div>

                  <div className="pt-3 border-t-2 border-[var(--border)]">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 border-2 border-[var(--border)] ${t.avatarColor} flex items-center justify-center font-black text-xs shadow-[2px_2px_0px_0px_var(--shadow-color)]`}>
                        {t.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <h4 className="text-xs font-black text-[var(--foreground)]">{t.name}</h4>
                          <CheckCircle2 className="w-3.5 h-3.5 text-[var(--secondary)]" />
                        </div>
                        <p className="text-[11px] text-[var(--muted-foreground)] font-medium">
                          {t.role} • {t.location}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Testimonial Action Bar */}
          <div className="p-6 border-2 border-[var(--border)] bg-[var(--card)] shadow-[4px_4px_0px_0px_var(--shadow-color)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border-2 border-[var(--border)] bg-[var(--secondary)] text-[var(--secondary-foreground)] flex items-center justify-center shadow-[2px_2px_0px_0px_var(--shadow-color)]">
                <Quote className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-black text-[var(--foreground)]">Have you filed an RTI using RTI Assist?</p>
                <p className="text-xs text-[var(--muted-foreground)] font-medium">Share your real outcome to replace mock demo data in the community showcase above.</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => setShowStoryModal(true)}
                className="px-5 py-2.5 border-2 border-[var(--border)] text-xs font-black uppercase tracking-wider text-[var(--primary-foreground)] bg-[var(--primary)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] shadow-[3px_3px_0px_0px_var(--shadow-color)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition cursor-pointer"
              >
                Submit Your Story
              </button>
              {userStories.length > 0 && (
                <button
                  onClick={handleClearUserStories}
                  className="px-3 py-2.5 border-2 border-[var(--border)] text-[11px] font-bold text-[var(--muted-foreground)] hover:text-[var(--foreground)] bg-[var(--background)] hover:bg-[var(--card)] shadow-[2px_2px_0px_0px_var(--shadow-color)] transition cursor-pointer"
                  title="Reset showcase back to default mock data"
                >
                  Reset Demo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modal: Submit Your Story */}
        {showStoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-[var(--card)] max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-[8px_8px_0px_0px_var(--shadow-color)] border-3 border-[var(--border)] relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowStoryModal(false)}
                className="absolute top-5 right-5 p-1 border-2 border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider border border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)] px-2 py-0.5 inline-block">
                  Citizen Community
                </span>
                <h3 className="text-2xl font-black text-[var(--foreground)]">Share Your RTI Experience</h3>
                <p className="text-xs text-[var(--muted-foreground)] font-medium">
                  Submitting your real story will immediately feature it in the showcase above and replace mock demo cards.
                </p>
              </div>

              {storySubmitted ? (
                <div className="p-6 border-2 border-[var(--border)] bg-[var(--background)] text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-[var(--secondary)] mx-auto" />
                  <h4 className="text-base font-black text-[var(--foreground)]">Your Story Is Now Live!</h4>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    It has been added to the community showcase above, replacing mock demo data.
                  </p>
                  <button
                    onClick={() => {
                      setStorySubmitted(false);
                      setShowStoryModal(false);
                    }}
                    className="px-4 py-2 border-2 border-[var(--border)] text-xs font-bold bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[2px_2px_0px_0px_var(--shadow-color)] cursor-pointer"
                  >
                    View in Showcase
                  </button>
                </div>
              ) : (
                <form onSubmit={handleStorySubmit} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-[var(--foreground)] mb-1">
                        Your Full Name *
                      </label>
                      <input
                        required
                        value={storyForm.name}
                        onChange={(e) => setStoryForm({ ...storyForm, name: e.target.value })}
                        placeholder="e.g. Ramesh Verma"
                        className="w-full p-2.5 border-2 border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-[var(--foreground)] mb-1">
                        Role & City
                      </label>
                      <input
                        value={storyForm.role}
                        onChange={(e) => setStoryForm({ ...storyForm, role: e.target.value })}
                        placeholder="e.g. Student, Lucknow"
                        className="w-full p-2.5 border-2 border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-[var(--foreground)] mb-1">
                        Category
                      </label>
                      <select
                        value={storyForm.category}
                        onChange={(e) => setStoryForm({ ...storyForm, category: e.target.value })}
                        className="w-full p-2.5 border-2 border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none"
                      >
                        <option value="Education & Scholarships">Education & Scholarships</option>
                        <option value="Civic & Roads">Civic & Roads</option>
                        <option value="Recruitment & Exams">Recruitment & Exams</option>
                        <option value="Healthcare & Public Services">Healthcare & Public Services</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-[var(--foreground)] mb-1">
                        Public Authority *
                      </label>
                      <input
                        required
                        value={storyForm.authority}
                        onChange={(e) => setStoryForm({ ...storyForm, authority: e.target.value })}
                        placeholder="e.g. State Technical University"
                        className="w-full p-2.5 border-2 border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-[var(--foreground)] mb-1">
                      Key Outcome / Impact *
                    </label>
                    <input
                      required
                      value={storyForm.outcome}
                      onChange={(e) => setStoryForm({ ...storyForm, outcome: e.target.value })}
                      placeholder="e.g. ₹18,000 Fee Hike Rescinded or Road Repaired"
                      className="w-full p-2.5 border-2 border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-[var(--foreground)] mb-1">
                      Your Story / Experience *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={storyForm.quote}
                      onChange={(e) => setStoryForm({ ...storyForm, quote: e.target.value })}
                      placeholder="Describe what information was sought, how the PIO responded, and how it helped solve the problem..."
                      className="w-full p-2.5 border-2 border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowStoryModal(false)}
                      className="px-4 py-2 border-2 border-[var(--border)] text-xs font-bold bg-[var(--background)] text-[var(--foreground)] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 border-2 border-[var(--border)] text-xs font-bold bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] shadow-[2px_2px_0px_0px_var(--shadow-color)] transition cursor-pointer"
                    >
                      Publish Story
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </section>

      {/* 10. USE CASE SECTION */}
      <section className="border-b-2 border-[var(--border)] bg-[var(--card)] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-bold shadow-[2px_2px_0px_0px_var(--shadow-color)] uppercase tracking-wider">
              Tailored Applications
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--foreground)] tracking-tight">
              Built for everyday questions.
            </h2>
            <p className="text-base sm:text-lg text-[var(--foreground)] font-medium">
              Whether you are questioning campus fee hikes, tracking road repairs, or examining public fund utilization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Use Case: Students */}
            <div className="p-7 border-2 border-[var(--border)] bg-[var(--background)] shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-all space-y-4">
              <div className="w-12 h-12 border-2 border-[var(--border)] bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center font-bold shadow-[2px_2px_0px_0px_var(--shadow-color)]">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[var(--foreground)]">Students</h3>
              <p className="text-sm text-[var(--foreground)] font-medium leading-relaxed">
                Ask about fees, scholarships, admissions, examinations, answer sheets, and institutional records.
              </p>
              <div className="pt-2 text-xs font-bold text-[var(--primary)]">
                UGC & Universities →
              </div>
            </div>

            {/* Use Case: Citizens */}
            <div className="p-7 border-2 border-[var(--border)] bg-[var(--background)] shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-all space-y-4">
              <div className="w-12 h-12 border-2 border-[var(--border)] bg-[var(--secondary)] text-[var(--secondary-foreground)] flex items-center justify-center font-bold shadow-[2px_2px_0px_0px_var(--shadow-color)]">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[var(--foreground)]">Citizens</h3>
              <p className="text-sm text-[var(--foreground)] font-medium leading-relaxed">
                Request information about public services, municipal policies, civic budgets, and local administrative decisions.
              </p>
              <div className="pt-2 text-xs font-bold text-[var(--secondary)]">
                Civic Authorities →
              </div>
            </div>

            {/* Use Case: Researchers */}
            <div className="p-7 border-2 border-[var(--border)] bg-[var(--background)] shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-all space-y-4">
              <div className="w-12 h-12 border-2 border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)] flex items-center justify-center font-bold shadow-[2px_2px_0px_0px_var(--shadow-color)]">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[var(--foreground)]">Researchers</h3>
              <p className="text-sm text-[var(--foreground)] font-medium leading-relaxed">
                Find official records, statistical disclosures, and publicly available government datasets for academic study.
              </p>
              <div className="pt-2 text-xs font-bold text-[var(--accent)]">
                Government Archives →
              </div>
            </div>

            {/* Use Case: Professionals & NGOs */}
            <div className="p-7 border-2 border-[var(--border)] bg-[var(--background)] shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-all space-y-4">
              <div className="w-12 h-12 border-2 border-[var(--border)] bg-[var(--foreground)] text-[var(--background)] flex items-center justify-center font-bold shadow-[2px_2px_0px_0px_var(--shadow-color)]">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[var(--foreground)]">Professionals & NGOs</h3>
              <p className="text-sm text-[var(--foreground)] font-medium leading-relaxed">
                Structure information requests and keep dozens of petitions and legal appeals organized across teams.
              </p>
              <div className="pt-2 text-xs font-bold text-[var(--foreground)]">
                Organizational Advocacy →
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. EDUCATIONAL / RESOURCE SECTION */}
      <section id="resources" className="border-b-2 border-[var(--border)] bg-[var(--background)] py-16 sm:py-24 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-bold shadow-[2px_2px_0px_0px_var(--shadow-color)] uppercase tracking-wider">
              Citizen Knowledge Base
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--foreground)] tracking-tight">
              Know your rights. Use them effectively.
            </h2>
            <p className="text-base sm:text-lg text-[var(--foreground)] font-medium">
              Practical guides to help you master the RTI Act 2005, avoid rejections, and protect your information rights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {guides.map((guide) => (
              <div
                key={guide.id}
                className="p-6 sm:p-7 border-2 border-[var(--border)] bg-[var(--card)] shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)]">
                      {guide.badge}
                    </span>
                    <span className="text-xs font-bold text-[var(--muted-foreground)]">{guide.readTime}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--foreground)] leading-snug">{guide.title}</h3>
                  <p className="text-xs text-[var(--muted-foreground)] font-bold">{guide.subtitle}</p>
                  <p className="text-xs text-[var(--foreground)] font-medium leading-relaxed pt-1">{guide.summary}</p>
                </div>

                <div className="pt-3 border-t-2 border-[var(--border)]">
                  <button
                    onClick={() => setActiveGuide(guide)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-[var(--border)] text-xs font-bold text-[var(--foreground)] bg-[var(--background)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] shadow-[2px_2px_0px_0px_var(--shadow-color)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                  >
                    <span>Read Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Modal for Reading Complete Guide */}
          {activeGuide && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="bg-[var(--card)] max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-[8px_8px_0px_0px_var(--shadow-color)] border-3 border-[var(--border)] relative">
                <button
                  onClick={() => setActiveGuide(null)}
                  className="absolute top-5 right-5 p-1 border-2 border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider border border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)] px-2.5 py-0.5 inline-block">
                    {activeGuide.badge}
                  </span>
                  <h3 className="text-2xl font-black text-[var(--foreground)]">{activeGuide.title}</h3>
                  <p className="text-sm text-[var(--muted-foreground)] font-bold">{activeGuide.subtitle}</p>
                </div>

                <div className="space-y-3.5 text-sm text-[var(--foreground)] font-medium leading-relaxed border-t-2 border-b-2 border-[var(--border)] py-4 bg-[var(--background)] p-4 shadow-[2px_2px_0px_0px_var(--shadow-color)]">
                  {activeGuide.content.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--muted-foreground)]">Right to Information Act, 2005</span>
                  <button
                    onClick={() => setActiveGuide(null)}
                    className="px-4 py-2 border-2 border-[var(--border)] font-bold text-xs text-[var(--primary-foreground)] bg-[var(--primary)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] shadow-[2px_2px_0px_0px_var(--shadow-color)] transition cursor-pointer"
                  >
                    Close Guide
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 12. FAQ SECTION */}
      <section id="faqs" className="border-b-2 border-[var(--border)] bg-[var(--card)] py-16 sm:py-24 scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-bold shadow-[2px_2px_0px_0px_var(--shadow-color)] uppercase tracking-wider">
              Frequently Asked Questions
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[var(--foreground)] tracking-tight">
              Clear answers about filing an RTI.
            </h2>
            <p className="text-base text-[var(--foreground)] font-medium">
              Everything you need to know about the RTI Act, statutory fees, deadlines, and appeals.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="border-2 border-[var(--border)] bg-[var(--background)] shadow-[4px_4px_0px_0px_var(--shadow-color)] transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-[var(--card)] transition focus:outline-none cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className="text-base font-bold text-[var(--foreground)]">{faq.q}</span>
                    <div
                      className={`w-8 h-8 border-2 border-[var(--border)] flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_var(--shadow-color)] transition-transform ${
                        isOpen ? 'bg-[var(--accent)] text-[var(--accent-foreground)] rotate-180' : 'bg-[var(--card)] text-[var(--foreground)]'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-3 text-sm text-[var(--foreground)] font-medium leading-relaxed border-t-2 border-[var(--border)] bg-[var(--card)]">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 13. FINAL CTA SECTION */}
      <section className="py-20 sm:py-28 bg-[var(--background)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-3 border-[var(--border)] bg-[var(--primary)] text-[var(--primary-foreground)] p-8 sm:p-14 lg:p-20 shadow-[8px_8px_0px_0px_var(--shadow-color)] text-center space-y-6">
            <div className="max-w-2xl mx-auto space-y-4">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 border-2 border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-black shadow-[2px_2px_0px_0px_var(--shadow-color)] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Get Started in 2 Minutes</span>
              </span>

              <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                Have a question? Start with it.
              </h2>

              <p className="text-base sm:text-lg font-medium leading-relaxed opacity-95">
                You don't need to know the legal language. Just tell RTI Assist what information you're looking for, and we'll help structure the rest.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link
                  to="/intake"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 border-2 border-[var(--border)] font-bold text-base text-[var(--foreground)] bg-[var(--card)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] shadow-[4px_4px_0px_0px_var(--shadow-color)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                >
                  <Sparkles className="w-4 h-4 text-[var(--primary)]" />
                  <span>Create Your RTI</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 border-2 border-[var(--border)] font-bold text-base text-[var(--primary-foreground)] bg-transparent hover:bg-black/20 transition"
                >
                  <span>Learn How It Works</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
