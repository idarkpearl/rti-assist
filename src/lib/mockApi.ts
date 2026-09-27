import { mockAuthorities, mockCases, mockDeadlines, mockAppealDrafts } from './mockData.js';

// Simulated latency helper
const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

let authoritiesStore = [...mockAuthorities];
let casesStore = [...mockCases];
let deadlinesStore = [...mockDeadlines];
let appealsStore = [...mockAppealDrafts];

/**
 * Fetch all authorities or filter by query/level
 */
export async function getAuthorities(params?: { search?: string; level?: string }) {
  await delay();
  let result = [...authoritiesStore];

  if (params?.search) {
    const q = params.search.toLowerCase();
    result = result.filter(
      (a: any) =>
        a.name.toLowerCase().includes(q) ||
        (a.ministry && a.ministry.toLowerCase().includes(q)) ||
        (a.department && a.department.toLowerCase().includes(q)) ||
        a.pio?.name?.toLowerCase().includes(q)
    );
  }

  if (params?.level && params.level !== 'all') {
    result = result.filter((a: any) => a.level === params.level);
  }

  return result;
}

/**
 * Get all cases or filter by status/search
 */
export async function listCases(params?: { status?: string; search?: string; limit?: number }) {
  await delay();
  let result = [...casesStore];

  if (params?.status && params.status !== 'all') {
    result = result.filter((c: any) => c.status === params.status);
  }

  if (params?.search) {
    const q = params.search.toLowerCase();
    result = result.filter(
      (c: any) =>
        c.title.toLowerCase().includes(q) ||
        c.trackingNumber.toLowerCase().includes(q) ||
        (c.authority?.name && c.authority.name.toLowerCase().includes(q))
    );
  }

  if (params?.limit) {
    result = result.slice(0, params.limit);
  }

  return result;
}

/**
 * Get single case by ID
 */
export async function getCase(id: string) {
  await delay();
  const found = casesStore.find((c: any) => c.id === id);
  if (!found) {
    throw new Error(`RTI Case with ID '${id}' not found in mock store.`);
  }
  return found;
}

/**
 * Update case details or status
 */
