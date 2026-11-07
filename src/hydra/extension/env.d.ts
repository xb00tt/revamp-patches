// Globals the ported fork code uses in Hydra's renderer.
interface Window {
  electron: {
    hydraApi: {
      get<T>(path: string, options?: unknown): Promise<T>;
      post<T>(path: string, options?: unknown): Promise<T>;
    };
    updateUserPreferences(values: Record<string, unknown>): Promise<unknown>;
  };
  /** Exposed by the Steam bridge patch's preload code. */
  revampSteam: {
    getSteamAppTags(objectId: string): Promise<number[]>;
    getSteamRecommendations(
      objectId: string
    ): Promise<import("../steam-bridge/main.ts").SteamRecommendation[]>;
  };
}

/** Stylesheets are injected as a <style> element when the extension loads (see scripts/extension.ts). */
declare module "*.css";
