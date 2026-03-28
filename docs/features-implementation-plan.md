# COLS – Features Implementation Plan
### features-implementation-plan.md | Version 1.0

---

## Architecture Decision: Modular Monolith

### لماذا Modular Monolith وليس Microservices؟

```
✅ اخترنا: Modular Monolith
❌ تجنبنا: Microservices (في المرحلة الأولى)

الأسباب:
1. الفريق صغير (5-8 مطورين) — Microservices تحتاج DevOps متمرس
2. الـ startup stage تحتاج iteration سريع وليس distributed complexity
3. أسهل debugging وتتبع الأخطاء
4. تكلفة infrastructure أقل بكثير
5. يمكن Extract to Microservices لاحقاً بسهولة إذا كانت modules معزولة

Architecture:
NestJS Monolith (Modules)
├── AuthModule
├── CaseModule
├── DocumentModule
├── AIModule (calls Python AI service)
├── BillingModule
├── NotificationModule
└── TenantModule

Python AI Service (منفصل — لأن AI/ML يحتاج Python ecosystem)
├── RAG Pipeline
├── Document Processing
├── Embedding Service
└── Agent Orchestration
```

---

## Tech Stack الكامل

```
FRONTEND:
├── Next.js 14 (App Router)
├── TypeScript
├── TailwindCSS
├── ShadCN UI (component library)
├── TanStack Query (server state)
├── Zustand (client state)
├── React Hook Form + Zod (forms + validation)
└── i18n (Arabic/English RTL support)

BACKEND:
├── NestJS (TypeScript)
├── PostgreSQL (primary DB)
├── MongoDB (document metadata + flexible schemas)
├── Prisma (ORM for PostgreSQL)
├── Redis (caching + sessions + BullMQ queues)
├── BullMQ (job queues for AI processing)
└── S3-compatible (Cloudflare R2 / AWS S3) for file storage

AI SERVICE (Python):
├── FastAPI
├── LangChain
├── pgvector (vector search in PostgreSQL)
├── PyMuPDF (PDF processing)
├── Tesseract OCR (Arabic support)
├── Sentence Transformers (embeddings)
└── Anthropic SDK + OpenAI SDK

INFRASTRUCTURE:
├── Docker + Docker Compose
├── Kubernetes (production)
├── Nginx (reverse proxy)
├── GitHub Actions (CI/CD)
└── Cloudflare (CDN + DDoS protection)
```

---

## Feature 1: Case Management

### Backend Logic

```typescript
// NestJS Module Structure
// src/modules/case/

case.module.ts
case.controller.ts
case.service.ts
case.repository.ts
dto/
  create-case.dto.ts
  update-case.dto.ts
  case-filter.dto.ts
entities/
  case.entity.ts
  case-event.entity.ts
```

### Database Schema (Prisma)

```prisma
model Case {
  id          String   @id @default(cuid())
  caseNumber  String   @unique
  title       String
  description String?
  status      CaseStatus @default(OPEN)
  type        CaseType
  priority    Priority @default(MEDIUM)
  
  // Multi-tenancy
  tenantId    String
  tenant      Tenant @relation(fields: [tenantId], references: [id])
  
  // Relations
  clientId    String
  client      Client @relation(fields: [clientId], references: [id])
  assignedTo  CaseLawyer[]
  documents   Document[]
  events      CaseEvent[]
  invoices    Invoice[]
  timeEntries TimeEntry[]
  
  // Metadata
  courtDate   DateTime?
  filingDate  DateTime?
  closedAt    DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // AI-generated
  aiSummary   String?
  aiLastUpdated DateTime?
  
  @@index([tenantId, status])
  @@index([tenantId, clientId])
  @@map("cases")
}

enum CaseStatus {
  OPEN
  IN_PROGRESS
  ON_HOLD
  CLOSED
  ARCHIVED
}

enum CaseType {
  CIVIL
  COMMERCIAL
  CRIMINAL
  LABOR
  REAL_ESTATE
  FAMILY
  ADMINISTRATIVE
}

model CaseEvent {
  id          String   @id @default(cuid())
  caseId      String
  case        Case @relation(fields: [caseId], references: [id])
  type        EventType
  title       String
  description String?
  date        DateTime
  createdBy   String
  metadata    Json?
  createdAt   DateTime @default(now())
  
  @@index([caseId])
}
```

