"use client";

import QRCode from "qrcode";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { candidate, site } from "@/content/candidate";
import { ROUTES, absoluteUrl, buildVCard } from "@/lib/profile";
import { CheckIcon, ContactIcon, ShareIcon } from "./icons";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** The page's own address: configured site URL in production, else the current origin. */
export function useRouteUrl(route: string): { url: string | null; isPreview: boolean } {
  const configured = absoluteUrl(site, route);
  const [origin, setOrigin] = useState<string | null>(null);
  useEffect(() => setOrigin(window.location.origin), []);
  if (configured) return { url: configured, isPreview: false };
  if (!origin) return { url: null, isPreview: true };
  return { url: `${origin}${basePath}${route === "/" ? "/" : `${route}/`}`, isPreview: true };
}

/**
 * Pointer-reactive tilt: the corner under the pointer tips away from the
 * reader, like pressing a corner of a card. Max about 8 degrees.
 */
export function TiltCard({ children, className = "", max = 8 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover)").matches) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--ry", `${(x * 2 * max).toFixed(2)}deg`);
      el.style.setProperty("--rx", `${(-y * 2 * max).toFixed(2)}deg`);
    };
    const leave = () => {
      el.style.setProperty("--ry", "0deg");
      el.style.setProperty("--rx", "0deg");
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [max]);
  return (
    <div ref={ref} className={`tilt ${className}`}>
      {children}
    </div>
  );
}

/** Saves the candidate as a phone contact. Only verified fields go in. */
export function SaveContact({ className = "btn btn-secondary" }: { className?: string }) {
  const { url } = useRouteUrl(ROUTES.profile);
  const card = buildVCard(candidate, url);
  if (!card) {
    return (
      <p className="text-sm text-ink-2" data-testid="contact-unavailable">
        Save-to-phone contact card switches on once the name is confirmed.
      </p>
    );
  }
  const save = () => {
    const blob = new Blob([card], { type: "text/vcard;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `${candidate.name!.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.vcf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  };
  return (
    <button type="button" onClick={save} className={className} data-testid="save-contact">
      <ContactIcon /> Save contact
    </button>
  );
}

/** Native share sheet where the phone has one, copy-link fallback elsewhere. */
export function ShareButton({ route, title, text, className = "btn btn-secondary" }: { route: string; title: string; text: string; className?: string }) {
  const { url } = useRouteUrl(route);
  const [copied, setCopied] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const share = async () => {
    if (!url) return;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (e) {
        if ((e as DOMException).name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setShowUrl(true);
    }
  };
  return (
    <span className="inline-flex flex-col items-stretch gap-2">
      <button type="button" onClick={share} className={className} disabled={!url}>
        {copied ? <CheckIcon /> : <ShareIcon />}
        <span aria-live="polite">{copied ? "Link copied" : "Share"}</span>
      </button>
      {showUrl && url && (
        <input readOnly value={url} aria-label="Link to copy" onFocus={(e) => e.currentTarget.select()} autoFocus
          className="rounded-lg border border-line bg-bg-2 px-3 py-2 font-mono text-xs text-ink" />
      )}
    </span>
  );
}

/** Renders a QR code as inline SVG. Dark modules on white for reliable scanning. */
export function QrCode({ value, label, className = "" }: { value: string; label: string; className?: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    QRCode.toString(value, { type: "svg", errorCorrectionLevel: "M", margin: 2, color: { dark: "#080c12", light: "#ffffff" } })
      .then((s) => live && setSvg(s))
      .catch(() => live && setSvg(null));
    return () => {
      live = false;
    };
  }, [value]);
  return (
    <div
      role="img"
      aria-label={label}
      data-qr-value={value}
      className={`aspect-square w-full overflow-hidden rounded-2xl bg-white p-2 [&_svg]:h-full [&_svg]:w-full ${className}`}
      dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
    />
  );
}
