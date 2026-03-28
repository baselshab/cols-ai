# COLS – Project Milestones & Tasks

---

## M1: Foundation (Weeks 1-4)

**Goal:** Infrastructure and authentication foundation

### Backend
- [ ] Setup NestJS project structure
- [ ] Configure TypeScript strict mode
- [ ] Setup Prisma with PostgreSQL
- [ ] Create Tenant model with multi-tenant schema
- [ ] Create User model with roles (ADMIN, LAWYER, PARALEGAL, SECRETARY, CLIENT)
- [ ] Implement JWT authentication (access + refresh tokens)
- [ ] Implement RBAC guards and decorators
- [ ] Create tenant middleware for request isolation
- [ ] Setup environment configuration
- [ ] Write unit tests for auth module

### Frontend
- [ ] Setup Next.js 14 project with App Router
- [ ] Configure Tailwind CSS with shadcn/ui
- [ ] Create auth store (Zustand)
- [ ] Build login page with tenant selection
- [ ] Build registration page
- [ ] Implement protected route middleware
- [ ] Create base layout with sidebar
- [ ] Setup React Query provider

### AI Service
- [ ] Setup FastAPI project structure
- [ ] Configure Pydantic models
- [ ] Setup Anthropic/OpenAI LLM client
- [ ] Create health check endpoint
- [ ] Setup API key authentication

### Infrastructure
- [ ] Setup docker-compose.dev.yml
- [ ] Configure PostgreSQL container
- [ ] Configure Redis container
- [ ] Configure MinIO for S3 storage

---

## M2: Core Case Management (Weeks 5-8)

**Goal:** Full case lifecycle management

### Backend
- [ ] Create Case model with status enum
- [ ] Create CaseEvent model for timeline
- [ ] Implement case CRUD endpoints
- [ ] Implement case filtering (status, client, lawyer)
- [ ] Add case assignment to lawyers
- [ ] Create case timeline endpoints
- [ ] Add case event creation
- [ ] Implement case search
- [ ] Write unit tests for cases module

### Frontend
- [ ] Create cases list page with filters
- [ ] Create case detail page with timeline
- [ ] Create new case form
- [ ] Create case status badges
- [ ] Implement case search
- [ ] Add case assignment dropdown
- [ ] Add timeline visualization

### Client Module
- [ ] Create Client model
- [ ] Implement client CRUD endpoints
- [ ] Link clients to cases
- [ ] Create client list page
- [ ] Create client detail page

---

## M3: Document Intelligence (Weeks 9-12)

**Goal:** Upload, process, and analyze documents

### Backend
- [ ] Create Document model
- [ ] Implement file upload endpoint (multipart/form-data)
- [ ] Integrate S3 service for storage
- [ ] Create document status tracking (PENDING, PROCESSING, PROCESSED, FAILED)
- [ ] Setup BullMQ for document processing queue
- [ ] Create document processor worker
- [ ] Implement document download endpoint
- [ ] Create document listing and search
- [ ] Write unit tests

### AI Service
- [ ] Create document processor service
- [ ] Implement PDF text extraction
- [ ] Implement DOCX text extraction
- [ ] Setup OCR service for images
- [ ] Create chunking service (1000 chars with overlap)
- [ ] Generate document embeddings
- [ ] Implement document summarization
- [ ] Extract entities (dates, parties, obligations)

### Frontend
- [ ] Create document upload component
- [ ] Create document list with status
- [ ] Create document detail view
- [ ] Add drag-and-drop upload
- [ ] Show processing status
- [ ] Create document search interface

---

## M4: AI Legal Assistant (Weeks 13-16)

**Goal:** RAG-powered legal chat

### Backend
- [ ] Create DocumentEmbedding model (pgvector)
- [ ] Implement embedding storage
- [ ] Create vector search endpoint
- [ ] Create AI chat endpoint
- [ ] Implement chat session storage
- [ ] Add rate limiting to AI endpoints
- [ ] Create session history endpoint

### AI Service
- [ ] Setup pgvector integration
- [ ] Implement embedding generation (multilingual-e5-large)
- [ ] Create RAG retrieval pipeline
- [ ] Build legal assistant agent
- [ ] Create document analyzer agent
- [ ] Implement contract comparison
- [ ] Add source citation to responses
- [ ] Add legal disclaimer to responses
- [ ] Support Arabic and English prompts

### Frontend
- [ ] Create AI chat interface
- [ ] Implement chat message component
- [ ] Add streaming response support
- [ ] Create session history sidebar
- [ ] Add loading indicator
- [ ] Display source citations
- [ ] Add legal disclaimer

---

## M5: Client Portal & Billing (Weeks 17-20)

**Goal:** Client-facing portal and financial management

### Client Portal
- [ ] Create client portal layout
- [ ] Client case view (read-only)
- [ ] Client document access
- [ ] Client messaging system
- [ ] Client notification preferences

### Billing - Backend
- [ ] Create TimeEntry model
- [ ] Create Invoice model
- [ ] Implement time entry CRUD
- [ ] Implement invoice CRUD
- [ ] Create invoice PDF generation
- [ ] Track payment status
- [ ] Support multi-currency (SAR, AED, USD)

### Billing - Frontend
- [ ] Create time entry form
- [ ] Create time tracking widget
- [ ] Create invoice list
- [ ] Create invoice detail view
- [ ] Add invoice PDF download

### Notifications
- [ ] Create Notification model
- [ ] Implement notification service
- [ ] Create notification endpoints
- [ ] Setup WebSocket gateway
- [ ] Create in-app notification UI

---

## M6: Polish & Launch (Weeks 21-24)

**Goal:** UI polish, notifications, and MVP launch

### Notifications
- [ ] Setup email service (SMTP)
- [ ] Create email templates (case update, reminder, invoice)
- [ ] Implement court date reminders
- [ ] Implement deadline alerts
- [ ] Create daily digest emails

### Calendar
- [ ] Create calendar data model
- [ ] Calendar list endpoint
- [ ] Court date display
- [ ] Calendar UI component

### Dashboard
- [ ] Create partner dashboard (team overview)
- [ ] Create lawyer dashboard (personal stats)
- [ ] Add case statistics
- [ ] Add revenue widgets

### Polish
- [ ] Arabic UI translation
- [ ] RTL support for Arabic
- [ ] Language switcher
- [ ] Mobile responsive fixes
- [ ] Performance optimization
- [ ] Accessibility audit

### Launch
- [ ] Production docker-compose
- [ ] SSL/HTTPS setup
- [ ] Monitoring setup (Sentry)
- [ ] Load testing
- [ ] Security audit
- [ ] Documentation (API docs)
- [ ] User onboarding flow
- [ ] MVP release

---

## Future Phases (Post-MVP)

### AI Contract Generation (Phase 2)
- [ ] Contract template library
- [ ] AI contract drafting
- [ ] Contract clause suggestions
- [ ] Version comparison

### Advanced Analytics (Phase 2)
- [ ] Revenue dashboards
- [ ] Case outcome tracking
- [ ] Team performance metrics
- [ ] Custom reports

### Mobile Apps (Phase 3)
- [ ] iOS app
- [ ] Android app
- [ ] Push notifications

### API Marketplace (Phase 3)
- [ ] Public API
- [ ] API documentation
- [ ] Developer portal

### Predictive Outcomes (Phase 3)
- [ ] ML model for case outcomes
- [ ] Risk assessment
- [ ] Timeline prediction
