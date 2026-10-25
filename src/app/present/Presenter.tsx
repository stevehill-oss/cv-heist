"use client";

import { useState } from "react";
import { QrCode, useRouteUrl } from "@/components/client";
import { BriefcaseIcon, TerminalIcon } from "@/components/icons";
import { ROUTES } from "@/lib/profile";

const CODES = {
  profile: { route: ROUTES.profile, title: "THE PROFESSIONAL", line: "View my CV and LinkedIn.", Icon: BriefcaseIcon, accent: "text-cyan" },
  heist: { route: ROUTES.heist, title: "THE CV HEIST", line: "Or try stealing my CV instead.", Icon: TerminalIcon, accent: "text-amber" },
} as const;

type Key = keyof typeof CODES;

export function Presenter() {
  const [active, setActive] = useState<Key>("profile");
  const code = CODES[active];
  const { url, isPreview } = useRouteUrl(code.route);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center">
      <div role="tablist" aria-label="Choose a QR code" className="glass grid w-full grid-cols-2 gap-1 p-1">
        {(Object.keys(CODES) as Key[]).map((k) => {
          const { Icon, title } = CODES[k];
          const on = k === active;
          return (
            <button
              key={k}
              role="tab"
              aria-selected={on}
              aria-controls="qr-panel"
              onClick={() => setActive(k)}
              className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 font-display text-sm font-semibold transition-colors ${on ? "bg-raised text-ink shadow-[inset_0_0_0_1px_var(--color-line)]" : "text-ink-2 hover:text-ink"}`}
            >
              <Icon width={16} height={16} /> {k === "profile" ? "Professional" : "Hacker"}
              <span className="sr-only">: {title}</span>
            </button>
          );
        })}
      </div>

      <div id="qr-panel" role="tabpanel" className="mt-8 flex w-full flex-col items-center text-center">
        <h1 className={`text-3xl font-semibold sm:text-4xl ${code.accent}`}>{code.title}</h1>
        <p className="mt-2 text-ink-2">{code.line}</p>
        <div className="mt-6 w-full max-w-[min(20rem,78vw)]">
          {url ? (
            <QrCode value={url} label={`QR code for ${url}`} />
          ) : (
            <div className="aspect-square w-full animate-pulse rounded-2xl bg-raised" />
          )}
        </div>
        <p className="mt-5 break-all font-mono text-sm text-ink" data-testid="qr-url">{url ?? "…"}</p>
        {isPreview && (
          <p className="mt-4 rounded-xl border border-amber/40 bg-amber/[0.07] px-4 py-3 text-sm text-amber" role="note" data-testid="qr-preview-note">
            Preview only. This code points at the address this page is open on. Final print codes are made once the
            site has its free public address.
          </p>
        )}
      </div>
    </div>
  );
}
