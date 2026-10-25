import type { ReactNode } from "react";
import { Tbc } from "./ProfileLinks";

export function Section({ id, eyebrow, title, children, aside }: { id: string; eyebrow: string; title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-20">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={`${id}-title`} className="mt-2 text-2xl font-semibold sm:text-3xl">{title}</h2>
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

/**
 * Designed empty state. Skeleton rows show the shape of what is coming
 * without inventing any content to fill it.
 */
export function Pending({ what, rows = 3 }: { what: string; rows?: number }) {
  return (
    <div className="tbc-block p-5 sm:p-6" data-testid="pending-section">
      <div className="flex flex-wrap items-center gap-3">
        <Tbc>Awaiting confirmation</Tbc>
        <p className="text-sm text-ink-2">{what} will appear here once checked against the CV or LinkedIn.</p>
      </div>
      <div aria-hidden="true" className="mt-5 space-y-3">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="h-2 w-2 shrink-0 rounded-full bg-line" />
            <span className="h-2.5 rounded-full bg-line/60" style={{ width: `${70 - i * 14}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
}
