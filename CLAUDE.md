# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Development Server**
- `bun run dev` - Start development server
- `bun run dev -- --open` - Start dev server and open browser

**Build & Preview**
- `bun run build` - Create production build
- `bun run preview` - Preview production build

**Code Quality**
- `bun run lint` - Run prettier check and eslint
- `bun run format` - Format code with prettier
- `bun run check` - Run svelte-check with TypeScript validation
- `bun run check:watch` - Run svelte-check in watch mode

**Testing**
- `bun run test` - Run all tests (unit + e2e)
- `bun run test:unit` - Run Vitest unit tests
- `bun run test:e2e` - Run Playwright e2e tests

**Database (Drizzle + PostgreSQL)**
- `bun run db:push` - Push schema changes to database
- `bun run db:migrate` - Run database migrations
- `bun run db:studio` - Open Drizzle Studio

**Storybook**
- `bun run storybook` - Start Storybook dev server on port 6006
- `bun run build-storybook` - Build Storybook

## Architecture Overview

**Framework Stack**
- SvelteKit 2.x with Svelte 5
- TypeScript
- TailwindCSS 4.x with forms and typography plugins
- Vite for bundling

**Database**
- Drizzle ORM with PostgreSQL
- Schema defined in `src/lib/server/db/schema.ts`
- Database connection via Neon serverless
- Requires `DATABASE_URL` environment variable

**Internationalization**
- Paraglide JS for i18n
- Messages in `messages/{locale}.json` (en, cs)
- Server-side middleware in `src/hooks.server.ts`

**Testing & Quality**
- Vitest for unit testing with browser mode
- Playwright for e2e testing
- ESLint with TypeScript and Svelte plugins
- Prettier with Svelte and TailwindCSS plugins
- Storybook for component development

**Project Structure**
- `src/lib/server/` - Server-side utilities and database code
- `src/routes/` - SvelteKit routes and pages
- `src/stories/` - Storybook stories and components
- `messages/` - Internationalization message files
- `e2e/` - Playwright e2e tests

**Key Features**
- MDSvex support for markdown in Svelte components
- Component development with Storybook
- Accessibility testing with Storybook a11y addon
- Multi-language support with Czech and English locales