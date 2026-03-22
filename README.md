# English Vocabulary App

A web-based English vocabulary learning app that helps users build a personal word bank, learn words in context, and retain vocabulary through AI-generated quizzes and reading passages.

## Features

- **Word lookup** — search system dictionary (CEFR A1–C2), view definitions, phonetics, examples
- **Personal word bank** — save words with custom notes organized by title
- **AI assistance** — ask AI about any word, get note suggestions, check note accuracy
- **Quizzes** — daily review, quick quizzes, band placement test, custom quizzes
- **Reading passages** — AI-generated passages built from your saved words, highlight unknown words inline
- **Spaced repetition** — automatic learning status tracking (NEW → LEARNING → REVIEWING → MASTERED)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | NestJS + Prisma |
| Database | PostgreSQL |
| Cache | Redis |
| Deploy | VPS + Docker Compose + Nginx |

## Project Structure

```
/
├── apps/
│   ├── api/                  # NestJS backend
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   ├── words/
│   │   │   ├── user-words/
│   │   │   ├── ai/
│   │   │   ├── quiz/
│   │   │   └── reading/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   └── Dockerfile
│   └── web/                  # React + Vite frontend
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── hooks/
│       │   └── router.tsx
│       └── Dockerfile
├── docker-compose.yml
├── nginx.conf
└── .env.example
```

## Getting Started

### Prerequisites

- Docker + Docker Compose
- Node.js 20+
- An API key for Claude (Anthropic) or OpenAI

### Setup

1. Clone the repository

```bash
git clone <repo-url>
cd vocab-app
```

2. Copy environment variables

```bash
cp .env.example .env
```

3. Fill in `.env`

```
DATABASE_URL=postgresql://user:password@postgres:5432/vocab_app
REDIS_URL=redis://redis:6379
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
AI_API_KEY=your_ai_api_key
AI_MODEL=claude-haiku-4-5
```

4. Start all services

```bash
docker compose up -d
```

5. Run database migrations and seed

```bash
docker compose exec api npx prisma migrate deploy
docker compose exec api npx prisma db seed
```

6. App is running at `http://localhost`

### Development (without Docker)

**Backend**
```bash
cd apps/api
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

**Frontend**
```bash
cd apps/web
npm install
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens |
| `AI_API_KEY` | API key for AI provider |
| `AI_MODEL` | Model to use (e.g. `claude-haiku-4-5`) |

## API Overview

| Module | Base Path | Auth Required |
|---|---|---|
| Auth | `/auth` | No |
| System Words | `/words` | No |
| Personal Word Bank | `/user-words` | Yes |
| AI Features | `/ai` | Yes |
| Quizzes | `/quizzes` | Yes |
| Reading Passages | `/passages` | Yes |