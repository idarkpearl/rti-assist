# 🏛️ RTI Assist

> **Empowering Indian citizens to draft, file, track, and appeal Right to Information (RTI) requests with AI assistance.**

RTI Assist simplifies the entire lifecycle of an RTI application under the Right to Information Act, 2005:
$$\text{Citizen's Issue} \longrightarrow \text{AI Draft} \longrightarrow \text{Authority Recommendation} \longrightarrow \text{Official Filing} \longrightarrow \text{Statutory Deadline Tracking} \longrightarrow \text{First/Second Appeal}$$

---

## 📄 Backend Handover Documentation & PDF
For the backend developer building the Spring Boot + PostgreSQL service:
- 📖 **Markdown Report**: [`BACKEND_HANDOVER_REPORT.md`](./BACKEND_HANDOVER_REPORT.md)
- 📑 **Printable PDF**: [`BACKEND_HANDOVER_REPORT.pdf`](./BACKEND_HANDOVER_REPORT.pdf)

Includes full API contracts, DTO schemas, database ER models, LLM system prompt specifications, statutory deadline rules, and Step 11 integration checklist.

---

## ✨ Features

- **🪄 3-Step Guided Intake Wizard (`/intake`)**:
  - Step 1: Plain-language citizen concern entry.
  - Step 2: AI-structured formal RTI draft with editable queries and fee/inspection requests.
  - Step 3: Verified Public Authority recommendation with jurisdiction, filing channels, and statutory disclaimers.
- **📚 Verified Public Authority Directory (`/directory`)**:
  - Searchable catalog of Central & Delhi NCT public authorities.
  - Real PIO/CPIO designations, official filing portals, and direct linkage to request drafting.
- **📝 Case Filing & Registration (`/cases/new/filing`)**:
  - Official portal filing instructions (RTI Online / Delhi e-RTI).
  - Capture registration number, filing date, confirmed authority, and document metadata.
- **📊 Case Tracking Dashboard (`/dashboard`)**:
  - Unified view of all citizen cases.
  - Real-time statutory urgency badges:
    - 🔴 **Red**: Urgent / Overdue (< 3 days left or passed).
    - 🟡 **Yellow**: Attention needed (< 7 days left).
    - 🟢 **Green**: Active / On track (≥ 7 days left).
- **⏱️ Case Detail & Timeline (`/cases/:id`)**:
  - Visual status progress: `Drafted` ➔ `Filed` ➔ `Response Due` ➔ `First Appeal` ➔ `Second Appeal` ➔ `Disposed`.
  - Case metadata, authority contact info, and attached filing receipt records.
  - Automatic appeal trigger when response deadline passes.
- **⚖️ AI-Assisted Appeal Drafting (`/appeals/:id`)**:
  - First Appeal (Section 19(1)) and Second Appeal (Section 19(3)) drafting.
  - Grounds for appeal (No response within 30 days, incomplete/misleading information, unlawful refusal).
  - One-click copy with filing instructions for FAA and CIC/SIC portals.
- **🔐 Secure Authentication**:
  - JWT-based authentication context (`AuthContext.tsx`).
  - Protected routes for citizen dashboard, cases, and appeal management.
  - Automatic `Authorization: Bearer <token>` injection for all secure API calls.
- **🧪 Comprehensive Test Suite**:
  - 30 unit tests covering statutory deadline calculations, edge cases, leap years, life & liberty requests, and JWT headers.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript / JSX
- **Styling**: Tailwind CSS
- **Routing**: React Router v7
- **Icons**: Lucide React
- **Testing**: Vitest + Testing Library
- **Build Tool**: Vite
- **Target Backend**: Spring Boot 3.x + PostgreSQL 15/16 + Spring Security (JWT) + Claude / Gemini API

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/idarkpearl/rti-assist.git
cd rti-assist
npm install
```

### 2. Environment Configuration
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL for Spring Boot backend | `http://localhost:8000/api` |
| `VITE_USE_MOCK` | Toggle mock API (`true`) or real backend (`false`) | `true` |

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Run Test Suite
```bash
npm test
```
Runs all 30 Vitest tests validating deadline computations and authentication headers.

### 5. Production Build
```bash
npm run build
```

---

## 🏛️ Statutory Rules Implemented

- **Section 7(1)**: General RTI response deadline is **30 calendar days** from filing date.
- **Section 7(1) Proviso**: Requests concerning **Life and Liberty** require response within **48 hours**.
- **Section 19(1)**: First Appeal must be filed within **30 days** after response deadline expiry.
- **Section 19(3)**: Second Appeal must be filed within **90 days** from First Appellate decision date.

---

## 🤝 Backend Handover Note

The frontend is complete and operates seamlessly with an in-memory mock mode (`VITE_USE_MOCK=true`). When the Spring Boot backend is deployed, simply switch `VITE_USE_MOCK=false` and configure `VITE_API_URL`. Refer to [`BACKEND_HANDOVER_REPORT.md`](./BACKEND_HANDOVER_REPORT.md) for full endpoint specifications.

---

## 📜 License
MIT
