import { definePatch, fingerprint, type Capture, type Match, type PatchContext } from "@revamp-app/sdk";

/**
 * Hydra's root render call, the last statement of the renderer module. Registry entries are assigned just before
 * it: every top-level binding is initialized there, and nothing has rendered yet.
 */
export const rootRender = fingerprint({
  name: "renderer root render",
  strings: ['createRoot(document.getElementById("root"))'],
  pattern: '$DOM.createRoot(document.getElementById("root")).render($$$);',
});

/**
 * A top-level name, a property path on one, or a top-level name bound by destructuring (resolve() can't follow
 * those; the root render is the module's last statement, so every top-level binding is initialized by then).
 */
type Entry = Capture | { of: Capture; path: string } | { destructured: Capture };

/** Adds app internals to globalThis.__revamp.registry. Each must start from a top-level binding of the same file. */
function register(ctx: PatchContext, entries: Record<string, Entry>) {
  const render = ctx.match(rootRender);
  const values: string[] = [];
  for (const [name, entry] of Object.entries(entries)) {
    const binding = "of" in entry ? entry.of : "destructured" in entry ? entry.destructured : entry;
    if (binding.file !== render.file) throw new Error(`registry entry ${name} is in ${binding.file}, not in ${render.file}`);
    // Declared at the top level (resolve() throws otherwise) and before the root render, so it exists when this runs.
    if (!("destructured" in entry) && binding.resolve().start > render.start) {
      throw new Error(`registry entry ${name} (${binding}) is declared after the root render`);
    }
    values.push(`${name}: ${"of" in entry ? `${entry.of}.${entry.path}` : binding}`);
  }
  render.insertBefore(`Object.assign((globalThis.__revamp ??= { registry: {}, mounts: {} }).registry, { ${values.join(", ")} });`);
}

/**
 * The match of `pattern` inside `scope` that initializes `name` (`name = <match>`). Minified builds join a
 * function's declarations with commas, which a pattern can't express, so this reads the text before each match.
 */
function initializerOf(scope: Match, name: string, pattern: string): Match {
  const declares = new RegExp(`(?:^|[^\\w$])${name.replace(/\$/g, "\\$")}\\s*=\\s*$`);
  const hits = scope.findAll(pattern).filter((m) => declares.test(scope.text.slice(0, m.start - scope.start)));
  if (hits.length !== 1) throw new Error(`${scope.file}:${scope.line}: ${hits.length} matches of ${pattern} initialize ${name}, expected 1`);
  return hits[0];
}

/** Stock "More like this" on the game page: everything it renders with is captured from it. */
export const similarGamesComponent = fingerprint({
  name: "stock SimilarGames component",
  strings: ['"similar-games__card"', '"game_details"'],
  pattern: "function $SIMILAR_GAMES({ objectId: $OBJECT_ID, shop: $SHOP }) { $$$ }",
  where: { "renders the similar games cards": (m) => m.text.includes('"similar-games__card"') },
});

export const similarGamesSkeleton = fingerprint({
  name: "stock SimilarGames skeleton",
  strings: ['"similar-games__skeleton"'],
  pattern: '$JSX.jsx($SKELETON, { className: "similar-games__skeleton" })',
});

/** Internal "registry: game page": React, the JSX runtime and the UI the stock section is built from. */
export const registerGamePage = definePatch({
  description: "registry: game page",
  execute(ctx) {
    const section = ctx.match(similarGamesComponent);
    const card = section.find('$JSX.jsx($CARD, { className: "similar-games__card" })');
    const open = card.find("() => $NAVIGATE($PATH($GAME))"); // the card's onClick
    const control = (side: string) =>
      section.find(`({ className: "similar-games__control similar-games__control--${side}", children: $JSX.jsx($ICON, { size: 36 }) })`).$ICON;
    register(ctx, {
      React: section.find("$REACT.useCallback($$$)").$REACT,
      jsxRuntime: card.$JSX,
      useNavigate: initializerOf(section, `${open.$NAVIGATE}`, "$USE_NAVIGATE()").$USE_NAVIGATE,
      useTranslation: section.find('$USE_TRANSLATION("game_details")').$USE_TRANSLATION,
      useEmblaCarousel: section.find('$EMBLA({ align: "start" })').$EMBLA,
      VerticalCoverCard: card.$CARD,
      buildGameDetailsPath: open.$PATH,
      ChevronLeftIcon: control("previous"),
      ChevronRightIcon: control("next"),
      Skeleton: ctx.match(similarGamesSkeleton).$SKELETON,
    });
  },
});