### API Design

```typescript
// Case endpoints
GET    /api/cases                    // List with filters + pagination
POST   /api/cases                    // Create case
GET    /api/cases/:id                // Get case details
PATCH  /api/cases/:id                // Update case
DELETE /api/cases/:id                // Soft delete

GET    /api/cases/:id/timeline       // Case events timeline
POST   /api/cases/:id/events         // Add event
GET    /api/cases/:id/documents      // Case documents
POST   /api/cases/:id/assign         // Assign lawyer
GET    /api/cases/:id/summary        // AI-generated summary

// Response format
{
  "data": Case | Case[],
  "meta": { "total": 100, "page": 1, "limit": 20 },
  "success": true
}
```

### Frontend Components

```typescript
// Component Tree
pages/cases/
├── page.tsx                  // Cases list with filters
├── [id]/
│   ├── page.tsx              // Case detail view
│   ├── documents/page.tsx    // Case documents
│   └── timeline/page.tsx     // Case timeline

components/cases/
├── CaseList.tsx              // Table + filters
├── CaseCard.tsx              // Kanban card view
├── CaseForm.tsx              // Create/edit form
├── CaseStatus.tsx            // Status badge + change
├── CaseTimeline.tsx          // Events timeline
├── CaseSummaryPanel.tsx      // AI summary sidebar
└── AssignLawyerModal.tsx     // Lawyer assignment
```

---

## Feature 2: Document Processing

### Backend Logic

```typescript
// Document processing pipeline
// src/modules/document/

1. Upload Phase:
   - Multer middleware → S3 upload → DB record creation
   - Return presigned URL + document_id

2. Processing Phase (Background Job via BullMQ):
   - Fetch from S3
   - Send to Python AI Service
   - Store extracted text + embeddings
   - Update status

3. Search Phase:
   - Query → Python AI Service → pgvector search
   - Return ranked results with context
```

```typescript
// BullMQ Job Definition
@Processor('document-processing')
export class DocumentProcessor {
  @Process('extract-and-embed')
  async processDocument(job: Job<DocumentJob>) {
    const { documentId, tenantId } = job.data;
    
    // 1. Fetch document from S3
    const fileBuffer = await this.s3Service.getObject(documentId);
    
    // 2. Call Python AI service
    const result = await this.aiService.processDocument({
      documentId,
      tenantId,
      fileBuffer,
      documentType: job.data.type
    });
    
    // 3. Update database
    await this.documentRepo.updateProcessingResult(documentId, {
      extractedText: result.text,
      summary: result.summary,
      entities: result.entities,
      status: 'PROCESSED'
    });
    
    // 4. Trigger notification
    await this.notificationService.send({
      type: 'DOCUMENT_PROCESSED',
      userId: job.data.uploadedBy,
      data: { documentId, summary: result.summary }
    });
  }
}
```

### Database Schema

```prisma
model Document {
  id            String @id @default(cuid())
  name          String
  originalName  String
  fileType      String
  fileSize      Int
  s3Key         String @unique
  
  // Processing
  status        DocStatus @default(PENDING)
  extractedText String?
  aiSummary     String?
  language      String?  // "ar" | "en" | "mixed"
  
  // Relations
  tenantId      String
  caseId        String?
  uploadedBy    String
  
  // AI Extracted Data
  entities      Json?    // parties, dates, amounts
  riskFlags     Json?
  keyDates      Json?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([tenantId, caseId])
  @@index([tenantId, status])
}
```

### API Design

```typescript
POST   /api/documents/upload          // Upload + trigger processing
GET    /api/documents/:id             // Get document + AI analysis
DELETE /api/documents/:id             // Delete document
GET    /api/documents/:id/download    // Presigned download URL
POST   /api/documents/search          // Semantic search across documents

// Search request body:
{
  "query": "عقد إيجار 2024 الرياض",
  "caseId": "optional",
  "documentType": "optional",
  "limit": 10
}
```

### Frontend Components

```typescript
components/documents/
├── DocumentUploader.tsx     // Drag & drop + progress
├── DocumentList.tsx         // Document grid/list
├── DocumentViewer.tsx       // PDF viewer + AI panel
├── DocumentSearch.tsx       // Semantic search bar
├── DocumentSummary.tsx      // AI summary display
├── EntityExtraction.tsx     // Extracted entities display
└── RiskFlagsPanel.tsx       // Risk indicators
```

