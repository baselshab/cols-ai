# COLS – Project Architecture
### architecture.md | Version 2.0

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
│  │  + pgvector│     │  + BullMQ  │     │  (MinIO)   │        │
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
│   ├── AGENTS.md             # AI agent coding guidelines
│   └── claude.md              # AI execution guide
│
├── backend/                   # NestJS API (TypeScript)
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── config/
│   │   ├── prisma/
│   │   ├── common/
│   │   └── modules/
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/                  # Next.js App (TypeScript)
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── stores/
│   │   └── types/
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── next.config.js
│   └── Dockerfile
│
├── ai-service/               # Python FastAPI
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   ├── agents/
│   │   ├── core/
│   │   ├── services/
│   │   └── models/
│   ├── tests/
│   ├── requirements.txt
│   ├── pyproject.toml
│   └── Dockerfile
│
├── docker-compose.dev.yml     # Development environment
├── docker-compose.prod.yml    # Production environment
├── docker-compose.test.yml    # Testing environment
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
│   ├── config/                       # Configuration
│   │   ├── config.module.ts
│   │   ├── config.service.ts
│   │   └── configuration.ts
│   │
│   ├── prisma/                       # Database
│   │   ├── schema.prisma            # Full schema with pgvector
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   │
│   ├── common/                       # Shared utilities
│   │   ├── decorators/
│   │   │   ├── request.decorator.ts  # @TenantId, @CurrentUser
│   │   │   ├── roles.decorator.ts    # @Roles
│   │   │   ├── public.decorator.ts   # @Public
│   │   │   └── throttle.decorator.ts # @Throttle
│   │   │
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts    # JWT authentication
│   │   │   ├── tenant.guard.ts      # Tenant validation
│   │   │   ├── roles.guard.ts       # Role-based access
│   │   │   └── throttle.guard.ts    # Rate limiting
│   │   │
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   │
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   │   └── transform.interceptor.ts
│   │   │
│   │   └── utils/
│   │       ├── sanitize.ts
│   │       └── hash.ts
│   │
│   └── modules/
│       ├── auth/                     # Authentication
│       │   ├── auth.module.ts
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   ├── strategies/jwt.strategy.ts
│       │   └── dto/
│       │
│       ├── users/                    # User management
│       │   ├── users.module.ts
│       │   ├── users.controller.ts
│       │   ├── users.service.ts
│       │   └── dto/
│       │
│       ├── tenants/                  # Multi-tenancy
│       │   ├── tenants.module.ts
│       │   ├── tenants.controller.ts
│       │   ├── tenants.service.ts
│       │   └── middleware/tenant.middleware.ts
│       │
│       ├── cases/                    # Case management
│       │   ├── cases.module.ts
│       │   ├── cases.controller.ts
│       │   ├── cases.service.ts
│       │   ├── cases.repository.ts
│       │   └── dto/
│       │
│       ├── clients/                  # Client management
│       │   ├── clients.module.ts
│       │   ├── clients.controller.ts
│       │   └── clients.service.ts
│       │
│       ├── documents/                # Document handling
│       │   ├── documents.module.ts
│       │   ├── documents.controller.ts
│       │   ├── documents.service.ts
│       │   └── s3.service.ts
│       │
│       ├── ai/                       # AI integration
│       │   ├── ai.module.ts
│       │   ├── ai.controller.ts
│       │   ├── ai.service.ts
│       │   └── orchestrator.service.ts
│       │
│       ├── billing/                  # Billing
│       │   ├── billing.module.ts
│       │   ├── invoices/
│       │   └── time-entries/
│       │
│       ├── notifications/            # Notifications
│       │   ├── notifications.module.ts
│       │   ├── notifications.controller.ts
│       │   ├── notifications.service.ts
│       │   └── notifications.gateway.ts # WebSocket
│       │
│       └── queue/                   # BullMQ
│           ├── queue.module.ts
│           └── processors/
│               ├── document.processor.ts
│               └── notification.processor.ts
│
├── test/
│   └── jest-e2e.json
│
├── Dockerfile
├── Dockerfile.dev
├── tsconfig.json
├── tsconfig.build.json
├── nest-cli.json
├── package.json
├── .eslintrc.js
├── .prettierrc
└── .env.example
```

---

## 4. Frontend Structure (Next.js 14)

```
frontend/
├── src/
│   ├── app/                          # App Router
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Home (redirects)
│   │   ├── globals.css
│   │   │
│   │   ├── (auth)/                  # Auth route group
│   │   │   ├── layout.tsx
│   │   │   ├── login/
│   │   │   │   ├── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   └── register/
│   │   │       ├── page.tsx
│   │   │       └── layout.tsx
│   │   │
│   │   └── (dashboard)/             # Protected dashboard
│   │       ├── layout.tsx           # Dashboard layout
│   │       ├── page.tsx             # Dashboard home
│   │       │
│   │       ├── cases/
│   │       │   ├── page.tsx
│   │       │   ├── new/page.tsx
│   │       │   └── [id]/
│   │       │       ├── page.tsx
│   │       │       └── layout.tsx
│   │       │
│   │       ├── clients/
│   │       │   ├── page.tsx
│   │       │   └── [id]/
│   │       │
│   │       ├── documents/
│   │       │   ├── page.tsx
│   │       │   └── [id]/
│   │       │
│   │       ├── ai/
│   │       │   └── page.tsx         # Chat interface
│   │       │
│   │       ├── billing/
│   │       │   └── page.tsx
│   │       │
│   │       ├── calendar/
│   │       │   └── page.tsx
│   │       │
│   │       └── settings/
│   │           └── page.tsx
│   │
│   ├── components/
│   │   ├── ui/                      # ShadCN/Radix components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── label.tsx
│   │   │   ├── table.tsx
│   │   │   ├── toast.tsx
│   │   │   └── toaster.tsx
│   │   │
│   │   ├── layout/                 # Layout components
│   │   │   ├── sidebar.tsx
│   │   │   └── header.tsx
│   │   │
│   │   └── providers.tsx            # React Query + Theme
│   │
│   ├── hooks/                       # Custom React hooks
│   │
│   ├── lib/                        # Utilities
│   │   ├── api.ts                  # Axios client with interceptors
│   │   ├── utils.ts                # Helper functions
│   │   └── validators/             # Zod schemas
│   │       ├── auth.schema.ts
│   │       └── case.schema.ts
│   │
│   ├── stores/                     # Zustand stores
│   │   ├── auth-store.ts
│   │   ├── tenant-store.ts
│   │   ├── ui-store.ts
│   │   └── index.ts
│   │
│   └── types/                      # TypeScript types
│
├── public/
├── package.json
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── .eslintrc.json
├── .prettierrc
└── Dockerfile
```

---

## 5. AI Service Structure (Python)

```
ai-service/
├── app/
│   ├── main.py                     # FastAPI entry point
│   │
│   ├── api/
│   │   └── routes/
│   │       ├── chat.py            # Chat endpoint
│   │       ├── documents.py       # Document analysis
│   │       ├── embeddings.py     # Embedding generation
│   │       └── search.py         # Vector search
│   │
│   ├── agents/                    # AI Agents
│   │   ├── orchestrator.py       # Main orchestrator
│   │   ├── legal_assistant.py     # Legal Q&A
│   │   └── document_analyzer.py  # Document analysis
│   │
│   ├── core/                      # Core services
│   │   ├── config.py             # Settings
│   │   ├── llm.py                # LLM client (Anthropic)
│   │   └── prompts.py            # Prompt templates
│   │
│   ├── services/                  # Business logic
│   │   ├── embedding.py          # Embedding generation
│   │   ├── vector_store.py       # pgvector operations
│   │   └── document_processor.py  # PDF/DOCX extraction
│   │
│   └── models/                   # Pydantic models
│       ├── chat.py
│       ├── document.py
│       └── search.py
│
├── tests/
│   ├── test_agents.py
│   ├── test_embeddings.py
│   └── test_chunker.py
│
├── Dockerfile
├── requirements.txt
├── pyproject.toml
└── .env.example
```

---

## 6. Database Schema (Prisma)

**Core Models:**
- `Tenant` - Multi-tenant organization
- `User` - Users with roles (ADMIN, LAWYER, PARALEGAL, SECRETARY, CLIENT)
- `Client` - Law firm clients
- `Case` - Legal cases with status tracking
- `CaseEvent` - Case timeline events
- `Document` - Uploaded documents with S3 storage
- `DocumentEmbedding` - pgvector embeddings for RAG
- `TimeEntry` - Billing time tracking
- `Invoice` - Client invoicing
- `AiSession` - Chat history
- `RefreshToken` - JWT refresh tokens
- `Notification` - User notifications

---

## 7. API Routes

```
Backend API (NestJS) - Port 3000
│
├── POST /api/auth/login
├── POST /api/auth/register
├── POST /api/auth/refresh
├── POST /api/auth/logout
│
├── GET  /api/users
├── GET  /api/users/:id
├── POST /api/users
├── PATCH /api/users/:id
│
├── GET  /api/tenants/:id
├── POST /api/tenants
│
├── GET  /api/cases
├── POST /api/cases
├── GET  /api/cases/:id
├── PATCH /api/cases/:id
├── DELETE /api/cases/:id
├── POST /api/cases/:id/events
│
├── GET  /api/clients
├── POST /api/clients
├── GET  /api/clients/:id
├── PATCH /api/clients/:id
│
├── GET  /api/documents
├── POST /api/documents/upload
├── GET  /api/documents/:id
├── GET  /api/documents/:id/download
├── DELETE /api/documents/:id
│
├── POST /api/ai/chat
├── POST /api/ai/summarize/case/:caseId
├── POST /api/ai/analyze/document/:documentId
├── GET  /api/ai/sessions
│
├── GET  /api/billing/invoices
├── POST /api/billing/invoices
├── GET  /api/billing/time-entries
├── POST /api/billing/time-entries
│
└── GET  /api/notifications
    ├── GET  /api/notifications/unread-count
    └── PATCH /api/notifications/:id/read
```

---

## 8. Running the Application

### Development
```bash
# All services
docker-compose -f docker-compose.dev.yml up -d

# Individual services
cd backend && npm install && npm run start:dev
cd frontend && npm install && npm run dev
cd ai-service && pip install -r requirements.txt && uvicorn app.main:app --reload
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## 9. Key Files Reference

| Service | Key Files |
|---------|-----------|
| Backend | `src/main.ts`, `src/app.module.ts`, `src/prisma/schema.prisma` |
| Frontend | `src/app/(dashboard)/page.tsx`, `src/lib/api.ts`, `src/stores/auth-store.ts` |
| AI | `app/main.py`, `app/core/llm.py`, `app/agents/orchestrator.py` |

See `docs/AGENTS.md` for coding guidelines.
