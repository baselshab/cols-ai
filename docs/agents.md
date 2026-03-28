# COLS – AI Agents System Design
### agents.md | Version 1.0

---

## 1. نظرة عامة على نظام الـ Agents

COLS يعتمد على **Multi-Agent Architecture** حيث كل agent متخصصة في مهمة قانونية محددة. الـ agents تتواصل عبر **Orchestrator Agent** مركزي يقرر أي agent تُستدعى بناءً على طلب المستخدم.

```
User Request
    ↓
[Orchestrator Agent]
    ↓
┌──────┬──────┬──────┬──────┬──────┐
│Legal │Doc   │Case  │Cont- │Resch │
│Asst. │Anlyz.│Summ. │ract  │-arch │
│Agent │Agent │Agent │Agent │Agent │
└──────┴──────┴──────┴──────┴──────┘
    ↓
[RAG Pipeline] ← [Vector DB] ← [Document Store]
    ↓
Response to User
```

---

## 2. قائمة الـ Agents

### Agent 1: Orchestrator Agent (المنسق الرئيسي)

**الدور:** Brain of the system — يستقبل كل طلب، يحدد الـ intent، ويوجه للـ agent المناسب أو يستدعي عدة agents بالتسلسل.

**Inputs:**
- User message (text)
- Conversation history
- User context (role, current case, tenant_id)
- Available agents list

**Outputs:**
- Agent selection decision
- Structured task for selected agent
- Final composed response

**Tools:**
- Intent classifier (fine-tuned model)
- Agent registry
- Context manager

**Prompt Strategy:**
```
System: You are the orchestration layer for COLS legal AI system.
Your job is ONLY to route requests, not to answer them.

Given the user message and context, output a JSON:
{
  "intent": "document_analysis|case_summary|legal_research|contract_review|general_qa",
  "agent": "DocumentAnalyzerAgent|CaseSummaryAgent|LegalResearchAgent|ContractAgent|LegalAssistantAgent",
  "sub_tasks": [...],
  "requires_rag": true|false,
  "case_context_needed": true|false,
  "priority": "high|medium|low"
}

Always consider:
1. User's current case context
2. Their role (partner/associate/client)
3. Urgency signals (words like "urgent", "tomorrow", "court date")
```

---

### Agent 2: Legal Assistant Agent (المساعد القانوني العام)

**الدور:** المساعد الذي يتحدث مع المحامي مباشرة — يجيب على الأسئلة القانونية، يبحث في وثائق المكتب، يقدم اقتراحات.

**Inputs:**
- User question (Arabic/English)
- Retrieved RAG context (documents, cases)
- Conversation history (last 10 turns)
- Tenant knowledge base

**Outputs:**
- Detailed legal answer with sources
- Follow-up suggestions
- Confidence score
- Source citations (document name + page)

**Tools:**
- RAG retrieval (pgvector)
- Web search (legal databases)
- Citation formatter

**Prompt Strategy:**
```
System: You are COLS Legal Assistant, an expert AI lawyer assistant 
specialized in [tenant's jurisdiction: Saudi/UAE/Egyptian law].

CRITICAL RULES:
1. NEVER give legal advice without citing sources
2. Always add disclaimer: "هذا للمساعدة البحثية فقط، راجع محامياً مختصاً"
3. Prefer Arabic unless user writes in English
4. Cite exact document name and section for every claim
5. If unsure, say so clearly - never hallucinate

Retrieved Context:
{rag_context}

Current Case Context:
{case_context}

User Question: {user_message}

Respond with:
- Main answer (structured, clear)
- Key legal points (bullet format)
- Sources used (with confidence)
- Suggested next actions
```

**Confidence Thresholds:**
- >85%: إجابة مباشرة
- 60-85%: إجابة مع تحفظ واضح
- <60%: "أنصح بمراجعة متخصص + هذا ما وجدته"

---

### Agent 3: Document Analyzer Agent (محلل الوثائق)

**الدور:** يحلل الوثائق القانونية المرفوعة ويستخرج منها معلومات منظمة.

