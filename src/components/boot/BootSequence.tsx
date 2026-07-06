"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";

/* ============================================================
   BOOT LINE DATA
   ============================================================ */

type LineType =
  | "header"
  | "divider"
  | "spacer"
  | "text"
  | "progress"
  | "status"
  | "warning"
  | "granted"
  | "welcome";

interface BootLine {
  id: string;
  type: LineType;
  text?: string;
  status?: string;
  slowReveal?: boolean;
}

const BOOT_LINES: BootLine[] = [
  { id: "h1", type: "header",  text: "NEXUS OS v3.7.1 — ARCHITECT INTERFACE",       slowReveal: true },
  { id: "h2", type: "header",  text: "SUJITH.AI // SYSTEM INITIALIZING",             slowReveal: true },
  { id: "d1", type: "divider" },
  { id: "s1", type: "spacer"  },
  { id: "t1", type: "text",    text: "> LOADING CORE MODULES..." },
  { id: "s2", type: "spacer"  },
  { id: "p1", type: "progress", text: "KERNEL BOOTSTRAP" },
  { id: "p2", type: "progress", text: "IDENTITY MATRIX" },
  { id: "p3", type: "progress", text: "NEURAL LINK" },
  { id: "s3", type: "spacer"  },
  { id: "o1", type: "status",  text: "AI SUBSYSTEMS NOMINAL",        status: "OK" },
  { id: "o2", type: "status",  text: "PERSONALITY ENGINE LOADED",    status: "OK" },
  { id: "o3", type: "status",  text: "THREAT ASSESSMENT: NEGATIVE",  status: "OK" },
  { id: "o4", type: "status",  text: "CREATIVE MODULES ONLINE",      status: "OK" },
  { id: "o5", type: "status",  text: "SHIPPING VELOCITY: MAXIMUM",   status: "OK" },
  { id: "s4", type: "spacer"  },
  { id: "t2", type: "text",    text: "> SCANNING INCOMING AGENT..." },
  { id: "t3", type: "text",    text: "  ENTITY DETECTED: UNKNOWN_AGENT" },
  { id: "w1", type: "warning", text: "  AUTHORIZATION REQUIRED", status: "PROCESSING" },
  { id: "s5", type: "spacer"  },
  { id: "g1", type: "granted", text: "  ACCESS LEVEL: GUEST", status: "GRANTED ✓" },
  { id: "s6", type: "spacer"  },
  { id: "wl", type: "welcome", text: "  WELCOME TO THE ARCHITECT'S DOMAIN." },
];

/* ============================================================
   BOOT SEQUENCE COMPONENT
   ============================================================ */

interface BootSequenceProps {
  onComplete: () => void;
}

