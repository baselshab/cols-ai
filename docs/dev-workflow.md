# COLS – Engineering Team Dev Workflow
### dev-workflow.md | Version 1.0

---

## 1. Git Workflow: GitFlow (Modified)

### لماذا GitFlow؟

```
✅ اخترنا: GitFlow المُعدَّل
الأسباب:
- فريق 5-8 أشخاص يحتاج structure واضحة
- نحتاج staging environment منفصلة
- Releases محددة تناسب SaaS cycle
- Hotfix capability دون الانتظار
```

### Branch Structure

```
main              ← Production only (protected, no direct push)
  └── develop     ← Integration branch (الـ main working branch)
        ├── feature/COLS-123-case-management     ← Feature branches
        ├── feature/COLS-124-document-upload
        ├── bugfix/COLS-201-auth-token-expiry    ← Bug fixes
        ├── hotfix/COLS-301-critical-data-leak   ← Production hotfixes
        └── release/v1.2.0                       ← Release preparation
```

### Branch Naming Convention

```bash
# Format: type/TICKET-ID-short-description

# Feature branches
feature/COLS-123-ai-chat-interface
feature/COLS-124-document-rag-pipeline

# Bug fixes
bugfix/COLS-201-fix-arabic-rtl-layout
bugfix/COLS-202-case-status-not-updating

# Hotfixes (production critical)
hotfix/COLS-301-critical-auth-bypass
hotfix/COLS-302-data-leak-fix

# Release branches
release/v1.0.0
release/v1.1.0

# Chore/Tech debt
chore/update-prisma-to-v6
chore/refactor-ai-service-module
```

---

## 2. Branch Strategy & Lifecycle

### Feature Development Flow

```bash
# 1. Start from develop
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/COLS-123-case-management

# 3. Work + commit often
git add .
git commit -m "feat(case): add case creation endpoint"

# 4. Keep up to date with develop
git fetch origin
git rebase origin/develop  # REBASE not merge — cleaner history

# 5. Push and open PR
git push origin feature/COLS-123-case-management
# → Open PR to develop on GitHub

# 6. After PR approval + CI passes
# → Squash and merge to develop (clean history)

# 7. Delete branch after merge
git branch -d feature/COLS-123-case-management
```

### Hotfix Flow (Production Emergency)

```bash
# 1. Branch from main (NOT develop)
git checkout main
git checkout -b hotfix/COLS-301-critical-auth-bypass

# 2. Fix + commit
git commit -m "fix(auth): prevent JWT algorithm confusion attack"

# 3. Merge to BOTH main AND develop
git checkout main && git merge hotfix/COLS-301-critical-auth-bypass
git checkout develop && git merge hotfix/COLS-301-critical-auth-bypass

# 4. Tag the release
git tag -a v1.0.1 -m "Hotfix: Auth bypass vulnerability"
git push origin main develop --tags
```

### Release Flow

```bash
# 1. Create release branch from develop
git checkout develop
git checkout -b release/v1.1.0

# 2. Only bugfixes allowed on release branch
# NO new features — version bump + changelog only

# 3. When ready
git checkout main && git merge release/v1.1.0
git tag -a v1.1.0 -m "Release v1.1.0"

git checkout develop && git merge release/v1.1.0
git push origin main develop --tags
```

---

## 3. Commit Convention (Conventional Commits)

```bash
# Format: type(scope): description
# Scope = affected module

# Types:
feat     → New feature
fix      → Bug fix
docs     → Documentation only
style    → Formatting, no logic change
refactor → Code restructure, no feature/fix
test     → Tests only
chore    → Build, CI, dependencies
perf     → Performance improvement
revert   → Reverting a commit

# Examples:
git commit -m "feat(ai): add document analyzer agent"
git commit -m "fix(auth): handle expired refresh token gracefully"
git commit -m "feat(case): implement case timeline with pagination"
git commit -m "perf(rag): add Redis cache for common queries"
git commit -m "test(billing): add invoice generation unit tests"
git commit -m "chore: upgrade NestJS to v11"
git commit -m "docs(api): update OpenAPI spec for case endpoints"

# Breaking changes (add ! and BREAKING CHANGE in footer):
git commit -m "feat(api)!: change case status enum values

BREAKING CHANGE: CaseStatus values renamed from ACTIVE to IN_PROGRESS"
```

---

## 4. Code Review Rules

### PR Requirements (Mandatory)

```yaml
# Every PR MUST have:
✅ Linked ticket number in title: "[COLS-123] Add case management"
✅ PR description using template (see below)
✅ Min 1 reviewer approval (min 2 for auth/security changes)
✅ All CI checks passing (green)
✅ No console.log() in production code
✅ No hardcoded secrets or env vars
✅ Test coverage not decreased

# Auto-blocked:
❌ Direct push to main or develop
❌ PR with >500 lines changed (split it)
❌ Failing tests
❌ Security audit failures
```

