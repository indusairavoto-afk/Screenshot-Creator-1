# ScreenCraft — App Store Screenshot Creator

A browser-based tool for designing and exporting App Store and Google Play screenshot decks. Supports iPhone, iPad, Android phone, Android tablets, and Feature Graphic banners.

## Run & Operate

- `pnpm --filter @workspace/screenshot-editor run dev` — run the screenshot editor (port 3000)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- Required env: `AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY` — for AI headline suggestions and translation

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- **Screenshot Editor**: Next.js 15 (App Router), Tailwind CSS, shadcn/ui
- **API Server**: Express 5
- **DB**: PostgreSQL + Drizzle ORM (not used by screenshot editor)
- AI: Replit AI Integrations (OpenAI) — headline suggestions, multi-locale translation
- Export: html-to-image + JSZip

## Where things live

- `artifacts/screenshot-editor/` — Next.js app (main product)
  - `src/app/` — Next.js App Router pages and API routes
  - `src/components/editor/` — canvas, toolbar, sidebar, inspector, device frames
  - `src/lib/` — types, constants, defaults, storage, locale utilities
  - `public/` — static assets (mockup.png, favicon)
  - `app-store-screenshots.json` — auto-saved project state (git-trackable)
- `artifacts/api-server/` — Express 5 API (health check, unused by screenshot editor)
- `lib/api-spec/openapi.yaml` — OpenAPI spec source of truth

## Architecture decisions

- Project state is stored in localStorage (fast) + `/api/project` file (git-trackable). File wins on hydration.
- Screenshots uploaded via `/api/upload` are stored in `public/screenshots/uploaded/` as content-addressed SHA1-named files.
- html-to-image is used for PNG export; images are pre-cached as base64 data URIs to avoid export race conditions.
- Canvas dimensions match the largest required export size per device; display scaling is CSS-only.
- Per-device slide decks: switching between iPhone/iPad/Android preserves each deck independently.

## Product

- Design multi-slide screenshot decks for iOS and Android app stores
- 7 slide layouts: hero, device-bottom, device-top, two-devices, no-device, split-landscape, feature-graphic
- 10 built-in themes + custom gradient per slide
- 9 background patterns (mesh, grain, glass, blobs, grid, glow, paper, depth)
- Drag-and-drop screenshot upload; device frames for iPhone, iPad, Android phone/tablet
- Zoom callout bubbles for highlighting UI details
- AI headline suggestions and multi-locale translation (20+ languages)
- One-click bulk PNG export (all required App Store / Google Play sizes)
- Undo/redo (50 steps), auto-save every 600ms

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The screenshot editor is a Next.js app; it does NOT use the shared OpenAPI/codegen workflow
- AI features require `AI_INTEGRATIONS_OPENAI_BASE_URL` + `AI_INTEGRATIONS_OPENAI_API_KEY` env vars
- The `app-store-screenshots.json` file in `artifacts/screenshot-editor/` stores the live project — commit it to track work
- Uploaded screenshots go to `artifacts/screenshot-editor/public/screenshots/uploaded/`
- Never run `pnpm dev` at the workspace root — use the workflow

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
