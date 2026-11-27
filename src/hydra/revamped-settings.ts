import { definePatch, fingerprint } from "@revamp-app/sdk";
import { useBundledUi } from "./bundled-ui.ts";
import { hydraExtensionLoader } from "./extension-loader.ts";
import { registerSettings, rootRender } from "./registry.ts";

const SETTINGS_STRINGS = ['"download_sources"', '"content_gameplay"', '"big_picture"'];

/** The Settings page's categories, General first (a game's own settings have "settings_category_general"). */
export const settingsCategories = fingerprint({
  name: "settings categories",
  strings: SETTINGS_STRINGS,
  pattern: '[{ id: "general", label: $T("general"), icon: $JSX.jsx($ICON, { size: 16 }) }, $$$]',
});

/** Which panel the Settings page renders: one `if` per category up to 4.2.0. */
export const settingsPanel = fingerprint({
  name: "settings panel choice",
  strings: SETTINGS_STRINGS,
  pattern: 'if ($ID === "general") { return $JSX.jsx($GENERAL, { appearance: $APPEARANCE }); }',
});

/** The same choice as a chain of conditionals in a minified build (4.4.0 on). */
export const settingsPanelMinified = fingerprint({
  name: "settings panel choice (minified)",
  strings: SETTINGS_STRINGS,
  pattern: '$ID === "general" ? $JSX.jsx($GENERAL, { appearance: $APPEARANCE }) : $REST',
});

/** The call that creates Octicons' SlidersIcon, the Revamped category's icon. */
export const octiconSliders = fingerprint({
  name: "octicon SlidersIcon",
  strings: ['"octicon octicon-sliders"'],
  pattern: '$CREATE("SlidersIcon", "octicon octicon-sliders", $$$)',
});

const PAGE = "__revampSettingsPage";

/** What a patch with a Revamped setting inserts before the root render, so the Revamped category is listed. */
export const REVAMPED_SETTINGS_MARKER = "(globalThis.__revamp ??= { registry: {}, mounts: {} }).registry.revampedSettings = true;";

/**
 * Internal "Revamped settings": a Revamped category at the top of Hydra's Settings, above General. Its panel is the
 * extension's hydra.revampedSettings mount, which holds every Revamped setting.
 */
export const revampedSettings = definePatch({
  description: "Revamped settings",
  dependsOn: [useBundledUi, hydraExtensionLoader, registerSettings], // the panel uses Hydra's CheckboxField
  execute(ctx) {
    const list = ctx.match(settingsCategories);
    const icon = ctx.match(octiconSliders);
    const render = ctx.match(rootRender);
    if (icon.file !== list.file || render.file !== list.file) {
      throw new Error(`the settings categories (${list.file}), SlidersIcon (${icon.file}) and the root render (${render.file}) are not in one file`);
    }
    let panel;
    try {
      panel = ctx.match(settingsPanel);
    } catch {
      panel = ctx.match(settingsPanelMinified); // its error is the one reported: newer builds have this shape
    }

    render.insertBefore(`const ${PAGE} = globalThis.__revamp?.mount?.("hydra.revampedSettings", () => null) ?? (() => null);`);
    // Listed only when a patch with settings applied (REVAMPED_SETTINGS_MARKER); the icon is created once, at first
    // render, from Hydra's own SlidersIcon call.
    list.find('({ id: "general" })').insertBefore(
      `...(globalThis.__revamp?.registry?.revampedSettings ? [{ id: "revamped", label: "Revamped", icon: ${list.$JSX}.jsx(globalThis.__revampSlidersIcon ??= ${icon.text}, { size: 16 }) }] : [])`,
    );
    const page = `${panel.$JSX}.jsx(${PAGE}, {})`;
    if (panel.node?.type === "IfStatement") panel.insertBefore(`if (${panel.$ID} === "revamped") {\n        return ${page};\n      }`);
    else panel.insertBefore(`${panel.$ID} === "revamped" ? ${page} : `);
  },
});
