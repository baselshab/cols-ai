# COLS – Project Architecture
### architecture.md | Version 1.0

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         COLS System                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    │
│  │   Frontend   │     │   Backend    │     │  AI Service  │    │
│  │   (Next.js)  │────▶│   (NestJS)   │────▶│   (Python)  │    │
│  └──────────────┘     └──────┬───────┘     └──────────────┘    │
│                              │                                    │
│         ┌────────────────────┼────────────────────┐             │
│         │                    │                    │             │
│         ▼                    ▼                    ▼             │
│  ┌────────────┐     ┌────────────┐     ┌────────────┐        │
│  │ PostgreSQL  │     │   Redis    │     │    S3      │        │
│  │  + pgvector│     │  + BullMQ  │     │  (Files)   │        │
│  └────────────┘     └────────────┘     └────────────┘        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Monorepo Structure

```
cols-ai/
├── docs/                      # Documentation
│   ├── prd.md                 # Product Requirements
│   ├── architecture.md        # This file
│   ├── dev-workflow.md        # Git workflow & CI/CD
│   ├── features-impl.md       # Feature specs
│   └── claude.md              # AI execution guide
│
├── backend/                   # NestJS API
├── frontend/                  # Next.js App
├── ai-service/               # Python FastAPI
│
├── docker-compose.dev.yml     # Development environment
├── docker-compose.prod.yml     # Production environment
└── README.md
```

---

## 3. Backend Structure (NestJS)

```
backend/
├── src/
│   ├── main.ts                       # Application entry point
│   ├── app.module.ts                 # Root module
│   │
│   ├── common/                       # Shared utilities
│   │   ├── decorators/               # Custom decorators
│   │   │   ├── tenant-id.decorator.ts
│   │   │   ├── current-user.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   │
│   │   ├── guards/                   # Route guards
│   │   │   ├── auth.guard.ts
│   │   │   ├── tenant.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   └── throttle.guard.ts
│   │   │
│   │   ├── filters/                  # Exception filters
│   │   │   ├── http-exception.filter.ts
│   │   │   └── validation.filter.ts
│   │   │
│   │   ├── interceptors/             # Request/response interceptors
│   │   │   ├── logging.interceptor.ts
│   │   │   └── transform.interceptor.ts
│   │   │
│   │   ├── pipes/                    # Validation pipes
│   │   │   └── validation.pipe.ts
│   │   │
│   │   └── utils/                    # Helper functions
│   │       ├── sanitize.ts
│   │       └── hash.ts
│   │
│   ├── config/                       # Configuration
│   │   ├── config.module.ts
│   │   ├── config.service.ts
│   │   └── configuration.ts
│   │
│   ├── modules/                      # Feature modules
│   │   │
│   │   ├── auth/                     # Authentication
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   └── jwt.strategy.ts
│   │   │   ├── dto/
│   │   │   │   ├── login.dto.ts
│   │   │   │   ├── register.dto.ts
│   │   │   │   └── refresh-token.dto.ts
│   │   │   └── entities/
│   │   │       └── refresh-token.entity.ts
│   │   │
│   │   ├── users/                    # User management
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── dto/
│   │   │   └── entities/
│   │   │
│   │   ├── tenants/                  # Multi-tenancy
│   │   │   ├── tenants.module.ts
│   │   │   ├── tenants.controller.ts
│   │   │   ├── tenants.service.ts
│   │   │   ├── middleware/
│   │   │   │   └── tenant.middleware.ts
│   │   │   ├── dto/
│   │   │   └── entities/
│   │   │
│   │   ├── cases/                    # Case management
│   │   │   ├── cases.module.ts
│   │   │   ├── cases.controller.ts
│   │   │   ├── cases.service.ts
│   │   │   ├── cases.repository.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-case.dto.ts
│   │   │   │   ├── update-case.dto.ts
│   │   │   │   └── case-filter.dto.ts
│   │   │   └── entities/
│   │   │       ├── case.entity.ts
│   │   │       └── case-event.entity.ts
│   │   │
│   │   ├── clients/                   # Client management
│   │   │   ├── clients.module.ts
│   │   │   ├── clients.controller.ts
│   │   │   ├── clients.service.ts
│   │   │   ├── dto/
│   │   │   └── entities/
│   │   │
│   │   ├── documents/                 # Document handling
│   │   │   ├── documents.module.ts
│   │   │   ├── documents.controller.ts
│   │   │   ├── documents.service.ts
│   │   │   ├── s3.service.ts
│   │   │   ├── dto/
│   │   │   └── entities/
│   │   │
│   │   ├── ai/                       # AI integration
│   │   │   ├── ai.module.ts
│   │   │   ├── ai.controller.ts
│   │   │   ├── ai.service.ts
│   │   │   ├── orchestrator.service.ts
│   │   │   ├── dto/
│   │   │   └── gateways/
│   │   │       └── ai.gateway.ts     # WebSocket gateway
│   │   │
│   │   ├── billing/                   # Billing & invoicing
│   │   │   ├── billing.module.ts
│   │   │   ├── invoices/
│   │   │   ├── time-entries/
│   │   │   └── stripe/
│   │   │
│   │   ├── notifications/             # Notifications
│   │   │   ├── notifications.module.ts
│   │   │   ├── notifications.controller.ts
│   │   │   ├── notifications.service.ts
│   │   │   ├── notifications.gateway.ts  # WebSocket
│   │   │   ├── email.service.ts
│   │   │   └── dto/
│   │   │
│   │   └── queue/                     # BullMQ processing
│   │       ├── queue.module.ts
│   │       └── processors/
│   │           ├── document.processor.ts
│   │           └── notification.processor.ts
│   │
│   └── prisma/                        # Database
│       ├── schema.prisma
│       └── migrations/
│
├── test/                              # E2E tests
│   └── *.e2e-spec.ts
│
├── Dockerfile
├── tsconfig.json
├── nest-cli.json
└── package.json
```

