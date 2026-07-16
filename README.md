# POS System

Modular monolith point-of-sale: Spring Boot backend, React/Vite frontend, PostgreSQL.

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
