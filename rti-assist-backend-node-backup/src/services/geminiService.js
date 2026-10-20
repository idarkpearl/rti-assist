import { config } from '../config.js';

/**
 * Call Gemini API with structured prompt
 */
async function callGeminiApi(systemPrompt, userPrompt, temperature = 0.2) {
  const apiKey = config.geminiApiKey;
  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  // Candidate models to attempt in order
  const models = [
    config.geminiModel,
    'gemini-3.1-flash-lite',
    'gemini-3.8-flash',
    'gemini-3.5-flash-lite',
    'gemini-2.5-flash-lite',
  ].filter((m, idx, arr) => arr.indexOf(m) === idx);

  let lastError = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${systemPrompt}\n\nUSER INPUT:\n${userPrompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature,
          maxOutputTokens: 2048,
        },
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Gemini API HTTP ${res.status}: ${errorText}`);
      }

      const json = await res.json();
      const generatedText = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!generatedText) {
        throw new Error('Empty response received from Gemini API');
      }

      return generatedText;
    } catch (err) {
      lastError = err;
      console.warn(`[GeminiService] Model ${model} failed: ${err.message}. Trying next candidate...`);
    }
  }

  throw lastError || new Error('All Gemini models failed');
}

/**
 * 1. RTI Application Formulation (Section 6(1))
 */
export async function draftRtiRequest(concern) {
  const query = (concern || '').trim();
  if (!query) {
    throw new Error('Concern description cannot be blank');
  }

  const isEmergency =
    query.toLowerCase().includes('emergency') ||
    query.toLowerCase().includes('life') ||
    query.toLowerCase().includes('death') ||
    query.toLowerCase().includes('arrest') ||
    query.toLowerCase().includes('hospital');

  if (config.geminiApiKey) {
    try {
      const systemPrompt = `You are an expert Indian Right to Information Act (RTI Act, 2005) legal draftsman.
The citizen provides an informal grievance, grievance against an institution, or problem in plain language.
Convert their input into an impeccably crafted, legally enforceable RTI application under Section 6(1) of the RTI Act, 2005.

CRITICAL RULES:
1. TARGET THE SPECIFIC COMPETENT PUBLIC INFORMATION OFFICER (PIO):
   - Identify the exact college, campus, university, municipal ward, or department from the citizen's query.
   - For educational institutions (e.g., Delhi Skill and Entrepreneurship University - DSEU Okhla-II Campus, Delhi State University, Delhi ITI/Polytechnic):
     Address directly to:
     The Public Information Officer (PIO),
     Delhi Skill and Entrepreneurship University (DSEU) / Respective Campus/Directorate,
     Govt. of NCT of Delhi.
   - Do NOT default generically to central ministries (like Shastri Bhawan) when it pertains to a State/UT government university or specific campus.
   - Under Section 6(1), the RTI MUST always be filed first before the designated Public Information Officer (PIO) of the concerned public authority. (If the PIO denies or fails to reply within 30 days, the citizen can subsequently file a First Appeal before the First Appellate Authority (FAA) under Section 19(1)).

2. CONVERT INFORMAL GRIEVANCES INTO PRECISE, NUMBERED DOCUMENTARY QUERIES:
   - Transform vague complaints (e.g. "where is the college fund going") into formal requests for certified records under Section 2(f) and Section 6(1):
     * Certified copy of audited Income & Expenditure statements and Balance Sheet for the specified campus/institute.
     * Itemized utilization certificate of student development funds, laboratory fees, and campus facility allocations.
     * Certified copies of administrative sanction orders and vendor procurement work orders.
     * Designation of Drawing and Disbursing Officers (DDO) and Action Taken Report (ATR).
   - NEVER quote raw informal fragments with ellipses (do NOT output strings like '...' or quoted raw slang).
   - Do NOT ask questions starting with "Why" or asking for subjective opinions (Section 2(f) rule). Focus exclusively on certified copies of files, ledgers, vouchers, and sanction orders.

3. STATUTORY TIMEFRAME & FEES:
   - 30 CALENDAR DAYS under Section 7(1) of the RTI Act, 2005 (or 48 HOURS for life and liberty).
   - Prescribed statutory fee of Rs. 10/- remitted.

Output strictly valid JSON without markdown code fences or backticks:
{
  "category": "Department or Subject Category (e.g., Higher & Technical Education (DSEU / State University))",
  "suggestedAuthority": "Specific Public Authority Name",
  "suggestedAuthorityType": "central | state | municipal",
  "draftText": "The complete formal RTI petition letter formatted with Addressee (The Public Information Officer), Subject, numbered queries under Section 6(1), statutory timeline, and Applicant placeholder signature block."
}`;

      const rawResponse = await callGeminiApi(systemPrompt, query);
      const cleaned = rawResponse.replace(/```json/gi, '').replace(/```/g, '').trim();

      try {
        const parsed = JSON.parse(cleaned);
        return {
          category: parsed.category || 'Public Administration',
          draftText: parsed.draftText,
          suggestedAuthorityType: parsed.suggestedAuthorityType || 'state',
          disclaimer: `Generated via Google Gemini (${config.geminiModel}). Formatted under Section 6(1) of RTI Act, 2005.`,
        };
      } catch {
        return {
          category: 'Public Administration',
          draftText: cleaned,
          suggestedAuthorityType: 'state',
          disclaimer: `Generated via Google Gemini (${config.geminiModel}).`,
        };
      }
    } catch (apiErr) {
      console.warn('[GeminiService] Gemini API call failed, falling back to legal rules engine:', apiErr.message);
    }
  }

  // High-fidelity fallback rules engine
  return fallbackDraftRtiRequest(query, isEmergency);
}

/**
 * 2. Authority Recommendation
 */
export async function recommendAuthorityService(draftText, authorities) {
  const text = (draftText || '').toLowerCase();

  let selected = authorities.find((a) => a.id === 'auth-9') || authorities[0];
  let rationale = 'Competent public authority for inquiries.';

  if (
    text.includes('dseu') ||
    text.includes('okhla') ||
    text.includes('polytechnic') ||
    text.includes('diploma') ||
    text.includes('college fund') ||
    text.includes('skill university')
  ) {
    selected = authorities.find((a) => a.id === 'auth-9') || authorities.find((a) => a.id === 'auth-1') || authorities[0];
    rationale = 'Competent State University public authority for DSEU campus inquiries, academic finances, college fund allocations, and student fee utilization in Delhi NCT.';
  } else if (
    text.includes('toll') ||
    text.includes('highway') ||
    text.includes('road') ||
    text.includes('nhai') ||
    text.includes('transport') ||
    text.includes('expressway')
  ) {
    selected = authorities.find((a) => a.id === 'auth-2') || authorities[1];
    rationale = 'Jurisdiction over national highway asset development, concessionaire toll agreements, road quality inspection, and transport infrastructure.';
  } else if (
    text.includes('water') ||
    text.includes('drain') ||
    text.includes('sewage') ||
    text.includes('pipeline') ||
    text.includes('jal')
  ) {
    selected = authorities.find((a) => a.id === 'auth-7') || authorities[6];
    rationale = 'Jurisdiction over drinking water supply, pipeline contamination audits, and sewage infrastructure in Delhi NCT.';
  } else if (
    text.includes('school') ||
    text.includes('ews') ||
    text.includes('admission') ||
    text.includes('teacher') ||
    text.includes('edudel')
  ) {
    selected = authorities.find((a) => a.id === 'auth-5') || authorities[4];
    rationale = 'Jurisdiction over recognized private schools, EWS quota admissions, and school education regulatory compliance in Delhi NCT.';
  } else if (
    text.includes('police') ||
    text.includes('fir') ||
    text.includes('chowki') ||
    text.includes('traffic') ||
    text.includes('challan')
  ) {
    selected = authorities.find((a) => a.id === 'auth-4') || authorities[3];
    rationale = 'Jurisdiction over law enforcement, FIR status inquiries, crime records, and traffic regulation in Delhi NCT.';
  } else if (
    text.includes('dda') ||
    text.includes('housing') ||
    text.includes('land') ||
    text.includes('allotment') ||
    text.includes('flat')
  ) {
    selected = authorities.find((a) => a.id === 'auth-3') || authorities[2];
    rationale = 'Jurisdiction over urban land development, housing lottery schemes, and master plan zoning in Delhi NCT.';
  } else if (
    text.includes('rail') ||
    text.includes('train') ||
    text.includes('station') ||
    text.includes('coach')
  ) {
    selected = authorities.find((a) => a.id === 'auth-8') || authorities[7];
    rationale = 'Jurisdiction over Indian Railways operations, passenger amenities, track safety, and ticketing systems.';
  } else if (
    text.includes('food') ||
    text.includes('fssai') ||
    text.includes('adulteration') ||
    text.includes('sample')
  ) {
    selected = authorities.find((a) => a.id === 'auth-6') || authorities[5];
    rationale = 'Statutory authority responsible for science-based food standards, adulteration testing, and business licensing.';
  } else if (
    text.includes('higher education') ||
    text.includes('ugc') ||
    text.includes('central university')
  ) {
    selected = authorities.find((a) => a.id === 'auth-1') || authorities[0];
    rationale = 'Primary administrative jurisdiction for central higher educational and academic institutional inquiries.';
  }

  return {
    authority: selected,
    filingChannel: {
      type: selected.level === 'state' ? 'State Portal / Postal Order' : 'Online Central Portal',
      portalName: selected.portalUrl ? new URL(selected.portalUrl).hostname : 'rtionline.gov.in',
      portalUrl: selected.portalUrl || 'https://rtionline.gov.in',
      fee: selected.applicationFee || 10,
      paymentModes: selected.paymentModes || ['Online Gateway', 'UPI', 'Postal Order'],
    },
    statutoryTimeframe: '30 calendar days under Section 7(1) of RTI Act, 2005 (or 48 hours for life & liberty)',
    rationale,
    confidenceScore: 0.95,
    disclaimer:
      'Administrative suggestion based on keyword analysis and public authority records. Please verify PIO details on the official portal before filing.',
  };
}

/**
 * 3. RTI Appeal Drafting (First Appeal Sec 19(1) or Second Appeal Sec 19(3))
 */
export async function draftAppealPetition(caseDetails, appealType = 'first') {
  const isSecondAppeal = String(appealType).toLowerCase().includes('second');
  const typeLabel = isSecondAppeal ? 'Second Appeal (Sec 19(3))' : 'First Appeal (Sec 19(1))';

  if (config.geminiApiKey) {
    try {
      const systemPrompt = `You are an expert Indian RTI Act legal advocate drafting a formal ${typeLabel}.
The applicant has either received no reply within 30 statutory days (Deemed Refusal under Section 7(2)) or received an unlawful rejection.
Compose a formal petition containing:
1. Header addressed to ${isSecondAppeal ? "The Hon'ble Central / State Information Commission" : 'The First Appellate Authority (FAA)'}.
2. Appellant and Public Authority details.
3. Chronological facts and numbered queries.
4. Legal grounds citing relevant sections (Section 7(1), Section 7(2), Section 7(6) free information entitlement, and Section 20 penalties for Second Appeal).
5. Prayer / Relief sought.`;

      const userPrompt = JSON.stringify(caseDetails, null, 2);
      const generated = await callGeminiApi(systemPrompt, userPrompt, 0.2);

      return {
        draftText: generated,
        disclaimer: `Drafted via Google Gemini (${typeLabel}). Review and sign before official filing.`,
      };
    } catch (err) {
      console.warn('[GeminiService] Appeal drafting via Gemini failed, falling back to template engine:', err.message);
    }
  }

  // Fallback Appeal template
  return fallbackDraftAppeal(caseDetails, isSecondAppeal);
}

// -----------------------------------------------------------------------------
// FALLBACK GENERATORS (Zero external dependency resilience)
// -----------------------------------------------------------------------------

function fallbackDraftRtiRequest(concern, isEmergency) {
  let category = 'Public Administration';
  let authorityName = 'The Public Information Officer (PIO), Department of Higher Education';
  let authorityAddress = 'Room 214, C-Wing, Shastri Bhawan, New Delhi - 110001';
  let queries = [];

  const lower = concern.toLowerCase();

  if (
    lower.includes('dseu') ||
    lower.includes('okhla') ||
    lower.includes('college') ||
    lower.includes('university') ||
    lower.includes('campus') ||
    lower.includes('fund') ||
    lower.includes('fee')
  ) {
    category = 'Higher & Technical Education (DSEU / State University)';
    authorityName = 'The Public Information Officer (PIO)\nDelhi Skill and Entrepreneurship University (DSEU), Okhla Campus-II';
    authorityAddress = 'Okhla Industrial Area Phase-II / DSEU Head Office, Dwarka, New Delhi - 110020, GNCTD';
    queries = [
      'Certified copy of the audited Annual Balance Sheet and Income & Expenditure Statement pertaining specifically to DSEU Okhla Campus-II for the preceding two financial years.',
      'Itemized statement detailing the receipt and utilization of student fees, college development funds, lab fees, and government grants disbursed to this campus.',
      'Certified copies of administrative sanction orders, tender approvals, and purchase work orders exceeding INR 50,000 executed for campus development and equipment.',
      'Name, official designation, and contact details of the designated Drawing and Disbursing Officer (DDO) and Campus Director responsible for fund administration.',
      'Certified copy of the Action Taken Report (ATR) regarding any financial audits or expenditure reviews conducted for this campus.',
    ];
  } else if (lower.includes('road') || lower.includes('highway') || lower.includes('toll')) {
    category = 'Infrastructure & Highways';
    authorityName = 'The Public Information Officer (PIO)\nNational Highways Authority of India (NHAI)';
    authorityAddress = 'G-5 & 6, Sector-10, Dwarka, New Delhi - 110075';
    queries = [
      'Certified copy of the road construction, repair tender sanction order, and contract agreement.',
      'Certified copy of quality assurance and bituminous asphalt compaction test reports.',
      'Itemized statement of funds budgeted, disbursed, and balance unspent for this section.',
      'Designation of the supervisory engineer and executive engineer responsible for inspection.',
    ];
  } else if (lower.includes('water') || lower.includes('jal') || lower.includes('drain')) {
    category = 'Water Supply & Municipal Works';
    authorityName = 'The Public Information Officer (PIO)\nDelhi Jal Board (DJB)';
    authorityAddress = 'Varunalaya Phase-II, Karol Bagh, New Delhi - 110005';
    queries = [
      'Certified copy of pipeline maintenance logs and water quality test reports for the area.',
      'Action Taken Report (ATR) on citizen complaints regarding sewage contamination or supply interruptions.',
      'Statement of funds allocated and contractor work orders issued for pipeline repairs.',
    ];
  } else if (lower.includes('school') || lower.includes('ews') || lower.includes('admission')) {
    category = 'School Education';
    authorityName = 'The Public Information Officer (PIO)\nDirectorate of Education, GNCTD';
    authorityAddress = 'Old Secretariat, Civil Lines, Delhi - 110054';
    queries = [
      'Certified copy of total EWS/DG quota seats sanctioned versus filled in the school.',
      'Date-wise lottery admission lists and verification reports.',
      'Inspection reports and compliance show-cause notices issued to the school.',
    ];
  } else if (lower.includes('police') || lower.includes('fir')) {
    category = 'Public Safety & Policing';
    authorityName = 'The Public Information Officer (PIO)\nDelhi Police Headquarters (PHQ)';
    authorityAddress = 'Jai Singh Road, Connaught Place, New Delhi - 110001';
    queries = [
      'Certified copy of daily diary entry (DD entry), FIR registration status, and case diary progress.',
      'Action Taken Report (ATR) and name of the investigating officer assigned.',
      'Supervisory remarks of the concerned ACP/DCP regarding complaint redressal.',
    ];
  } else {
    queries = [
      'Certified copy of all administrative sanction orders, tender allocations, and file notings concerning the subject matter.',
      'Certified copy of the official Action Taken Report (ATR) along with diary number and movement history.',
      'Name, designation, and official email of the supervisory officer mandated to monitor compliance.',
      'Certified statement of total public funds budgeted, disbursed, and utilized under this head for the current financial year.',
    ];
  }

  const statutoryDays = isEmergency ? '48 HOURS (Under Section 7(1) Proviso concerning Life & Liberty)' : '30 CALENDAR DAYS (Under Section 7(1))';

  const draftText = `APPLICATION FOR OBTAINING INFORMATION UNDER SECTION 6(1) OF THE RIGHT TO INFORMATION ACT, 2005

To,
The Public Information Officer (PIO),
${authorityName},
${authorityAddress}

Subject: Request for certified records under Section 6(1) of the RTI Act, 2005.

Sir / Madam,
I, a citizen of India, hereby request you to furnish certified, authentic copies of the following official records and information under Section 6(1) of the Right to Information Act, 2005:

${queries.map((q, i) => `${i + 1}. ${q}`).join('\n\n')}

Statutory Timeframe:
As prescribed under Section 7(1) of the RTI Act, 2005, the requested records must be furnished within ${statutoryDays}.

Application Fee:
Prescribed statutory fee of Rs. 10/- has been paid through the authorized government payment gateway / Postal Order.

Yours faithfully,
[Applicant Name]
[Applicant Address]
[Mobile Number & Email]`;

  return {
    category,
    draftText,
    suggestedAuthorityType: 'central',
    disclaimer: 'Engineered in compliance with Section 6(1) and Section 7(1) of the Right to Information Act, 2005.',
  };
}

function fallbackDraftAppeal(caseDetails, isSecondAppeal) {
  const regNo = caseDetails?.trackingNumber || caseDetails?.registrationNumber || 'RTI-2026-0042';
  const authorityName = caseDetails?.authority?.name || caseDetails?.authorityName || 'Public Authority';
  const filingDate = caseDetails?.filingDate ? new Date(caseDetails.filingDate).toLocaleDateString() : 'recent date';

  if (isSecondAppeal) {
    return {
      draftText: `# MEMORANDUM OF SECOND APPEAL UNDER SECTION 19(3) OF THE RIGHT TO INFORMATION ACT, 2005

**BEFORE THE HON'BLE CENTRAL / STATE INFORMATION COMMISSION**

---

### I. PARTICULARS OF THE APPELLANT:
- **Full Name:** ${caseDetails?.applicant?.fullName || 'Appellant'}
- **Contact:** ${caseDetails?.applicant?.email || 'citizen@example.com'}
- **Address for Service of Notices:** ${caseDetails?.applicant?.address || 'On Record'}

### II. PARTICULARS OF THE RESPONDENT PUBLIC AUTHORITY & CPIO:
- **Public Authority:** ${authorityName}
- **Original RTI Tracking ID:** ${regNo}
- **Filing Date of RTI Application:** ${filingDate}

---

### III. GROUNDS OF SECOND APPEAL:
1. **Gross Delay and Default:** The CPIO and First Appellate Authority failed to furnish information within the mandatory statutory deadlines prescribed under the RTI Act, 2005.
2. **Deemed Refusal:** The failure to provide information within 30 days constitutes a deemed refusal under Section 7(2).
3. **Free Information:** As per Section 7(6), the information must now be provided free of any charge.

---

### IV. PRAYER / RELIEF SOUGHT:
1. Direct the CPIO to immediately furnish certified copies of all requested records.
2. Direct that information be provided free of cost as mandated under Section 7(6).
3. Initiate inquiry and impose statutory penalty under Section 20(1) on the errant officer for malafide delay.

**Date:** ${new Date().toLocaleDateString()}  
*(Signed Electronically by Appellant)*`,
      disclaimer: 'Second Appeal formatted under Section 19(3) of RTI Act, 2005.',
    };
  }

  return {
    draftText: `# FIRST APPEAL UNDER SECTION 19(1) OF THE RIGHT TO INFORMATION ACT, 2005

**To,**  
The First Appellate Authority (FAA),  
${authorityName}

---

### PARTICULARS OF THE APPELLANT:
- **Full Name:** ${caseDetails?.applicant?.fullName || 'Vikramaditya Roy'}
- **Address:** ${caseDetails?.applicant?.address || 'Flat 402, Green Meadows, Indiranagar, Bengaluru - 560038'}
- **Original Reference Number:** ${regNo} (Filed on ${filingDate})

---

### GROUNDS OF FIRST APPEAL:
1. **Deemed Refusal under Section 7(2):** The mandatory period of 30 days prescribed under Section 7(1) of the RTI Act has expired and the CPIO has failed to furnish the requested records.
2. **Right to Free Information:** Under Section 7(6) of the RTI Act, 2005, where a public authority fails to give information within the statutory timeline, the information must be provided free of all charges.

---

### PRAYER / RELIEF SOUGHT:
1. Direct the CPIO to furnish full, legible, certified records requested in the original Section 6(1) application within 7 working days.
2. Direct that all documentation be supplied free of cost pursuant to Section 7(6) of the RTI Act.

**Date:** ${new Date().toLocaleDateString()}  
*(Signed Electronically by Appellant)*`,
    disclaimer: 'First Appeal petition formatted under Section 19(1) of RTI Act, 2005.',
  };
}

/**
 * 4. Response Classification
 */
export async function classifyResponseService(responseText, requestContext = {}) {
  const allowedStatuses = [
    'FULLY_ANSWERED',
    'PARTIALLY_ANSWERED',
    'DENIED',
    'EVASIVE_VAGUE',
    'TRANSFERRED',
    'NO_RESPONSE',
  ];

  const allowedNextSteps = [
    'No action needed',
    'Consider First Appeal',
    'File First Appeal — response is overdue',
    'Consider Second Appeal',
    'Request clarification',
  ];

  if (config.geminiApiKey) {
    const baseSystemPrompt = `You are an expert Indian Right to Information Act (RTI Act, 2005) response analyzer.
Analyze the government public authority's response to an RTI application and assess what it means and what the citizen should do next.

Follow these strict rules:
1. Classify the response status into EXACTLY ONE of:
   "FULLY_ANSWERED", "PARTIALLY_ANSWERED", "DENIED", "EVASIVE_VAGUE", "TRANSFERRED", "NO_RESPONSE".
   Definitions:
   - "FULLY_ANSWERED": Government provided the requested information or documents in full.
   - "PARTIALLY_ANSWERED": Some points answered while others were omitted, refused, or left incomplete.
   - "DENIED": Explicit refusal to provide information.
   - "EVASIVE_VAGUE": Non-substantive, deflective reply (e.g. "records not compiled", "information is bulky", or generic statements without actually furnishing documents).
   - "TRANSFERRED": Transferred to another department or public authority under Section 6(3).
   - "NO_RESPONSE": Acknowledgment only or statement indicating no response/refusal to reply.

2. If an exemption is cited, identify which RTI Act Section 8(1) sub-clause is referenced:
   (e.g., "8(1)(j)" for personal information/privacy, "8(1)(a)" for sovereignty/security, "8(1)(d)" for commercial confidence/trade secrets, "8(1)(e)" for fiduciary relationship, "8(1)(g)" for safety of person, "8(1)(h)" for investigation/prosecution, etc.).
   Match language in the response text against known exemption wording.
   If NO section is explicitly cited but the response is still a denial, mark sectionCited as null and clearly mention "no section cited" in the reason (this is noteworthy as valid denials are required by law to cite a specific exemption under Section 8(1)).

3. Give a short plain-language reason summarizing WHY it was classified this way (1-2 sentences, quote or paraphrase the relevant part of the response text, do not invent reasons not grounded in the pasted text).

4. Suggest a possible next step from THIS FIXED SET ONLY:
   - "No action needed" (for FULLY_ANSWERED)
   - "Consider First Appeal" (for DENIED, EVASIVE_VAGUE, or problematic PARTIALLY_ANSWERED)
   - "File First Appeal — response is overdue" (if response indicates over 30 days or deemed refusal)
   - "Consider Second Appeal" (if already past First Appeal or blatant FAA disregard)
   - "Request clarification" (for TRANSFERRED or ambiguous PARTIALLY_ANSWERED)
   Do NOT give actual legal advice or guarantee an appeal will succeed — frame as a suggestion only.

5. Do NOT invent deadline dates, specific office names, or legal citations beyond standard, well-known RTI Act exemption sections. If uncertain about classification, default to "PARTIALLY_ANSWERED" or flag lower confidence rather than guessing status.

Respond ONLY with strict JSON, no markdown fences, no extra text:
{
  "status": "FULLY_ANSWERED" | "PARTIALLY_ANSWERED" | "DENIED" | "EVASIVE_VAGUE" | "TRANSFERRED" | "NO_RESPONSE",
  "sectionCited": "string | null",
  "reason": "1-2 sentences explanation grounded in the text",
  "suggestedNextStep": "string from allowed set",
  "confidence": "high" | "medium" | "low",
  "disclaimer": "AI-generated analysis. This is not legal advice — verify before deciding on an appeal."
}`;

    const contextSummary = requestContext
      ? `\nRequest Context:\n- Original Request: ${requestContext.originalRequestText || 'N/A'}\n- Filing Date: ${requestContext.filingDate || 'N/A'}\n- Authority: ${requestContext.authorityName || 'N/A'}`
      : '';

    const userPrompt = `Government Response Text:\n"${responseText}"${contextSummary}`;

    // Attempt 1
    try {
      const raw1 = await callGeminiApi(baseSystemPrompt, userPrompt);
      const cleaned1 = raw1.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed1 = JSON.parse(cleaned1);
      return sanitizeClassification(parsed1, allowedStatuses, allowedNextSteps);
    } catch (err1) {
      console.warn('[GeminiService] Attempt 1 failed to parse JSON, retrying with explicit instruction...', err1.message);

      // Attempt 2: retry once appending "return valid JSON only"
      try {
        const retryPrompt = `${baseSystemPrompt}\n\nIMPORTANT: Return valid JSON only without markdown or backticks.`;
        const raw2 = await callGeminiApi(retryPrompt, userPrompt);
        const cleaned2 = raw2.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
        const parsed2 = JSON.parse(cleaned2);
        return sanitizeClassification(parsed2, allowedStatuses, allowedNextSteps);
      } catch (err2) {
        console.error('[GeminiService] Attempt 2 also failed JSON parsing:', err2);
        const parseError = new Error('Upstream LLM response could not be parsed as valid JSON');
        parseError.statusCode = 502;
        throw parseError;
      }
    }
  }

  // Fallback Rule-Based Engine
  return fallbackClassifyResponse(responseText, requestContext);
}

function sanitizeClassification(data, allowedStatuses, allowedNextSteps) {
  let status = (data.status || '').toUpperCase().trim();
  if (!allowedStatuses.includes(status)) {
    status = 'PARTIALLY_ANSWERED';
  }

  let suggestedNextStep = (data.suggestedNextStep || '').trim();
  if (!allowedNextSteps.includes(suggestedNextStep)) {
    if (status === 'FULLY_ANSWERED') {
      suggestedNextStep = 'No action needed';
    } else if (status === 'TRANSFERRED') {
      suggestedNextStep = 'Request clarification';
    } else {
      suggestedNextStep = 'Consider First Appeal';
    }
  }

  let confidence = (data.confidence || 'medium').toLowerCase();
  if (!['high', 'medium', 'low'].includes(confidence)) {
    confidence = 'medium';
  }

  return {
    status,
    sectionCited: data.sectionCited || null,
    reason: data.reason || 'Response analyzed according to RTI Act, 2005 provisions.',
    suggestedNextStep,
    confidence,
    disclaimer: 'AI-generated analysis. This is not legal advice — verify before deciding on an appeal.',
  };
}

export function fallbackClassifyResponse(responseText, requestContext = {}) {
  const text = (responseText || '').toLowerCase();

  let status = 'PARTIALLY_ANSWERED';
  let sectionCited = null;
  let reason = '';
  let suggestedNextStep = 'Consider First Appeal';
  let confidence = 'high';

  if (text.includes('8(1)(j)') || text.includes('8 (1) (j)') || text.includes('personal information') || text.includes('privacy') || text.includes('third party')) {
    status = 'DENIED';
    sectionCited = '8(1)(j)';
    reason = 'The authority denied disclosure invoking Section 8(1)(j), citing personal information or privacy of individuals without demonstrating larger public interest.';
    suggestedNextStep = 'Consider First Appeal';
  } else if (text.includes('8(1)(a)') || text.includes('security of india') || text.includes('sovereignty') || text.includes('strategic interest')) {
    status = 'DENIED';
    sectionCited = '8(1)(a)';
    reason = 'The authority refused disclosure citing Section 8(1)(a) claiming potential prejudice to sovereignty, security, or strategic interests of the state.';
    suggestedNextStep = 'Consider First Appeal';
  } else if (text.includes('8(1)(d)') || text.includes('commercial confidence') || text.includes('trade secret') || text.includes('intellectual property')) {
    status = 'DENIED';
    sectionCited = '8(1)(d)';
    reason = 'Information was withheld under Section 8(1)(d) citing commercial confidence or trade secrets of third parties.';
    suggestedNextStep = 'Consider First Appeal';
  } else if (text.includes('8(1)(e)') || text.includes('fiduciary')) {
    status = 'DENIED';
    sectionCited = '8(1)(e)';
    reason = 'Disclosure was denied citing fiduciary relationship under Section 8(1)(e).';
    suggestedNextStep = 'Consider First Appeal';
  } else if (text.includes('8(1)(h)') || text.includes('investigation') || text.includes('prosecution') || text.includes('impede')) {
    status = 'DENIED';
    sectionCited = '8(1)(h)';
    reason = 'Information was refused under Section 8(1)(h) on grounds that disclosure would impede ongoing investigation or prosecution of offenders.';
    suggestedNextStep = 'Consider First Appeal';
  } else if (text.includes('6(3)') || text.includes('transferred') || text.includes('forwarded') || text.includes('another public authority') || text.includes('does not pertain to this department')) {
    status = 'TRANSFERRED';
    sectionCited = 'Section 6(3)';
    reason = 'Your application has been transferred under Section 6(3) to another public authority deemed to hold the requested records.';
    suggestedNextStep = 'Request clarification';
  } else if (text.includes('rejected') || text.includes('denied') || text.includes('cannot be provided') || text.includes('cannot be shared') || text.includes('not permissible') || text.includes('regret to inform')) {
    status = 'DENIED';
    sectionCited = null;
    reason = 'The authority denied the requested information but cited no specific exemption section under Section 8(1) (no section cited in the reply).';
    suggestedNextStep = 'Consider First Appeal';
  } else if (text.includes('not compiled') || text.includes('bulky') || text.includes('disproportionate') || text.includes('create information') || text.includes('clarification') || text.includes('opinion') || text.includes('scattered')) {
    status = 'EVASIVE_VAGUE';
    sectionCited = null;
    reason = 'The PIO gave an evasive or deflective reply stating records are not compiled or voluminous, without providing accessible documents.';
    suggestedNextStep = 'Consider First Appeal';
  } else if (text.includes('enclosed') || text.includes('attached') || text.includes('herewith') || text.includes('as requested') || text.includes('certified copy') || text.includes('furnished below') || text.includes('point wise information')) {
    status = 'FULLY_ANSWERED';
    sectionCited = null;
    reason = 'The authority furnished substantive point-wise information and documents corresponding to the Section 6(1) queries.';
    suggestedNextStep = 'No action needed';
  } else {
    status = 'PARTIALLY_ANSWERED';
    sectionCited = null;
    reason = 'The response provides preliminary or incomplete remarks regarding the requested matter; certain aspects remain unresolved.';
    suggestedNextStep = 'Consider First Appeal';
    confidence = 'medium';
  }

  return {
    status,
    sectionCited,
    reason,
    suggestedNextStep,
    confidence,
    disclaimer: 'AI-generated analysis. This is not legal advice — verify before deciding on an appeal.',
  };
}