### PR Template

```markdown
## 📋 Description
[Brief description of what this PR does]

## 🎫 Ticket
Closes #COLS-123

## 🔍 Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Refactor
- [ ] Documentation

## 🧪 Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

**Test Instructions:**
1. Step 1...
2. Step 2...

## 📸 Screenshots (if UI changes)
[Before/After screenshots]

## ⚠️ Risk Assessment
- Risk level: Low / Medium / High
- Rollback plan: [describe]

## ✅ Checklist
- [ ] Code follows project coding standards
- [ ] No hardcoded secrets
- [ ] Prisma migrations are backward compatible
- [ ] API changes documented in OpenAPI spec
```

### Review Guidelines

```
Reviewer Responsibilities:
✅ Review within 24 hours of assignment
✅ Check logic, not just style (that's what linting is for)
✅ Ask questions, don't demand — use "Consider..." not "You must..."
✅ Approve if >90% good — minor nits don't block
✅ Block if: security risk / data integrity risk / breaking change undocumented

Comment Prefixes:
[BLOCK]  → Must fix before merge
[nit]    → Minor style, optional
[Q]      → Question, not blocking
[IDEA]   → Suggestion for future
```

---

## 5. CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  push:
    branches: [develop, main]
  pull_request:
    branches: [develop, main]

jobs:
  # ─── STAGE 1: Code Quality ───────────────────
  lint-and-type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run lint          # ESLint
      - run: npm run type-check    # TypeScript compiler check
      - run: npm run format:check  # Prettier

  # ─── STAGE 2: Tests ──────────────────────────
  test-unit:
    runs-on: ubuntu-latest
    needs: lint-and-type-check
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test:unit
      - uses: codecov/codecov-action@v4  # Coverage reporting

  test-integration:
    runs-on: ubuntu-latest
    needs: lint-and-type-check
    services:
      postgres:
        image: pgvector/pgvector:pg16
        env:
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB: cols_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
      redis:
        image: redis:7-alpine
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:testpass@localhost:5432/cols_test
          REDIS_URL: redis://localhost:6379

  # ─── STAGE 3: Security ───────────────────────
  security-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit --audit-level=high
      - uses: aquasecurity/trivy-action@master  # Container scanning
        with:
          scan-type: 'fs'
          severity: 'CRITICAL,HIGH'

  # ─── STAGE 4: Build ──────────────────────────
  build:
    runs-on: ubuntu-latest
    needs: [test-unit, test-integration, security-audit]
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t cols-api:${{ github.sha }} .
      - run: docker build -t cols-web:${{ github.sha }} ./frontend
      - run: docker build -t cols-ai:${{ github.sha }} ./ai-service

  # ─── STAGE 5: Deploy (on main only) ──────────
  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: build
    runs-on: ubuntu-latest
    environment: production  # Requires manual approval
    steps:
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/cols-api api=cols-api:${{ github.sha }}
          kubectl set image deployment/cols-web web=cols-web:${{ github.sha }}
          kubectl rollout status deployment/cols-api
```

---

## 6. Environments

### Development (Local)

```yaml
# docker-compose.dev.yml
services:
  postgres:
    image: pgvector/pgvector:pg16
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: cols_dev
      POSTGRES_USER: cols
      POSTGRES_PASSWORD: devpassword

  mongodb:
    image: mongo:7
    ports: ["27017:27017"]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  minio:           # Local S3-compatible storage
    image: minio/minio
    ports: ["9000:9000", "9001:9001"]
    command: server /data --console-address ":9001"

# Run locally:
# docker-compose -f docker-compose.dev.yml up -d
# npm run dev (NestJS hot reload)
# npm run dev (Next.js)
# uvicorn main:app --reload (Python AI service)
```

### Staging

```
Purpose: Pre-production testing, QA, stakeholder demos
Data: Anonymized copy of production data (weekly refresh)
URL: staging.cols.ai
Deployment: Auto-deploy from develop branch
Access: Team only (IP whitelist)
Config: Production-like settings, test API keys
```

### Production

```
Purpose: Live customer-facing environment
Data: Real customer data
URL: app.cols.ai
Deployment: Manual approval required (GitHub Environments)
Rollback: < 5 minutes (kubectl rollout undo)
Monitoring: Datadog APM + PagerDuty alerts
Backups: Daily automated DB backup to S3
```

### Environment Variables Management

```bash
# DO NOT commit .env files
# Use:
# - Local: .env.local (gitignored)
# - Staging: GitHub Secrets + Kubernetes Secrets
# - Production: HashiCorp Vault + Kubernetes Secrets

# Required ENV vars per service:
# Backend (NestJS):
DATABASE_URL=
MONGODB_URI=
REDIS_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=
S3_BUCKET=
S3_ACCESS_KEY=
S3_SECRET_KEY=
AI_SERVICE_URL=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
SMTP_HOST=
STRIPE_SECRET_KEY=

