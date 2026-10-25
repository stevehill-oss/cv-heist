import type { ReactNode } from "react";
import styles from "./Vault.module.css";

interface VaultProps {
  /** Fragments recovered, 0 to 3. Lights the indicators. */
  progress?: number;
  status?: "locked" | "error" | "open";
  className?: string;
  /** Shown inside the vault once the door swings open. */
  children?: ReactNode;
}

const TICKS = Array.from({ length: 72 }, (_, i) => i);
const BOLTS = Array.from({ length: 8 }, (_, i) => i * 45 + 22.5);
const DIAL = Array.from({ length: 40 }, (_, i) => i);

export function Vault({ progress = 0, status = "locked", className = "", children }: VaultProps) {
  const open = status === "open";
  return (
    <div
      className={`${styles.wrap} ${open ? styles.open : ""} ${status === "error" ? styles.error : ""} ${className}`}
      role="img"
      aria-label={open ? "The vault door is open" : `Locked vault, ${progress} of 3 fragments recovered`}
    >
      <div className={styles.halo} aria-hidden="true" />
      <div className={styles.interior} aria-hidden={!open}>
        {children}
      </div>

      <svg className={styles.frame} viewBox="0 0 400 400" aria-hidden="true">
        <defs>
          <radialGradient id="v-frame" cx="50%" cy="38%" r="65%">
            <stop offset="0" stopColor="#2a4152" />
            <stop offset="0.7" stopColor="#13202d" />
            <stop offset="1" stopColor="#0a121b" />
          </radialGradient>
        </defs>
        <circle cx="200" cy="200" r="196" fill="url(#v-frame)" stroke="#294150" strokeWidth="2" />
        <circle cx="200" cy="200" r="168" fill="#05090e" stroke="#0e1a25" strokeWidth="6" />
        {TICKS.map((i) => (
          <line
            key={i}
            x1="200" y1="9" x2="200" y2={i % 6 === 0 ? 22 : 15}
            stroke={i % 6 === 0 ? "#57e4f5" : "#3a5668"}
            strokeOpacity={i % 6 === 0 ? 0.7 : 0.6}
            strokeWidth={i % 6 === 0 ? 2 : 1}
            transform={`rotate(${i * 5} 200 200)`}
          />
        ))}
        {[0, 1, 2].map((i) => {
          const lit = i < progress;
          return (
            <circle
              key={i}
              cx={200 + 182 * Math.sin(((i - 1) * 14 * Math.PI) / 180)}
              cy={200 - 182 * Math.cos(((i - 1) * 14 * Math.PI) / 180)}
              r="5"
              className={lit ? styles.ledOn : styles.ledOff}
            />
          );
        })}
      </svg>

      <div className={styles.doorHinge}>
        <svg className={styles.door} viewBox="0 0 400 400" aria-hidden="true">
          <defs>
            <radialGradient id="v-door" cx="42%" cy="30%" r="80%">
              <stop offset="0" stopColor="#2b4558" />
              <stop offset="0.55" stopColor="#172736" />
              <stop offset="1" stopColor="#0c1520" />
            </radialGradient>
            <linearGradient id="v-rim" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#57e4f5" stopOpacity="0.85" />
              <stop offset="0.4" stopColor="#294150" />
              <stop offset="1" stopColor="#57e4f5" stopOpacity="0.35" />
            </linearGradient>
            <radialGradient id="v-hub" cx="40%" cy="35%" r="70%">
              <stop offset="0" stopColor="#3a5a70" />
              <stop offset="1" stopColor="#101b26" />
            </radialGradient>
          </defs>

          <g className={styles.bolts}>
            {BOLTS.map((a) => (
              <g key={a} transform={`rotate(${a} 200 200)`}>
                <rect className={styles.bolt} x="192" y="22" width="16" height="30" rx="4" fill="#1d3142" stroke="#3d5d72" />
              </g>
            ))}
          </g>

          <circle cx="200" cy="200" r="160" fill="url(#v-door)" stroke="url(#v-rim)" strokeWidth="2.5" />
          <circle cx="200" cy="200" r="146" fill="none" stroke="#0a121b" strokeWidth="1.5" />
          <circle cx="200" cy="200" r="142" fill="none" stroke="#2c4658" strokeWidth="0.75" strokeDasharray="2 6" />

          <g className={styles.dial}>
            <circle cx="200" cy="200" r="108" fill="#0b141d" stroke="#294150" strokeWidth="1.5" />
            {DIAL.map((i) => (
              <line
                key={i}
                x1="200" y1="96" x2="200" y2={i % 5 === 0 ? 110 : 104}
                stroke={i % 5 === 0 ? "#a6b8c7" : "#3a5668"}
                strokeWidth={i % 5 === 0 ? 1.6 : 1}
                transform={`rotate(${i * 9} 200 200)`}
              />
            ))}
            <circle cx="200" cy="200" r="86" fill="none" stroke="#57e4f5" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="40 12 4 12" />
          </g>

          <g className={styles.handle}>
            {[0, 120, 240].map((a) => (
              <g key={a} transform={`rotate(${a} 200 200)`}>
                <rect x="194" y="112" width="12" height="70" rx="6" fill="#203546" stroke="#3d5d72" />
                <circle cx="200" cy="114" r="10" fill="#2a4456" stroke="#57e4f5" strokeOpacity="0.5" />
              </g>
            ))}
            <circle cx="200" cy="200" r="44" fill="url(#v-hub)" stroke="#57e4f5" strokeOpacity="0.55" strokeWidth="1.5" />
            <circle cx="200" cy="200" r="30" fill="#081018" stroke="#294150" />
          </g>
          <text x="200" y="205" textAnchor="middle" className={styles.readout}>
            {status === "error" ? "DENIED" : open ? "OPEN" : "LOCKED"}
          </text>
        </svg>
      </div>
    </div>
  );
}