**Inputs:**
- Document (PDF/DOCX/Image — converted to text)
- Analysis type (summary | entities | clauses | risks)
- Language preference

**Outputs:**
```json
{
  "summary": "ملخص الوثيقة في 3-5 جمل",
  "document_type": "contract|court_order|legal_memo|evidence",
  "parties": ["اسم الطرف الأول", "اسم الطرف الثاني"],
  "key_dates": [
    {"date": "2025-03-15", "type": "contract_start", "description": "..."}
  ],
  "obligations": [
    {"party": "...", "obligation": "...", "deadline": "..."}
  ],
  "risk_flags": [
    {"severity": "high|medium|low", "issue": "...", "clause": "..."}
  ],
  "key_clauses": [...],
  "confidence": 0.92
}
```

**Tools:**
- OCR (Tesseract/AWS Textract for Arabic)
- NER for legal entities
- Clause classifier
- Risk scorer

**Prompt Strategy:**
```
System: You are a legal document analysis expert. Extract structured 
information from the provided legal document.

Document Text:
{document_text}

Analysis Required: {analysis_type}

RULES:
- Extract ONLY what is explicitly in the document
- Mark uncertain extractions with [UNCERTAIN]
- Use exact quotes from document for key clauses
- Flag any missing standard clauses as risks
- Output MUST be valid JSON matching the schema

For Arabic documents: maintain Arabic text in extractions
For mixed documents: extract in original language, summarize in user's preferred language
```

**Processing Pipeline:**
```
File Upload → Text Extraction → Chunking (500 tokens overlap 50) 
→ Embedding → Vector Store → Analysis Agent → Structured Output
```

---

### Agent 4: Case Summary Agent (ملخص القضايا)

**الدور:** يولد ملخصات ذكية للقضايا للاجتماعات والتقارير ومراجعة الشركاء.

**Inputs:**
- case_id
- All case documents
- Timeline of events
- Summary type (brief | detailed | court_prep | client_update)

**Outputs:**
- Executive summary
- Key facts timeline
- Strengths & weaknesses
- Recommended next steps
- Client-friendly version (مبسط)

**Prompt Strategy:**
```
System: You are a senior legal strategist preparing case summaries.

Case Data:
- Case Name: {case_name}
- Status: {status}
- Type: {case_type}
- Jurisdiction: {jurisdiction}
- Key Documents: {documents_summary}
- Timeline: {events_timeline}
- Team Notes: {notes}

Summary Type: {summary_type}

Generate a {summary_type} summary following this structure:

[للملخص التنفيذي]:
1. القضية في سطر واحد
2. الوضع الحالي
3. أبرز 3 نقاط قوة
4. أبرز 3 مخاطر
5. الخطوة التالية الموصى بها

[لتحضير الجلسة]:
1. الحجج الرئيسية لتقديمها
2. الوثائق المطلوب تقديمها
3. الشهود المتوقعون وأسئلة محتملة
4. نقاط الضعف والرد عليها
```

---

### Agent 5: Contract Review Agent (مراجع العقود)

**الدور:** المتخصص في تحليل العقود، مقارنتها، وتحديد المخاطر والبنود غير المعتادة.

**Inputs:**
- Contract document(s)
- Contract type (employment | service | real_estate | partnership)
- Client position (which party are we representing)
- Jurisdiction

**Outputs:**
- Clause-by-clause analysis
- Risk assessment per clause (Red/Yellow/Green)
- Missing standard clauses
- Negotiation recommendations
- Comparison with previous similar contracts (RAG)

**Prompt Strategy:**
```
System: You are a contract law specialist with 20 years experience.
You ALWAYS represent our client's best interests.

Contract to Review:
{contract_text}

Our Client: {client_name} | Position: {client_role_in_contract}
Contract Type: {contract_type}
Jurisdiction: {jurisdiction}

Perform full contract review:

1. CLAUSE ANALYSIS: For each clause:
   - Status: ✅ Standard | ⚠️ Needs attention | 🔴 High risk
   - Why it matters to our client
   - Recommended modification (if needed)

2. MISSING CLAUSES: List any standard clauses absent

3. RISK SUMMARY: Overall risk level + top 3 risks

4. NEGOTIATION STRATEGY: 
   - Must-have changes (deal breakers)
   - Nice-to-have changes
   - Can accept as-is

Use the firm's previous similar contracts as reference:
{similar_contracts_rag}
```