---

## Feature 3: AI Assistant

### Backend Logic

```typescript
// AI Chat endpoint with streaming
@Controller('ai')
export class AIController {
  @Post('chat')
  @UseGuards(AuthGuard, TenantGuard)
  async chat(
    @Body() dto: ChatDto,
    @Req() req,
    @Res() res
  ) {
    // Set streaming headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    
    // Build context
    const context = await this.contextBuilder.build({
      userId: req.user.id,
      tenantId: req.tenant.id,
      caseId: dto.caseId,
      sessionId: dto.sessionId
    });
    
    // Call orchestrator
    const stream = await this.orchestratorService.chat({
      message: dto.message,
      context,
      history: dto.history
    });
    
    // Stream response
    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }
    res.end();
  }
}
```

### API Design

```typescript
POST   /api/ai/chat              // Chat with AI (streaming SSE)
POST   /api/ai/summarize/:caseId // Generate case summary
POST   /api/ai/analyze/:docId    // Analyze specific document
GET    /api/ai/sessions          // List chat sessions
GET    /api/ai/sessions/:id      // Get session history
DELETE /api/ai/sessions/:id      // Clear session

// Chat request:
{
  "message": "ما هي أبرز بنود عقد الإيجار المرفوع؟",
  "sessionId": "uuid",
  "caseId": "optional",
  "documentIds": ["optional", "array"]
}
```

### Frontend Components

```typescript
components/ai/
├── ChatInterface.tsx        // Main chat UI
├── ChatMessage.tsx          // Message with sources
├── SourceCitation.tsx       // Click → open document
├── ThinkingIndicator.tsx    // "AI is thinking..."
├── SessionHistory.tsx       // Previous conversations
├── QuickActions.tsx         // "Summarize case", "Analyze contract"
└── AISettingsPanel.tsx      // Language, detail level
```

---

## Feature 4: Billing & Time Tracking

### Database Schema

```prisma
model TimeEntry {
  id          String @id @default(cuid())
  description String
  hours       Decimal @db.Decimal(8, 2)
  rate        Decimal @db.Decimal(10, 2)
  amount      Decimal @db.Decimal(10, 2)
  date        DateTime
  
  // Relations
  lawyerId    String
  caseId      String
  case        Case @relation(fields: [caseId], references: [id])
  invoiceId   String?
  invoice     Invoice? @relation(fields: [invoiceId], references: [id])
  tenantId    String
  
  createdAt   DateTime @default(now())
}

model Invoice {
  id            String @id @default(cuid())
  invoiceNumber String @unique
  status        InvoiceStatus @default(DRAFT)
  
  subtotal      Decimal @db.Decimal(10, 2)
  taxRate       Decimal @db.Decimal(5, 2) @default(15)  // VAT 15%
  taxAmount     Decimal @db.Decimal(10, 2)
  total         Decimal @db.Decimal(10, 2)
  currency      String @default("SAR")
  
  dueDate       DateTime
  paidAt        DateTime?
  
  // Relations
  clientId      String
  caseId        String?
  timeEntries   TimeEntry[]
  tenantId      String
  
  // PDF
  pdfS3Key      String?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

### API Design

```typescript
// Time Tracking
POST   /api/time-entries              // Log time
GET    /api/time-entries              // List (filter by case/lawyer/date)
PATCH  /api/time-entries/:id          // Update entry
DELETE /api/time-entries/:id          // Delete entry

// Invoices
POST   /api/invoices                  // Create invoice (from time entries)
GET    /api/invoices                  // List invoices
GET    /api/invoices/:id              // Invoice detail
POST   /api/invoices/:id/send         // Send to client
GET    /api/invoices/:id/pdf          // Download PDF
PATCH  /api/invoices/:id/mark-paid    // Mark as paid
```

---

## Feature 5: Notifications

### Implementation

```typescript
// src/modules/notification/notification.service.ts
@Injectable()
export class NotificationService {
  async send(notification: CreateNotificationDto) {
    // 1. Save to DB
    const saved = await this.repo.create(notification);
    
    // 2. In-app (WebSocket)
    this.wsGateway.emit(notification.userId, 'notification', saved);
    
    // 3. Email (if enabled)
    if (notification.priority === 'HIGH' || userPrefs.emailEnabled) {
      await this.emailQueue.add('send-email', {
        to: user.email,
        template: notification.type,
        data: notification.data
      });
    }
    
    // 4. SMS (urgent only)
    if (notification.priority === 'URGENT') {
      await this.smsService.send(user.phone, notification.message);
    }
  }
}

