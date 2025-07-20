# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a D&D AI Dungeon Master application built with:
- **Frontend**: Nuxt 4 (Vue 3) with TypeScript, Tailwind CSS
- **Backend**: Nitro server with SQLite database
- **State Management**: Pinia with persistence
- **Authentication**: better-auth with database sessions (simplified from previous JWT system)
- **External API**: Open5e integration for D&D data

## Essential Commands

```bash
# Database Setup (First Time)
npm run db:migrate     # Initialize app + better-auth database schema

# Development
npm run dev        # Start development server on http://localhost:3000

# Production
npm run build      # Build for production
npm run preview    # Preview production build locally

# Code Quality
npm run lint       # Run ESLint to check code quality
npm run lint:fix   # Auto-fix ESLint issues where possible
npm run typecheck  # Run TypeScript type checking

# Other
npm run generate   # Generate static site
```

## Architecture Overview

### Authentication System (better-auth)
- **Database sessions** stored in `auth_session` table
- **Single API endpoint**: `/api/auth/[...auth].ts` handles all auth routes
- **Automatic session management** - no manual token refresh needed
- **Client integration** via `better-auth/vue` package
- **Environment variables**: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`

### API Structure
All API endpoints follow a standardized response format and are located in `server/api/`:
- **Auth endpoints**: `/api/auth/[...auth]` - All authentication handled by better-auth
- **Data endpoints**: `/api/data/*` - D&D game data and session management

### Authentication Flow
- Database sessions
- Sessions stored in SQLite `auth_session` table
- better-auth client handles all session management automatically
- Simplified Pinia store with better-auth integration

### Database Layer
- SQLite with prepared statements in `server/db/`
- **App migrations**: `server/db/migrations/001_initial.sql` (D&D game tables: sessions, characters, messages)
- **Auth tables**: `user`, `session`, `account`, `verification` (created via better-auth CLI)
- **Database setup**: Use `npm run db:migrate` (runs both app + auth migrations)
- Type-safe queries defined in `server/db/queries.ts` for app-specific data

### State Management
- **Pinia store** (`stores/auth.ts`)
- Uses `better-auth/vue` client for all auth operations
- **Persistent state** for user data only (sessions handled server-side)

## Development Guidelines

### Time Calculations
Always use the `ms` library for time-related values.

### Authentication
- Use better-auth client in components: `createAuthClient()`
- Server-side auth via better-auth handler
- No manual JWT or cookie management needed

### Database
- Use prepared statements from `server/db/queries.ts`
- Follow existing query patterns
- SQLite with WAL mode enabled for performance

## Code Best Practices

- Don't add comments to code unless it's necessary.
- `@typescript-eslint/no-explicit-any` is set to error. don't use any type.
- Prefer named function declarations over anonymous arrow functions for multi-line functions:
  ```javascript
  // Good: Named function declaration for multi-line
  async function handleCreateCampaign() {
    const campaign = await createCampaign(createForm.value);
    if (campaign) {
      closeCreateModal();
    }
  }
  
  // Acceptable: Arrow functions for one-liners
  const users = data.filter(user => user.active);
  ```

## Pre-Commit Checks

- Run `npm run typecheck` and `npm run lint` before calling work done/fixed.

## Claude Guidance

- Never run dev server (npm run dev) by yourself. Always ask USER to run when needed.