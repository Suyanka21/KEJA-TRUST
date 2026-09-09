# KeJaTrust (NyumbaYangu) — Kenyan Landlord & Rental Property Rating Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Jurisdiction](https://img.shields.io/badge/Jurisdiction-Republic%20of%20Kenya-red.svg)](https://www.odpc.go.ke/)
[![ODPC DPA 2019](https://img.shields.io/badge/Compliance-ODPC%20DPA%202019-teal.svg)](https://www.odpc.go.ke/)
[![Cap 36 Defamation Shield](https://img.shields.io/badge/Legal%20Shield-Defamation%20Act%20Cap%2036-amber.svg)](http://kenyalaw.org/)
[![Verification Suite](https://img.shields.io/badge/Tests-37%20Passing-brightgreen.svg)](tests/)

---

## 1. Project Overview & Working Prototype Disclaimer

### Title
**KeJaTrust (NyumbaYangu)** — Decentralized Kenyan Tenant Transparency and Landlord Rating Platform.

### Status
**Working Prototype & High-Fidelity Interactive Simulation.**
This repository contains both a containerized, production-mode TypeScript/React client application and an asynchronous Python/FastAPI backend architecture equipped with automated cryptographic enclaves, statutory state machines, and a comprehensive 37-test verification suite.

### Mission
The Kenyan urban rental ecosystem (spanning Nairobi, Kiambu, Mombasa, Nakuru, Kisumu, and Eldoret) has historically suffered from systemic information asymmetry:
- **Arbitrary Deposit Retention**: Widespread refusal by caretakers and landlords to refund security deposits upon tenancy termination.
- **Water Cartels & Rationing**: Hidden artificial water shortages, vendor cartels, and erratic borehole/token electricity billing.
- **Unlawful Evictions & Self-Help Lockouts**: Violation of statutory notice mandates under the Distress for Rent Act (Cap 293) and Rent Restriction Act (Cap 296).
- **Whistleblower Vulnerability**: Fear of tenant blacklisting, violent retaliatory evictions, or aggressive civil defamation litigation under the Defamation Act (Cap 36).

**KeJaTrust** eliminates this asymmetry through **cryptographic anonymity**, **statutory safe harbors**, and **verified tenant ratings** grounded in Safaricom M-Pesa receipt verification.

---

## 2. Statutory Legal & Compliance Framework

KeJaTrust is engineered from the ground up to comply natively with Kenyan statutory jurisprudence and data protection requirements.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       STATUTORY COMPLIANCE ARCHITECTURE                      │
├───────────────────────────────┬─────────────────────────────────────────────┤
│ Kenya DPA 2019 (ODPC)         │ Zero Plaintext PII · HMAC-SHA-256 Hashes    │
│                               │ AES-256 Enclaves · Section 40 Right-to-Forget│
├───────────────────────────────┼─────────────────────────────────────────────┤
│ Defamation Act (Cap 36)       │ Section 14 Justification Defence            │
│                               │ 168-Hour Notice & Takedown State Machine    │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ Distress for Rent (Cap 293)   │ Anti-Lockout Auditing · Notice Period Checks│
├───────────────────────────────┼─────────────────────────────────────────────┤
│ Cybercrimes Act (CMCA)        │ Gated Disputes: Police OB / EARB Validation │
└───────────────────────────────┴─────────────────────────────────────────────┘
```

### 1. Office of the Data Protection Commissioner (ODPC) — Kenya DPA 2019
- **Zero Raw PII Storage**: Tenant phone numbers (MSISDN) and email addresses are never stored in plaintext. They are salted and transformed into deterministic one-way HMAC-SHA-256 identity fingerprints (`identity_fingerprint`).
- **Cryptographic Enclaves (AES-256-GCM)**: Sensitive verification artifacts are protected with AES-256 authenticated envelope encryption (`StandardFernetCipher`) using rotating master keys (`K_master`).
- **Anonymous Display Pseudonyms**: Automatic pseudonym generation (e.g., `RoysambuRenter82`, `KilimaniResident`, `WestlandsTenant`) isolates the tenant's public review from real-world identification.
- **Section 40 "Right to be Forgotten"**: Full cryptographic shredding mechanism that scrubs an account, purges linked review metadata, and leaves a tamper-evident audit receipt.

### 2. Defamation Act (Cap 36) — Safe Harbor & Notice-and-Takedown
- **Intermediary Safe Harbor**: KeJaTrust acts as an algorithmic intermediary hosting user-generated tenant feedback. Contested reviews immediately enter a temporary statutory sandbox.
- **168-Hour (7-Day) Rebuttal State Machine**:
  1. When a landlord files a formal contest, the review transitions to `under_investigation`.
  2. Public commentary text is masked by a statutory Cap 36 warning banner.
  3. The tenant receives a 168-hour countdown to present proof of tenancy.
  4. If substantiated via verified M-Pesa transaction reference, the review is restored with a permanent **Gold Verification Badge**.
  5. If unsubstantiated after 168 hours, the review transitions to `archived_defamatory` and is purged from public indices by `landlord-rating-worker.py`.
- **Section 14 Justification Defence**: Truth and honest opinion backed by financial transaction timestamps constitute an absolute defense against civil libel.

### 3. Distress for Rent Act (Cap 293) & Rent Restriction Act (Cap 296)
- Measures landlord compliance with lawful distress procedures.
- Tracks and flags illegal self-help remedies (e.g., removal of doors, padlocking gates, or disconnection of pre-paid power meters).

### 4. Computer Misuse and Cybercrimes Act (CMCA 2018/2024)
- Prevents weaponized smear campaigns and extortion.
- Dispute tickets are strictly gated behind mandatory statutory credentials:
  - Valid **Kenya Police Occurrence Book (OB) Number** (format: `OB {num}/{DD}/{MM}/{YYYY}`), or
  - Verified **Estate Agents Registration Board (EARB)** license (format: `EARB/{category}/{code}`).

---

## 3. Architectural & Module Breakdown

### Full-Stack Architecture Diagram

```
                       +-----------------------------+
                       |    React 18 + Vite (SPA)    |
                       |  Tailwind CSS v4 + Motion   |
                       +--------------+--------------+
                                      |
                     RESTful Ingress  | (HTTP / JSON)
                                      v
                       +-----------------------------+
                       |   FastAPI Async Application  |
                       |       (Python 3.11+)        |
                       +--------------+--------------+
                                      |
         +----------------------------+----------------------------+
         |                                                         |
         v                                                         v
+-------------------------+                               +-------------------------+
|  Security Vault & PII   |                               |  Safaricom Daraja C2B   |
| HMAC-SHA-256 + AES-256  |                               | Webhook Anti-Replay     |
+-------------------------+                               +-------------------------+
         |                                                         |
         +----------------------------+----------------------------+
                                      |
                                      v
                       +-----------------------------+
                       |     SQLAlchemy 2.0 Async    |
                       |    PostgreSQL + pgcrypto    |
                       +--------------+--------------+
                                      ^
                                      | Periodic Sweep
                       +--------------+--------------+
                       |  landlord-rating-worker.py  |
                       |  Cap 36 Rebuttal Expiration |
                       +-----------------------------+
```

### Module Specifications

#### 1. Backend Engine (`src/`)
- **FastAPI Core (`src/main.py`)**: Asynchronous ASGI routing, CORS middleware, startup database seeding for 47 counties, and automated logging with ODPC PII regex redactors (`LoggerSanitizationFilter`).
- **Database Layer (`src/db/models.py`, `src/db/session.py`)**: SQLAlchemy 2.0 declarative models featuring composite unique constraints, foreign keys, and encrypted `BYTEA` storage.
- **Cryptographic Perimeter (`src/security/crypto_vault.py`)**: Zero-leakage cryptographic hashing, Fernet/AES-GCM encryption, and PII log filtering.
- **Safaricom Daraja C2B Verification (`src/services/mobile_service.py`)**: Webhook validation enforcing E.164 Kenyan MSISDN regex (`^254[17]\d{8}$`), transaction ID syntax (`^[A-Z0-9]{10}$`), minimum amount thresholds (KES 2,500), and anti-replay cache protection.
- **Background Worker (`landlord-rating-worker.py`)**: Standalone async daemon running statutory Cap 36 dispute sweeps and ODPC Section 40 record shredding.

#### 2. Physical Schema & Geographic Hierarchy
- **Counties**: 47 ISO-coded Kenyan counties (Nairobi [47], Mombasa [01], Kiambu [22], Nakuru [32], etc.).
- **Estates**: Urban estates and neighborhoods (Kilimani, Kileleshwa, Roysambu, Westlands, South B, Kasarani, etc.).
- **Properties**: Unique composite indexing (`estate_id`, `building_name`, `street_address`) preventing duplicate landlord registrations.
- **Reviews**: Multi-vector ratings, tenancy date intervals, verified lease hashes, and lifecycle states (`active`, `under_investigation`, `archived_defamatory`).
- **Dispute Tickets**: Contested claims linked to Kenyan Police OB records or EARB licenses with exact 168-hour rebuttal deadlines.

#### 3. Frontend Architecture (`src/App.tsx`, `src/components/`)
- **Client-Side SPA**: React 18 with Vite, styled with Tailwind CSS v4 using custom dark mode variant compilation.
- **Natural Product Flow**: Welcome & Splash presentation -> Authentication Gate with cryptographic identity feedback -> Interactive Multi-Vector Dashboard -> Comprehensive ODPC Privacy Controls.
- **Performance & Bandwidth Optimization**: Low-bandwidth cellular data saver mode for mobile Kenyan networks, reducing heavy media consumption while preserving real-time statutory metrics.

---

## 4. 5-Vector Rental Friction Indicators

Generic 5-star rating systems fail to capture the realities of Kenyan tenancy. KeJaTrust measures 5 specialized friction vectors on a 1.0 to 5.0 scale:

| Vector | Name | What It Measures | Kenyan Context & Statutory Grounding |
|:---:|:---|:---|:---|
| **V1** | **Deposit Refund Reliability** | Timeliness and percentage of security deposit returned upon vacating. | Discourages rogue landlords from treating tenant deposits as arbitrary renovation windfalls. |
| **V2** | **Water & Utility Consistency** | Weekly frequency of water rationing, token meter independence, and bowser charges. | Exposes synthetic water shortages and unregulated water cartels in estates like Roysambu and Kasarani. |
| **V3** | **Security & Quiet Enjoyment** | Gate security protocol, compound lighting, noise levels, and caretaker intrusion. | Enforces Section 61 of the Land Act regarding tenant rights to quiet and peaceful possession. |
| **V4** | **Eviction Fairness & Notice** | Compliance with statutory notice periods and rent increment protocols. | Measures adherence to Distress for Rent Act (Cap 293) and prevents unlawful gate padlocking. |
| **V5** | **Caretaker Responsiveness** | Speed of plumbing, electrical, and structural repairs after formal maintenance requests. | Tracks management accountability and living condition preservation. |

---

## 5. Repository Directory Structure & Running Instructions

### Directory Structure

```
kejatrust-nyumbayangu/
├── .gitignore                      # Git ignore rules (node_modules, pycache, secrets)
├── README.md                       # Primary technical manual (this document)
├── index.html                      # Single-page application entry point
├── metadata.json                   # Applet configuration & major capabilities
├── package.json                    # Node dependencies & Vite build scripts
├── tsconfig.json                   # TypeScript compiler configuration
├── vite.config.ts                  # Vite build engine with Tailwind CSS v4 plugin
├── landlord-rating-worker.py       # Cap 36 168h background maintenance daemon
│
├── src/                            # Full-Stack Application Source
│   ├── main.py                     # FastAPI asynchronous backend application
│   ├── main.tsx                    # React client entry point
│   ├── App.tsx                     # Top-level application layout & state machine
│   ├── index.css                   # Tailwind CSS global styles & dark mode variants
│   │
│   ├── api/                        # FastAPI REST Route Handlers
│   │   └── v1/
│   │       ├── geo_property.py     # County, estate, and property endpoints
│   │       ├── mpesa_review.py     # Tenant reviews & Daraja verification
│   │       └── dispute_mobile.py   # Cap 36 dispute filing & resolution
│   │
│   ├── components/                 # Reusable Modular React Components
│   │   ├── SplashScreen.tsx        # Welcome & statutory introduction screen
│   │   ├── MockAuthGatePanel.tsx   # Cryptographic login / registration enclave
│   │   ├── ShowcasePanel.tsx       # Search, filter, and property directory
│   │   ├── PropertyCard.tsx        # Building card with 5-vector sub-scores
│   │   ├── PropertyDetailView.tsx  # Deep-dive property analytics & reviews
│   │   ├── TenantDashboardPanel.tsx# Rate-a-flat submission & authored reviews
│   │   ├── DisputeCenterPanel.tsx  # Cap 36 legal sandboxes & 168h timers
│   │   ├── SettingsPrivacyPanel.tsx# ODPC Section 40 shredder & theme controls
│   │   ├── CompliantTermsPanel.tsx # Legal statutory terms & Cap 36 guidelines
│   │   ├── Navbar.tsx              # Top navigation bar with active session state
│   │   └── modals/                 # Review submission, dispute, & audit modals
│   │
│   ├── context/                    # React Context & State Storage
│   │   └── AppStateContext.tsx     # Global application state, crypto logs & store
│   │
│   ├── data/                       # Seed Data & Representative Estates
│   │   └── mockData.ts             # High-fidelity Kenyan seed records
│   │
│   ├── db/                         # Database Engine & Schema
│   │   ├── models.py               # SQLAlchemy 2.0 declarative tables
│   │   ├── session.py              # Async engine & sessionmaker
│   │   └── pure_engine.py          # Standalone pure-Python storage emulator
│   │
│   ├── schemas/                    # Pydantic Ingress / Egress Schemas
│   │   ├── geo_property.py         # Property validation rules
│   │   ├── mpesa_review.py         # Review submission schemas
│   │   └── dispute_mobile.py       # Dispute ticket validation schemas
│   │
│   ├── security/                   # Cryptographic Boundary
│   │   └── crypto_vault.py         # HMAC-SHA-256, Fernet ciphers, log filters
│   │
│   ├── services/                   # Business Logic & Integrations
│   │   ├── geo_property_service.py # Spatial query algorithms
│   │   ├── mpesa_review_service.py # Review calculation & caching
│   │   ├── dispute_service.py      # Cap 36 notice-and-takedown pipeline
│   │   └── mobile_service.py       # Safaricom Daraja C2B anti-replay logic
│   │
│   └── types/                      # TypeScript Interface Declarations
│       └── index.ts                # Property, review, dispute & user types
│
└── tests/                          # 37-Test Comprehensive Verification Suite
    ├── test_kejatrust_verification.py # Red team leak, Daraja & Cap 36 tests
    ├── test_phase4_slices.py       # Ingress contract & HMAC schema tests
    ├── test_phase4_slices_3_4.py   # Property rating & aggregation tests
    └── test_phase4_slices_5_6.py   # End-to-end statutory integration tests
```

---

## 6. Running the Verification Suite & Development Environment

### 1. Running the Automated Test Suite (37 Tests)

The 37 tests can be executed either via Python's standard library `unittest` runner or `pytest`:

```bash
# Option A: Standard Library (Zero external dependencies)
python3 -m unittest discover tests

# Option B: Run specific test modules
python3 tests/test_kejatrust_verification.py
python3 tests/test_phase4_slices.py
python3 tests/test_phase4_slices_3_4.py
python3 tests/test_phase4_slices_5_6.py

# Option C: If pytest is installed
pytest tests/ -v
```

### 2. Running the Background Cleanup Daemon

```bash
# Execute a single audit pass:
python3 landlord-rating-worker.py --once

# Run continuously as an hourly background daemon:
WORKER_INTERVAL_SECONDS=3600 python3 landlord-rating-worker.py
```

### 3. Launching the Interactive Frontend

```bash
# Install node dependencies
npm install

# Start Vite development server
npm run dev

# Build for production
npm run build
```

The interactive application will run on port `3000` (or `http://localhost:3000`).

---

## 7. License & Jurisdiction

- **Jurisdiction**: Built strictly for the constitutional and statutory framework of the **Republic of Kenya**.
- **Data Protection**: Regulated by the Office of the Data Protection Commissioner (ODPC) under the Kenya Data Protection Act 2019.
- **License**: MIT License. See [LICENSE](LICENSE) for details.
