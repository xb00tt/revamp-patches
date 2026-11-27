import { registryEntries, useTranslation } from "../../app.ts";
import { patchedRows } from "../../rows.ts";
import { similarGamesText } from "../../strings.ts";
import { SimilarGamesSettings } from "./similar-games-settings.tsx";

// The Revamped category of Hydra's Settings: every Revamped setting, grouped the way Hydra's own panels are.
export function RevampedSettings() {
  const { i18n } = useTranslation("settings");
  if (patchedRows(registryEntries()).length === 0) return null;

  return (
    <div className="settings-context-panel">
      <div className="settings-context-panel__group">
        <h3>{similarGamesText(i18n.language).section}</h3>
        <SimilarGamesSettings />
      </div>
    </div>
  );
}
