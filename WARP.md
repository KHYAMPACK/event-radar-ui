# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project overview

This is a Vite + React single-page application implementing the "Dark Themed Mobile UI" Figma design. The UI is optimized for a mobile viewport and themed via Tailwind CSS v4 with a custom dark/light design system.

Key entrypoints:
- `index.html` – standard Vite HTML shell mounting React at `#root` and loading `/src/main.tsx`.
- `src/main.tsx` – creates the React root, wraps `<App />` in a `BrowserRouter` from `react-router-dom`, and imports the global Tailwind build from `src/index.css`.
- `src/App.tsx` – central application shell that:
  - Uses React Router (`Routes`/`Route`) to define real URLs: `/` (home/onboarding), `/event/:eventId`, `/calendar`, `/clubs`, `/profile`, and `/create`.
  - Holds user state (saved events, followed clubs, notification preferences, dark mode, onboarding completion) and persists it to `localStorage` under `eventRadarData`.
  - Wires mock data from `src/data/*` into the various screens.
  - Hosts the global `NotificationDrawer` overlay.

The app is conceptually a mobile event discovery product ("Event Radar") with onboarding, home feed, event details, calendar, club discovery, profile, and saved/follow states.

## Commands

All commands below assume you run them from the project root (this directory, containing `package.json` and `vite.config.ts`).

- **Install dependencies**
  - `npm install`

- **Start development server** (Vite dev server, opens browser on port 3000 per `vite.config.ts`):
  - `npm run dev`

- **Build for production** (outputs to `build/` per `vite.config.ts`):
  - `npm run build`

- **Preview production build** (serves the contents of `build/`):
  - `npm run preview`

- **Type-check TypeScript** (no emit; uses `tsconfig.json`):
  - `npm run typecheck`

- **Tests and linting**
  - There are currently no `test`, `lint`, or similar scripts defined in `package.json`. If you add them, update this section with the exact commands, including how to run a single test.

## Architecture and structure

### Application state and navigation

- **Navigation model**
  - The `Screen` union in `src/types.ts` still models high-level screens, but routing is now handled by React Router.
  - `App.tsx` defines URL routes with `Routes`/`Route`:
    - `/` – onboarding on first visit, then the Home feed once onboarding is completed.
    - `/event/:eventId` – event detail screen; events are resolved by ID from `mockEvents`.
    - `/calendar` – calendar view of saved events.
    - `/clubs` – club discovery view.
    - `/profile` – profile and settings.
    - `/create` – placeholder screen for future event creation.
  - Bottom navigation is implemented by `src/components/BottomNav.tsx`, but navigation is now driven by `useNavigate` in `App.tsx`, which maps `Screen` values to URL paths.

- **Global state in `App.tsx`**
  - Event-level state:
    - `savedEventIds: Set<string>` – IDs of events the user has saved.
  - Club-level state:
    - `followedClubIds: Set<string>` – IDs of clubs the user follows.
    - `clubNotifications: Map<string, boolean>` – per-club notification toggle.
  - Notification center state:
    - `notifications: Notification[]` – notification items loaded from `src/data/mockNotifications.ts`.
    - `showNotifications: boolean` – whether the `NotificationDrawer` overlay is visible.
  - UI state:
    - `darkMode: boolean` – toggles between dark and light visual themes and is passed into most screen components.
    - `hasCompletedOnboarding: boolean` – tracks whether to show the onboarding screen or the Home feed at `/`.
    - `clubFilterId?: string` – used to filter the home feed when navigating from club-related contexts (e.g. from `/clubs`).

- **Persistence**
  - On mount, `App` reads `localStorage.getItem('eventRadarData')` and rehydrates `savedEventIds`, `followedClubIds`, `clubNotifications`, `notifications`, `darkMode`, and `hasCompletedOnboarding`.
  - On changes to these slices, `useEffect` serializes them back into `localStorage`. Future code that modifies those states should go through the existing setter functions so persistence stays consistent.

### Screens and data flow

- **Home screen (`src/components/HomeScreen.tsx`)**
  - Receives `events`, `clubs`, sets of followed/saved IDs, notification counts, and callbacks from `App`.
  - Provides search and club-filter chips, using `selectedClubFilter` and `searchQuery` to derive `filteredEvents`, then sorts them according to a `SortOption` (`'date' | 'popular' | 'recent'`) via the `SortSheet` component.
  - Renders each event via `EventCard`, passing `onClick` to navigate to details and `onToggleSave` to toggle saved state.
  - Integrates `ClubModal` for club-specific actions and `BottomNav` for global navigation.

