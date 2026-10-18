# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

revamp-patches is the official bundle for [Revamp](https://github.com/xb00tt/revamp) ("Revamp official"): the patches for Hydra and Heroic that Revamp applies to a release's `app.asar`. Revamp adds this repo as its default source, so a release here reaches every Revamp user on their next `revamp check`. The engine does the work: the dev dependencies `@revamp-app/sdk`, `@revamp-app/engine` and `@revamp-app/cli` come from npm (published from xb00tt/revamp), pinned to one exact version.

**Source of truth for the patch model:** Revamp's specs, in that repo: `docs/superpowers/specs/2026-10-14-revamp-v1-design.md` (§5 patch model, §6 extensions, §10 the patches this bundle holds) and `docs/superpowers/specs/2026-10-16-more-like-this-rows-design.md` (the Hydra "More like this" rows). Code comments citing `spec §…` mean the v1 spec. The patch-specific plans (M1 to M5) stay in Revamp as history.

## Commands

Node 26 (`~/.local/node26`) is installed per-user only; every command needs it first (`.npmrc` has `engine-strict=true`):

```bash
export PATH="$HOME/.local/node26/bin:$PATH"
npm test                                    # all unit tests (node --test, TS runs natively, no network)
npm run typecheck                           # two tsc --noEmit projects: the repo and the TSX extension
node --test test/patches.test.ts                                   # one test file
node --test --test-name-pattern='claimLinks' test/patches.test.ts  # one test
npm run build                               # scripts/build.ts: the extensions, then dist/official.mjs, patches.json, bundle.json
npm run test:integration                    # builds the bundle, then patches the REAL releases into temp homes
npm run revamp -- patches hydra --bundle dist/official.mjs   # the npm-installed CLI; also patch <app> [--version v --force]
                                            #   [--enable/--disable "<patch>"] [--option "<patch>:<key>=<value>"] [--dry-run]
npm run release                             # owner only: GitHub release bundle-v<version>, then commits bundle.json
```

- Always pass `--bundle dist/official.mjs` while developing. Without it the CLI uses the bundle pinned by the user's sources (and on a fresh home first seeds the default source, this repo's released `bundle.json`), so a rebuild changes nothing.
- The integration tests use `dist/official.mjs` directly; `npm run test:integration` rebuilds it first.
- The integration tests (`REVAMP_INTEGRATION=1`) reuse the real download cache `~/.cache/revamp/releases`: Hydra 4.1.6 and 4.2.0, Heroic 2.22.3 and 2.22.4, and Hydra 4.0.6 forced as the deliberate mismatch. Without the cache that is about 740 MB of downloads. With it, a run takes about two minutes.
- Passing tests install nothing for the owner: integration runs use temp homes.
- The forced Hydra 4.0.6 test calls api.github.com unauthenticated (60 requests/hour); HTTP 403 there means wait and rerun.
- Inspect a real build in a scratch dir: `dpkg-deb --fsys-tarfile <cached .deb> | tar -x`, then `extractFile` from `@electron/asar` (repo node_modules). Never eval app code; parse with acorn or regex.
- Unit tests must not touch the network or the real home. Use temp dirs, local HTTP servers on port 0, or a stub `fetch`.
- CI (`.github/workflows/ci.yml`, Revamp's spec §7.4) runs the typecheck, the unit tests and the build, then dry-runs every app version in `patches.json` against the real release, cached per app and version. `npm ci` (npm 11, locally and on GitHub) prints `npm warn install-scripts … esbuild (postinstall: node install.js)`; the build still works through esbuild's optional platform package, so that warning is expected noise.

## The engine

- The three `@revamp-app` packages share one version, pinned exactly (no `^`). Taking a new engine: `npm install -D -E @revamp-app/sdk@<v> @revamp-app/engine@<v> @revamp-app/cli@<v>`, then commit `package.json` and `package-lock.json` together (CI checks that commit). Raise `minEngine` in `src/index.ts` only when a patch needs something the new engine added: it is the oldest engine that can run the bundle, not the one it was built with.
- Trying an unpublished engine from a Revamp checkout next to this one: `npm install --no-save ../revamp/packages/sdk ../revamp/packages/engine ../revamp/packages/cli`. npm links the folders, so their TypeScript runs directly. `npm ci` returns to the pinned npm versions.

## Releases

A bundle release is `npm run release`, by the owner, by hand:
1. Raise `manifest.version` in `src/index.ts` and add a `## <version>` section to `CHANGELOG.md`: it becomes the release notes and the `changelog` field of `bundle.json`, and a unit test fails without it.
2. Commit and push: the script refuses a dirty tree or an unpushed commit, because the release tags the commit GitHub must already have.
3. `npm run release` builds, creates the GitHub release `bundle-v<version>` with `official.mjs` and `patches.json`, and commits the root `bundle.json` that GitHub sources read.
4. `git push`: Revamp reads `bundle.json` from the default branch, so the release is live only once that commit is up.

## Architecture (the parts that span files)

**Bundle format.** `npm run build` makes one self-contained ESM file, `dist/official.mjs`, with no imports and no top-level `await`. Revamp's runner loads it with `createRequire(bundle)(bundle)` (require(esm)) inside a sandboxed child, so bundle code never runs in Revamp's parent process. `src/index.ts` exports `manifest`, `apps` and `patches`; `scripts/build.ts` then runs the built file through the engine's `describe` to write `patches.json`.

**Extensions (spec §6, M3).** New UI ships as an extension: `src/hydra/extension/` (its own tsconfig with JSX and DOM types). Node tests may import its plain `.ts` files but never a `.tsx` file or anything that imports one, because Node can't strip JSX.
- `scripts/build.ts` compiles it with esbuild into a string and embeds it in the bundle through `define` (`__REVAMP_HYDRA_EXTENSION__`). Unit tests import bundle sources directly and get a placeholder.
- A second esbuild output, the Steam bridge (`__REVAMP_HYDRA_STEAM_BRIDGE__`), runs in Hydra's main process.
- The internal "Hydra extension loader" patch adds it as `out/renderer/assets/revamp-hydra.js`, loaded before Hydra's module script.
- Registry patches (`src/hydra/registry.ts`) capture Hydra internals from the stock code that uses them. Each name is `resolve()`-checked as top-level, and they are assigned to `globalThis.__revamp.registry` just before the root render call.
- Extension code reaches them only at call time through `@revamp-app/sdk/shims/*` and the extension's `app.ts`, because the extension loads before Hydra's module runs.
- A feature patch routes a stock component through `mount()`: the extension's replacement renders inside an error boundary that falls back to the stock component.
- `test/extension.test.ts` builds the extension and renders it with real React 18.3.1 (Hydra's version) through `react-test-renderer`.

**Fingerprinting rules learned on real releases:**
- Anchor on behavior strings (case labels, i18n keys, route paths), never on minified or `$1`-suffixed names.
- Never identify a language by translated text ("Most played" appears in 23 Hydra locales). Hydra locales walks `resources` → locale → `library` namespace with `resolve()`.
- Hydra's main process has its own copy of the translations, hence the `where: in the renderer` check.
- Hydra release builds load their UI from the web unless the "Use the bundled UI" patch applies, so every Hydra renderer patch depends on it.
- Test fixtures (`test/fixtures/<app>-<version>/`) are trimmed excerpts of the real built files, decoys included.

## Constraints

- TypeScript is run by type stripping. Erasable syntax only: no `enum`, `namespace`, constructor parameter properties or `import x = require()`. Use `import type`, and include `.ts` in relative imports.
- A production server runs on port 3000 on this machine: never listen on or connect to it. Never read or modify `/opt/Hydra` or `/opt/Heroic`.
- The git identity (xb00tt) lives in this repo's `.git/config`, not globally: a scratch `git clone` needs `git config user.name/user.email` before it can commit.
- Commits: conventional (`feat:`, `fix:`, `test:`, `docs:`), ending with the trailer `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- The owner (xb00tt) prefers plain-language explanations and docs that describe what is true now.