---

## 4. Frontend Structure (Next.js)

```
frontend/
├── src/
│   ├── app/                           # App Router pages
│   │   ├── (auth)/                    # Auth route group
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   │
│   │   ├── (dashboard)/               # Protected dashboard
│   │   │   ├── layout.tsx             # Dashboard layout
│   │   │   ├── page.tsx               # Dashboard home
│   │   │   │
│   │   │   ├── cases/
│   │   │   │   ├── page.tsx           # Cases list
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx       # Case detail
│   │   │   │       ├── documents/
│   │   │   │       ├── timeline/
│   │   │   │       └── billing/
│   │   │   │
│   │   │   ├── clients/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │
│   │   │   ├── documents/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │
│   │   │   ├── ai/
│   │   │   │   ├── page.tsx           # Chat interface
│   │   │   │   └── sessions/
│   │   │   │
│   │   │   ├── billing/
│   │   │   │   ├── invoices/
│   │   │   │   └── time-entries/
│   │   │   │
│   │   │   ├── calendar/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   └── settings/
│   │   │       ├── page.tsx
│   │   │       ├── profile/
│   │   │       ├── team/
│   │   │       └── notifications/
│   │   │
│   │   ├── (client-portal)/          # Client-facing portal
│   │   │   ├── portal/
│   │   │   │   ├── cases/
│   │   │   │   ├── documents/
│   │   │   │   └── messages/
│   │   │   └── layout.tsx
│   │   │
│   │   ├── api/                      # API route handlers (if needed)
│   │   │
│   │   ├── layout.tsx                # Root layout
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                        # ShadCN components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/                   # Layout components
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   └── navbar.tsx
│   │   │
│   │   ├── cases/
│   │   │   ├── case-list.tsx
│   │   │   ├── case-card.tsx
│   │   │   ├── case-form.tsx
│   │   │   ├── case-status.tsx
│   │   │   └── case-timeline.tsx
│   │   │
│   │   ├── documents/
│   │   │   ├── document-uploader.tsx
│   │   │   ├── document-list.tsx
│   │   │   ├── document-viewer.tsx
│   │   │   └── document-search.tsx
│   │   │
│   │   ├── ai/
│   │   │   ├── chat-interface.tsx
│   │   │   ├── chat-message.tsx
│   │   │   ├── source-citation.tsx
│   │   │   └── thinking-indicator.tsx
│   │   │
│   │   ├── billing/
│   │   │   ├── invoice-form.tsx
│   │   │   ├── time-tracker.tsx
│   │   │   └── invoice-list.tsx
│   │   │
│   │   └── shared/                   # Reusable components
│   │       ├── data-table.tsx
│   │       ├── modal.tsx
│   │       ├── toast.tsx
│   │       └── loading-spinner.tsx
│   │
│   ├── hooks/                         # Custom React hooks
│   │   ├── use-cases.ts
│   │   ├── use-documents.ts
│   │   ├── use-auth.ts
│   │   ├── use-tenant.ts
│   │   └── use-toast.ts
│   │
│   ├── lib/                           # Utilities
│   │   ├── api.ts                     # API client
│   │   ├── auth.ts                    # Auth utilities
│   │   ├── utils.ts                   # Helper functions
│   │   └── validators/                # Zod schemas
│   │       ├── case.schema.ts
│   │       └── document.schema.ts
│   │
│   ├── stores/                        # Zustand stores
│   │   ├── auth-store.ts
│   │   ├── tenant-store.ts
│   │   └── ui-store.ts
│   │
│   └── types/                         # TypeScript types
│       ├── api.ts
│       ├── case.ts
│       └── document.ts
│
├── public/                            # Static assets
├── components.json                     # ShadCN config
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── Dockerfile
```

