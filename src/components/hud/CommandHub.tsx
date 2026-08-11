"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { useNexusStore, type ActiveModule } from "@/stores/nexusStore";

/* ThreeScene is client-only (WebGL), never SSR'd */
const ThreeScene = dynamic(
  () => import("@/components/three/ThreeScene").then((m) => m.ThreeScene),
  { ssr: false }
);

/* ============================================================
   LIVE CLOCK
   ============================================================ */

function useClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " UTC+5:30"
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

/* ============================================================
   CYCLING SUBTITLE
   ============================================================ */

const ROLES = [
  "SOFTWARE ARCHITECT",
  "AI ENGINEER",
  "BACKEND DEVELOPER",
  "ML ENGINEER",  
];

function CyclingRole() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % ROLES.length), 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="h-7 overflow-hidden flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          className="block terminal-text tracking-[0.25em] text-sm"
          style={{ color: "var(--ion)" }}
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -14, opacity: 0 }}
          transition={{ duration: 0.26, ease: "easeInOut" }}
        >
          {ROLES[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

/* ============================================================
   STATUS DOT
   ============================================================ */

function StatusDot({ color = "ok" }: { color?: "ok" | "warn" | "ferrari" }) {
  const colors = {
    ok: "var(--status-ok)",
    warn: "var(--status-warn)",
    ferrari: "var(--ferrari)",
  };
  return (
    <span
      className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
      style={{
        background: colors[color],
        boxShadow: `0 0 6px ${colors[color]}`,
        animation: "pulse-dot 1.5s ease-in-out infinite",
      }}
    />
  );
}

/* ============================================================
   HUD PANEL WRAPPER
   ============================================================ */

function HUDPanel({
  children,
  className = "",
  style = {},
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`glass-panel ${className}`}
      style={{
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ============================================================
   MINI BAR
   ============================================================ */

function MiniBar({
  label,
  value,
  color,
  delay = 0,
}: {
  label: string;
  value: number;
  color: string;
  delay?: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <span
          className="terminal-text"
          style={{ color: "var(--text-secondary)", fontSize: 10 }}
        >
          {label}
        </span>
        <span className="font-hud" style={{ color, fontSize: 10 }}>
          {value}%
        </span>
      </div>
      <div
        className="h-px w-full rounded-full overflow-hidden"
        style={{ background: "var(--text-dim)" }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: color, boxShadow: `0 0 4px ${color}` }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        />
      </div>
    </div>
  );
}

/* ============================================================
   DATA ROW
   ============================================================ */

function DataRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className="terminal-text"
        style={{ color: "var(--text-dim)", fontSize: 10 }}
      >
        {label}
      </span>
      <span
        className="font-hud text-sm"
        style={{
          color: accent ? "var(--ferrari)" : "var(--text-primary)",
          textShadow: accent ? "0 0 8px var(--ferrari-glow)" : "none",
        }}
      >
        {value}
      </span>
    </div>
  );
}

/* ============================================================
   NAV ITEM
   ============================================================ */

const NAV_ITEMS = [
  { id: "identity",     code: "01", label: "IDENTITY",      icon: "◈" },
  { id: "missions",     code: "02", label: "MISSIONS",      icon: "◉" },
  { id: "matrix",       code: "03", label: "NEURAL MATRIX", icon: "◎" },
  { id: "chronicle",    code: "04", label: "CHRONICLE",     icon: "◊" },
  { id: "transmission", code: "05", label: "TRANSMISSION",  icon: "◈" },
] as const;

function NavItem({
  item,
  index,
}: {
  item: (typeof NAV_ITEMS)[number];
  index: number;
}) {
  const [hovered, setHovered] = useState(false);
  const { activeModule, setActiveModule } = useNexusStore();
  const isActive = activeModule === item.id;

  const handleClick = () => {
    setActiveModule(isActive ? null : (item.id as ActiveModule));
  };

  return (
    <motion.button
      data-cursor="pointer"
      className="relative flex flex-col items-center gap-2 px-5 py-4 group transition-colors duration-200"
      style={{
        background: isActive
          ? "rgba(220,0,0,0.12)"
          : hovered
          ? "rgba(220,0,0,0.07)"
          : "rgba(0,212,255,0.02)",
        border: `1px solid ${
          isActive
            ? "rgba(220,0,0,0.55)"
            : hovered
            ? "rgba(220,0,0,0.4)"
            : "rgba(0,212,255,0.10)"
        }`,
        minWidth: 110,
        boxShadow: isActive ? "0 0 12px var(--ferrari-glow)" : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: 0.55 + index * 0.07,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
    >
      {/* Corner brackets */}
      <span
        className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l transition-colors duration-200"
        style={{ borderColor: isActive || hovered ? "var(--ferrari)" : "var(--ion-dim)" }}
      />
      <span
        className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r transition-colors duration-200"
        style={{ borderColor: isActive || hovered ? "var(--ferrari)" : "var(--ion-dim)" }}
      />

      <span
        className="font-hud text-xs tracking-widest transition-colors duration-200"
        style={{ color: isActive || hovered ? "var(--ferrari)" : "var(--text-dim)" }}
      >
        {item.code}
      </span>
      <span
        className="text-2xl transition-all duration-200"
        style={{
          color: isActive || hovered ? "var(--ferrari)" : "var(--ion-dim)",
          textShadow:
            isActive || hovered
              ? "0 0 10px var(--ferrari), 0 0 20px var(--ferrari-glow)"
              : "none",
        }}
      >
        {item.icon}
      </span>
      <span
        className="terminal-text text-xs tracking-widest transition-colors duration-200"
        style={{ color: isActive || hovered ? "var(--text-primary)" : "var(--text-secondary)" }}
      >
        {item.label}
      </span>

      {hovered && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: "var(--ferrari)", boxShadow: "0 0 6px var(--ferrari)" }}
          layoutId="nav-underline"
          transition={{ duration: 0.15 }}
        />
      )}
    </motion.button>
  );
}

/* ============================================================
   COMMAND HUB
   ============================================================ */

const SLIDE_IN = (delay: number, fromY?: number, fromX?: number) => ({
  initial: {
    opacity: 0,
    y: fromY ?? 0,
    x: fromX ?? 0,
  },
  animate: { opacity: 1, y: 0, x: 0 },
  transition: {
    duration: 0.6,
    delay,
    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
  },
});

export function CommandHub() {
  const clock = useClock();
  const { activeModule } = useNexusStore();

  return (
    <motion.div
      className="fixed inset-0"
      style={{ background: "var(--void)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.9, ease: "easeOut" }}
    >
      {/* ── THREE.JS CANVAS — z-index 0 ── */}
      <ThreeScene />

      {/* ── TOP HUD BAR ── */}
      <motion.header
        {...SLIDE_IN(0.08, -48)}
        className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-3"
        style={{
          borderBottom: "1px solid var(--glass-border)",
          background: "rgba(1,12,20,0.80)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3">
          <StatusDot color="ferrari" />
          <span
            className="font-display font-bold text-sm tracking-widest"
            style={{ color: "var(--text-primary)" }}
          >
            NEXUS
          </span>
          <span className="terminal-text text-xs" style={{ color: "var(--ion)" }}>
            ://SUJITH.AI
          </span>
          <span
            className="terminal-text text-xs ml-2"
            style={{ color: "var(--text-dim)" }}
          >
            v3.7.1
          </span>
        </div>

        {/* Status tags */}
        <div className="flex items-center gap-6">
          {(
            [
              { label: "SYSTEM", value: "ONLINE", color: "var(--status-ok)" },
              { label: "VISITOR", value: "GUEST", color: "var(--ion)" },
              { label: "CLEARANCE", value: "LIMITED", color: "var(--ion)" },
            ] as const
          ).map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-1.5 terminal-text text-xs"
            >
              <span style={{ color: "var(--text-dim)" }}>{item.label}:</span>
              <span style={{ color: item.color }}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* Clock */}
        <span
          className="font-hud text-xs tracking-widest"
          style={{ color: "var(--text-secondary)" }}
        >
          {clock}
        </span>
      </motion.header>

      {/* ── LEFT DATA STRIP ── */}
      <motion.aside
        {...SLIDE_IN(0.35, 0, -70)}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-20 px-4 py-5 flex flex-col gap-4"
        style={{
          borderRight: "1px solid var(--glass-border)",
          borderTop: "1px solid var(--glass-border)",
          borderBottom: "1px solid var(--glass-border)",
          background: "rgba(1,12,20,0.75)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          minWidth: 148,
        }}
      >
        {/* Corner accent */}
        <div
          className="absolute top-0 right-0 w-3 h-3 border-t border-r"
          style={{ borderColor: "var(--ion-dim)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-3 h-3 border-b border-r"
          style={{ borderColor: "var(--ion-dim)" }}
        />

        <DataRow label="LEVEL" value="07" accent />
        <MiniBar label="XP" value={72} color="var(--ferrari)" delay={0.5} />

        <div className="h-px w-full" style={{ background: "var(--glass-border)" }} />

        <MiniBar label="PYTHON"  value={98} color="var(--ion)"     delay={0.6} />
        <MiniBar label="AI / ML" value={95} color="var(--ion)"     delay={0.65} />
        <MiniBar label="NODE"    value={88} color="var(--ion)"     delay={0.7} />
        <MiniBar label="REACT"   value={85} color="var(--ion-dim)" delay={0.75} />

        <div className="h-px w-full" style={{ background: "var(--glass-border)" }} />

        <DataRow label="COMMITS"  value="2,847" />
        <DataRow label="PROJECTS" value="12" />
        <DataRow label="UPTIME"   value="99.9%" />
      </motion.aside>

      {/* ── RIGHT ACTIVITY FEED ── */}
      <motion.aside
        {...SLIDE_IN(0.4, 0, 70)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-20 px-4 py-5 flex flex-col gap-2"
        style={{
          borderLeft: "1px solid var(--glass-border)",
          borderTop: "1px solid var(--glass-border)",
          borderBottom: "1px solid var(--glass-border)",
          background: "rgba(1,12,20,0.75)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          minWidth: 190,
        }}
      >
        <div
          className="absolute top-0 left-0 w-3 h-3 border-t border-l"
          style={{ borderColor: "var(--ion-dim)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-3 h-3 border-b border-l"
          style={{ borderColor: "var(--ion-dim)" }}
        />

        <span
          className="terminal-text text-xs tracking-widest mb-1"
          style={{ color: "var(--text-dim)" }}
        >
          // ACTIVITY_FEED
        </span>
        {[
          "RAG v2 deployed",
          "Agent pipeline live",
          "PR merged ✓",
          "Model fine-tuned",
          "API latency −60%",
          "Tests: 98% pass",
          "Docker image built",
        ].map((item, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.35,
              delay: 0.6 + i * 0.07,
              ease: "easeOut",
            }}
          >
            <span style={{ color: "var(--ion)", fontSize: 10 }}>›</span>
            <span
              className="terminal-text text-xs"
              style={{ color: "var(--text-secondary)" }}
            >
              {item}
            </span>
          </motion.div>
        ))}
      </motion.aside>

      {/* ── CENTER IDENTITY TEXT — floats over canvas ── */}
      <div className="fixed inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
        <div className="flex flex-col items-center gap-5 text-center">
          {/* Name */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            <h1
              className="font-display font-bold tracking-[0.16em] text-4xl md:text-5xl"
              style={{
                color: "var(--text-primary)",
                textShadow:
                  "0 0 60px rgba(232,244,255,0.07), 0 2px 40px rgba(0,0,0,0.8)",
              }}
            >
              SUJITH SANTHOSH
            </h1>
          </motion.div>

          {/* Divider */}
          <motion.div
            className="h-px"
            style={{
              background:
                "linear-gradient(to right, transparent, var(--ferrari), var(--ion), transparent)",
            }}
            initial={{ width: 0 }}
            animate={{ width: 320 }}
            transition={{ duration: 0.9, delay: 0.55, ease: "easeOut" }}
          />

          {/* Role */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.65 }}
          >
            <CyclingRole />
          </motion.div>

          {/* Available badge */}
          <motion.div
            className="flex items-center gap-2 px-4 py-1.5 pointer-events-auto"
            style={{
              border: "1px solid rgba(0,255,136,0.22)",
              background: "rgba(0,255,136,0.04)",
              backdropFilter: "blur(8px)",
            }}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.78, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
          >
            <StatusDot color="ok" />
            <span
              className="terminal-text text-xs tracking-widest"
              style={{ color: "var(--status-ok)" }}
            >
              AVAILABLE FOR HIRE
            </span>
          </motion.div>

          {/* Hint */}
          <motion.p
            className="terminal-text text-xs tracking-widest mt-2"
            style={{ color: "var(--text-dim)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.1 }}
          >
            SELECT A MODULE TO BEGIN
          </motion.p>
        </div>
      </div>

      {/* ── BOTTOM NAV BAR ── */}
      <motion.footer
        {...SLIDE_IN(0.12, 60)}
        className="fixed bottom-0 left-0 right-0 z-30"
        style={{
          borderTop: "1px solid var(--glass-border)",
          background: "rgba(1,12,20,0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {/* Nav buttons */}
        <div className="flex items-center justify-center gap-2 px-6 py-2">
          {NAV_ITEMS.map((item, i) => (
            <NavItem key={item.id} item={item} index={i} />
          ))}
        </div>

        {/* Status row */}
        <div
          className="flex items-center justify-between px-6 py-1.5"
          style={{ borderTop: "1px solid rgba(0,212,255,0.05)" }}
        >
          <div className="flex items-center gap-2">
            <StatusDot color="ferrari" />
            <span
              className="terminal-text text-xs tracking-widest"
              style={{ color: "var(--text-dim)" }}
            >
              ACTIVE: {activeModule ? activeModule.toUpperCase() : "COMMAND_CENTER"}
            </span>
          </div>
          <span
            className="terminal-text text-xs"
            style={{ color: "var(--text-dim)" }}
          >
            BUILD 247
          </span>
        </div>
      </motion.footer>

      {/* Scanline */}
      <div
        className="scanline pointer-events-none"
        style={{ zIndex: 2, animationDuration: "9s" }}
      />

      {/* Noise grain */}
      <div className="noise-overlay" />
    </motion.div>
  );
}
