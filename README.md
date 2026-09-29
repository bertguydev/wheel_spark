# SparkyWheel

A free online random decision wheel. This client-side prototype includes an SVG decision wheel and an editor for 2–20 options. Spin to choose an equally likely option using browser cryptographic randomness. Editing is locked during the animation; reduced-motion preferences skip the rotation. Options and an optional wheel title are saved locally in your browser. Untitled wheels work as before.

## GitHub repository and pushes

- Repository: [bertguydev/wheel_spark](https://github.com/bertguydev/wheel_spark)
- Git remote (`origin`): `https://github.com/bertguydev/wheel_spark.git`
- Default branch: `main`
- Production site: [SparkyWheel](https://sparkywheel.com/)

This is the existing repository for ongoing SparkyWheel development and frequent pushes. Use it for future project updates rather than creating another repository. When asked to push, use `main` unless a different branch or pull request workflow is requested.

Before committing, fetch the remote, review the diff, and preserve existing deployment configuration and unrelated changes. Stage only the intended files, run checks appropriate to the change, then commit and push without force. A successful GitHub push does not by itself verify a production deployment.

## Specialized tools

`/food-wheel` reuses `WheelExperience`, the editor, animation, and sharing controls. `src/lib/wheel-tools.ts` defines a small `WheelTool` configuration: an explicit stable storage key, default title/labels, and optional presets. Another tool needs its own configuration and server-rendered page with metadata and supporting content, not a copy of the wheel engine. Pass the configuration to `WheelExperience`; the restored session is keyed by storage key to keep tool state separate.

The homepage keeps `sparkywheel:wheel`, its original six defaults, and existing V1-to-V2 compatibility. Food uses `sparkywheel:wheel:food-wheel` and never copies or migrates homepage data. Loading, saving, and adopting shared wheels use the active tool's configuration. Existing callers without a configuration still use the homepage. Blocked storage and invalid drafts retain the existing fallback behavior.

Food starts with ten Dinner Ideas: Pizza, Tacos, Burgers, Pasta, Stir-fry, Curry, Burritos, Noodle soup, Baked potatoes, and Grain bowls. Takeout / Cuisines and Quick Meals provide alternative starting sets. Selecting a preset alone does not change the wheel. Use preset and Restore defaults apply immediately when the current title and ordered choices exactly match a built-in preset. Custom titles or choices require confirmation; Replace wheel replaces them, saves only this tool, clears any previous result/rotation, and adopts a shared session if present. Session option IDs do not affect preset matching. Cancel preserves the current wheel. Preset controls are disabled during a spin. Preset selection itself is not saved; the resulting wheel title and choices are.

Sharing keeps the current pathname, so Food links use `/food-wheel?wheel=...` with the unchanged V1 payload. Opening, spinning, or resharing does not overwrite either saved wheel. Editing or applying a preset adopts into Food storage only. Full page links between tools reload the destination's saved session. Food metadata and supporting content are static HTML, with share parameters excluded from the canonical.

For local review, run commands from the connected repository checkout. In the original Windows workspace this is `.seo-publish/`; the outer source copy is not the active implementation. Task B must not be pushed or deployed until explicitly requested. Before release, manually check phone editing and preset confirmation, native mobile sharing, saved state across both pages, and shared-wheel adoption. `npm run build` validates Next.js; Cloudflare runtime verification is separate.

## Local wheel data

The `sparkywheel:wheel` localStorage key stores `{ version: 2, title: string, options: string[] }`. Valid V1 records restore with an empty title and are saved as V2 after hydration, preserving option labels, order, and duplicates. Titles are trimmed when saved; blank titles remain optional. Missing V2 titles are treated as empty. Invalid data falls back to defaults, and storage restrictions do not prevent editing or spinning. Temporary invalid option edits retain the last usable saved wheel.

## Sharing

Share links use the current origin and page path with `?wheel=<data>`. The independent share schema is `{ v: 1, t: string, o: string[] }`: only the title and ordered option labels travel. JSON is encoded as UTF-8 and unpadded base64url using native platform APIs, with no new dependencies. Unicode, emoji, punctuation, duplicates and whitespace round-trip exactly. Session IDs are reconstructed; winners, rotation and other UI state are never shared. Generated links remove unrelated query parameters and fragments.

Incoming data must have share version 1, a string title of at most **200 UTF-16 code units**, and 2–20 nonblank string options. The encoded payload limit is **6,000 characters**, at most 4,500 bytes decoded. The raw query is also bounded at 7,024 characters before query percent-decoding. Malformed base64url, invalid UTF-8, bad JSON, duplicate wheel parameters and invalid schemas are rejected. Existing long local titles/options still work locally; sharing gives a clear message instead of silently truncating them.

After hydration, initialization uses **valid URL → valid localStorage → defaults**. A shared session never writes localStorage during viewing, spinning or resharing. Editing its title or an option, adding an option or deleting an option explicitly adopts it as a local wheel. Adoption removes only the `wheel` parameter using `history.replaceState`, preserving other parameters, the anchor and history state without reloading. The existing last-valid-save rule still applies while an option is temporarily blank. The home wordmark intentionally performs a full navigation to restore the saved local wheel. The homepage has no reset control; specialized tools with presets provide Restore defaults with confirmation for customized wheels.

Share invokes native Web Share from the click handler. If unavailable or blocked, it tries Clipboard API copying. Native cancellation returns quietly; successful copying announces “Link copied!” for three seconds in a reserved live-region area. If clipboard access fails, a focused, selected read-only link and a Copy link retry are shown inline. Configuration edits clear stale copy feedback/links. Share is secondary to Spin and disabled while spinning or while options are blank.

The homepage stays static with an absolute production canonical URL and fixed metadata. No server APIs, databases, accounts, analytics or public wheel discovery are added. Anyone with the URL can decode its configuration. Query data is naturally present in browser history and requests to the hosting origin; links are not described as private or secure. Before launch, verify the hosting provider's request-line limits and target apps' URL-length behavior: the defensive payload cap leaves room under common 8 KiB request limits but is not a promise that every app accepts long links. Confirm native share sheets on target mobile devices and production HTTPS clipboard permissions.

Sharing modules: `src/lib/wheel-sharing.ts` (payload/URL validation and encoding), `src/lib/wheel-session.ts` (source, adoption and persistence guard), `src/lib/share-actions.ts` (native/clipboard behavior), and `src/components/ShareControls.tsx` (accessible Share/Copy UI). `tests/wheel-sharing.test.mjs` covers these alongside the existing storage/migration and spin tests.

## Requirements

- Node.js 24 LTS or newer (the recommended major version is recorded in `.nvmrc`)
- npm 11 or newer (included with Node.js 24)

## Getting started

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Edit `src/app/page.tsx` to change the homepage.

## Checks and production

```bash
npm test
npm run lint
npm run typecheck
npm run build
npm start
```

`npm start` serves the production build after `npm run build`. The type check generates Next.js route types before checking TypeScript.

## Cloudflare Workers deployment

The repository includes an ES module Next.js configuration, the OpenNext adapter,
and Wrangler configuration. Install dependencies with `npm ci`.

For a Git-connected Cloudflare Worker, use `npm run build:cloudflare` as the build
command and `npx opennextjs-cloudflare deploy` as the deploy command, with the
repository root as the root directory. Use Node.js 24 or newer.

For a complete build and deploy from an authenticated terminal, run `npm run deploy`.
To build and preview locally in the Workers runtime, run `npm run preview`.

The configured Worker name is `wheel-spark`. If your existing Cloudflare Worker has
a different name, update both `name` and `services[0].service` in `wrangler.jsonc`
to match it. No R2 bucket is required by this app's current configuration.

Generated `.open-next` and `.wrangler` files and local `.dev.vars` secrets are
ignored by Git. See the [OpenNext setup guide](https://opennext.js.org/cloudflare/get-started).

## Structure and choices

- `src/app/page.tsx`: responsive homepage.
- `src/app/layout.tsx`: root layout, page title, and description.
- `src/app/globals.css`: Tailwind CSS, brand tokens, and reusable component styles.
- `tsconfig.json`: strict TypeScript and the `@/*` alias for `src/*`.
- `eslint.config.mjs`: Next.js Core Web Vitals and TypeScript rules.
- `postcss.config.mjs`: Tailwind's PostCSS integration.

Uses Next.js App Router, React, TypeScript, Tailwind CSS, ESLint, and npm. Direct dependencies are pinned and `package-lock.json` records the resolved dependency tree. No database, authentication, UI framework, or state-management library is included. Poppins is loaded with next/font/google and self-hosted by Next.js; the first build needs access to Google Fonts.

TypeScript 6.0.3 and ESLint 9.39.5 are the latest stable releases within the peer dependency ranges supported by the Next.js lint plugins at setup time. ESLint 10 and TypeScript 7 require those plugins to add compatibility first.

## Windows setup and installation troubleshooting

Install Node.js 24 LTS with its bundled npm before installing dependencies:

```powershell
winget install --id OpenJS.NodeJS.LTS --exact --source winget
```

Close and reopen your terminal after installation (restart your editor if it hosts the terminal), then check:

```powershell
node --version
npm --version
```

These should report Node.js 24 or newer and npm 11 or newer. If an older version still appears, use `where.exe node` and `where.exe npm` to find an outdated installation earlier in PATH.

Run `npm ci` and then `npm run dev` from the project folder. An error such as `Cannot read property 'next' of undefined` with npm 6 occurs because that npm version cannot read this project's version 3 lockfile. Upgrade Node.js and npm together; keep the committed lockfile. The message about removing `node_modules` is normal for a clean install.

The page composes WheelExperience, which owns client state and coordinates Wheel, WheelEditor, SpinButton, and ResultDisplay. Pure selection and rotation helpers live in src/lib/wheel.ts. Run npm test for rejection-sampling and pointer-alignment checks across every supported option count.

## Brand system

Brand colors, accessible action/feedback colors, spacing, radii, and shadows are centralized in `src/app/globals.css`. Shared button, panel, input, status, and wheel styles use those tokens. Poppins is configured in the root layout with four weights.

`Brand.tsx` supplies small decorative spark and status icons. `Mascot.tsx` has typed slots for approved future mascot states; see `public/mascots/README.md` for adding finalized artwork. No mascot artwork is fabricated or loaded from the reference sheet.

The editor is left of the wheel on desktop; mobile keeps the wheel first. Winner selection and rotation math remain in `src/lib/wheel.ts`. The result includes Spin again and a button that focuses the first option for editing. Darker coral is used for readable text and light-text action buttons; the supplied pastel coral remains on wheel segments and accents.

## Local UX polish

Shared secondary controls use warm peach fills, stronger borders, and hover, active, focus and disabled states. Save Wheel is the primary editor action on desktop and mobile; it retains the former Done editing navigation behavior and automatic persistence. The header Tools disclosure contains a crawlable Food Wheel link; the wordmark returns to the general wheel. No Share Result behavior is included.
