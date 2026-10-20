# 🛡️ RTI Assist — Java Spring Boot Backend & Gemini AI Gateway

An enterprise-grade, high-performance **Java Spring Boot 3.4.2 (Java 21/23)** REST backend and Google Gemini AI integration service for **RTI Assist**.

Built to support demo presentations, statutory deadline tracking, public authority directory lookup, citizen authentication (Email OTP via Brevo + JWT), and AI-powered RTI application and appeal drafting under the Right to Information Act, 2005.

---

## ⚡ Quick Start

### Prerequisites
- **Java 21 or Java 23** installed (`java -version`)
- Maven Wrapper is pre-included (`./mvnw.cmd` on Windows, `./mvnw` on Linux/macOS)

### 1. Run the Backend
```powershell
cd rti-assist-backend

# Run directly via Maven wrapper:
.\mvnw.cmd spring-boot:run

# Or run the packaged JAR:
java -jar target/rti-assist-backend-0.0.1-SNAPSHOT.jar

# Or via npm shortcut:
npm run dev
```

The server starts on: **`http://localhost:8000`**  
The API base URL is: **`http://localhost:8000/api`**

---

## 🔑 Environment Configuration (`.env`)

Configuration is seamlessly read from `rti-assist-backend/.env`:

```env
# Server Port (Frontend connects to http://localhost:8000/api by default)
PORT=8000

# Google Gemini API Key
GEMINI_API_KEY=your_actual_key_here
GEMINI_MODEL=gemini-3.1-flash-lite

# JWT Secret for Token Verification
JWT_SECRET=rti_assist_jwt_dev_secret_key_2026

# Allowed Frontend Origin for CORS
FRONTEND_URL=http://localhost:5173

# Brevo (Sendinblue) Email API Configuration
BREVO_API_KEY=your_brevo_api_key_here
BREVO_SENDER_EMAIL=darkpearl251103@gmail.com
BREVO_SENDER_NAME=RTI Assist Verification
```

> **Zero-Crash Resiliency:** If `GEMINI_API_KEY` is not provided (or if API quota runs out during your demo/presentation), the backend automatically switches to a built-in legal drafting rules engine so the app **never crashes or errors out in front of your mentor/evaluators**.

---

## 📋 Available REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Backend service health, preloaded record counts, and Gemini status |
| `GET` | `/api/health` | Health check endpoint |
| `POST` | `/api/auth/send-otp` | Generates & dispatches 6-digit email OTP via Brevo |
| `POST` | `/api/auth/check-email` | Checks if citizen email exists and has password set |
| `POST` | `/api/auth/verify-otp` | Verifies OTP code, registers user, issues JWT token |
| `POST` | `/api/auth/set-password` | Sets account password after OTP verification |
| `POST` | `/api/auth/login` | Authenticates citizen with email & password, issues JWT |
| `GET` | `/api/auth/me` | Fetch authenticated citizen profile (Requires Bearer token) |
| `GET` | `/api/authorities` | List verified public authorities (supports `search`, `jurisdiction`, `level`) |
| `GET` | `/api/authorities/:id` | Fetch specific authority by ID (includes DSEU, NHAI, DDA, etc.) |
| `GET` | `/api/cases` | List all citizen cases (supports `status`, `search` filtering) |
| `GET` | `/api/cases/:id` | Fetch single case details with linked authority, deadlines, and appeals |
| `POST` | `/api/cases` | Create a new case; computes 30-day (or 48-hour) statutory deadlines |
| `PATCH` | `/api/cases/:id` | Update case status or record PIO response summary & date |
| `DELETE`| `/api/cases/:id` | Remove a case |
| `POST` | `/api/draft-request` | **AI Endpoint:** Formulate Section 6(1) RTI draft from citizen concern (Gemini AI) |
| `POST` | `/api/cases/recommend-authority` | **AI Endpoint:** Recommends competent public authority, filing portal, and fee |
| `POST` | `/api/draft-appeal` | **AI Endpoint:** Drafts Section 19(1) First Appeal or Section 19(3) Second Appeal |
| `POST` | `/api/classify-response` | **AI Endpoint:** Analyzes government RTI reply and recommends statutory next steps |
| `GET` | `/api/deadlines` | List statutory tracking deadlines |
| `PATCH`| `/api/deadlines/:id/complete` | Mark deadline completed |
| `POST` | `/api/appeals` | Save generated appeal petition |
| `GET` | `/api/appeals/:id` | Fetch specific appeal petition |

---

## 🧪 Running Automated Tests

Run the full integration test suite:
```powershell
.\mvnw.cmd test
```

All 9 integration tests test:
- Service health & pre-loaded authorities
- DSEU recommendation logic
- Section 6(1) drafting with Google Gemini
- Section 8(1) exemption response classification contract
- 30-day statutory response calculation
- Full Citizen Auth cycle (Send OTP &rarr; Verify OTP &rarr; Set Password &rarr; Password Login &rarr; Protected Me profile)

---

## 🏗️ Architecture

```
src/main/java/org/rtiassist/
├── RtiAssistBackendApplication.java   # Spring Boot Application entrypoint
├── config/
│   ├── DotenvConfig.java              # .env environment loader
│   ├── JwtUtil.java                   # JWT token generation & payload verification
│   └── WebConfig.java                 # CORS configuration & Auth interceptor
├── controller/
│   ├── RootController.java            # /, /api/health
│   ├── AuthController.java            # /api/auth/*
│   ├── AuthorityController.java       # /api/authorities/*
│   ├── CaseController.java            # /api/cases/*
│   ├── DeadlineController.java        # /api/deadlines/*
│   ├── AppealController.java          # /api/appeals/*
│   └── AiController.java              # /api/draft-request, /api/classify-response, etc.
├── dto/                               # Request/response data transfer objects
├── exception/
│   ├── ApiException.java              # Controlled HTTP status exceptions
│   └── GlobalExceptionHandler.java    # Centralized JSON error format handler
├── model/                             # POJO entities (User, CaseItem, Authority, Deadline, Appeal)
├── repository/
│   ├── JsonDataStore.java             # Thread-safe JSON persistence (data/db.json)
│   └── SeedData.java                  # Initial authorities and seed records
└── service/
    ├── BrevoService.java              # Transactional email & OTP verification
    └── GeminiService.java             # Google Gemini API & resilient legal rules engine
```
