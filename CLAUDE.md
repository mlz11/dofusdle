# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # TypeScript check + Vite production build
npm run preview      # Preview production build locally
npm run lint         # Biome lint check
npm run lint:fix     # Auto-fix lint issues
npm run format       # Format all files with Biome
npm run test         # Run tests (Vitest)
npm run test:watch   # Run tests in watch mode
```

## Testing

- **Runner**: Vitest (`npm run test` / `npm run test:watch`)
- **Rule**: Never export functions solely for testing. Tests should exercise the public API only. Use techniques like creating new array references (`[...pool]`) to invalidate caches instead of exporting test-only reset helpers.
- **Structure**: One `describe` block per tested function or component.
- **Naming**: Test names must follow the form `"should ... when ..."`. The name alone should be enough to understand the assertion. Describe what the user sees or experiences, not code concepts like props, classes, or state (e.g., "should appear green when the attribute is correct" not "should apply correct status class when feedback status is correct").

### Component Tests

- **Library**: React Testing Library (`@testing-library/react`) + `@testing-library/jest-dom/vitest` + `@testing-library/user-event`
- **Environment**: Per-file `// @vitest-environment jsdom` comment (global environment stays `node`)
- **Location**: `__tests__/` directory next to the component (e.g., `src/components/DofusRetro/__tests__/HintPanel.test.tsx`)
- **Assertions**: Prefer `jest-dom` matchers over raw DOM checks:
  - `toBeVisible()` for all positive visibility assertions ("user can see this")
  - `not.toBeInTheDocument()` only when the element doesn't exist in the DOM at all (component returns `null`)
  - `toHaveTextContent()` for text inside an element already queried
  - Never use `toBeTruthy()` or `container.innerHTML` for DOM assertions
- **Queries**: Use user-facing queries (`getByText`, `getByRole`, `getByAltText`). Avoid `getByTestId` unless no semantic query fits. When the same text appears in multiple places, use `within()` to scope queries to a parent element instead of `getAllByText(...)[0]`.
- **Mindset**: Tests assert what the user experiences, not implementation details. Don't assert CSS class names, internal state, or callback references — assert visible text, presence/absence, and user interactions.
- **Async**: Prefer `findByText` / `findByRole` over `waitFor(() => expect(...))`. Wait for a user-visible DOM change, then assert synchronously.
- **Clipboard**: Don't mock `navigator.clipboard`. `userEvent.setup()` provides a built-in clipboard — verify content with `await navigator.clipboard.readText()`.
- **Fake timers + userEvent**: Use `vi.useFakeTimers({ shouldAdvanceTime: true })` and pass `advanceTimers: (ms) => vi.advanceTimersByTime(ms)` to `userEvent.setup()`. Create the user instance per-test via a `setupUser()` helper, not at module level.

## Code Style

- **Formatter**: Biome with tab indentation and double quotes for JS/TS
- **Linting**: Biome recommended rules (a11y `noStaticElementInteractions` disabled)
- **Exports**: Never export functions that are only used within the same file. Keep internal helpers unexported.
- **Dependencies**: Always use exact versions in package.json (no `^` or `~` prefixes).
- **Commits**: Conventional commits enforced via commitlint (`feat:`, `fix:`, `build:`, etc.)
- **Git hooks**: Pre-commit runs `npm run lint`; commit-msg validates conventional commit format

## Architecture

Dofusdle is a client-side Wordle-style daily guessing game for Dofus Retro 1.29 monsters. No backend — fully static Vite + React 19 SPA.

### Core Data Flow

1. **Daily monster selection** (`src/utils/daily.ts`): Deterministic hash of today's date selects a monster from `src/data/monsters.json`. Same monster for all players each day.
2. **Guess comparison** (`src/utils/compare.ts`): Each guess produces feedback on 5 attributes (ecosystem, race, niveau max, couleur, pv max) with statuses: correct/partial/wrong and directional arrows for numeric fields. Race comparison uses ecosystem grouping for partial matches. Only max values are displayed and compared for niveau and pv. Numeric thresholds for partial: niveau ±10, pv ±20%.
3. **Persistence** (`src/utils/storage.ts`): Daily progress and cumulative stats stored in localStorage (`dofusdle-progress`, `dofusdle-stats`). Progress auto-clears when the date changes.

### Component Structure

`Game.tsx` is the main orchestrator under `src/components/DofusRetro/`. It owns all game state (guesses, win status, stats) and delegates to:
- `SearchBar` — autocomplete input with keyboard navigation
- `GuessGrid` → `GuessRow` → `AttributeCell` — renders guess results with flip animations
- `Victory` — win modal with stats and emoji share

Components are organized under `src/components/DofusRetro/` to allow future game modes for other Ankama titles (each would get its own directory).

### Key Types (`src/types.ts`)

- `Monster` — id, name, type, zone, niveau, couleur, pv, image?
- `GuessResult` — monster + feedback map of `AttributeFeedback` (value, status, arrow)
- `GameStats` / `DailyProgress` — localStorage-persisted structures
