# D&D AI Dungeon Master

A Vue.js-based D&D AI Dungeon Master application built with Nuxt 4 and better-auth.

## Tech Stack

- **Frontend**: Nuxt 4 (Vue 3) with TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: better-auth with SQLite sessions
- **Database**: SQLite with better-sqlite3
- **State Management**: Pinia with persistence
- **External API**: Open5e integration for D&D data

## Setup

### 1. Install Dependencies

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

### 2. Environment Configuration

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Update the environment variables:

```env
# Required: Better-Auth Configuration
BETTER_AUTH_SECRET=your-super-secret-key-here-at-least-32-characters-long
BETTER_AUTH_URL=http://localhost:3000
```

**Important**: Generate a secure secret key for production. The secret should be at least 32 characters long.

### 3. Database Setup

The SQLite database needs to be initialized with better-auth's schema:

```bash
# Create the database with proper better-auth tables
npm run db:migrate
```

This creates `./data/game.db` with both application and authentication tables:

**Application Tables:**
- `campaigns` - D&D game campaigns 
- `characters` - Player characters  
- `messages` - Game chat/actions

**Authentication Tables (better-auth):**
- `user` - User accounts
- `session` - Auth sessions (better-auth)
- `account` - OAuth accounts (for future providers)
- `verification` - Email verification tokens

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Authentication

The application uses better-auth for authentication.

### Auth Endpoints

All authentication is handled through a single endpoint:
- `POST /api/auth/sign-up` - User registration
- `POST /api/auth/sign-in` - User login  
- `POST /api/auth/sign-out` - User logout
- `GET /api/auth/session` - Get current session

## Code Quality

```bash
npm run lint       # Run ESLint to check code quality
npm run lint:fix   # Auto-fix ESLint issues where possible
npm run typecheck  # Run TypeScript type checking
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Project Structure

```
├── components/          # Vue components
├── layouts/            # Application layouts
├── pages/              # Application pages (auto-routed)
├── server/             # Server-side code
│   ├── api/            # API endpoints
│   ├── db/             # Database layer
│   └── utils/          # Server utilities
├── stores/             # Pinia state management
├── data/               # SQLite database files
└── docs/               # Project documentation
```