/** The stock hook's download-source lookup (newest source first, as ids) and its error log. */
export const similarGamesSources = fingerprint({
  name: "stock similar games download sources",
  strings: ['"downloadSources"', '"createdAt"', '"Failed to fetch similar games"'],
  pattern: 'async () => { const $SOURCES = await $DB.values("downloadSources"); $$$ }',
  where: { "maps the sources newest first": (m) => /"createdAt",\s*"desc"\s*\)\s*\.map\(/.test(m.text) },
});

export const similarGamesErrorLog = fingerprint({
  name: "stock similar games error log",
  strings: ['"Failed to fetch similar games"'],
  pattern: '$LOGGER.error("Failed to fetch similar games", $ERROR)',
});

/** Internal "registry: game data": LevelDB, lodash's orderBy and the renderer logger. */
export const registerGameData = definePatch({
  description: "registry: game data",
  execute(ctx) {
    const sources = ctx.match(similarGamesSources);
    const orderBy = sources.find(`$ORDER_BY(${sources.$SOURCES}, "createdAt", "desc")`).$ORDER_BY;
    register(ctx, { levelDBService: sources.$DB, orderBy, logger: ctx.match(similarGamesErrorLog).$LOGGER });
  },
});

/** Hydra's useLibrary(), which also names its redux hooks. */
export const libraryHook = fingerprint({
  name: "useLibrary hook",
  strings: [".library.downloadLibrary", "updateLibrary"],
  pattern: "function $USE_LIBRARY() { $$$ }",
  where: {
    "selects library.value and library.downloadLibrary": (m) => /\.library\.value\b/.test(m.text) && /\.library\.downloadLibrary\b/.test(m.text),
    "returns updateLibrary": (m) => /\bupdateLibrary\b/.test(m.text),
  },
});

/** Internal "registry: library": the library and Hydra's typed redux hooks. */
export const registerLibrary = definePatch({
  description: "registry: library",
  execute(ctx) {
    const hook = ctx.match(libraryHook);
    register(ctx, {
      useLibrary: hook.$USE_LIBRARY,
      useAppDispatch: hook.find("$USE_APP_DISPATCH()").$USE_APP_DISPATCH, // its only call without arguments
      useAppSelector: hook.find("$USE_APP_SELECTOR(($STATE) => $STATE.library.value)").$USE_APP_SELECTOR,
    });
  },
});

/**
 * The catalogue's tag and genre lookup, which stores the tags with the setTags action (Big Picture fetches the same
 * paths directly, in the other order).
 */
export const steamFiltersRequest = fingerprint({
  name: "Steam tags and genres request",
  strings: ['"/catalogue/steam/tags"', '"/catalogue/steam/genres"'],
  pattern:
    'async () => { const [$TAGS, $GENRES] = await Promise.all([$GET_METADATA("/catalogue/steam/tags", $$$), $GET_METADATA("/catalogue/steam/genres", $$$)]); $$$ }',
});

/** Internal "registry: Steam tags": the catalogue's setTags action and its localized metadata loader. */
export const registerSteamTags = definePatch({
  description: "registry: Steam tags",
  execute(ctx) {
    const request = ctx.match(steamFiltersRequest);
    register(ctx, {
      setTags: { destructured: request.find(`$DISPATCH($SET_TAGS(${request.$TAGS}))`).$SET_TAGS },
      getLocalizedSteamMetadata: request.$GET_METADATA,
    });
  },
});

/** The last checkbox of Settings > Content & gameplay > Content preferences (Big Picture's list uses a different shape). */
export const settingsLastCheckbox = fingerprint({
  name: "settings Content preferences last checkbox",
  strings: ['"persist_filters_and_sorting"', '"content_preferences"'],
  pattern: '$JSX.jsx($CHECKBOX, { label: $T("persist_filters_and_sorting"), checked: $FORM.persistFiltersAndSorting })',
});

/** Internal "registry: settings": Hydra's checkbox, so the Settings checkboxes look like its own. */
export const registerSettings = definePatch({
  description: "registry: settings",
  execute(ctx) {
    register(ctx, { CheckboxField: ctx.match(settingsLastCheckbox).$CHECKBOX });
  },
});