export function BootSequence({ onComplete }: BootSequenceProps) {
  const [phase, setPhase] = useState<"cursor" | "terminal" | "exploding">(
    "cursor"
  );
  const [showSkip, setShowSkip] = useState(false);
  const [progressValues, setProgressValues] = useState<
    Record<string, number>
  >({});

  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const skippedRef = useRef(false);

  /* --- Explosion + completion --- */
  const triggerExplosion = useCallback(() => {
    if (skippedRef.current) return;
    skippedRef.current = true;
    setPhase("exploding");

    const lines = lineRefs.current.filter(Boolean) as HTMLElement[];

    gsap.to(lines, {
      x: () => (Math.random() - 0.5) * window.innerWidth * 1.8,
      y: () => (Math.random() - 0.5) * window.innerHeight * 1.8,
      opacity: 0,
      scale: () => Math.random() * 0.5 + 0.15,
      rotation: () => (Math.random() - 0.5) * 80,
      filter: "blur(2px)",
      duration: 0.75,
      stagger: { amount: 0.18, from: "random" },
      ease: "power3.in",
      onComplete,
    });
  }, [onComplete]);

  /* --- Skip handler --- */
  const handleSkip = useCallback(() => {
    if (skippedRef.current) return;
    tlRef.current?.kill();

    // Reveal all hidden lines instantly
    const lines = lineRefs.current.filter(Boolean) as HTMLElement[];
    gsap.set(lines, { autoAlpha: 1 });

    // Fill all progress bars instantly
    setProgressValues({ p1: 100, p2: 100, p3: 100 });

    // Short pause, then explode
    setTimeout(triggerExplosion, 200);
  }, [triggerExplosion]);

  /* --- Mount: cursor phase, skip listener, begin timer --- */
  useEffect(() => {
    const skipTimer = setTimeout(() => setShowSkip(true), 1800);
    const startTimer = setTimeout(() => setPhase("terminal"), 700);

    const onKey = () => handleSkip();
    const onClick = () => handleSkip();

    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClick);

    return () => {
      clearTimeout(skipTimer);
      clearTimeout(startTimer);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
    };
  }, [handleSkip]);

  /* --- Terminal phase: GSAP timeline --- */
  useEffect(() => {
    if (phase !== "terminal") return;

    // Hide all lines initially
    const lines = lineRefs.current.filter(Boolean);
    gsap.set(lines, { autoAlpha: 0 });

    const tl = gsap.timeline();
    tlRef.current = tl;

    let cursor = 0; // timeline cursor in seconds

    BOOT_LINES.forEach((line, i) => {
      const el = lineRefs.current[i];
      if (!el) return;

      let delay: number;
      if (line.type === "spacer") {
        delay = 0.05;
      } else if (line.slowReveal) {
        delay = 0.28;
      } else if (line.type === "progress") {
        delay = 0.18;
      } else if (["status", "warning"].includes(line.type)) {
        delay = 0.1;
      } else {
        delay = 0.13;
      }

      // Reveal the line
      tl.to(
        el,
        { autoAlpha: 1, x: 0, duration: 0.04, ease: "none" },
        cursor
      );
      cursor += delay;

      // Progress bar animation
      if (line.type === "progress") {
        const id = line.id;
        tl.add(() => {
          setProgressValues((prev) => ({ ...prev, [id]: 0 }));
          gsap.to(
            {},
            {
              duration: 0.45,
              ease: "power2.out",
              onUpdate: function () {
                const pct = Math.round(this.progress() * 100);
                setProgressValues((prev) => ({ ...prev, [id]: pct }));
              },
            }
          );
        }, cursor - 0.1);
        cursor += 0.35;
      }

      // Granted flash effect
      if (line.type === "granted") {
        tl.to(el, { filter: "brightness(4)", duration: 0.08 }, cursor);
        tl.to(el, { filter: "brightness(1)", duration: 0.25 }, cursor + 0.08);
        cursor += 0.35;
      }
    });

    // Pause at end, then explode
    tl.add(() => {}, cursor + 0.9);
    tl.add(() => triggerExplosion(), cursor + 0.9);

    return () => {
      tl.kill();
    };
  }, [phase, triggerExplosion]);

  /* ============================================================
     RENDER HELPERS
     ============================================================ */

  const renderLine = (line: BootLine, i: number): ReactNode => {
    const ref = (el: HTMLDivElement | null) => {
      lineRefs.current[i] = el;
    };

    const base =
      "terminal-text leading-6 whitespace-pre select-none";

    switch (line.type) {
      case "header":
        return (
          <div ref={ref} key={line.id} className={`${base} text-text-primary font-semibold tracking-widest glow-text-ion`}>
            {line.text}
          </div>
        );

      case "divider":
        return (
          <div ref={ref} key={line.id} className={`${base} text-ion-dim opacity-40`}>
            {"─".repeat(52)}
          </div>
        );

      case "spacer":
        return (
          <div ref={ref} key={line.id} className="h-2" />
        );

      case "text":
        return (
          <div
            ref={ref}
            key={line.id}
            className={`${base}`}
            style={{
              color:
                line.text?.includes("UNKNOWN_AGENT")
                  ? "var(--ferrari-bright)"
                  : "var(--text-terminal)",
              textShadow: line.text?.includes("UNKNOWN_AGENT")
                ? "0 0 8px var(--ferrari), 0 0 16px var(--ferrari-glow)"
                : undefined,
            }}
          >
            {line.text}
          </div>
        );

      case "progress": {
        const pct = progressValues[line.id] ?? 0;
        const filled = Math.round((pct / 100) * 20);
        const empty = 20 - filled;
        const bar = "█".repeat(filled) + "░".repeat(empty);

        return (
          <div ref={ref} key={line.id} className={`${base} flex items-center gap-3`}>
            <span className="text-text-secondary w-40 shrink-0">{line.text}</span>
            <span className="text-ferrari tracking-tighter">[{bar}]</span>
            <span className="text-text-secondary w-8 text-right font-hud text-xs">
              {pct}%
            </span>
            {pct === 100 && (
              <span className="text-ok glow-text-ok text-xs tracking-widest">[OK]</span>
            )}
          </div>
        );
      }

      case "status":
        return (
          <div ref={ref} key={line.id} className={`${base} flex items-center gap-3`}>
            <span className="text-text-terminal">{line.text}</span>
            <span className="ml-auto text-ok glow-text-ok text-xs tracking-widest shrink-0">
              [{line.status}]
            </span>
          </div>
        );

      case "warning":
        return (
          <div ref={ref} key={line.id} className={`${base} flex items-center gap-3`}>
            <span style={{ color: "var(--status-warn)" }}>{line.text}</span>
            <span
              className="ml-auto text-xs tracking-widest shrink-0"
              style={{
                color: "var(--status-warn)",
                animation: "pulse-dot 0.6s ease-in-out infinite",
              }}
            >
              [{line.status}]
            </span>
          </div>
        );

      case "granted":
        return (
          <div
            ref={ref}
            key={line.id}
            className={`${base} flex items-center gap-3`}
          >
            <span className="text-ok font-semibold tracking-wider glow-text-ok">
              {line.text}
            </span>
            <span className="ml-auto text-ok glow-text-ok text-sm tracking-widest font-semibold shrink-0">
              [{line.status}]
            </span>
          </div>
        );

      case "welcome":
        return (
          <div
            ref={ref}
            key={line.id}
            className={`${base} text-text-primary font-semibold tracking-widest`}
            style={{
              textShadow:
                "0 0 12px var(--ion), 0 0 30px rgba(0,212,255,0.4)",
            }}
          >
            {line.text}
          </div>
        );

      default:
        return null;
    }
  };

  /* ============================================================
     MAIN RENDER
     ============================================================ */

  return (
    <motion.div
      ref={containerRef}
      className="fixed inset-0 flex items-center justify-center"
      style={{
        background: "var(--void)",
        zIndex: "var(--z-boot)" as never,
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Scanline sweep */}
      <div className="scanline" />

      {/* Corner brackets on the whole screen */}
      <ScreenCorners />

      {/* ── CURSOR PHASE ── */}
      <AnimatePresence>
        {phase === "cursor" && (
          <motion.div
            key="cursor-phase"
            className="flex items-center gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <span
              className="terminal-text text-text-terminal text-base"
              style={{ animation: "blink 1s step-end infinite" }}
            >
              _
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TERMINAL PHASE ── */}
      <AnimatePresence>
        {(phase === "terminal" || phase === "exploding") && (
          <motion.div
            key="terminal-phase"
            className="w-full max-w-2xl px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            {/* Header row */}
            <div className="flex items-center gap-2 mb-6">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  background: "var(--ferrari)",
                  boxShadow: "0 0 8px var(--ferrari)",
                  animation: "pulse-dot 1.2s ease-in-out infinite",
                }}
              />
              <span
                className="terminal-text text-xs tracking-widest"
                style={{ color: "var(--text-secondary)" }}
              >
                SECURE CHANNEL — ENCRYPTED — v3.7.1
              </span>
            </div>

            {/* Terminal lines */}
            <div className="space-y-0">
              {BOOT_LINES.map((line, i) => renderLine(line, i))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SKIP HINT ── */}
      <AnimatePresence>
        {showSkip && phase === "terminal" && (
          <motion.div
            key="skip"
            className="absolute bottom-8 right-8"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.4 }}
          >
            <span
              className="terminal-text text-xs tracking-widest"
              style={{
                color: "var(--text-dim)",
                animation: "pulse-dot 2s ease-in-out infinite",
              }}
            >
              [ PRESS ANY KEY TO SKIP ]
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Noise overlay */}
      <div className="noise-overlay" />
    </motion.div>
  );
}

