# LifeFundamentals

A SvelteKit application with TypeScript, TailwindCSS, and internationalization support.

## Tech Stack

- **Framework**: SvelteKit 2.x with Svelte 5
- **Language**: TypeScript
- **Styling**: TailwindCSS 4.x
- **Database**: PostgreSQL with Drizzle ORM
- **i18n**: Paraglide JS (English/Czech)
- **Testing**: Vitest + Playwright
- **Package Manager**: Bun

## Getting Started

Install dependencies:

```sh
bun install
```

Set up environment variables (copy `.env.example` to `.env` and configure):

```sh
DATABASE_URL=your_postgresql_connection_string
```

## Development

Start the development server:

```sh
bun run dev

# or open in browser automatically
bun run dev -- --open
```

## Building

Create a production build:

```sh
bun run build
```

Preview the production build:

```sh
bun run preview
```

## Available Scripts

**Development**
- `bun run dev` - Start development server
- `bun run dev -- --open` - Start dev server and open browser

**Build & Deploy**
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

**Database**
- `bun run db:push` - Push schema changes to database
- `bun run db:migrate` - Run database migrations
- `bun run db:studio` - Open Drizzle Studio

**Storybook**
- `bun run storybook` - Start Storybook dev server
- `bun run build-storybook` - Build Storybook

## Features

- 🌐 Internationalization with Paraglide JS (English/Czech)
- 🗄️ PostgreSQL database with Drizzle ORM
- 🎨 TailwindCSS with forms and typography plugins
- 📚 Storybook for component development
- ✅ Comprehensive testing setup (Vitest + Playwright)
- 🔍 ESLint + Prettier for code quality
- 📱 Responsive design ready

## Project Structure

- `src/lib/server/` - Server-side utilities and database code
- `src/routes/` - SvelteKit routes and pages
- `src/stories/` - Storybook stories
- `messages/` - i18n message files
- `e2e/` - Playwright e2e tests

## Demo Routes

- `/demo/paraglide` - i18n demonstration with language switching