---

## 5. AI Service Structure (Python)

```
ai-service/
├── app/
│   ├── main.py                        # FastAPI entry point
│   │
│   ├── api/                           # API routes
│   │   ├── __init__.py
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── chat.py               # Chat endpoint
│   │   │   ├── documents.py          # Document processing
│   │   │   ├── embeddings.py         # Embedding generation
│   │   │   └── search.py             # Vector search
│   │   └── deps.py                    # Dependencies
│   │
│   ├── agents/                        # AI Agents
│   │   ├── __init__.py
│   │   ├── orchestrator.py           # Main orchestrator
│   │   ├── legal_assistant.py        # Legal Q&A
│   │   ├── document_analyzer.py      # Document analysis
│   │   ├── case_summary.py           # Case summarization
│   │   ├── contract_review.py        # Contract review
│   │   └── research.py               # Legal research
│   │
│   ├── core/                          # Core services
│   │   ├── __init__.py
│   │   ├── config.py                 # Settings
│   │   ├── llm.py                    # LLM client (Anthropic/OpenAI)
│   │   └── prompts.py                # Prompt templates
│   │
│   ├── services/                      # Business logic
│   │   ├── __init__.py
│   │   ├── embedding.py              # Embedding generation
│   │   ├── vector_store.py           # pgvector operations
│   │   ├── document_processor.py      # PDF/DOCX extraction
│   │   ├── ocr.py                    # Tesseract OCR
│   │   └── chunker.py               # Text chunking
│   │
│   └── models/                       # Pydantic models
│       ├── __init__.py
│       ├── chat.py
│       ├── document.py
│       └── search.py
│
├── tests/
│   ├── __init__.py
│   ├── test_agents.py
│   ├── test_embeddings.py
│   └── test_chunker.py
│
├── Dockerfile
├── requirements.txt
├── pyproject.toml
└── README.md
```

---

## 6. Database Schema Overview (Prisma)