- **Event detail (`src/components/EventDetailScreen.tsx`)**
  - Takes a single `event`, its `club`, and a list of related events (computed in `App` via `getRelatedEvents`).
  - Provides back navigation (`onBack`) and a `onToggleSave` handler wired to `App`’s `handleToggleSaveEvent`.

- **Calendar and saved views**
  - `CalendarScreen` works off `savedEvents` (computed in `App` from `savedEventIds`) and `clubs` to show events in a calendar-like layout.
  - `DiscoverClubsScreen` and `ProfileScreen` share the club-following state and `clubNotifications` map, but target different user flows (discover vs. manage profile and preferences).

- **Onboarding and placeholders**
  - `OnboardingScreen` is the initial `currentScreen` and transitions to `'home'` when the user continues.
  - `PlaceholderScreen` backs non-implemented routes like `'create'`, allowing the UI to remain visually complete while keeping logic simple.

### Data, types, and utilities

- **Static data**
  - `src/data/mockEvents.ts` – seed event data including club IDs, date/time, and metadata used across the app.
  - `src/data/mockClubs.ts` – club definitions with `id`, `name`, `logo`, color, and descriptive fields used in filters and club chips/modals.
  - `src/data/mockNotifications.ts` – synthetic notifications referencing `eventId` and/or `clubId` to drive the notification drawer.

- **Types**
  - `src/types.ts` – core app-level types: `Screen`, `Event`, `Club`, and `Notification`.
  - `src/types/index.ts` (if referenced) re-exports or augments these types for more ergonomic imports.

- **Utilities**
  - `src/utils/dateUtils.ts` – date formatting and calendar helper functions used by components like `CalendarGrid` and `CalendarScreen`.

### UI components and styling

- **Design system and theming**
  - Tailwind CSS v4 is compiled into `src/index.css`, which contains theme variables (e.g. `--color-dark-900`, `--color-neon-blue`) and a large set of utility classes.
  - Additional theme tokens and base styles are defined in `src/styles/globals.css` using `@import "tailwindcss";` and `@theme` custom properties.
  - Components switch between dark and light variants using the `darkMode` boolean passed from `App` (e.g. toggling between `bg-dark-*` and `bg-light-*` class combinations).

- **UI primitives (`src/components/ui`)**
  - Contains shadcn-style abstractions for Radix UI primitives and common controls (accordion, dialogs, drawers, inputs, selects, tabs, etc.).
  - These components are wired via Vite aliases defined in `vite.config.ts` and are used throughout higher-level screens for consistent behavior and styling.

- **Layout components**
  - `BottomNav.tsx` – fixed bottom navigation bar controlling `Screen` state.
  - `NotificationDrawer.tsx`, `DayEventsSheet.tsx`, `SortSheet.tsx`, `ClubModal.tsx`, `CalendarGrid.tsx`, etc. – encapsulate specific interaction patterns (drawers, sheets, modals) over the base design system.

### Tooling configuration

- **Vite (`vite.config.ts`)**
  - Uses `@vitejs/plugin-react-swc` for React with SWC-based transforms.
  - Configures module resolution:
    - An alias `@` -> `./src` is available for absolute-style imports.
    - A set of aliases maps version-suffixed package names (e.g. `lucide-react@0.487.0`, `@radix-ui/...@x.y.z`) back to their actual package names so the Figma-exported imports compile without modification.
  - Sets `build.outDir` to `build` and dev server options (`port: 3000`, `open: true`).

- **TypeScript (`tsconfig.json`)**
  - Strict-ish configuration targeting ESNext with bundler-style module resolution and `jsx: "react-jsx"`.
  - `npm run typecheck` runs `tsc --noEmit` against the `src/` tree.

## Notes for future changes

- Preserve the `App.tsx` responsibility split: treat it as the central state owner and routing hub, and keep screens mostly presentational with callbacks up to `App`.
- When adding new screens, extend the `Screen` union in `src/types.ts` (if you still use it for navigation metadata), add a new `Route` in `App.tsx`, and wire the screen into `BottomNav` if it should be reachable from the bottom bar.
- If you introduce real APIs or backends, replace the `src/data/mock*` modules with data-fetching layers but keep the types in `src/types.ts` as the source of truth for event/club/notification shapes.
