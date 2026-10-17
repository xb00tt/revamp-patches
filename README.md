# revamp-patches

The official patches for [Revamp](https://github.com/xb00tt/revamp), the tool that installs "Hydra (Revamped)" and "Heroic (Revamped)" next to the stock Linux apps from their official releases.

Revamp adds this repo as its default source, so there is nothing to set up: `revamp check` sees each new release here, and `revamp update` applies it. If you removed the default, add it back with

```
revamp sources add xb00tt/revamp-patches
```

Each release is the GitHub release `bundle-v<version>` (`official.mjs`, the bundle, and `patches.json`, what it holds), and the root `bundle.json` points at the current one. [CHANGELOG.md](CHANGELOG.md) says what changed in each version.

## The patches

| Patch | App | What it does |
|---|---|---|
| Disable self-update | Hydra, Heroic (required) | Turns off the app's built-in updater, so it never installs releases over the stock app; Revamp handles updates instead. |
| Side-by-side identity | Hydra, Heroic (required) | Gives the patched copy its own menu name and window class, so it doesn't merge with the stock app in menus and panels. Option `claimLinks`: off keeps app links opening the stock app. |
| Use the bundled UI | Hydra 4.1.6 | Loads the UI that ships inside the release (the one Revamp patches) instead of the copy on Hydra's website. Every Hydra UI patch depends on it. |
| Recently added sort | Hydra 4.1.6 | Adds "Recently added" (newest first) to the library and sidebar sort menus. |
| Recently downloaded sort | Hydra 4.1.6 | Adds "Recently downloaded" (newest download first) to the library and sidebar sort menus. |
| More like this (Revamped) | Hydra 4.1.6 | Adds a row to a game's page with Hydra's catalogue matched on the game's Steam tags, the shared tags and an "Already in library" badge. |
| More like this (Steam) | Hydra 4.1.6 | Adds a row to a game's page with Steam's own recommendations, the tags each shares with the game and an "Already in library" badge. |
| Hide Deals link | Heroic 2.22.3 | Removes the Deals link from Heroic's sidebar. |

The two "More like this" rows each get a checkbox in Settings → Content & gameplay, and Hydra's own row stays as "More like this (Original)". Internal patches (Hydra locales, the extension loader, the registry hooks, the Steam bridge) carry the ones above and don't show in `revamp patches`.

## Developing

Node 26 is required (`.npmrc` has `engine-strict=true`).

```
npm ci
npm test                                                  # unit tests on trimmed excerpts of the real builds
npm run build                                             # dist/official.mjs, patches.json and bundle.json
npm run revamp -- patch hydra --dry-run --bundle dist/official.mjs   # the patches against the real release, nothing installed
npm run test:integration                                  # patches the real releases into temp homes
```

The engine (`@revamp-app/sdk`, `@revamp-app/engine` and `@revamp-app/cli`) comes from npm, published from [xb00tt/revamp](https://github.com/xb00tt/revamp), and is pinned to one exact version here. Revamp's design specs describe the patch model; [CLAUDE.md](CLAUDE.md) has the working notes.

## License

[GPL-3.0-only](LICENSE).
