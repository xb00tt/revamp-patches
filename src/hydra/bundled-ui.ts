import { definePatch, fingerprint } from "@revamp-app/sdk";
import { hydra } from "../apps.ts";

/**
 * Release builds load their UI from https://release-v<version>.hydra-eqi.pages.dev and fall back to the
 * bundled out/renderer/index.html only when that fails. Every renderer patch edits the bundled copy.
 */
export const remoteUi = fingerprint({
  name: "remote UI with local fallback",
  strings: ["../renderer/index.html", "loadURL("],
  pattern: "try { await $W.loadURL($URL); } catch ($E) { $$$; $W.loadFile($$$ARGS); }",
});

/** The same code in an obfuscated main process (4.4.0 on): method names and strings are hidden in a lookup table. */
export const remoteUiObfuscated = fingerprint({
  name: "remote UI with local fallback (obfuscated)",
  strings: ["ELECTRON_RENDERER_URL"],
  pattern: "try { await $W[$LOAD_URL]($URL); } catch ($E) { $LOG, $W[$LOAD_FILE]($PATH, { hash: $HASH }); }",
});

export const useBundledUi = definePatch({
  name: "Use the bundled UI",
  description:
    "Loads the UI that ships inside the release (the one Revamp patches) instead of the copy on Hydra's website, which can change without a release.",
  compatibleWith: [{ app: hydra, versions: ["4.1.6", "4.2.0", "4.4.0"] }],
  execute(ctx) {
    let m;
    try {
      m = ctx.match(remoteUi);
    } catch {
      m = ctx.match(remoteUiObfuscated); // its error is the one reported: newer builds have this shape
      m.replace(`${m.$W}[${m.$LOAD_FILE}](${m.$PATH}, { hash: ${m.$HASH} });`);
      return;
    }
    m.replace(`${m.$W}.loadFile(${m.$ARGS});`);
  },
});
