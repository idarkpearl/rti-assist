# 🏛️ RTI Assist — Full-Stack Monorepo

> **Empowering Indian citizens to draft, file, track, and appeal Right to Information (RTI) requests with AI assistance under the Right to Information Act, 2005.**

[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4.2-brightgreen.svg?logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.0-blue.svg?logo=react)](https://react.dev)
[![Java](https://img.shields.io/badge/Java-21%2F23-orange.svg?logo=openjdk)](https://openjdk.org)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-3.1_Flash--Lite-purple.svg?logo=google)](https://aistudio.google.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📌 Project Overview

**RTI Assist** simplifies and automates the entire lifecycle of citizen Right to Information applications:
$$\text{Citizen Concern} \longrightarrow \text{AI Draft} \longrightarrow \text{Public Authority Recommendation} \longrightarrow \text{Portal Filing} \longrightarrow \text{Statutory Deadline Engine} \longrightarrow \text{First / Second Appeal}$$

This monorepo contains the complete end-to-end software ecosystem:
- **`rti-assist-frontend/`**: Modern React 19 + TypeScript + Tailwind CSS citizen portal with dark/light theme, interactive filing wizard, timeline dashboard, and appeal generator.
- **`rti-assist-backend/`**: Enterprise-grade Java Spring Boot 3.4.2 REST backend powering authentication (Email OTP via Brevo + JWT), case management, statutory deadline engine, and Google Gemini AI gateway with resilient legal fallback.
- **`rti-assist-llm-service/`**: Microservice providing RTI Act 2005 legal NLP classification for official government replies.

---

## 🏗️ Repository Architecture

```text
rti-assist/
├── rti-assist-frontend/            # React 19 + Vite + Tailwind CSS Citizen Web App
│   ├── src/                        # Pages, components, hooks, tests
│   ├── public/                     # Static assets & creator voice notes
│   ├── package.json
│   └── vite.config.js
│
├── rti-assist-backend/             # Java Spring Boot 3.4.2 REST Backend
│   ├── src/main/java/              # Controllers, services, models, security
│   ├── data/                       # Local JSON persistence store & seeds
│   ├── pom.xml                     # Maven dependencies (Java 21/23)
│   ├── mvnw.cmd / mvnw             # Maven wrapper scripts
│   └── .env.example
│
├── rti-assist-llm-service/         # Dedicated LLM microservice
│   ├── src/                        # Legal classification endpoints
│   ├── package.json
│   └── .env.example
│
├── .gitignore                      # Monorepo root ignore rules (excludes credentials & build artifacts)
└── README.md                       # Monorepo documentation
```

---

## ⚡ Quickstart Guide

### 1. Prerequisites
- **Node.js**: v18+ or v20+ (`node -v`)
- **Java**: Java 21 or Java 23 (`java -version`)
- **Maven**: Maven Wrapper is pre-bundled in `rti-assist-backend`

---

### 2. Run the Java Spring Boot Backend

```bash
cd rti-assist-backend

# Configure your environment
cp .env.example .env

# Run using the included Maven wrapper (Windows PowerShell):
.\mvnw.cmd spring-boot:run

# Or on macOS/Linux:
./mvnw spring-boot:run
```

- **Backend Base URL**: `http://localhost:8000`
- **REST API Base URL**: `http://localhost:8000/api`
- **Health Check**: `http://localhost:8000/api/health`

---

### 3. Run the React Frontend

```bash
cd rti-assist-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

- **Frontend Application**: `http://localhost:5173`

> **Note on Mock Mode**: Set `VITE_USE_MOCK=false` in `rti-assist-frontend/.env` to connect directly to the live Java backend.

---

### 4. (Optional) Run the LLM Classification Service

```bash
cd rti-assist-llm-service
npm install
npm run dev
```

- **Service URL**: `http://localhost:8001`

---

## ⚖️ Statutory Deadline Rules (RTI Act, 2005)

- **Section 7(1)**: General response deadline is **30 calendar days** from filing date.
- **Section 7(1) Proviso**: Requests concerning **Life & Liberty** require response within **48 hours**.
- **Section 19(1)**: First Appeal must be filed within **30 days** of deadline expiry or receipt of adverse decision.
- **Section 19(3)**: Second Appeal to Central/State Information Commission within **90 days** from First Appellate decision.

---

## 🛡️ Zero-Crash AI Resiliency

Both the backend and LLM service implement automatic legal rule-based fallbacks. If no external Gemini API key is configured or if rate limits are reached, the application automatically uses embedded statutory heuristics to draft queries, suggest authorities, and generate appeals without interrupting citizen workflow.

---

## 👥 Project Team & Contributors

Developed as part of the **B.Tech Semester 7 Major Project** at **Delhi Skill and Entrepreneurship University (DSEU)**.

- **Yash Sehgal** ([@idarkpearl](https://github.com/idarkpearl)) — Project Lead & Full-Stack Engineer
- **Prachi Mehra** ([@prachi1862](https://github.com/prachi1862)) — Partner, Collaborator & Systems Engineer

---

## 📜 License
MIT License

