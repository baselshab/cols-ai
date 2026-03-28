# COLS – Agent Coding Guidelines
### AGENTS.md | Version 2.0

---

## 1. Project Overview

**COLS** (Collaborative Online Legal System) is a Legal SaaS platform for law firms with:
- **Frontend**: Next.js 14 + TypeScript + TailwindCSS + ShadCN
- **Backend**: NestJS (TypeScript) + Prisma + PostgreSQL + pgvector
- **AI Service**: Python FastAPI + LangChain + multilingual-e5-large embeddings
- **Infrastructure**: Docker, Redis, BullMQ, S3-compatible storage

**Multi-tenancy**: Every query MUST include `tenantId` filter. Data isolation is mandatory.

---

## 2. Build & Development Commands

### Standard Development
```bash
# Install dependencies
npm install

# Start all services (Docker)
docker-compose -f docker-compose.dev.yml up -d

# Run individual services
npm run dev              # NestJS with hot reload
cd frontend && npm run dev  # Next.js
cd ai-service && uvicorn main:app --reload  # Python FastAPI
```

### Code Quality
```bash
npm run lint           # ESLint check
npm run type-check     # TypeScript compiler validation
npm run format         # Prettier auto-format
npm run format:check  # Check formatting without changes
```

### Testing
```bash
# Run all tests
npm run test           # Watch mode
npm run test:unit      # Unit tests only
npm run test:unit -- --testPathPattern=case  # Single test file
npm run test:unit -- --testNamePattern="should create"  # Single test
npm run test:coverage  # With coverage report
npm run test:e2e       # E2E tests (requires running services)
```

### Database
```bash
npx prisma generate    # Generate Prisma client
npx prisma migrate dev # Run migrations
npx prisma studio      # Visual DB editor
```

---

## 3. Code Style Guidelines

### TypeScript Rules (Strict Mode)
```json
// tsconfig.json enforces:
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true
}
```

**Required Patterns:**
```typescript
// ✅ GOOD: Explicit types, return type, tenant validation
async getCaseById(id: string, tenantId: string): Promise<Case | null> {
  return this.caseRepo.findOne({ where: { id, tenantId } });
}

// ❌ BAD: Implicit any, no return type
async getCaseById(id, tenantId) {
  return this.caseRepo.findOne({ id, tenantId });
}
```

### Imports & Structure
```typescript
// Order: 1. External 2. Internal 3. Relative
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CaseRepository } from '../repositories/case.repository';
import { CreateCaseDto } from './dto/create-case.dto';

// File naming: kebab-case for files, PascalCase for classes
// case.service.ts, create-case.dto.ts, case.entity.ts
```

### Naming Conventions
```
Classes:     PascalCase (CaseService, DocumentController)
Functions:   camelCase (createCase, findById)
Variables:   camelCase (caseData, isActive)
Constants:   UPPER_SNAKE_CASE (MAX_RETRY_COUNT)
Types/Enums: PascalCase (CaseStatus, UserRole)
Files:       kebab-case (case.service.ts, auth.module.ts)
```

### Error Handling
```typescript
// Always handle errors with proper NestJS exceptions
async createCase(dto: CreateCaseDto, tenantId: string): Promise<Case> {
  try {
    return await this.caseRepo.create({ ...dto, tenantId });
  } catch (error) {
    if (error.code === 'P2002') {
      throw new ConflictException('Case with this number already exists');
    }
    throw error;
  }
}

// Use Result pattern for service methods
async findOrFail(id: string, tenantId: string): Promise<Case> {
  const case = await this.caseRepo.findOne({ where: { id, tenantId } });
  if (!case) {
    throw new NotFoundException(`Case ${id} not found`);
  }
  return case;
}
```

### DTOs & Validation
```typescript
// Use class-validator for all DTOs
export class CreateCaseDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsEnum(CaseType)
  type: CaseType;

  @IsUUID()
  clientId: string;

  @IsOptional()
  @IsDateString()
  courtDate?: string;
}
```

