## R-Meth – Copilot (AI Agent) Instructions

Short, targeted guidance to help AI agents contribute safely and productively.

Quick start

- Install & run locally: `npm install` then `npm run dev` (Vite server on :3000).
- Build/preview: `npm run build` and `npm run preview`.

Core files / responsibilities

- `constants.ts` — single source of content (RECON_DATA). Edit this for new recon items.
- `types.ts` — `ContentType` and `ReconItem/ReconSection` shapes. Use these types when adding items.
- `components/CodeBlock.tsx` — terminal UI and template processing. Key functions: `getProcessedCode()` and `TerminalEmulator`.
- `components/CodeBlock.tsx` — terminal UI and template processing. Key functions: `getProcessedCode()` and `TerminalEmulator`. Note: Copy now writes the processed template value (tokens expanded) by default; a "Copy Raw" button is also available.
- `ThemeContext.tsx` — local theme toggle (dark/light) persisted to localStorage. The header in `App.tsx` contains a small toggle for convenience.
- `WebContainerContext.tsx` — boots the in-browser WebContainer and requires cross-origin isolation.
- `scripts/validate-constants.js` — runs validations on `constants.ts` using the TypeScript AST and is run by `npm run validate`.
- Husky (`.husky/`) and `lint-staged` — pre-commit hook configured to run `npm run validate`. Run `npm install` to prepare husky hooks locally.
- `tests/` — Vitest + Testing Library unit tests; run with `npm test`.

Data & template conventions

- Use placeholder tokens in commands: `target.com`, `ASXXXXX`, `Target Org`. `CodeBlock` replaces these using `ReconContext`.
- `ContentType.COMMAND` expects a string command; set `meta.language` (e.g., `bash`, `graphql`, `javascript`).
- Keep `id` unique per item — they're used as DOM node ids and keys.

WebContainer & COOP/COEP

- The dev server sets COOP/COEP on HTML requests (`vite.config.ts`) to enable `WebContainer.boot()`.
- The middleware avoids setting headers on WS upgrades (HMR). If WebContainer fails to boot, check browser console and the response headers for `Cross-Origin-Opener-Policy` / `Cross-Origin-Embedder-Policy`.

Adding content (quick example)

- Bash command item:
  {
  id: 'rs-21',
  title: 'New Step',
  type: ContentType.COMMAND,
  content: `curl -s https://example.com | jq .`,
  meta: { language: 'bash' }
  }

Best practices & PR guidance

- Keep PRs focused: content updates vs UI/logic changes should be separate.
- Avoid embedding secrets in `constants.ts` or code. Use env vars and do not commit `.env.local`.
- Verify changes with `npm run dev`; test terminal copy & run flows, and preview HMR behavior.
- Run validations and tests locally before opening PRs:
  - `npm run validate`
  - `npm test`

Troubleshooting

- If terminal errors show: `WebContainer not ready`: verify cross-origin isolation and check the Vite middleware logs in the console.
- Use `vite.config.ts` server logs to diagnose header issues; disable COOP/COEP only if HMR breaks, then test build/preview flows.

If anything in this file is unclear or you want an additional rule (e.g., a linter or pre-commit check for unique IDs), ask and I'll add a small validation script and a test step.
