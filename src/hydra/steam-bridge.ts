import { definePatch, fingerprint } from "@revamp-app/sdk";

// scripts/build.ts replaces this name with the compiled bridge (src/hydra/steam-bridge/main.ts). Unit tests import
// the source directly, where it is undefined and a placeholder stands in.
declare const __REVAMP_HYDRA_STEAM_BRIDGE__: string | undefined;

export const STEAM_BRIDGE =
  typeof __REVAMP_HYDRA_STEAM_BRIDGE__ === "string"
    ? __REVAMP_HYDRA_STEAM_BRIDGE__
    : "var __revampSteamBridge = { registerSteamBridge() {} }; // Revamp Steam bridge (not built)\n";

/** The window object the preload exposes the bridge as (window.revampSteam). */
export const PRELOAD_WORLD_KEY = "revampSteam";

// Import statements are the anchors: an obfuscated build (4.4.0 on) hides strings and member names, never imports.
export const mainLogImport = fingerprint({
  name: "main process electron-log import",
  strings: ["electron-log"],
  pattern: 'import $LOG from "electron-log"',
  where: { "in the main process": (m) => m.file.startsWith("out/main/") },
});

export const preloadElectronImport = fingerprint({
  name: "preload electron import",
  strings: ["contextBridge", "ipcRenderer"],
  pattern: 'import { contextBridge as $BRIDGE, ipcRenderer as $IPC } from "electron"',
  where: { "in the preload": (m) => m.file.startsWith("out/preload/") },
});

/**
 * Internal "Steam bridge": Steam data for the More like this patches, fetched in Hydra's main process (the renderer
 * can't reach Steam) and exposed to the renderer as window.revampSteam.
 */
export const steamBridge = definePatch({
  description: "Steam bridge",
  execute(ctx) {
    // Imports are evaluated before the module body and ipcMain works before the app is ready, so this can run first.
    const log = ctx.match(mainLogImport);
    log.insertAfter(
      `import { ipcMain as __revampIpcMain } from "electron";\n${STEAM_BRIDGE}\n` +
        `__revampSteamBridge.registerSteamBridge((name, listener) => __revampIpcMain.handle(name, listener), ${log.$LOG}.scope("main"));`,
    );

    const preload = ctx.match(preloadElectronImport);
    preload.insertAfter(
      `${preload.$BRIDGE}.exposeInMainWorld(${JSON.stringify(PRELOAD_WORLD_KEY)}, {\n` +
        `  getSteamAppTags: (objectId) => ${preload.$IPC}.invoke("revamp:getSteamAppTags", objectId),\n` +
        `  getSteamRecommendations: (objectId) => ${preload.$IPC}.invoke("revamp:getSteamRecommendations", objectId),\n` +
        `});`,
    );
  },
});
