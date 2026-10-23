# Zakazi.me

Zakazi.me lets clients book appointments at hair salons, gyms and service shops by picking a free
time slot, and lets business owners publish and manage those slots.

## Theme
Full design in @frontend/DESIGN.md; tokens in `frontend/src/index.css`.
- Tone: simple, modern, professional, after Apple's HIG and WWDC fluid-motion talks
- Light mode: grouped gray page (`#F2F2F7`) with white content groups and a red primary
  (`#D70015`); dark mode (`.dark` on `<html>`): black page, `#1C1C1E` groups. Red is the only accent.
- Glass (`glass` utility) only on floating chrome: top bar, phone tab bar, sheet, menus, dialogs
- Font: system font (SF Pro) with Inter as fallback, `tabular-nums` for times and prices
- Shape: 12 px radius, 20 px content groups, capsule buttons; shadows only on floating layers
- Users: clients and business owners, 18–45, on every device (check 375 px and 1440 px)

This is a monorepo: one repository for the whole app.
- `frontend/`: React app (Workshop 3). Details in @frontend/CLAUDE.md
- `backend/`: API, database and auth (next workshop)
- `docs/entities.md`: entities and the API contract shared by frontend and backend

## Language
All code, identifiers, comments, commit messages, docs and UI copy are in English.
You may talk to me in any language.

## Commands (run from the repo root)
- `pnpm install`: installs dependencies for every package in the workspace
- `pnpm dev`: frontend dev server at http://localhost:5173
- `pnpm typecheck`: TypeScript check
- `pnpm lint`: oxlint and the boundary check between features
- `pnpm build`: production build
- `pnpm format`: Prettier formats `frontend/src/`

## Working in the monorepo
- One change that touches frontend and backend goes in one commit or pull request
- When an entity changes, update `docs/entities.md` in the same change
- Run commands from the root; scripts are forwarded with `pnpm --filter <package>`