---

## 4. Security Requirements

**CRITICAL - Never Do:**
```typescript
// ❌ Log sensitive data
logger.log(`User password: ${password}`);

// ❌ Raw SQL (SQL injection risk)
const q = `SELECT * FROM users WHERE id = ${userId}`;

// ❌ Skip tenant validation
async getCase(id: string) {
  return this.repo.findOne({ id }); // Missing tenantId!
}
```

**Always Do:**
```typescript
// ✅ Validate tenant on every query
async getCase(id: string, tenantId: string): Promise<Case> {
  const found = await this.repo.findOne({ where: { id, tenantId } });
  if (!found) throw new NotFoundException();
  return found;
}

// ✅ Sanitize inputs
@IsString() @MaxLength(500) @Transform(({ value }) => sanitizeHtml(value))
title: string;

// ✅ Rate limit AI endpoints
@Throttle({ default: { limit: 20, ttl: 60000 } })
@Post('chat')
```

---

## 5. Git & Commits (Conventional Commits)

```bash
# Format: type(scope): description
git commit -m "feat(case): add case creation endpoint"
git commit -m "fix(auth): handle expired refresh token"
git commit -m "test(billing): add invoice generation tests"

# Types: feat, fix, docs, style, refactor, test, chore, perf
# Breaking changes: feat(api)!: or add BREAKING CHANGE footer
```

**Branch Naming:**
```bash
feature/COLS-123-case-management
bugfix/COLS-201-auth-token-expiry
hotfix/COLS-301-critical-data-leak
```

---

## 6. Testing Requirements

### Unit Tests (Jest)
```typescript
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
  });

  it('should create case with correct tenantId', async () => {
    const dto: CreateCaseDto = { title: 'Test', type: CaseType.CIVIL };
    mockRepo.create.mockResolvedValue({ id: 'case-1', ...dto });
    
    const result = await service.create(dto, { tenantId: 'tenant-1' });
    
    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: 'tenant-1' })
    );
  });
});
```

### Coverage Targets
- Services: >80% coverage
- Overall: >60% coverage

---

## 7. AI Response Guidelines

When generating AI responses:
1. **NEVER give legal advice without citing sources**
2. **Always add disclaimer**: "هذا للمساعدة البحثية فقط، راجع محامياً مختصاً"
3. **Cite exact document name and section** for every legal claim
4. **Prefer Arabic** unless user writes in English
5. **Confidence thresholds**: >85% direct answer, 60-85% with caveats, <60% suggest specialist

---

## 8. Key Files Reference

```
src/
├── modules/
│   ├── auth/           # JWT, RBAC, tenant guards
│   ├── case/           # Case management CRUD
│   ├── document/       # Upload, processing, RAG
│   ├── ai/             # Orchestrator, agents
│   └── billing/        # Invoices, time tracking
├── common/
│   ├── decorators/     # @Roles, @TenantId, @Throttle
│   ├── guards/         # AuthGuard, TenantGuard
│   └── filters/       # Exception filters
└── prisma/
    └── schema.prisma   # Database schema
```

**See Also:**
- `docs/prd.md` - Product Requirements Document
- `docs/dev-workflow.md` - Full development workflow & CI/CD
- `docs/features-implementation-plan.md` - Technical architecture
- `docs/claude.md` - Phase-by-phase execution guide

---

## 9. Documentation Maintenance

**IMPORTANT**: After major changes, update the `@docs/` folder to reflect the current project state:

| File | When to Update |
|------|----------------|
| `prd.md` | New features, scope changes, MVP completion |
| `dev-workflow.md` | CI/CD changes, testing strategy updates |
| `features-implementation-plan.md` | Architecture decisions, new modules |
| `claude.md` | Phase completions, new constraints |
| `AGENTS.md` | Build commands, coding standards changes |

Keep these docs in sync with the codebase - stale documentation causes confusion for new team members and AI agents working in the repository.
