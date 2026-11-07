import { definePatch, fingerprint, option } from "@revamp-app/sdk";

export const protocolRegistration = fingerprint({
  name: "setAsDefaultProtocolClient call",
  strings: ["setAsDefaultProtocolClient("],
  count: "many",
  pattern: "$APP.setAsDefaultProtocolClient($$$)",
});

/** Hydra's registration in an obfuscated main process (4.4.0 on), where the method name is hidden in a lookup table. */
export const protocolRegistrationObfuscated = fingerprint({
  name: "setAsDefaultProtocolClient calls (obfuscated)",
  strings: ["process["],
  pattern: "process[$DEFAULT_APP] ? process[$ARGV][$LENGTH] >= 2 && $APP[$SET]($PROTOCOL, process[$EXEC_PATH], [$$$]) : $APP[$SET]($PROTOCOL)",
});

export const sideBySideIdentity = definePatch({
  name: "Side-by-side identity",
  description:
    "Gives the patched copy its own menu name and window class (Electron's desktopName), so it doesn't merge with the stock app in menus and panels.",
  options: {
    claimLinks: option.bool({
      title: "Open app links in the Revamped copy",
      description: "When off, the Revamped copy never registers itself for the app's links, so links keep opening the stock app.",
      default: true,
    }),
  },
  execute(ctx) {
    const id = `revamp-${ctx.app.id}`;
    const pkg = ctx.file("package.json");
    pkg.setJson({ ...pkg.json<Record<string, unknown>>(), desktopName: `${id}.desktop` });
    ctx.desktopEntry.Name = `${ctx.desktopEntry.Name ?? ctx.app.id} (Revamped)`;
    ctx.desktopEntry.StartupWMClass = id;
    if (ctx.options.claimLinks === false) {
      let calls;
      try {
        calls = ctx.matchAll(protocolRegistration);
      } catch {
        const m = ctx.match(protocolRegistrationObfuscated); // its error is the one reported: newer builds have this shape
        calls = m.findAll(`${m.$APP}[${m.$SET}]($$$)`);
      }
      for (const call of calls) call.replace("false");
      delete ctx.desktopEntry.MimeType;
    }
  },
});
