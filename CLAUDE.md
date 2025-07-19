# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a D&D AI Dungeon Master application built with:
- **Frontend**: Nuxt 3 (Vue 3) with TypeScript, Tailwind CSS
- **Backend**: Nitro server with SQLite database
- **State Management**: Pinia with persistence
- **Authentication**: JWT-based with refresh tokens
- **External API**: Open5e integration for D&D data

## Essential Commands

```bash
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

### API Structure
All API endpoints follow a standardized response format and are located in `server/api/`:
- **Auth endpoints**: `/api/auth/*` - Authentication (login, register, refresh, logout)
- **Data endpoints**: `/api/data/*` - D&D game data and session management

### Authentication Flow
- JWT tokens stored in HTTP-only cookies
- Access tokens (15 min) auto-refresh before expiry
- Three auth middleware levels: `getUser`, `requireAuth`, `requireDM`, `requireParticipant`

### Database Layer
- SQLite with prepared statements in `server/db/`
- Migrations in `server/db/migrations/`
- Type-safe queries defined in `server/db/queries.ts`

### State Management
- Pinia store in `stores/auth.ts` handles user state and token refresh
- Persisted using `@pinia-plugin-persistedstate`

### Open5e Integration
- Cached in both memory and SQLite for performance
- Rate-limited to 100 requests/minute
- Background cache warmup every 12 hours

## Development Guidelines

### Code Style (from .cursorrules)
- Use TypeScript with strict type checking
- Prefer named functions over arrow functions
- Write pure functions, avoid side effects
- Extract reusable hooks/components (DRY)
- Use camelCase for directories and variables
- Favor default exports for components
- No comments unless code is complex

### Planning Process
Before implementing features:
1. Create a PRD file defining requirements and scope
2. Document technical decisions upfront
3. Get PRD approved before implementation
4. Create meaningful commits during development
5. Delete PRD file when task is complete

### Important Notes
- **No testing framework** - Project explicitly states "Testing: No tests"
- **Linting**: ESLint with TypeScript and Vue support for code quality
- SSR is disabled (SPA mode)
- Always verify auth middleware requirements for new endpoints
- Use existing patterns for consistency