# AI Service (Python):
DATABASE_URL=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
REDIS_URL=
EMBEDDING_MODEL=
```

---

## 7. Testing Strategy

### Unit Tests (NestJS + Jest)

```typescript
// Target: All services + utils + complex logic
// Coverage target: >80% for services, >60% overall

// Example: case.service.spec.ts
describe('CaseService', () => {
  let service: CaseService;
  let mockRepo: jest.Mocked<CaseRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CaseService,
        { provide: CaseRepository, useValue: createMock<CaseRepository>() }
      ]
    }).compile();

    service = module.get<CaseService>(CaseService);
    mockRepo = module.get(CaseRepository);
  });

  it('should create a case with correct tenantId', async () => {
    const dto: CreateCaseDto = { title: 'Test Case', type: CaseType.CIVIL };
    mockRepo.create.mockResolvedValue({ id: 'case-1', ...dto });
    
    const result = await service.create(dto, { tenantId: 'tenant-1' });
    
    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: 'tenant-1' })
    );
    expect(result.id).toBeDefined();
  });

  it('should throw if case not found in tenant', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne('nonexistent', 'tenant-1'))
      .rejects.toThrow(NotFoundException);
  });
});
```

### Integration Tests

```typescript
// Target: API endpoints + DB operations + Auth flows
// Tool: Supertest + Test containers

describe('Cases API (Integration)', () => {
  let app: INestApplication;
  let jwtToken: string;

  beforeAll(async () => {
    app = await createTestApp();  // Real DB (test container)
    jwtToken = await getAuthToken(app, 'lawyer@test.com');
  });

  it('POST /api/cases → should create case and return 201', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/cases')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        title: 'Commercial Dispute Q4 2024',
        type: 'COMMERCIAL',
        clientId: 'client-uuid'
      })
      .expect(201);

    expect(response.body.data).toMatchObject({
      title: 'Commercial Dispute Q4 2024',
      status: 'OPEN'
    });
  });

  it('GET /api/cases → should only return cases from same tenant', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/cases')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    // All cases must belong to same tenant
    response.body.data.forEach(c => {
      expect(c.tenantId).toBe(TEST_TENANT_ID);
    });
  });
});
```

### E2E Tests (Playwright)

```typescript
// Target: Critical user journeys
// Tool: Playwright

// Test: Complete case creation flow
test('Lawyer can create a case and upload a document', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name=email]', 'lawyer@testfirm.com');
  await page.fill('[name=password]', 'password123');
  await page.click('button[type=submit]');

  await expect(page).toHaveURL('/dashboard');

  // Create case
  await page.click('text=New Case');
  await page.fill('[name=title]', 'Test Automation Case');
  await page.selectOption('[name=type]', 'CIVIL');
  await page.click('text=Create Case');

  await expect(page.locator('.toast-success')).toBeVisible();

  // Upload document
  await page.click('text=Upload Document');
  await page.setInputFiles('input[type=file]', './test-files/sample-contract.pdf');
  
  // Wait for AI processing
  await expect(page.locator('.document-status')).toHaveText('Processed', {
    timeout: 30000
  });
  
  // Check AI summary appeared
  await expect(page.locator('.ai-summary')).toBeVisible();
});
```

---

## 8. Coding Standards

### TypeScript Rules

```typescript
// tsconfig.json — Strict settings
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}

// ✅ GOOD: Explicit types, no any
async getCaseById(id: string, tenantId: string): Promise<Case | null> {
  return this.caseRepo.findOne({ where: { id, tenantId } });
}

// ❌ BAD: implicit any, no return type
async getCaseById(id, tenantId) {
  return this.caseRepo.findOne({ id, tenantId });
}
```

### ESLint Configuration

```json
{
  "extends": [
    "@nestjs/eslint-config-nestjs",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "no-console": "error",
    "no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### Security Standards

```typescript
// NEVER:
// 1. Log sensitive data
logger.log(`User password: ${password}`); // ❌

// 2. Use raw SQL without parameterization  
const q = `SELECT * FROM users WHERE id = ${userId}`; // ❌ SQL injection

// 3. Skip tenant validation
async getCase(id: string) {  // ❌ Missing tenant check
  return this.repo.findOne({ id });
}

// ALWAYS:
// 1. Validate tenant on every query
async getCase(id: string, tenantId: string): Promise<Case> {
  const found = await this.repo.findOne({ where: { id, tenantId } }); // ✅
  if (!found) throw new NotFoundException();
  return found;
}

// 2. Sanitize all inputs
@IsString() @MaxLength(500) @Transform(({ value }) => sanitizeHtml(value))
title: string; // ✅

// 3. Rate limit AI endpoints
@Throttle({ default: { limit: 20, ttl: 60000 } })  // 20 req/min per user
@Post('chat') // ✅
```
