# 🧠 RTI Assist Dedicated LLM Microservice

This microservice provides high-precision RTI Act 2005 legal NLP capabilities for RTI Assist, powered by Google Gemini (with resilient built-in legal rules fallback).

---

## ⚡ Quick Start

```bash
cd rti-assist-llm-service
npm install
npm run dev     # starts on http://localhost:8001
```

To configure live Gemini AI:
Open `.env` and set your key:
```env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-1.5-flash
```

---

## 📜 API Contract: `POST /classify-response`

Analyzes an official government reply and classifies its statutory status and next steps.

### Request Body:
```json
{
  "responseText": "The requested information relates to commercial confidence under Section 8(1)(d) of RTI Act and cannot be disclosed.",
  "requestContext": {
    "originalRequestText": "Tender vendor bids and pricing calculation sheets.",
    "filingDate": "2026-08-14",
    "authorityName": "National Highways Authority of India (NHAI)"
  }
}
```

### Response (`200 OK`):
```json
{
  "status": "DENIED",
  "sectionCited": "8(1)(d)",
  "reason": "Information was withheld under Section 8(1)(d) citing commercial confidence or trade secrets of third parties.",
  "suggestedNextStep": "Consider First Appeal",
  "confidence": "high",
  "disclaimer": "AI-generated analysis. This is not legal advice — verify before deciding on an appeal."
}
```

### Status Enum:
- `FULLY_ANSWERED` (Green)
- `PARTIALLY_ANSWERED` (Yellow)
- `DENIED` (Red)
- `EVASIVE_VAGUE` (Red)
- `TRANSFERRED` (Yellow)
- `NO_RESPONSE` (Yellow)
