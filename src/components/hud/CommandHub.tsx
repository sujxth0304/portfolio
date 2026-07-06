"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  "SYSTEMS BUILDER",
];

function CyclingRole() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % ROLES.length),
      2800
    );
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
          transition={{ duration: 0.28, ease: "easeInOut" }}
        >
          {ROLES[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

/* ============================================================
   CSS PARTICLE STARS
   ============================================================ */

interface Star {
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

function StarField() {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    // Generate deterministic-feeling stars client-side
    const generated: Star[] = Array.from({ length: 120 }, (_, i) => {
      const seed = (i * 9301 + 49297) % 233280;
      const rng = seed / 233280;
      const seed2 = (i * 6971 + 3 + 7919) % 233280;
      const rng2 = seed2 / 233280;
      const seed3 = (i * 1021 + 17 * i) % 233280;
      const rng3 = seed3 / 233280;
      return {
        x: rng * 100,
        y: rng2 * 100,
        size: rng3 < 0.7 ? 1 : rng3 < 0.9 ? 1.5 : 2,
        delay: rng * 5,
        duration: 2 + rng2 * 4,
      };
    });
    setStars(generated);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            backgroundColor:
              i % 5 === 0 ? "var(--ferrari)" : i % 3 === 0 ? "var(--ion)" : "var(--text-primary)",
            animation: `star-twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ============================================================
   CSS ORBITING RINGS
   ============================================================ */

function OrbRings() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{ perspective: "800px" }}
    >
      {/* Ring 1 — tight, red */}
      <div
        className="absolute rounded-full"
        style={{
          width: 220,
          height: 220,
          border: "1px solid rgba(220,0,0,0.25)",
          transform: "rotateX(72deg) rotateZ(0deg)",
          animation: "rotate-cw 9s linear infinite",
          boxShadow: "0 0 12px rgba(220,0,0,0.08)",
        }}
      />
      {/* Ring 1 dot marker */}
      <div
        className="absolute"
        style={{
          width: 4,
          height: 4,
          borderRadius: "50%",
          background: "var(--ferrari)",
          boxShadow: "0 0 8px var(--ferrari)",
          transform: `translateX(110px) translateY(-1px)`,
          animation: "rotate-cw 9s linear infinite",
          transformOrigin: "-110px 1px",
        }}
      />

      {/* Ring 2 — mid, cyan */}
      <div
        className="absolute rounded-full"
        style={{
          width: 340,
          height: 340,
          border: "1px solid rgba(0,212,255,0.18)",
          transform: "rotateX(68deg) rotateY(20deg)",
          animation: "rotate-ccw 14s linear infinite",
          boxShadow: "0 0 16px rgba(0,212,255,0.06)",
        }}
      />
      {/* Ring 2 dot marker */}
      <div
        className="absolute"
        style={{
          width: 3,
          height: 3,
          borderRadius: "50%",
          background: "var(--ion)",
          boxShadow: "0 0 8px var(--ion)",
          transform: `translateX(-170px)`,
          animation: "rotate-ccw 14s linear infinite",
          transformOrigin: "170px 1.5px",
        }}
      />

      {/* Ring 3 — outer, dim */}
      <div
        className="absolute rounded-full"
        style={{
          width: 480,
          height: 480,
          border: "1px solid rgba(201,168,76,0.10)",
          transform: "rotateX(74deg) rotateZ(45deg)",
          animation: "rotate-cw 22s linear infinite",
        }}
      />
    </div>
  );
}

/* ============================================================
   CENTRAL ORB
   ============================================================ */

function CentralOrb() {
  return (
    <div className="relative flex items-center justify-center w-32 h-32">
      {/* Core glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: 80,
          height: 80,
          background:
            "radial-gradient(circle, rgba(220,0,0,0.4) 0%, rgba(0,212,255,0.2) 50%, transparent 75%)",
          filter: "blur(8px)",
          animation: "pulse-ferrari 3s ease-in-out infinite",
        }}
      />
      {/* Inner sphere */}
      <div
        className="absolute rounded-full"
        style={{
          width: 40,
          height: 40,
          background:
            "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.15), rgba(220,0,0,0.6) 50%, rgba(0,0,5,0.9))",
          border: "1px solid rgba(220,0,0,0.5)",
          boxShadow:
            "0 0 20px rgba(220,0,0,0.4), 0 0 40px rgba(220,0,0,0.15), inset 0 0 10px rgba(255,255,255,0.05)",
          animation: "float 4s ease-in-out infinite",
        }}
      />
      {/* Outer glow ring */}
      <div
        className="absolute rounded-full"
        style={{
          width: 100,
          height: 100,
          border: "1px solid rgba(0,212,255,0.12)",
          animation: "pulse-ion 4s ease-in-out infinite",
        }}
      />
    </div>
  );
}

/* ============================================================
   NAV ITEMS
   ============================================================ */

const NAV_ITEMS = [
  { id: "identity",     code: "01", label: "IDENTITY",     icon: "◈" },
  { id: "missions",     code: "02", label: "MISSIONS",     icon: "◉" },
  { id: "matrix",       code: "03", label: "NEURAL MATRIX",icon: "◎" },
  { id: "chronicle",    code: "04", label: "CHRONICLE",    icon: "◊" },
  { id: "transmission", code: "05", label: "TRANSMISSION", icon: "◈" },
];

function NavItem({
  item,
  index,
}: {
  item: (typeof NAV_ITEMS)[number];
  index: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      data-cursor="pointer"
      className="relative flex flex-col items-center gap-2 px-5 py-4 group"
      style={{
        background: hovered ? "rgba(220,0,0,0.06)" : "rgba(0,212,255,0.02)",
        border: `1px solid ${hovered ? "rgba(220,0,0,0.35)" : "rgba(0,212,255,0.10)"}`,
        transition: "background 0.2s, border-color 0.2s",
        minWidth: 110,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Corner brackets */}
      <span
        className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l transition-colors duration-200"
        style={{ borderColor: hovered ? "var(--ferrari)" : "var(--ion-dim)" }}
      />
      <span
        className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r transition-colors duration-200"
        style={{ borderColor: hovered ? "var(--ferrari)" : "var(--ion-dim)" }}
      />

      {/* Code */}
      <span
        className="font-hud text-xs tracking-widest transition-colors duration-200"
        style={{ color: hovered ? "var(--ferrari)" : "var(--text-dim)" }}
      >
        {item.code}
      </span>

      {/* Icon */}
      <span
        className="text-2xl transition-all duration-200"
        style={{
          color: hovered ? "var(--ferrari)" : "var(--ion-dim)",
          textShadow: hovered ? "0 0 10px var(--ferrari), 0 0 20px var(--ferrari-glow)" : "none",
        }}
      >
        {item.icon}
      </span>

      {/* Label */}
      <span
        className="terminal-text text-xs tracking-widest transition-colors duration-200"
        style={{ color: hovered ? "var(--text-primary)" : "var(--text-secondary)" }}
      >
        {item.label}
      </span>

      {/* Hover underline */}
      {hovered && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: "var(--ferrari)" }}
          layoutId="nav-underline"
          transition={{ duration: 0.15 }}
        />
      )}
    </motion.button>
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
   COMMAND HUB
   ============================================================ */

export function CommandHub() {
  const clock = useClock();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const stagger = (i: number) => ({
    initial: { opacity: 0, y: -8 },
    animate: { opacity: visible ? 1 : 0, y: visible ? 0 : -8 },
    transition: { duration: 0.5, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  });

  return (
    <motion.div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: "var(--void)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Starfield */}
      <StarField />

      {/* Background gradient — dual radial */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 50% 45%, rgba(220,0,0,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 80% 60% at 50% 55%, rgba(0,212,255,0.04) 0%, transparent 70%)
          `,
        }}
      />

      {/* Scanline */}
      <div className="scanline" style={{ animationDuration: "8s" }} />

      {/* ── TOP HUD BAR ── */}
      <motion.header
        className="relative z-30 flex items-center justify-between px-6 py-3 shrink-0"
        style={{
          borderBottom: "1px solid var(--glass-border)",
          background: "rgba(1,12,20,0.85)",
          backdropFilter: "blur(20px)",
        }}
        initial={{ y: -48, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Left — branding */}
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
        </div>

        {/* Center — status */}
        <div className="flex items-center gap-6">
          {[
            { label: "SYSTEM", value: "ONLINE" },
            { label: "VISITOR", value: "GUEST" },
            { label: "CLEARANCE", value: "LIMITED" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              className="flex items-center gap-2 terminal-text text-xs"
              {...stagger(i)}
            >
              <span style={{ color: "var(--text-dim)" }}>{item.label}:</span>
              <span
                style={{
                  color:
                    item.value === "ONLINE" ? "var(--status-ok)" : "var(--ion)",
                  textShadow:
                    item.value === "ONLINE"
                      ? "0 0 6px var(--status-ok)"
                      : "none",
                }}
              >
                {item.value}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Right — clock */}
        <div className="flex items-center gap-2">
          <span
            className="font-hud text-xs tracking-widest"
            style={{ color: "var(--text-secondary)" }}
          >
            {clock}
          </span>
        </div>
      </motion.header>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="relative flex-1 flex flex-col items-center justify-center z-10 overflow-hidden">
        {/* Orbiting rings */}
        <OrbRings />

        {/* Central identity block */}
        <div className="relative flex flex-col items-center gap-6 text-center">
          {/* Orb */}
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <CentralOrb />
          </motion.div>

          {/* Name */}
          <motion.div
            className="flex flex-col items-center gap-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1
              className="font-display font-bold tracking-[0.15em] text-4xl md:text-5xl"
              style={{
                color: "var(--text-primary)",
                textShadow: "0 0 40px rgba(232,244,255,0.08)",
              }}
            >
              SUJITH SANTHOSH
            </h1>

            {/* Divider line */}
            <motion.div
              className="h-px w-0 my-3"
              style={{ background: "linear-gradient(to right, transparent, var(--ferrari), var(--ion), transparent)" }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            />

            {/* Cycling role */}
            <CyclingRole />
          </motion.div>

          {/* Status badge */}
          <motion.div
            className="flex items-center gap-2 px-4 py-1.5"
            style={{
              border: "1px solid rgba(0,255,136,0.2)",
              background: "rgba(0,255,136,0.04)",
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <StatusDot color="ok" />
            <span
              className="terminal-text text-xs tracking-widest"
              style={{ color: "var(--status-ok)" }}
            >
              AVAILABLE FOR HIRE
            </span>
          </motion.div>

          {/* Hint text */}
          <motion.p
            className="terminal-text text-xs tracking-widest"
            style={{ color: "var(--text-dim)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            SELECT A MODULE TO BEGIN
          </motion.p>
        </div>
      </main>

      {/* ── LEFT DATA STRIP ── */}
      <motion.aside
        className="fixed left-0 top-1/2 -translate-y-1/2 z-20 px-4 py-5 flex flex-col gap-4"
        style={{
          borderRight: "1px solid var(--glass-border)",
          background: "rgba(1,12,20,0.7)",
          backdropFilter: "blur(12px)",
          minWidth: 140,
        }}
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <DataRow label="LEVEL" value="07" accent />
        <MiniBar label="XP" value={72} color="var(--ferrari)" />
        <MiniBar label="PYTHON" value={98} color="var(--ion)" />
        <MiniBar label="AI / ML" value={95} color="var(--ion)" />
        <MiniBar label="NODE" value={88} color="var(--ion)" />
        <div className="h-px w-full" style={{ background: "var(--glass-border)" }} />
        <DataRow label="COMMITS" value="2,847" />
        <DataRow label="PROJECTS" value="12" />
        <DataRow label="UPTIME" value="99.9%" />
      </motion.aside>

      {/* ── RIGHT ACTIVITY FEED ── */}
      <motion.aside
        className="fixed right-0 top-1/2 -translate-y-1/2 z-20 px-4 py-5 flex flex-col gap-2"
        style={{
          borderLeft: "1px solid var(--glass-border)",
          background: "rgba(1,12,20,0.7)",
          backdropFilter: "blur(12px)",
          minWidth: 180,
        }}
        initial={{ x: 80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <span
          className="terminal-text text-xs tracking-widest mb-2"
          style={{ color: "var(--text-dim)" }}
        >
          // ACTIVITY
        </span>
        {[
          "RAG system deployed",
          "Agent v2 online",
          "PR merged",
          "Model fine-tuned",
          "API optimized",
          "Tests passing",
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span style={{ color: "var(--ion)", fontSize: 10 }}>›</span>
            <span
              className="terminal-text text-xs"
              style={{ color: "var(--text-secondary)" }}
            >
              {item}
            </span>
          </div>
        ))}
      </motion.aside>

      {/* ── BOTTOM NAV BAR ── */}
      <motion.footer
        className="relative z-30 shrink-0"
        style={{
          borderTop: "1px solid var(--glass-border)",
          background: "rgba(1,12,20,0.85)",
          backdropFilter: "blur(20px)",
        }}
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Nav items */}
        <div className="flex items-center justify-center gap-2 px-6 py-2">
          {NAV_ITEMS.map((item, i) => (
            <NavItem key={item.id} item={item} index={i} />
          ))}
        </div>

        {/* Bottom status bar */}
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
              ACTIVE: COMMAND_CENTER
            </span>
          </div>
          <span
            className="terminal-text text-xs"
            style={{ color: "var(--text-dim)" }}
          >
            v3.7.1 | BUILD 247
          </span>
        </div>
      </motion.footer>

      {/* Noise overlay */}
      <div className="noise-overlay" />
    </motion.div>
  );
}

/* ============================================================
   MINI HELPERS
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
        className="terminal-text text-xs"
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

function MiniBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
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
        <span
          className="font-hud"
          style={{ color, fontSize: 10 }}
        >
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
          transition={{ duration: 0.9, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}
