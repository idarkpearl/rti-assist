import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initialAuthorities, initialCases, initialDeadlines, initialAppeals } from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.resolve(__dirname, '../../data/db.json');

// Ensure data folder exists
const dataDir = path.dirname(DB_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

class DatabaseStore {
  constructor() {
    this.authorities = [...initialAuthorities];
    this.cases = [...initialCases];
    this.deadlines = [...initialDeadlines];
    this.appeals = [...initialAppeals];
    this.users = [];

    this.loadFromFile();
  }

  loadFromFile() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed.cases && Array.isArray(parsed.cases)) this.cases = parsed.cases;
        if (parsed.deadlines && Array.isArray(parsed.deadlines)) this.deadlines = parsed.deadlines;
        if (parsed.appeals && Array.isArray(parsed.appeals)) this.appeals = parsed.appeals;
        if (parsed.users && Array.isArray(parsed.users)) this.users = parsed.users;
        if (parsed.authorities && Array.isArray(parsed.authorities)) this.authorities = parsed.authorities;
      }
    } catch (err) {
      console.warn('[DatabaseStore] Could not load persisted db.json, using seed memory:', err.message);
    }
  }

  saveToFile() {
    try {
      const data = {
        authorities: this.authorities,
        cases: this.cases,
        deadlines: this.deadlines,
        appeals: this.appeals,
        users: this.users,
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.warn('[DatabaseStore] Failed to write db.json:', err.message);
    }
  }

  // --- Authorities ---
  getAuthorities({ search, jurisdiction, level } = {}) {
    let result = [...this.authorities];

    if (jurisdiction) {
      result = result.filter(
        (a) => a.jurisdiction && a.jurisdiction.toLowerCase() === jurisdiction.toLowerCase()
      );
    }

    if (level) {
      result = result.filter(
        (a) => a.level && a.level.toLowerCase() === level.toLowerCase()
      );
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          (a.ministry && a.ministry.toLowerCase().includes(q)) ||
          (a.department && a.department.toLowerCase().includes(q)) ||
          (a.categoryTags && a.categoryTags.some((t) => t.toLowerCase().includes(q))) ||
          (a.pio && a.pio.name.toLowerCase().includes(q))
      );
    }

    return result;
  }

  getAuthorityById(id) {
    return this.authorities.find((a) => a.id === id) || null;
  }

  // --- Cases ---
  getCases({ status, search } = {}) {
    let list = [...this.cases];

    if (status) {
      list = list.filter((c) => c.status === status);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.trackingNumber.toLowerCase().includes(q) ||
          (c.authority?.name && c.authority.name.toLowerCase().includes(q)) ||
          (c.summary && c.summary.toLowerCase().includes(q))
      );
    }

    return list;
  }

  getCaseById(id) {
    const caseItem = this.cases.find((c) => c.id === id);
    if (!caseItem) return null;

    // Attach latest related deadlines and appeals
    const deadlines = this.deadlines.filter((d) => d.caseId === id);
    const appeals = this.appeals.filter((a) => a.caseId === id);
    const authority = this.getAuthorityById(caseItem.authorityId) || caseItem.authority;

    return {
      ...caseItem,
      authority,
      deadlines: deadlines.length > 0 ? deadlines : caseItem.deadlines || [],
      appeals: appeals.length > 0 ? appeals : caseItem.appeals || [],
    };
  }

  createCase(data) {
    const id = data.id || `case-${Date.now()}`;
    const filingDate = data.filingDate || new Date().toISOString();
    const isLifeAndLiberty = Boolean(data.isLifeAndLiberty);
    const daysAllowed = isLifeAndLiberty ? 2 : 30;
    const dueDate = new Date(Date.now() + daysAllowed * 86400000).toISOString();

    const auth = this.getAuthorityById(data.authorityId) ||
      (typeof data.authority === 'object' ? data.authority : this.authorities[0]);

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
      createdAt: filingDate,
    };

    const newCase = {
      id,
      trackingNumber:
        data.trackingNumber ||
        `RTI-2026-${auth?.code || 'AUTH'}-${Math.floor(1000 + Math.random() * 9000)}`,
      title: data.title || 'Untitled RTI Inquiry',
      subjectCategory: data.subjectCategory || 'Public Administration',
      summary: data.summary || (data.queries && data.queries[0]) || 'RTI application under Section 6(1)',
      description: data.description || 'Application filed under Section 6(1) of the Right to Information Act, 2005.',
      queries: data.queries && data.queries.length > 0 ? data.queries : ['Certified copies of relevant files and administrative sanctions.'],
      applicant: data.applicant || {
        fullName: 'Vikramaditya Roy',
        email: 'vikram.roy@example.com',
      },
      authorityId: auth?.id || 'auth-1',
      authority: auth,
      status: data.status || 'submitted',
      isLifeAndLiberty,
      filingDate,
      submissionMode: data.submissionMode || 'online_portal',
      feePaid: data.feePaid !== undefined ? data.feePaid : (auth?.applicationFee || 10),
      paymentReference: data.paymentReference || `TXN-REF-${Math.floor(100000 + Math.random() * 900000)}`,
      deadlines: [defaultDeadline],
      appeals: [],
      documents: data.documents || [],
      tags: data.tags || [data.subjectCategory || 'General'],
      createdAt: filingDate,
      updatedAt: filingDate,
    };

    this.cases.unshift(newCase);
    this.deadlines.unshift(defaultDeadline);
    this.saveToFile();

    return newCase;
  }

  updateCase(id, updates) {
    const index = this.cases.findIndex((c) => c.id === id);
    if (index === -1) return null;

    this.cases[index] = {
      ...this.cases[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.saveToFile();
    return this.getCaseById(id);
  }

  deleteCase(id) {
    const prevLen = this.cases.length;
    this.cases = this.cases.filter((c) => c.id !== id);
    this.deadlines = this.deadlines.filter((d) => d.caseId !== id);
    this.appeals = this.appeals.filter((a) => a.caseId !== id);
    this.saveToFile();
    return this.cases.length < prevLen;
  }

  // --- Deadlines ---
  getDeadlines({ caseId, status } = {}) {
    let list = [...this.deadlines];
    if (caseId) list = list.filter((d) => d.caseId === caseId);
    if (status) list = list.filter((d) => d.status === status);
    return list;
  }

  getDeadlineById(id) {
    return this.deadlines.find((d) => d.id === id) || null;
  }

  createDeadline(data) {
    const id = data.id || `dl-${Date.now()}`;
    const newDeadline = {
      id,
      caseId: data.caseId,
      title: data.title || 'Statutory Response Window',
      type: data.type || 'pio_response',
      dueDate: data.dueDate,
      calculatedDays: data.calculatedDays || 30,
      daysRemaining: data.daysRemaining !== undefined ? data.daysRemaining : (data.calculatedDays || 30),
      status: data.status || 'pending',
      isLifeAndLiberty: Boolean(data.isLifeAndLiberty),
      actSectionReference: data.actSectionReference || 'RTI Act Sec 7(1)',
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
      ...data,
    };

    this.deadlines.unshift(newDeadline);

    if (data.caseId) {
      const caseItem = this.cases.find((c) => c.id === data.caseId);
      if (caseItem) {
        if (!caseItem.deadlines) caseItem.deadlines = [];
        caseItem.deadlines.unshift(newDeadline);
      }
    }

    this.saveToFile();
    return newDeadline;
  }

  updateDeadline(id, updates) {
    const index = this.deadlines.findIndex((d) => d.id === id);
    if (index === -1) return null;

    this.deadlines[index] = {
      ...this.deadlines[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.saveToFile();
    return this.deadlines[index];
  }

  completeDeadline(id) {
    return this.updateDeadline(id, {
      status: 'completed',
      completedAt: new Date().toISOString(),
    });
  }

  deleteDeadline(id) {
    const prevLen = this.deadlines.length;
    this.deadlines = this.deadlines.filter((d) => d.id !== id);
    this.saveToFile();
    return this.deadlines.length < prevLen;
  }

  // --- Appeals ---
  getAppeals(caseId) {
    if (caseId) {
      return this.appeals.filter((a) => a.caseId === caseId);
    }
    return [...this.appeals];
  }

  getAppealById(id) {
    return this.appeals.find((a) => a.id === id) || null;
  }

  createAppeal(data) {
    const id = data.id || `appeal-${Date.now()}`;
    const newAppeal = {
      id,
      caseId: data.caseId,
      type: data.type || 'first_appeal',
      appealNumber:
        data.appealNumber ||
        `FAA-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      authorityId: data.authorityId,
      authorityName: data.authorityName,
      groundOfAppeal: data.groundOfAppeal || 'no_response',
      groundsSummary: data.groundsSummary || 'Deemed refusal under Section 7(2).',
      draftContent: data.draftContent || data.draftText || '',
      status: data.status || 'ready_to_send',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };

    this.appeals.unshift(newAppeal);

    // Also update parent case if exists
    if (data.caseId) {
      const caseItem = this.cases.find((c) => c.id === data.caseId);
      if (caseItem) {
        if (!caseItem.appeals) caseItem.appeals = [];
        caseItem.appeals.push(newAppeal);
        caseItem.status = 'first_appeal_pending';
        caseItem.updatedAt = new Date().toISOString();
      }
    }

    this.saveToFile();
    return newAppeal;
  }

  updateAppeal(id, updates) {
    const index = this.appeals.findIndex((a) => a.id === id);
    if (index === -1) return null;

    this.appeals[index] = {
      ...this.appeals[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.saveToFile();
    return this.appeals[index];
  }

  deleteAppeal(id) {
    const prevLen = this.appeals.length;
    this.appeals = this.appeals.filter((a) => a.id !== id);
    this.saveToFile();
    return this.appeals.length < prevLen;
  }

  // --- Case Documents ---
  addDocumentToCase(caseId, docData) {
    const caseItem = this.cases.find((c) => c.id === caseId);
    if (!caseItem) return null;

    if (!caseItem.documents) caseItem.documents = [];
    const doc = {
      id: docData.id || `doc-${Date.now()}`,
      caseId,
      fileName: docData.fileName || 'uploaded_document.pdf',
      fileSize: docData.fileSize || 0,
      mimeType: docData.mimeType || 'application/pdf',
      fileUrl: docData.fileUrl || '#',
      category: docData.category || 'attachment',
      uploadedAt: new Date().toISOString(),
      ...docData,
    };

    caseItem.documents.unshift(doc);
    caseItem.updatedAt = new Date().toISOString();
    this.saveToFile();
    return doc;
  }

  // --- Users ---
  getUsers() {
    return this.users.map(({ password, ...u }) => u);
  }

  getUserById(id) {
    const u = this.users.find((user) => user.id === id);
    if (!u) return null;
    const { password, ...safeUser } = u;
    return safeUser;
  }

  findUserByEmail(email) {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  createUser(userData) {
    const newUser = {
      id: userData.id || `usr-${Date.now()}`,
      name: userData.name || 'Citizen User',
      email: userData.email,
      role: userData.role || 'citizen',
      password: userData.password || '',
      hasPassword: Boolean(userData.hasPassword),
      emailVerified: true,
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    this.saveToFile();
    return newUser;
  }

  updateUserPassword(email, password) {
    const user = this.findUserByEmail(email);
    if (!user) return null;
    user.password = password;
    user.hasPassword = true;
    user.emailVerified = true;
    user.updatedAt = new Date().toISOString();
    this.saveToFile();
    return user;
  }
}

export const db = new DatabaseStore();