export async function updateCase(id: string, updates: any) {
  await delay();
  const index = casesStore.findIndex((c: any) => c.id === id);
  if (index === -1) {
    throw new Error(`RTI Case with ID '${id}' not found in mock store.`);
  }
  casesStore[index] = {
    ...casesStore[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return casesStore[index];
}

/**
 * Create a new case
 */
export async function createCase(data: any) {
  await delay();
  const id = data.id || `case-${Date.now().toString().slice(-4)}`;
  const auth = authoritiesStore.find((a: any) => a.id === data.authorityId) || authoritiesStore[0];
  const filingDate = data.filingDate || new Date().toISOString();
  const isLifeAndLiberty = Boolean(data.isLifeAndLiberty);
  const daysAllowed = isLifeAndLiberty ? 2 : 30;
  const dueDate = new Date(Date.now() + daysAllowed * 86400000).toISOString();

  const defaultDeadline = {
    id: `dl-${Date.now()}`,
    caseId: id,
    title: isLifeAndLiberty ? 'Life & Liberty Urgent Reply Window (48h)' : 'PIO 30-Day Mandatory Response Window',
    type: isLifeAndLiberty ? 'life_and_liberty' : 'pio_response',
    dueDate,
    calculatedDays: daysAllowed,
    daysRemaining: daysAllowed,
    status: 'pending',
    isLifeAndLiberty,
    actSectionReference: isLifeAndLiberty ? 'RTI Act Sec 7(1) Proviso' : 'RTI Act Sec 7(1)',
    notes: isLifeAndLiberty
      ? 'Emergency 48-hour deadline concerning life and liberty under Section 7(1) proviso.'
      : 'Mandatory 30-day statutory response period from date of receipt by CPIO under Section 7(1).',
  };

  const newCase = {
    id,
    trackingNumber: data.trackingNumber || `RTI-2026-${(auth as any).code || 'AUTH'}-${Math.floor(1000 + Math.random() * 9000)}`,
    title: data.title || 'Untitled RTI Inquiry',
    subjectCategory: data.subjectCategory || 'Public Administration',
    summary: data.summary || (data.queries && data.queries[0]) || 'RTI application under Section 6(1)',
    description: data.description || 'Application filed under Section 6(1) of the Right to Information Act, 2005.',
    queries: data.queries && data.queries.length > 0 ? data.queries : ['Certified copies of relevant files and administrative sanctions.'],
    applicant: data.applicant || {
      fullName: 'Anonymous Applicant',
      email: 'applicant@example.com',
    },
    authorityId: (auth as any).id,
    authority: auth,
    status: data.status || 'submitted',
    isLifeAndLiberty,
    filingDate,
    submissionMode: data.submissionMode || 'online_portal',
    feePaid: data.feePaid !== undefined ? data.feePaid : (auth as any).applicationFee,
    paymentReference: data.paymentReference || `TXN-REF-${Math.floor(100000 + Math.random() * 900000)}`,
    deadlines: data.deadlines || [defaultDeadline],
    appeals: data.appeals || [],
    documents: data.documents || [],
    tags: data.tags || [data.subjectCategory || 'General', (auth as any).code || 'Govt'],
    createdAt: filingDate,
    updatedAt: filingDate,
  };

  casesStore = [newCase, ...casesStore];
  deadlinesStore = [defaultDeadline, ...deadlinesStore];
  return newCase;
}

/**
 * Get deadlines
 */
export async function getDeadlines(params?: { caseId?: string; status?: string }) {
  await delay();
  let result = [...deadlinesStore];

  if (params?.caseId) {
    result = result.filter((d: any) => d.caseId === params.caseId);
  }

  if (params?.status && params.status !== 'all') {
    result = result.filter((d: any) => d.status === params.status);
  }

  return result;
}

/**
 * Create an appeal draft
 */
export async function createAppealDraft(data: any) {
  await delay();
  const id = data.id || `appeal-${Date.now().toString().slice(-4)}`;
  const relatedCase: any = casesStore.find((c: any) => c.id === data.caseId);

  const newAppeal = {
    id,
    caseId: data.caseId || 'case-unknown',
    type: data.type || 'first_appeal',
    appealNumber: data.appealNumber || `FAA-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    authorityId: data.authorityId || relatedCase?.authorityId || 'auth-1',
    authorityName: data.authorityName || relatedCase?.authority?.name || 'Public Authority',
    appellateAuthorityName: data.appellateAuthorityName || relatedCase?.authority?.firstAppellateAuthority?.name || 'First Appellate Authority',
    appellateAuthorityDesignation: data.appellateAuthorityDesignation || 'Joint Secretary & FAA',
    appellant: data.appellant || {
      fullName: relatedCase?.applicant?.fullName || 'Appellant',
      email: relatedCase?.applicant?.email || 'appellant@example.com',
      phone: relatedCase?.applicant?.phone || '',
      address: relatedCase?.applicant?.address || '',
    },
    originalApplicationDate: data.originalApplicationDate || relatedCase?.filingDate || new Date().toISOString(),
    originalPioName: data.originalPioName || relatedCase?.authority?.pio?.name || 'CPIO',
    groundOfAppeal: data.groundOfAppeal || 'no_response',
    groundsSummary: data.groundsSummary || 'Statutory 30 days expired with no communication or decision from CPIO (Deemed refusal Sec 7(2)).',
    detailedGrounds: data.detailedGrounds || [
      'The Appellant filed the original application under Section 6(1) of the RTI Act.',
      'Statutory 30-day period expired without response or transfer under Section 6(3).',
      'Deemed refusal is established under Section 7(2).',
      'Information is now entitled to be provided completely free of charge under Section 7(6).',
    ],
    reliefSought: data.reliefSought || 'Direct the CPIO to immediately supply certified copies of all requested documents without fees.',
    draftContent: data.draftContent || `# FIRST APPEAL UNDER SECTION 19(1) OF THE RTI ACT, 2005\n\n**To:** The First Appellate Authority\n**Ground:** Deemed Refusal under Section 7(2)\n**Relief:** Direction to supply records free of charge under Section 7(6).`,
    status: data.status || 'ready_to_send',
    submissionDate: data.submissionDate || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  appealsStore = [newAppeal, ...appealsStore];

  if (data.caseId) {
    casesStore = casesStore.map((c: any) =>
      c.id === data.caseId
        ? {
            ...c,
            status: 'first_appeal_pending',
            appeals: [newAppeal, ...(c.appeals || [])],
          }
        : c
    );
  }

  return newAppeal;
}

/**
 * Intelligent helper to draft and structure an RTI request
 */
export async function draftRequest(data: {
  title: string;
  subjectCategory?: string;
  queries?: string[];
  authorityId?: string;
  applicant?: any;
  isLifeAndLiberty?: boolean;
}) {
  await delay();
  const authority: any = authoritiesStore.find((a: any) => a.id === data.authorityId) || authoritiesStore[0];
  const daysAllowed = data.isLifeAndLiberty ? 2 : 30;

  const formattedQueries = (data.queries && data.queries.length > 0
    ? data.queries
    : [
        'Certified true copy of the administrative sanction and file notings related to the matter.',
        'List of contractors/vendors awarded execution contracts and tender reference numbers.',
        'Total funds sanctioned, disbursed, and remaining unspent as of latest financial quarter.',
      ]
  ).map((q, idx) => (q.startsWith(`${idx + 1}.`) ? q : `${idx + 1}. ${q}`));

  const sampleLetterDraft = `FORM A
APPLICATION FOR INFORMATION UNDER SECTION 6(1) OF THE RTI ACT, 2005

To:
The Central Public Information Officer (CPIO),
${authority?.name || 'Public Authority'}
${authority?.pio?.address || 'Office of the CPIO'}

1. Full Name of the Applicant: ${data.applicant?.fullName || '[Applicant Name]'}
2. Address: ${data.applicant?.address || '[Postal Address]'}
3. Particulars of Information Required:
   Subject: ${data.title}
   Period / Scope: Latest available records

4. Specific Information Points:
${formattedQueries.map((q) => `   ${q}`).join('\n')}

5. Statutory Timeline:
   ${data.isLifeAndLiberty ? 'URGENT: Information sought concerns life and liberty under Section 7(1) Proviso (48-hour limit).' : 'Standard 30-day statutory response timeline pursuant to Section 7(1).'}

6. Application Fee:
   ₹${data.applicant?.isBelowPovertyLine ? '0 (Exempt under Section 7(5) - BPL proof attached)' : `${authority?.applicationFee || 10} paid via online/postal mode.`}

Date: ${new Date().toLocaleDateString()}
Signature of Applicant`;

  return {
    formattedQueries,
    statutoryDeadlineDays: daysAllowed,
    statutoryFee: data.applicant?.isBelowPovertyLine ? 0 : (authority?.applicationFee || 10),
    category: 'Public Administration',
    suggestedAuthorityType: (authority as any)?.level || 'central',
    sampleLetterDraft,
    draftText: sampleLetterDraft,
  };
}


export async function recommendAuthority(draftText: string) {
  await delay();
  const text = (typeof draftText === 'string' ? draftText : JSON.stringify(draftText || '')).toLowerCase();

  let selected = authoritiesStore[0];
  let rationale = 'Primary administrative jurisdiction for central educational, examination, and higher academic institutional inquiries.';

  if (
    text.includes('toll') ||
    text.includes('highway') ||
    text.includes('road') ||
    text.includes('nhai') ||
    text.includes('transport') ||
    text.includes('expressway')
  ) {
    selected = authoritiesStore.find((a: any) => a.id === 'auth-2') || authoritiesStore[1];
    rationale = 'Jurisdiction over national highway asset development, concessionaire toll agreements, road quality inspection, and transport infrastructure.';
  } else if (
    text.includes('water') ||
    text.includes('drain') ||
    text.includes('flood') ||
    text.includes('bmc') ||
    text.includes('mumbai') ||
    text.includes('municipal') ||
    text.includes('ward') ||
    text.includes('pothole') ||
    text.includes('sewage')
  ) {
    selected = authoritiesStore.find((a: any) => a.id === 'auth-3') || authoritiesStore[2];
    rationale = 'Competent local authority for municipal infrastructure, storm water drain maintenance, urban wards, and civil works.';
  } else if (
    text.includes('food') ||
    text.includes('fssai') ||
    text.includes('adulteration') ||
    text.includes('safety') ||
    text.includes('health') ||
    text.includes('license') ||
    text.includes('sample')
  ) {
    selected = authoritiesStore.find((a: any) => a.id === 'auth-4') || authoritiesStore[3];
    rationale = 'Statutory authority responsible for setting science-based food standards, licensing, quality enforcement, and product recall audits.';
  } else if (
    text.includes('university') ||
    text.includes('college') ||
    text.includes('faculty') ||
    text.includes('professor') ||
    text.includes('education') ||
    text.includes('ugc') ||
    text.includes('exam')
  ) {
    selected = authoritiesStore.find((a: any) => a.id === 'auth-1') || authoritiesStore[0];
    rationale = 'Nodal authority overseeing central universities, UGC mandates, higher education grants, and faculty recruitment.';
  }

  return {
    authority: selected,
    filingChannel: {
      type: (selected as any).level === 'municipal' ? 'In-Person / Postal / State Portal' : 'Online Central Portal',
      portalName: (selected as any).portalUrl ? new URL((selected as any).portalUrl).hostname : 'rtionline.gov.in',
      portalUrl: (selected as any).portalUrl || 'https://rtionline.gov.in',
      fee: (selected as any).applicationFee || 10,
      paymentModes: (selected as any).paymentModes || ['Online Gateway', 'UPI', 'Postal Order'],
      recommendedSubmissionMethod:
        (selected as any).level === 'municipal'
          ? 'Municipal Citizen Facilitation Center (CFC) or Speed Post'
          : 'Direct Electronic Filing via rtionline.gov.in',
    },
    statutoryTimeframe: '30 calendar days under Section 7(1) of RTI Act, 2005 (or 48 hours if life and liberty is invoked)',
    rationale,
    confidenceScore: 0.94,
    disclaimer:
      'This recommendation is an automated administrative suggestion based on keyword patterns and public authority directory records. It is not legal advice. Please verify the designated Public Information Officer (CPIO) details on the official government portal before filing.',
  };
}


/**
 * Intelligent helper to auto-draft a statutory first appeal based on case data & ground
 */
export async function draftAppeal(caseId: string, appealType: string = 'first', caseDetails?: any) {
  await delay();
  const caseItem: any = caseDetails || casesStore.find((c: any) => c.id === caseId) || {
    id: caseId,
    title: 'RTI Inquiry',
    trackingNumber: 'RTI-2026-0042',
    filingDate: new Date().toISOString(),
    applicant: { fullName: 'RTI Citizen', email: 'citizen@example.com' },
    authority: authoritiesStore[0],
    queries: ['Certified copy of official records and sanction orders.'],
  };

  const isSecondAppeal = String(appealType).toLowerCase().includes('second');
  const appealNumber = isSecondAppeal
    ? `CIC-2026-${caseItem.authority?.code || 'AUTH'}-${Math.floor(1000 + Math.random() * 9000)}`
    : `FAA-2026-${caseItem.authority?.code || 'AUTH'}-${Math.floor(1000 + Math.random() * 9000)}`;

  let draftText = '';

  if (isSecondAppeal) {
    draftText = `# MEMORANDUM OF SECOND APPEAL UNDER SECTION 19(3) OF THE RIGHT TO INFORMATION ACT, 2005

**BEFORE THE HON'BLE CENTRAL / STATE INFORMATION COMMISSION**

---

### I. PARTICULARS OF THE APPELLANT:
- **Full Name:** ${caseItem.applicant?.fullName || 'Appellant'}
- **Contact:** ${caseItem.applicant?.email || ''} | ${caseItem.applicant?.phone || ''}
- **Address for Service of Notices:** ${caseItem.applicant?.address || 'Address on record'}

### II. PARTICULARS OF THE RESPONDENT PUBLIC AUTHORITY & CPIO:
- **Public Authority:** ${caseItem.authority?.name || 'Public Authority'}
- **Designated CPIO:** ${caseItem.authority?.pio?.name || 'Central Public Information Officer'}, ${caseItem.authority?.pio?.designation || ''}
- **Official Address of CPIO:** ${caseItem.authority?.pio?.address || 'Administrative Headquarters'}
- **Original RTI Tracking ID:** ${caseItem.trackingNumber}
- **Filing Date of RTI Application:** ${new Date(caseItem.filingDate).toLocaleDateString()}

### III. PARTICULARS OF THE FIRST APPELLATE AUTHORITY (FAA):
- **Name & Designation of FAA:** ${caseItem.authority?.firstAppellateAuthority?.name || 'First Appellate Authority'}, ${caseItem.authority?.firstAppellateAuthority?.designation || 'FAA'}
- **Office Address:** ${caseItem.authority?.firstAppellateAuthority?.address || 'Headquarters'}
- **First Appeal Disposal Status:** The statutory 30/45-day window for first appeal disposal expired without an order, or the FAA wrongfully upheld non-disclosure.

---

### IV. BRIEF FACTS & NUMBERED QUERIES SUBMITTED UNDER SECTION 6(1):
${(caseItem.queries || ['Certified copies of file notings and expenditure statements.']).map((q: string, i: number) => `${i + 1}. ${q}`).join('\n')}

---

### V. GROUNDS OF SECOND APPEAL (SECTION 19(3)):
1. **Gross Breach of Statutory Mandate:** The CPIO and First Appellate Authority failed to furnish the information sought within the statutory timeframes mandated by Section 7(1) and Section 19(6).
2. **Deemed Refusal without Lawful Justification:** Under Section 7(2), failure to communicate within 30 days is deemed refusal. No exemptions under Section 8(1) or Section 9 were established.
3. **Larger Public Interest:** The requested information relates to public funds and administration. Pursuant to the Proviso to Section 8(1)(j) and Section 8(2), the public interest overwhelmingly justifies disclosure.
4. **Mandatory Exemption from Fee (Section 7(6)):** The Appellant is entitled to receive all certified copies, reports, and inspections completely free of cost.

---

### VI. PRAYER / RELIEF SOUGHT FROM THE COMMISSION:
1. Summon the complete records from the Respondent Public Authority and order immediate, unredacted certified copies to be furnished to the Appellant within 7 working days.
2. Direct that all records be supplied free of cost pursuant to Section 7(6) of the RTI Act.
3. Impose maximum penalty of ₹250 per day up to ₹25,000 upon the defaulting CPIO under Section 20(1) for deliberate denial and delay without reasonable cause.
4. Recommend disciplinary proceedings against the delinquent officer under Section 20(2).
5. Award token compensation to the Appellant under Section 19(8)(b) for detriment and mental agony suffered.

**Verification:**  
I, ${caseItem.applicant?.fullName || 'Appellant'}, do hereby verify that the contents of this Appeal Memorandum are true to the best of my knowledge and belief.

**Place:** ${caseItem.applicant?.address?.split(',').slice(-1)[0]?.trim() || 'Online'}  
**Date:** ${new Date().toLocaleDateString()}  
*(Digitally Submitted by ${caseItem.applicant?.fullName || 'Appellant'})*`;
  } else {
    draftText = `# FIRST APPEAL UNDER SECTION 19(1) OF THE RIGHT TO INFORMATION ACT, 2005

**BEFORE THE FIRST APPELLATE AUTHORITY:**
**Public Authority:** ${caseItem.authority?.name || 'Public Authority'}
**Designated FAA Officer:** ${caseItem.authority?.firstAppellateAuthority?.name || 'First Appellate Authority'}
**Designation:** ${caseItem.authority?.firstAppellateAuthority?.designation || 'Joint Secretary & FAA'}
**Office Address:** ${caseItem.authority?.firstAppellateAuthority?.address || 'Administrative Headquarters'}

---

### I. PARTICULARS OF THE APPELLANT:
- **Full Name:** ${caseItem.applicant?.fullName || 'Appellant'}
- **Contact:** ${caseItem.applicant?.email || ''} | ${caseItem.applicant?.phone || ''}
- **Postal Address:** ${caseItem.applicant?.address || 'Address on record'}

### II. PARTICULARS OF THE CENTRAL PUBLIC INFORMATION OFFICER (CPIO):
- **Name & Designation:** ${caseItem.authority?.pio?.name || 'Central Public Information Officer'}, ${caseItem.authority?.pio?.designation || ''}
- **Original RTI Tracking ID:** ${caseItem.trackingNumber}
- **Date of Application:** ${new Date(caseItem.filingDate).toLocaleDateString()}
- **Statutory 30-Day Response Due Date:** Expired under Section 7(1)

---

### III. BRIEF PARTICULARS OF ORIGINAL QUERIES (SECTION 6(1)):
${(caseItem.queries || ['Certified copy of official records and sanction orders.']).map((q: string, i: number) => `${i + 1}. ${q}`).join('\n')}

---

### IV. GROUNDS OF FIRST APPEAL:
1. **Deemed Refusal under Section 7(2):** More than 30 statutory calendar days have elapsed since the filing of the RTI application. The CPIO has failed to furnish the information or communicate any decision.
2. **Breach of Section 7(1) Timeline:** The Public Information Officer was obligated to supply information or reject with reasons within 30 days. No notice or transfer under Section 6(3) was received.
3. **Statutory Right to Free Information (Section 7(6)):** Where a public authority fails to provide information within the statutory timeframe, all records must be provided free of any charge.

---

### V. RELIEF / PRAYER SOUGHT:
1. Direct the CPIO to furnish full, certified copies of all documents requested in Queries 1 to ${(caseItem.queries || []).length || 4} within 7 working days.
2. Direct that all documentation, printouts, and inspections be provided completely free of cost in terms of Section 7(6).
3. Issue appropriate warning/advisory to the CPIO regarding statutory compliance under Section 20 of the Act.

**Date:** ${new Date().toLocaleDateString()}  
**Place:** ${caseItem.applicant?.address?.split(',').slice(-1)[0]?.trim() || 'Online'}  
*(Signed Electronically by ${caseItem.applicant?.fullName || 'Appellant'})*`;
  }

  return {
    draftText,
    draftContent: draftText,
    appealNumber,
    type: isSecondAppeal ? 'second_appeal' : 'first_appeal',
    toString: () => draftText,
  };
}
