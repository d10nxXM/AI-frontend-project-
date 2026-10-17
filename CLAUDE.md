# Zakazi.me

Zakazi.me lets clients book appointments at hair salons, gyms and service shops by picking a free
time slot, and lets business owners publish and manage those slots.

## Theme
Full design in @frontend/DESIGN.md; tokens in `frontend/src/index.css`.
- Tone: simple, modern, professional
- Light mode: white background with crimson red primary; dark mode (`.dark` on `<html>`):
  near-black background with a lighter red primary. Grays are neutral; red is the only accent.
- Font: Inter only, `tabular-nums` for times and prices
- Shape: 8 px radius, thin borders, shadows only on dialogs, dropdowns and popovers
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
