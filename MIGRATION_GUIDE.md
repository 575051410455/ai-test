# Migration Fix Guide

## Problem
The error `type "role" already exists` occurs when the database already has the enum type from a previous migration attempt.

## Solution

### Option 1: Reset Database (Development Only)

Run these commands in order:

```bash
cd backend

# 1. Reset/clean the database
bun run db:reset

# 2. Run migrations
bun run db:migrate

# 3. Start the server
bun run dev
```

### Option 2: Manual SQL Fix (If you want to keep existing data)

Connect to your PostgreSQL database and run:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

-- If tables don't exist but enum does, drop the enum:
DROP TYPE IF EXISTS role CASCADE;

-- Then run migrations:
-- bun run db:migrate
```

### Option 3: Use Drizzle Kit Migrate Command

```bash
cd backend
bun drizzle-kit migrate
```

This uses the drizzle-kit built-in migration runner which handles the migration state automatically.

## Recommended Workflow

For development:
```bash
# Fresh start
bun run db:reset    # Drops all tables and types
bun run db:migrate  # Runs all migrations
bun run dev         # Start server
```

## Notes

- The `db:reset` script safely drops all tables and enum types
- Always backup production databases before running migrations
- The enum conflict only happens if migrations are partially run
- Drizzle Kit tracks migration state in `__drizzle_migrations` table
