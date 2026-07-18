# POS System

Modular monolith point-of-sale: Spring Boot backend, React/Vite frontend, PostgreSQL.

## Documentation hub

**Do not hunt feature folders one by one.** Start at:

**[docs/README.md](docs/README.md)** — topic index + links to every feature README (`002`–`023`), pending backlogs, and Phase A order.

Also: [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) (architecture) · [docs/pending feature/](docs/pending%20feature/) (backlog).

## Prerequisites

- Docker Desktop
- Java 17+
- Node.js 20+

## Local setup

### 1. Start PostgreSQL

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
./mvnw spring-boot:run
```

On Windows PowerShell:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

API: http://localhost:8080

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

UI: http://localhost:5173