---

### Agent 6: Legal Research Agent (الباحث القانوني)

**الدور:** يبحث في قواعد البيانات القانونية والسوابق القضائية للعثور على الحجج الداعمة للقضية.

**Inputs:**
- Research query
- Legal issue/question
- Jurisdiction(s)
- case_id for context

**Outputs:**
- Relevant precedents with citations
- Applicable laws and articles
- Doctrinal analysis
- Counter-arguments (للاستعداد)

**Tools:**
- Internal RAG (firm's documents)
- External legal databases (future integration)
- Legal knowledge base (pre-indexed)

**Prompt Strategy:**
```
System: You are a legal research specialist. Find relevant law, 
precedents, and doctrine to support our client's position.

Research Question: {query}
Case Context: {case_summary}
Jurisdiction: {jurisdiction}
Our Position: {client_position}

Retrieved Sources:
{rag_sources}

Produce research memo:
1. المسألة القانونية المطروحة
2. النصوص القانونية المعمول بها (مواد + قوانين)
3. السوابق القضائية الداعمة (إن وجدت)
4. الحجج المضادة المتوقعة + الرد عليها
5. التوصية والخلاصة

Format: Legal memo style, Arabic-first
```

---

### Agent 7: Notification & Alert Agent (وكيل الإشعارات)

**الدور:** يراقب القضايا والمواعيد ويولد إشعارات ذكية وسياقية.

**Inputs:**
- Cases with deadlines
- Calendar events
- Recent changes to cases
- User preferences

**Outputs:**
- Prioritized alerts
- Smart reminders
- AI-generated context for each alert ("موعد جلسة غداً - القضية لم تُحدَّث منذ أسبوعين")

**Trigger Events:**
```
- Court date within 3 days → HIGH priority alert
- Document deadline tomorrow → URGENT alert
- Case inactive for 7+ days → REMINDER
- New document added to case → NOTIFICATION
- Client message received → IMMEDIATE
```

---

## 3. Agent Communication Flow

```
┌─────────────────────────────────────────────────┐
│                  USER INTERFACE                   │
└──────────────────────┬──────────────────────────┘
                       │ HTTP Request
                       ▼
┌─────────────────────────────────────────────────┐
│              API GATEWAY (NestJS)                 │
│         Auth → Rate Limit → Tenant Check          │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│           ORCHESTRATOR AGENT                      │
│   Intent Classification → Agent Routing           │
│   Context Injection → Task Decomposition          │
└────┬─────────┬────────┬──────────┬──────────────┘
     │         │        │          │
     ▼         ▼        ▼          ▼
┌────────┐ ┌──────┐ ┌──────┐ ┌────────┐
│Legal   │ │Doc   │ │Case  │ │Contract│
│Asst.   │ │Anlyz.│ │Summ. │ │Review  │  ...
└───┬────┘ └──┬───┘ └──┬───┘ └────┬───┘
    │         │        │          │
    └─────────┴────────┴──────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│              RAG PIPELINE                         │
│   Query → Embed → Retrieve → Rerank → Inject     │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│            VECTOR DATABASE (pgvector)             │
│   Per-tenant namespaced collections               │
└─────────────────────────────────────────────────┘
```

---

## 4. RAG Pipeline Architecture

### Pipeline Flow

```
INGESTION PIPELINE:
Document Upload
    → Text Extraction (PyMuPDF / Tesseract OCR)
    → Language Detection
    → Chunking Strategy:
        Legal Documents: 800 tokens, 150 overlap
        Court Orders: 500 tokens, 100 overlap
        Contracts: 1000 tokens, 200 overlap
    → Embedding (text-embedding-3-large / multilingual-e5-large for Arabic)
    → Metadata tagging {tenant_id, case_id, doc_type, date, parties}
    → Store in pgvector with RLS (Row Level Security)

RETRIEVAL PIPELINE:
User Query
    → Query Expansion (Arabic/English variants)
    → Hybrid Search: Semantic (70%) + BM25 Keyword (30%)
    → Tenant-filtered retrieval (WHERE tenant_id = ?)
    → Top-K retrieval (K=10)
    → Cross-encoder Reranking (Top 5)
    → Context Assembly with citations
    → Inject into Agent prompt
```

### Embedding Strategy

```python
# Arabic-optimized embedding approach
EMBEDDING_MODELS = {
    "arabic_primary": "intfloat/multilingual-e5-large",  # 560M params, strong Arabic
    "english_primary": "text-embedding-3-large",          # OpenAI, high quality
    "hybrid": True  # Store both, query both, merge scores
}

CHUNKING_CONFIG = {
    "contract": {"size": 1000, "overlap": 200},
    "court_order": {"size": 500, "overlap": 100},
    "legal_memo": {"size": 800, "overlap": 150},
    "evidence": {"size": 600, "overlap": 120}
}
```

---

## 5. Memory & Context Handling

### Short-term Memory (Conversation)
```
- Redis: last 20 conversation turns per user session
- TTL: 24 hours after last activity
- Structure: {user_id, session_id, messages[], current_case_id, active_documents}
```

### Long-term Memory (Knowledge)
```
- PostgreSQL: user preferences, frequently asked topics, case history
- Vector DB: all embedded documents (permanent, per tenant)
- Retrieval: semantic search on user's history for personalization
```

### Context Window Management
```
PRIORITY ORDER (when context window is limited):
1. Current query (always)
2. Last 5 conversation turns
3. Current case summary (if active)
4. Top 5 RAG retrieved chunks
5. User role context
6. System instructions

MAX TOKENS: 4000 (input) | 2000 (output) per call
OVERFLOW STRATEGY: Summarize older turns, keep recent + relevant
```

### Tenant Isolation
```sql
-- Every vector search includes tenant filter
SELECT * FROM document_embeddings 
WHERE tenant_id = $1 
  AND embedding <-> $2 < 0.3
ORDER BY embedding <-> $2
LIMIT 10;
```

---

## 6. Orchestration Logic

### Decision Tree
```
IF intent = "document_analysis":
    IF file attached → DocumentAnalyzerAgent
    IF referring to existing doc → RAG + LegalAssistantAgent

IF intent = "case_summary":
    CaseSummaryAgent(case_id)

IF intent = "legal_research":
    LegalResearchAgent → RAG search → response

IF intent = "contract_review":
    DocumentAnalyzerAgent → ContractReviewAgent (sequential)

IF intent = "general_qa":
    LegalAssistantAgent + RAG

IF intent = "multi_step":
    Orchestrator decomposes → parallel agent calls → merge results
```

### Error Handling & Fallbacks
```
Agent Failure → Retry (3x) → Fallback to General LLM → Log + Alert
Low Confidence (<60%) → Add disclaimer + suggest human review
Hallucination Detection → Citation check → Block if no source found
Rate Limit Hit → Queue with BullMQ → Background processing
```

---

## 7. LLM Model Strategy

| Use Case | Model | Reason |
|----------|-------|--------|
| General Legal Chat | claude-3-5-sonnet | Best Arabic + reasoning |
| Document Analysis | gpt-4o | Strong structured output |
| Fast Responses | claude-3-haiku | Low latency, lower cost |
| Embeddings (Arabic) | multilingual-e5-large | Best Arabic semantic |
| Embeddings (English) | text-embedding-3-large | Best English |
| Reranking | cross-encoder/ms-marco | Precision improvement |

### Cost Optimization
```
Caching Strategy:
- Exact same query → Redis cache (1 hour)
- Similar documents → embedding cache (permanent)
- Common legal Q&A → pre-computed answers cache

Routing Strategy:
- Simple queries → claude-3-haiku ($0.25/1M)
- Complex analysis → claude-3-5-sonnet ($3/1M)
- Batch processing → off-peak + queue
```
