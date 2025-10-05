# Full-Stack Auth Application

A modern full-stack authentication application with role-based access control.

## Tech Stack

### Backend
- **Runtime**: Bun
- **Framework**: Hono
- **Validation**: Zod + @hono/zod-validator
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: JWT (jose) + bcrypt

### Frontend
- **Build Tool**: Vite
- **Framework**: React
- **Router**: TanStack Router
- **Data Fetching**: TanStack Query
- **Forms**: TanStack Form
- **UI**: shadcn/ui + Tailwind CSS

## Features

- ✅ User registration and login
- ✅ JWT-based authentication
- ✅ Role-based access control (User/Admin)
- ✅ Protected routes
- ✅ Admin dashboard with user management
- ✅ User profile page
- ✅ Responsive UI with shadcn/ui

## Setup

### Prerequisites
- Bun installed
- PostgreSQL database running

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
bun install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your database credentials:
```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-secret-key
PORT=3000
```

5. Generate and run migrations:
```bash
bun run db:generate
bun run db:migrate
```

6. Start the development server:
```bash
bun run dev
```

Backend will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
bun install
```

3. Start the development server:
```bash
bun run dev
```

Frontend will run on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/me` - Get current user (authenticated)
- `GET /api/users` - Get all users (admin only)

## Application Routes

- `/` - Home (redirects to login or dashboard)
- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - User dashboard (authenticated)
- `/user` - User profile (authenticated)
- `/admin` - Admin panel (admin only)

## Default Roles

- **user**: Standard user access
- **admin**: Full system access with user management

## Database Schema

### Users Table
- `id` (UUID, PK)
- `email` (unique)
- `password` (hashed)
- `name`
- `role` (enum: user, admin)
- `createdAt`
- `updatedAt`

### Sessions Table
- `id` (UUID, PK)
- `userId` (FK to users)
- `token` (unique)
- `expiresAt`
- `createdAt`

## Development Notes

- JWT tokens expire after 7 days
- Passwords are hashed with bcrypt (10 rounds)
- CORS is configured for `http://localhost:5173`
- All authenticated routes require Bearer token in Authorization header
