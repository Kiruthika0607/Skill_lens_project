# SkillLens React/Spring Boot application

This directory contains a separate React/Vite frontend and Spring Boot backend. The existing Node/Vite application at the repository root is unchanged.

## Requirements

- Java 17 or later
- MySQL 8 or later
- Node.js and npm

## Configure MySQL

Create the `skilllens_db` schema in MySQL Workbench:

```sql
CREATE DATABASE skilllens_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

In `skilllens-backend`, copy `.env.example` to `.env` and set `DB_USERNAME` and `DB_PASSWORD` for your local MySQL account. Keep `.env` private; it is ignored by Git. Flyway applies the schema migrations and seed data at backend startup.

## Run locally

Start the backend from `skilllens-backend`:

```powershell
.\mvnw.cmd spring-boot:run
```

Start the frontend from `skilllens-frontend`:

```powershell
npm install
npm run dev
```

The frontend runs on port 3000 by default and proxies `/api` requests to the backend at `http://localhost:8080`.
