# Changelog

Each `## <version>` section becomes the `changelog` field of `bundle.json` when that version is published.

## 0.4.3

- Hydra 4.4.0 is listed, so `revamp update` installs it without `--force`. Hydra 4.4.0 ships minified UI code and an obfuscated main process, so the patches now find the same places by their shape instead of by Hydra's own names and strings. Every patch applies to 4.1.6, 4.2.0 and 4.4.0. Hydra 4.3.0 is not listed.
- The Steam data for the More like this rows now reaches the UI as its own `window.revampSteam` object instead of extra functions on Hydra's `window.electron`.

## 0.4.2

- Hydra 4.2.0 and Heroic 2.22.4 are listed, so `revamp update` installs them without `--force`. Every patch applies to both unchanged. Hydra 4.1.6 and Heroic 2.22.3 stay listed.

## 0.4.1

- The official patches moved to their own repo, xb00tt/revamp-patches, which Revamp 0.3.0 adds as its default source. The patches are the same as in 0.4.0.

## 0.4.0

- Hydra 4.1.6: **More like this (Steam)**. A row with Steam's own recommendations for the game, the tags each shares with it and an "Already in library" badge.
- Hydra 4.1.6: **More like this (Revamped)** replaces **More like this ranking**. It matches Hydra's catalogue on the game's Steam tags only (no longer padded with Hydra's own list), tries looser 3- and 2-tag searches for niche games, and skips Roguelike and Roguelite, which Hydra's search never matches.
- With either one, Hydra's own row stays as "More like this (Original)", and Settings → Content & gameplay gets a checkbox for each row.

## 0.3.0

- Hydra 4.1.6: **More like this ranking**. The game page's "More like this" ranks games by shared Steam tags, shows the shared tags and an "Already in library" badge, and caches results for the session.

## 0.2.0

- Hydra 4.1.6: **Recently added sort**, and the Hydra locale strings the sorts need.
- Heroic 2.22.3: **Hide Deals link**.

## 0.1.0

- Hydra 4.1.6: **Disable self-update**, **Side-by-side identity** and **Recently downloaded sort**.
