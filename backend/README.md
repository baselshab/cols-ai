# COLS Backend

NestJS API for Collaborative Online Legal System.

## Tech Stack

- **Framework**: NestJS 10.x
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Passport
- **Queue**: BullMQ with Redis
- **Documentation**: Swagger/OpenAPI

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- npm or pnpm

### Installation

```bash
npm install
```

### Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Update `DATABASE_URL` with your PostgreSQL connection string.

### Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio
npm run prisma:studio
```

### Running

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

### Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## Project Structure

```
src/
├── main.ts                 # Entry point
├── app.module.ts           # Root module
├── common/                 # Shared utilities
│   ├── decorators/         # @TenantId, @Roles, @Public, @Throttle
│   ├── guards/              # JwtAuthGuard, TenantGuard, RolesGuard
│   ├── filters/             # Exception filters
│   └── utils/               # Hash, sanitize utilities
├── config/                  # Configuration
├── prisma/                  # Database schema & service
└── modules/
    ├── auth/                # Authentication
    ├── users/               # User management
    ├── tenants/             # Multi-tenancy
    ├── cases/               # Case management
    ├── clients/             # Client management
    ├── documents/           # Document handling
    ├── ai/                   # AI integration
    ├── billing/             # Billing & invoicing
    ├── notifications/       # Notifications
    └── queue/               # Background jobs
```

## API Documentation

Once running, visit: `http://localhost:3000/api/docs`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Start with hot reload |
| `npm run build` | Build for production |
| `npm run lint` | Lint code |
| `npm run type-check` | TypeScript check |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run migrations |
