"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNexusStore } from "@/stores/nexusStore";

/* ============================================================
   DATA
   ============================================================ */

const METRICS = [
  { label: "PROBLEM SOLVING",   value: 100, color: "var(--ferrari)" },
  { label: "AI INTUITION",      value: 95,  color: "var(--ion)" },
  { label: "SYSTEM DESIGN",     value: 92,  color: "var(--ion)" },
  { label: "CODE QUALITY",      value: 98,  color: "var(--ferrari)" },
  { label: "SHIPPING VELOCITY", value: 94,  color: "var(--ion)" },
  { label: "CREATIVE THINKING", value: 88,  color: "var(--gold)" },
];

const FACTIONS = [
  { label: "FERRARI // F1",  color: "var(--ferrari)" },
  { label: "AI LABS",        color: "var(--ion)" },
  { label: "OPEN SOURCE",    color: "var(--ion)" },
  { label: "INDIE HACKERS",  color: "var(--gold)" },
  { label: "STARTUPS",       color: "var(--gold)" },
  { label: "SCI-FI ORDER",   color: "var(--ion)" },
  { label: "GAME DEV",       color: "var(--ion)" },
  { label: "BACKEND GUILD",  color: "var(--ferrari)" },
];

const TIMELINE = [
  {
    year: "2018",
    title: "SYSTEM BOOT",
    subtitle: "First line of code",
    desc: "Discovered programming. Wrote Hello World and felt like launching a rocket. The obsession was immediate.",
    tech: ["HTML", "CSS", "JavaScript"],
    status: "COMPLETED" as const,
  },
  {
    year: "2020",
    title: "WEB ARCHITECT",
    subtitle: "Full-stack era begins",
    desc: "Built web applications from DOM to database. Shipped first real products to real users. Everything clicked.",
    tech: ["React", "Node.js", "MongoDB", "Express"],
    status: "COMPLETED" as const,
  },
  {
    year: "2021",
    title: "BACKEND SPECIALIST",
    subtitle: "Systems at scale",
    desc: "Moved deep into backend systems. APIs, databases, microservices. Performance and reliability became obsessions.",
    tech: ["Python", "PostgreSQL", "Docker", "TypeScript"],
    status: "COMPLETED" as const,
  },
  {
    year: "2023",
    title: "AI AWAKENING",
    subtitle: "LLMs change everything",
    desc: "Discovered large language models. Built first AI integrations. The trajectory shifted permanently — no going back.",
    tech: ["Python", "OpenAI", "LangChain", "ML"],
    status: "COMPLETED" as const,
  },
  {
    year: "2024",
    title: "RAG ARCHITECT",
    subtitle: "Knowledge retrieval systems",
    desc: "Specialized in Retrieval-Augmented Generation. Built systems that retrieve context, reason over documents, and respond with precision.",
    tech: ["LangChain", "PostgreSQL", "Vector DBs", "RAG"],
    status: "COMPLETED" as const,
  },
  {
    year: "2025",
    title: "MULTI-AGENT SYSTEMS",
    subtitle: "Orchestrating intelligence",
    desc: "Building autonomous agent pipelines. Systems that think, plan, delegate, and execute — independently.",
    tech: ["LangGraph", "Airflow", "Python", "LLMs"],
    status: "ACTIVE" as const,
  },
  {
    year: "????",
    title: "NEXT MISSION",
    subtitle: "The chapter is unwritten",
    desc: "Looking for a team building something that matters. The best work is still ahead.",
    tech: [],
    status: "INCOMING" as const,
  },
] as const;

const BIO_LINES = [
  "> query --architect --full-profile",
  "",
  "DESIGNATION:  Sujith Santhosh",
  "ROLE:         AI / Software Engineer",
  "",
  "ANALYSIS:",
  "  Not a typical engineer. Architect by instinct,",
  "  builder by nature. Speaks to machines in Python,",
  "  trains them on data, ships them live.",
  "",
  "  Off-duty: tracking lap times at Grand Prix,",
  "  debating AI startups, lost in sci-fi universes.",
  "",
  "THREAT_LEVEL: MAXIMUM — hire immediately.",
  "",
  "[END_TRANSMISSION ✓]",
];
const BIO_TEXT = BIO_LINES.join("\n");

