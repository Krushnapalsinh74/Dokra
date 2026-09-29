# Dokra Health — Home Card Service MVP
**Task ID:** `DOKRA-HCS-MVP-001`  
**Service:** `@dokra/card-service`  

---

## Overview
The **Dokra Card Service** is the backend MVP proving the first vertical slice of the Dokra platform:
```
Master Admin / Card Studio
      │ (Canonical Card JSON)
      ▼
Dokra Card Persistence (SQLite + Immutable Revisions)
      │
      ▼
Compatibility Adapter (canonical-card-adapter)
      │ (WebServiceData Legacy JSON + SHA-256 ETag)
      ▼
Mobile Endpoint (GET /v2/servicecard/list & GET /v1/cards/feed)
      │
      ▼
Preserved Mobile Engine (WebServiceDataManager + ServiceViewFactory)
```

---

## Features
1. **Canonical Card Model:** Vendor-agnostic, extensible data model supporting title, description, icons, CTAs, scheduling, targeting, and priority.
2. **Compatibility Adapter:** Deterministically transforms canonical cards into legacy `WebServiceData` JSON objects matching the mobile client's Kotlin parcelable models.
3. **Immutable Revision History & Rollback:** Every publish creates an immutable snapshot (`card_revisions`); 1-click rollback re-activates a prior revision and records an audit log.
4. **Deterministic SHA-256 ETag Caching:** Evaluates `If-None-Match` header to return `304 Not Modified` with 0-byte body when feed content has not changed.
5. **Backend Targeting & Scheduling:** Filter cards based on start/end timestamps, country ISO codes, and app versions.
6. **Zero External Dependencies:** Built with native Node.js (Node v22.5+) using built-in `node:sqlite`, `node:crypto`, `node:http`, and `node:test`.

---

## Getting Started

### Prerequisites
* Node.js v22.5.0 or higher (v24.18.0 tested)

### Running Automated Tests
```bash
npm test
```

### Running the Local Service
```bash
npm start
```
By default, the server starts on `http://127.0.0.1:8080` with local development SQLite storage at `./data/card-service.db`.

---

### 1. Staging Authentication Endpoint (DOKRA-AUTH-SRV-001)
* `POST /v1/auth/staging-token` — Request a legitimate short-lived Dokra Staging Bearer JWT

### 2. Mobile Feed Endpoints (Authenticated)
* `GET /v2/servicecard/list?country=US&lang=en&app_ver=7.00.6.011` (Legacy Compatibility Route)
* `GET /v1/cards/feed?country=US` (Dokra Alias Route)
* Headers: `Authorization: Bearer <Dokra staging access token>`, `If-None-Match: W/"<sha256>"`

### 3. Master Admin Card Studio Endpoints
* `GET /admin/v1/cards` — List all canonical cards
* `POST /admin/v1/cards` — Create a new canonical card draft
* `GET /admin/v1/cards/:id` — Retrieve a single card by ID
* `PUT /admin/v1/cards/:id` — Update draft content
* `POST /admin/v1/cards/:id/publish` — Publish card and increment immutable revision
* `POST /admin/v1/cards/:id/rollback` — Revert card to target revision ID
* `GET /admin/v1/cards/:id/revisions` — List revision history
* `GET /admin/v1/cards/:id/audit` — List audit events
* `GET /health` — Service health check

---

## Environment Configuration

| Variable | Default | Description |
| :--- | :--- | :--- |
| `DOKRA_ENV` | `staging` | Runtime environment identifier |
| `DOKRA_AUTH_ISSUER` | `dokra-staging-auth` | JWT Issuer claim (`iss`) |
| `DOKRA_AUTH_AUDIENCE` | `dokra-api-staging` | JWT Audience claim (`aud`) |
| `DOKRA_TOKEN_TTL_SECONDS` | `3600` | Staging token lifetime in seconds (15–60 min) |
| `DOKRA_SIGNING_KEY` | *(dev default)* | HMAC-SHA256 signing secret key (kept outside source in production) |