/* ============================================================
   SCREEN CORNER ACCENTS
   ============================================================ */

function ScreenCorners() {
  const size = 28;
  const thickness = 1;
  const color = "rgba(0,212,255,0.3)";

  const corner = (
    pos: "tl" | "tr" | "bl" | "br",
    borderProps: React.CSSProperties
  ) => {
    const positions: Record<string, React.CSSProperties> = {
      tl: { top: 20, left: 20 },
      tr: { top: 20, right: 20 },
      bl: { bottom: 20, left: 20 },
      br: { bottom: 20, right: 20 },
    };
    return (
      <div
        style={{
          position: "absolute",
          width: size,
          height: size,
          ...positions[pos],
          ...borderProps,
          opacity: 0.6,
        }}
      />
    );
  };

  return (
    <>
      {corner("tl", { borderTop: `${thickness}px solid ${color}`, borderLeft: `${thickness}px solid ${color}` })}
      {corner("tr", { borderTop: `${thickness}px solid ${color}`, borderRight: `${thickness}px solid ${color}` })}
      {corner("bl", { borderBottom: `${thickness}px solid ${color}`, borderLeft: `${thickness}px solid ${color}` })}
      {corner("br", { borderBottom: `${thickness}px solid ${color}`, borderRight: `${thickness}px solid ${color}` })}
    </>
  );
}