/* ============================================================
   TYPEWRITER HOOK
   ============================================================ */

function useTypewriter(text: string, speed = 20, started = false) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    if (!started) return;
    setDisplayed("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, started]);

  return displayed;
}

/* ============================================================
   HEX AVATAR
   ============================================================ */

function HexAvatar() {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative flex items-center justify-center mx-auto"
      style={{ width: 96, height: 110 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Hex fill */}
      <div
        className="absolute inset-0 transition-all duration-300"
        style={{
          clipPath:
            "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          background: hovered
            ? "rgba(220,0,0,0.18)"
            : "rgba(0,212,255,0.06)",
        }}
      />

      {/* Hex border SVG */}
      <svg
        className="absolute inset-0"
        viewBox="0 0 96 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ transition: "all 0.3s ease" }}
      >
        <polygon
          points="48,2 94,26 94,84 48,108 2,84 2,26"
          stroke={hovered ? "var(--ferrari)" : "var(--ion)"}
          strokeWidth="1"
          fill="none"
          style={{
            filter: hovered
              ? "drop-shadow(0 0 8px var(--ferrari))"
              : "drop-shadow(0 0 5px var(--ion))",
          }}
        />
        {/* Inner hex (decorative) */}
        <polygon
          points="48,14 82,32 82,78 48,96 14,78 14,32"
          stroke={hovered ? "rgba(220,0,0,0.3)" : "rgba(0,212,255,0.15)"}
          strokeWidth="0.5"
          fill="none"
        />
      </svg>

      {/* Initials */}
      <span
        className="font-display font-bold text-2xl tracking-widest relative z-10 transition-all duration-300"
        style={{
          color: hovered ? "var(--ferrari)" : "var(--text-primary)",
          textShadow: hovered
            ? "0 0 14px var(--ferrari), 0 0 28px var(--ferrari-glow)"
            : "0 0 10px rgba(232,244,255,0.25)",
        }}
      >
        S.S
      </span>

      {/* Scanline over hex */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{
          clipPath:
            "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
        }}
      >
        <div className="scanline" style={{ opacity: 0.3, animationDuration: "4s" }} />
      </div>
    </div>
  );
}

/* ============================================================
   METRIC BAR
   ============================================================ */

function MetricBar({
  label,
  value,
  color,
  delay,
  started,
}: {
  label: string;
  value: number;
  color: string;
  delay: number;
  started: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="terminal-text shrink-0"
        style={{ color: "var(--text-secondary)", width: 148, fontSize: 9.5 }}
      >
        {label}
      </span>
      <div
        className="flex-1 h-px relative overflow-hidden"
        style={{ background: "var(--text-dim)" }}
      >
        <motion.div
          className="absolute top-0 left-0 h-full"
          style={{ background: color, boxShadow: `0 0 5px ${color}` }}
          initial={{ width: 0 }}
          animate={{ width: started ? `${value}%` : 0 }}
          transition={{
            duration: 0.85,
            delay: started ? delay : 0,
            ease: [0.16, 1, 0.3, 1] as [number,number,number,number],
          }}
        />
      </div>
      <span
        className="font-hud text-xs shrink-0 text-right"
        style={{ color, width: 34 }}
      >
        {value}%
      </span>
    </div>
  );
}

/* ============================================================
   TIMELINE NODE
   ============================================================ */

const STATUS_META = {
  COMPLETED: { color: "var(--ion)",        label: "DONE"     },
  ACTIVE:    { color: "var(--status-ok)",  label: "ACTIVE"   },
  INCOMING:  { color: "var(--text-dim)",   label: "INCOMING" },
} as const;

