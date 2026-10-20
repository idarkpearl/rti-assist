# 🛡️ RTI Assist Backend & Gemini AI Gateway

A lightweight, zero-dependency REST backend and Google Gemini AI integration service for **RTI Assist**. Built to support demo presentations, statutory deadline tracking, public authority directory lookup, and AI-powered RTI application and appeal drafting under the Right to Information Act, 2005.

---

## ⚡ Quick Start

### 1. Install & Run
```bash
cd rti-assist-backend
npm install
npm run dev     # with auto-restart on changes
# or
npm start
```
The server will start on: **`http://localhost:8000`**  
The API base URL is: **`http://localhost:8000/api`**

---

## 🔑 Adding Your Google Gemini API Key

You can connect your Google Gemini API key in seconds:

1. Open `rti-assist-backend/.env`
2. Get your free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
3. Paste it on the `GEMINI_API_KEY` line:
   ```env
   GEMINI_API_KEY=AIzaSy...your_actual_key_here
   ```
4. Save the file. The server will automatically use Gemini 1.5 Flash / 2.0 Flash for drafting.

> **Note on Resiliency:** If `GEMINI_API_KEY` is not provided (or if API quota runs out during your presentation), the backend automatically switches to a built-in legal drafting engine so the app **never crashes or errors out in front of your mentor**.

---

## 📋 Available REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Backend service health, preloaded record counts, and Gemini status |
| `GET` | `/api/health` | Health check endpoint |
| `POST` | `/api/auth/login` | Authenticates citizen / demo account, issues JWT token |
| `POST` | `/api/auth/register` | Citizen registration |
| `GET` | `/api/auth/me` | Fetch authenticated citizen profile |
| `GET` | `/api/authorities` | List verified public authorities (supports `search`, `jurisdiction`, `level`) |
| `GET` | `/api/authorities/:id` | Fetch specific authority by ID |
| `GET` | `/api/cases` | List all citizen cases (supports `status`, `search` filtering) |
| `GET` | `/api/cases/:id` | Fetch single case details with linked authority, deadlines, and appeals |
| `POST` | `/api/cases` | Create a new case; automatically computes 30-day (or 48-hour) statutory deadlines |
| `PATCH` | `/api/cases/:id` | Update case status or record PIO response summary & date |
| `DELETE`| `/api/cases/:id` | Remove a case |
| `POST` | `/api/draft-request` | **AI Endpoint:** Formulate Section 6(1) RTI draft from user concern (Gemini AI) |
| `POST` | `/api/cases/recommend-authority` | **AI Endpoint:** Recommends competent public authority, filing portal, and fee |
| `POST` | `/api/draft-appeal` | **AI Endpoint:** Drafts Section 19(1) First Appeal or Section 19(3) Second Appeal |
| `POST` | `/api/classify-response` | **AI Endpoint:** Analyzes government RTI response and recommends statutory next steps |
| `GET` | `/api/deadlines` | List statutory tracking deadlines |
| `PATCH`| `/api/deadlines/:id/complete` | Mark deadline completed |
| `POST` | `/api/appeals` | Save generated appeal petition |
| `GET` | `/api/appeals/:id` | Fetch specific appeal petition |

---

## 📜 API Contract: Government Response Classification (`POST /classify-response`)

### Sample Request (`POST /api/classify-response` or `POST /classify-response`):
```json
{
  "responseText": "With reference to your RTI query regarding faculty selection committee minutes, disclosure is hereby denied as it contains third party personal evaluations exempted under Section 8(1)(j) of the RTI Act, 2005.",
  "requestContext": {
    "originalRequestText": "Certified copies of faculty selection committee minutes and candidate score sheets.",
    "filingDate": "2026-08-14",
    "authorityName": "Department of Higher Education"
  }
}
```

### Sample Response (`200 OK`):
```json
{
  "status": "DENIED",
  "sectionCited": "8(1)(j)",
  "reason": "The authority denied disclosure invoking Section 8(1)(j), citing personal information or privacy of individuals without demonstrating larger public interest.",
  "suggestedNextStep": "Consider First Appeal",
  "confidence": "high",
  "disclaimer": "AI-generated analysis. This is not legal advice — verify before deciding on an appeal."
}
```

### Contract Notes for Spring Boot Teammate:
- **`status`**: Exactly one of `["FULLY_ANSWERED", "PARTIALLY_ANSWERED", "DENIED", "EVASIVE_VAGUE", "TRANSFERRED", "NO_RESPONSE"]`.
- **`sectionCited`**: E.g. `"8(1)(j)"`, `"8(1)(a)"`, `"8(1)(d)"`, `"Section 6(3)"`, or `null` if no section was explicitly cited.
- **`suggestedNextStep`**: Exactly one of `["No action needed", "Consider First Appeal", "File First Appeal — response is overdue", "Consider Second Appeal", "Request clarification"]`.
- **`confidence`**: `high` | `medium` | `low`.
- **Validation**: `responseText` must be non-empty and under 5,000 characters. Returns `400` on validation error, `502` if upstream LLM fails twice.

---

## 🗑️ How to Delete / Reset Later

Since this backend was created as a lightweight demo server:
- To reset database data: simply delete `rti-assist-backend/data/db.json` (it will re-seed on next launch).
- To delete the backend entirely later: simply delete the `rti-assist-backend` directory. The frontend will automatically fall back to mock mode if needed by switching `VITE_USE_MOCK=true` in `rti-assist-frontend/.env`.