```
┌─────────────────┐     ┌─────────────────┐
│     Tenant      │     │      User       │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │◀───││ tenantId (FK)  │
│ name            │     │ id (PK)         │
│ slug            │     │ email           │
│ plan            │     │ password        │
│ settings        │     │ role            │
│ createdAt       │     │ name            │
└─────────────────┘     │ isActive        │
        │              └─────────────────┘
        │                      │
        │              ┌───────┴───────┐
        ▼              ▼               ▼
┌─────────────────┐ ┌──────────┐ ┌──────────┐
│      Case       │ │  Client  │ │ Document │
├─────────────────┤ ├──────────┤ ├──────────┤
│ id (PK)         │ │ id (PK)  │ │ id (PK)  │
│ tenantId (FK)   │ │ tenantId │ │ tenantId │
│ caseNumber      │ │ name     │ │ caseId   │
│ title           │ │ email    │ │ name     │
│ status          │ │ phone    │ │ s3Key    │
│ type            │ │ company  │ │ status   │
│ clientId (FK)───┼─┘          │ │ extracted│
│ courtDate       │            │ │ summary  │
│ aiSummary       │            └──────────┘
└─────────────────┘
        │
        ├──┬──────────┬──────────┐
        ▼  ▼          ▼          ▼
   ┌──────────┐ ┌──────────┐ ┌──────────┐
   │CaseEvent │ │TimeEntry │ │ Invoice  │
   ├──────────┤ ├──────────┤ ├──────────┤
   │ id       │ │ id       │ │ id       │
   │ caseId   │ │ caseId   │ │ clientId │
   │ type     │ │ lawyerId │ │ status   │
   │ title    │ │ hours    │ │ total    │
   │ date     │ │ amount   │ │ dueDate  │
   └──────────┘ └──────────┘ └──────────┘

┌──────────────────────────────┐
│   DocumentEmbedding (pgvector)│
├──────────────────────────────┤
│ id (PK)                       │
│ tenantId                      │
│ documentId                    │
│ caseId                        │
│ chunkIndex                    │
│ content                       │
│ embedding (vector)            │
│ metadata (JSON)               │
└──────────────────────────────┘
```

---

## 7. API Routes Overview

```
Backend API (NestJS)
│
├── /api/auth
│   ├── POST   /auth/login
│   ├── POST   /auth/register
│   ├── POST   /auth/refresh
│   └── POST   /auth/logout
│
├── /api/users
│   ├── GET    /users
│   ├── GET    /users/:id
│   ├── PATCH  /users/:id
│   └── POST   /users/invite
│
├── /api/tenants
│   ├── POST   /tenants
│   ├── GET    /tenants/:id
│   └── PATCH  /tenants/:id
│
├── /api/cases
│   ├── GET    /cases
│   ├── POST   /cases
│   ├── GET    /cases/:id
│   ├── PATCH  /cases/:id
│   ├── DELETE /cases/:id
│   ├── GET    /cases/:id/timeline
│   ├── POST   /cases/:id/events
│   └── GET    /cases/:id/summary
│
├── /api/clients
│   ├── GET    /clients
│   ├── POST   /clients
│   ├── GET    /clients/:id
│   └── PATCH  /clients/:id
│
├── /api/documents
│   ├── POST   /documents/upload
│   ├── GET    /documents/:id
│   ├── DELETE /documents/:id
│   ├── GET    /documents/:id/download
│   └── POST   /documents/search
│
├── /api/ai
│   ├── POST   /ai/chat
│   ├── POST   /ai/summarize/:caseId
│   ├── POST   /ai/analyze/:docId
│   └── GET    /ai/sessions
│
├── /api/billing
│   ├── GET    /billing/invoices
│   ├── POST   /billing/invoices
│   ├── GET    /billing/time-entries
│   └── POST   /billing/time-entries
│
└── /api/notifications
    ├── GET    /notifications
    └── PATCH  /notifications/:id/read
```

---

## 8. Request/Response Patterns

### Standard API Response
```typescript
// Success
{
  "data": Case | Case[],
  "meta": { "total": 100, "page": 1, "limit": 20 },
  "success": true
}

// Error
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [...]
}
```

### Authentication Flow
```
1. User → POST /api/auth/login { email, password }
   ← { accessToken, refreshToken }

2. All subsequent requests → Header: Authorization: Bearer <token>

3. Token expires (15min) → POST /api/auth/refresh { refreshToken }
   ← { accessToken, refreshToken } (rotation)
```

---

## 9. Environment Configuration

```
# Development
.env.local (per developer, gitignored)

# Staging/Production
GitHub Secrets → Kubernetes Secrets

# Required Variables:
DATABASE_URL=postgresql://...
MONGODB_URI=mongodb://...
REDIS_URL=redis://...
JWT_SECRET=<64-char-random>
JWT_REFRESH_SECRET=<64-char-random>
S3_BUCKET=...
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
AI_SERVICE_URL=http://ai-service:8000
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
SMTP_HOST=smtp.example.com
STRIPE_SECRET_KEY=sk_live_...
```