function TimelineNode({
  node,
  index,
  isLast,
}: {
  node: (typeof TIMELINE)[number];
  index: number;
  isLast: boolean;
}) {
  const [expanded, setExpanded] = useState(index === 5); // ACTIVE node open by default
  const { color, label } = STATUS_META[node.status];
  const nextColor =
    !isLast ? STATUS_META[TIMELINE[index + 1].status].color : color;

  return (
    <motion.div
      className="relative flex gap-4"
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.38,
        delay: 0.35 + index * 0.065,
        ease: [0.16, 1, 0.3, 1] as [number,number,number,number],
      }}
    >
      {/* ── LEFT: trace + node ── */}
      <div
        className="flex flex-col items-center shrink-0"
        style={{ width: 22 }}
      >
        {/* Node dot */}
        <button
          data-cursor="pointer"
          className="rounded-full shrink-0 transition-all duration-300 focus:outline-none"
          style={{
            width: node.status === "ACTIVE" ? 14 : 10,
            height: node.status === "ACTIVE" ? 14 : 10,
            background: expanded ? "var(--ferrari)" : color,
            boxShadow:
              node.status === "ACTIVE"
                ? `0 0 10px ${color}, 0 0 22px ${color}50`
                : expanded
                ? "0 0 8px var(--ferrari), 0 0 14px var(--ferrari-glow)"
                : `0 0 5px ${color}80`,
            animation:
              node.status === "ACTIVE"
                ? "pulse-dot 1.4s ease-in-out infinite"
                : "none",
            marginTop: 2,
          }}
          onClick={() => setExpanded((e) => !e)}
        />

        {/* Trace line to next */}
        {!isLast && (
          <div
            className="flex-1 w-px mt-1.5"
            style={{
              background: `linear-gradient(to bottom, ${color}70, ${nextColor}40)`,
              minHeight: 28,
            }}
          />
        )}
      </div>

      {/* ── RIGHT: card ── */}
      <div
        className="flex-1 pb-5 cursor-pointer"
        onClick={() => setExpanded((e) => !e)}
      >
        <div
          className="transition-all duration-300 px-3 py-2.5"
          style={{
            borderLeft: `2px solid ${expanded ? "var(--ferrari)" : "transparent"}`,
            background: expanded ? "rgba(220,0,0,0.035)" : "transparent",
          }}
        >
          {/* Year + badge */}
          <div className="flex items-center gap-2 mb-1">
            <span
              className="font-hud text-xs transition-colors duration-300"
              style={{ color: expanded ? "var(--ferrari)" : color }}
            >
              {node.year}
            </span>
            <span
              className="terminal-text px-1.5 py-0.5"
              style={{
                color,
                border: `1px solid ${color}45`,
                fontSize: 8.5,
                letterSpacing: "0.09em",
                background: `${color}09`,
              }}
            >
              {label}
            </span>
            {/* Expand indicator */}
            <span
              className="ml-auto terminal-text transition-all duration-200"
              style={{ color: "var(--text-dim)", fontSize: 10 }}
            >
              {expanded ? "▲" : "▼"}
            </span>
          </div>

          {/* Title */}
          <h3
            className="font-display font-semibold text-sm tracking-wider transition-colors duration-300"
            style={{
              color: expanded ? "var(--text-primary)" : "var(--text-secondary)",
            }}
          >
            {node.title}
          </h3>
          <p
            className="terminal-text mt-0.5"
            style={{ color: "var(--text-dim)", fontSize: 10 }}
          >
            {node.subtitle}
          </p>

          {/* Expanded content */}
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                key="expanded"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.28, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <p
                  className="terminal-text text-xs mt-3 leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {node.desc}
                </p>

                {node.tech.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {(node.tech as readonly string[]).map((t) => (
                      <span
                        key={t}
                        className="terminal-text px-2 py-0.5"
                        style={{
                          border: "1px solid rgba(0,212,255,0.22)",
                          color: "var(--ion)",
                          fontSize: 9,
                          background: "rgba(0,212,255,0.04)",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================
   IDENTITY MODULE
   ============================================================ */

export function IdentityModule() {
  const { setActiveModule } = useNexusStore();
  const [metricsStarted, setMetricsStarted] = useState(false);
  const [bioStarted, setBioStarted] = useState(false);
  const bioText = useTypewriter(BIO_TEXT, 18, bioStarted);

  const close = useCallback(() => setActiveModule(null), [setActiveModule]);

  // Stagger: metrics animate in after panel slides, bio starts after metrics
  useEffect(() => {
    const t1 = setTimeout(() => setMetricsStarted(true), 380);
    const t2 = setTimeout(() => setBioStarted(true), 900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  return (
    <>
      {/* ── BACKDROP ── */}
      <motion.div
        className="fixed inset-0"
        style={{ background: "rgba(0,5,8,0.65)", zIndex: 22 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={close}
      />

      {/* ── PANEL ── */}
      <motion.div
        className="fixed top-0 bottom-0 left-0 flex flex-col"
        style={{
          width: "min(76vw, 1060px)",
          zIndex: 25,
          background: "rgba(1,12,20,0.95)",
          borderRight: "1px solid var(--glass-border)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          boxShadow:
            "6px 0 50px rgba(0,0,0,0.7), 1px 0 0 rgba(0,212,255,0.08)",
        }}
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ duration: 0.46, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Corner accents */}
        <div
          className="absolute top-0 right-0 w-5 h-5 border-t border-r pointer-events-none"
          style={{ borderColor: "var(--ion-dim)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-5 h-5 border-b border-r pointer-events-none"
          style={{ borderColor: "var(--ion-dim)" }}
        />

        {/* Scanline */}
        <div
          className="scanline pointer-events-none"
          style={{ animationDuration: "7s", opacity: 0.4 }}
        />

        {/* ── MODULE HEADER ── */}
        {/* pt-[50px] clears the CommandHub top bar which sits at z-30 above this panel */}
        <motion.div
          className="flex items-center justify-between px-8 pt-[50px] pb-4 shrink-0"
          style={{ borderBottom: "1px solid var(--glass-border)" }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.18 }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: "var(--ferrari)",
                boxShadow: "0 0 8px var(--ferrari)",
                animation: "pulse-dot 1.5s ease-in-out infinite",
              }}
            />
            <span
              className="terminal-text text-xs tracking-widest"
              style={{ color: "var(--text-dim)" }}
            >
              MODULE_01
            </span>
            <span
              className="font-display font-semibold text-sm tracking-widest"
              style={{ color: "var(--text-primary)" }}
            >
              // IDENTITY
            </span>
          </div>

          <CloseButton onClose={close} />
        </motion.div>

        {/* ── MAIN CONTENT ── */}
        <div className="flex flex-1 min-h-0">

          {/* LEFT: Dossier */}
          <motion.aside
            className="flex flex-col gap-6 px-7 py-6 overflow-y-auto shrink-0"
            style={{
              width: 290,
              borderRight: "1px solid var(--glass-border)",
              scrollbarWidth: "thin",
              scrollbarColor: "var(--ferrari-dim) transparent",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <HexAvatar />

            {/* Classification block */}
            <ProfileClassification />

            {/* Metric bars */}
            <div className="flex flex-col gap-2.5">
              <SectionLabel>PERFORMANCE_METRICS</SectionLabel>
              {METRICS.map((m, i) => (
                <MetricBar
                  key={m.label}
                  label={m.label}
                  value={m.value}
                  color={m.color}
                  delay={i * 0.07}
                  started={metricsStarted}
                />
              ))}
            </div>

            {/* Faction badges */}
            <div className="flex flex-col gap-3">
              <SectionLabel>FACTION_ALLEGIANCES</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {FACTIONS.map((f, i) => (
                  <motion.span
                    key={f.label}
                    className="terminal-text px-2 py-1"
                    style={{
                      border: `1px solid ${f.color}40`,
                      color: f.color,
                      fontSize: 9,
                      letterSpacing: "0.07em",
                      background: `${f.color}08`,
                    }}
                    initial={{ opacity: 0, scale: 0.82 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.28,
                      delay: 0.55 + i * 0.04,
                      ease: [0.34, 1.56, 0.64, 1] as [number,number,number,number],
                    }}
                  >
                    {f.label}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.aside>

          {/* RIGHT: Timeline */}
          <motion.div
            className="flex-1 px-8 py-6 overflow-y-auto"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "var(--ferrari-dim) transparent",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="mb-5">
              <SectionLabel>CAREER_CHRONICLE — CLICK ANY NODE TO EXPAND</SectionLabel>
            </div>

            {TIMELINE.map((node, i) => (
              <TimelineNode
                key={node.year + node.title}
                node={node}
                index={i}
                isLast={i === TIMELINE.length - 1}
              />
            ))}
          </motion.div>
        </div>

        {/* ── FOOTER: Bio terminal ── */}
        <motion.div
          className="px-8 py-4 shrink-0"
          style={{
            borderTop: "1px solid var(--glass-border)",
            /* pb clears the CommandHub bottom bar at z-30 */
            paddingBottom: "calc(1rem + 118px)",
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
        >
          <pre
            className="terminal-text text-xs leading-relaxed"
            style={{
              color: "var(--text-terminal)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              minHeight: 64,
            }}
          >
            {bioText}
            {bioText.length < BIO_TEXT.length && (
              <span
                className="inline-block w-2 h-3 ml-px align-middle"
                style={{
                  background: "var(--ion)",
                  animation: "blink 0.7s step-end infinite",
                }}
              />
            )}
          </pre>
        </motion.div>
      </motion.div>
    </>
  );
}

/* ============================================================
   SMALL REUSABLE PIECES
   ============================================================ */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="terminal-text tracking-widest"
      style={{ color: "var(--text-dim)", fontSize: 9 }}
    >
      // {children}
    </span>
  );
}

function ProfileClassification() {
  const rows = [
    { label: "DESIGNATION", value: "SUJITH SANTHOSH",        accent: false },
    { label: "ROLE",         value: "AI / SOFTWARE ENGINEER", accent: false },
    { label: "STATUS",       value: "ACTIVE — AVAILABLE",     accent: "ok"  },
    { label: "CLEARANCE",    value: "TOP LEVEL",               accent: false },
    { label: "LOCATION",     value: "INDIA",                   accent: false },
    { label: "THREAT",       value: "MAXIMUM — HIRE NOW",      accent: "red" },
  ] as const;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="h-px flex-1" style={{ background: "var(--glass-border)" }} />
        <span
          className="terminal-text tracking-widest"
          style={{ color: "var(--ferrari)", fontSize: 8.5 }}
        >
          // CLASSIFIED
        </span>
        <div className="h-px flex-1" style={{ background: "var(--glass-border)" }} />
      </div>

      {rows.map(({ label, value, accent }) => (
        <div key={label} className="flex flex-col gap-0.5">
          <span
            className="terminal-text"
            style={{ color: "var(--text-dim)", fontSize: 9 }}
          >
            {label}
          </span>
          <span
            className="terminal-text text-xs"
            style={{
              color:
                accent === "red"
                  ? "var(--ferrari)"
                  : accent === "ok"
                  ? "var(--status-ok)"
                  : "var(--text-primary)",
              textShadow:
                accent === "red"
                  ? "0 0 6px var(--ferrari-glow)"
                  : accent === "ok"
                  ? "0 0 6px var(--status-ok)"
                  : "none",
            }}
          >
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}

function CloseButton({ onClose }: { onClose: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      data-cursor="pointer"
      className="flex items-center gap-2 px-3 py-1.5 terminal-text text-xs tracking-widest transition-all duration-200"
      style={{
        border: `1px solid ${hovered ? "var(--ferrari)" : "var(--glass-border)"}`,
        color: hovered ? "var(--ferrari)" : "var(--text-secondary)",
        boxShadow: hovered ? "0 0 10px var(--ferrari-glow)" : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClose}
    >
      [ ESC ] CLOSE
    </button>
  );
}