// Scheduled jobs for proactive notifications
@Cron('0 8 * * *')  // Every day at 8 AM
async sendDailyDigest() {
  const users = await this.userRepo.findActive();
  for (const user of users) {
    const upcomingDeadlines = await this.caseService.getUpcomingDeadlines(
      user.tenantId, 
      { days: 7 }
    );
    if (upcomingDeadlines.length > 0) {
      await this.emailService.sendDigest(user, upcomingDeadlines);
    }
  }
}
```

---

## MVP Build Plan – Step by Step

### Phase 1: Foundation (Weeks 1-4)

```
Week 1: Infrastructure Setup
□ Project scaffolding (NestJS + Next.js)
□ Docker Compose setup (PostgreSQL + MongoDB + Redis)
□ GitHub Actions CI basic pipeline
□ Environment configs (dev/staging/prod)
□ Prisma schema v1 + migrations

Week 2: Auth & Multi-tenancy
□ JWT authentication (access + refresh tokens)
□ RBAC (Partner, Associate, Paralegal, Client roles)
□ Tenant registration + onboarding flow
□ User management (invite, roles, permissions)
□ Frontend: login, register, onboarding pages

Week 3: Core Case Management
□ Case CRUD API
□ Case list + detail pages
□ Client management module
□ Basic timeline/events
□ Lawyer assignment

Week 4: Document Upload & Storage
□ S3 integration (upload, download, presigned URLs)
□ Document list/detail UI
□ PDF viewer integration
□ Basic metadata storage
□ BullMQ setup for background jobs
```

### Phase 2: AI Core (Weeks 5-8)

```
Week 5: Python AI Service
□ FastAPI app setup
□ Document text extraction (PDF + DOCX + Images)
□ Tesseract OCR setup (Arabic)
□ Basic summarization API

Week 6: RAG Pipeline
□ pgvector setup + schema
□ Embedding service (multilingual-e5-large)
□ Document ingestion pipeline
□ Semantic search API

Week 7: AI Agents
□ Orchestrator Agent
□ Legal Assistant Agent
□ Document Analyzer Agent
□ Chat interface (with streaming SSE)
□ Session management (Redis)

Week 8: AI Integration
□ Case summary generation
□ Document analysis UI
□ Source citations in chat
□ AI quality testing + prompt tuning
```

### Phase 3: Business Features (Weeks 9-12)

```
Week 9: Billing & Time Tracking
□ Time entry logging
□ Rate management per lawyer
□ Invoice generation
□ PDF invoice export

Week 10: Notifications & Calendar
□ In-app notifications (WebSocket)
□ Email notifications (templates)
□ Court date alerts
□ Daily digest scheduler
□ Calendar view for deadlines

Week 11: Client Portal
□ Client-facing authentication
□ Case status view (limited)
□ Document sharing
□ Secure messaging

Week 12: Polish & Launch Prep
□ Performance optimization
□ Security audit
□ Arabic RTL fixes
□ Onboarding flow
□ Documentation
□ Load testing
```

---

## Priority Roadmap

### Phase 1 (MVP — Month 1-3)
- ✅ Authentication + Multi-tenancy
- ✅ Case Management
- ✅ Document Upload + AI Summarization
- ✅ Basic AI Chat (RAG)
- ✅ Simple Billing
- ✅ Email Notifications

### Phase 2 (Growth — Month 4-6)
- 🔜 Contract Review Agent
- 🔜 Advanced Analytics Dashboard
- 🔜 Client Portal (full)
- 🔜 Mobile App (React Native)
- 🔜 Advanced Search + Filters
- 🔜 Team Collaboration features

### Phase 3 (Scale — Month 7-12)
- 🔮 Predictive Case Outcomes (ML)
- 🔮 Court Filing Integration (API)
- 🔮 Legal Database Integration
- 🔮 Multi-language (French/English contracts)
- 🔮 API Marketplace for integrations
- 🔮 White-label for enterprise
