"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNexusStore } from "@/stores/nexusStore";

/* ============================================================
   DATA
   ============================================================ */

type MissionStatus = "DEPLOYED" | "ACTIVE" | "CLASSIFIED";

interface Mission {
  code: string;
  codename: string;
  title: string;
  status: MissionStatus;
  difficulty: 1 | 2 | 3 | 4 | 5;
  objective: string;
  briefing: string;
  tech: string[];
  stats: { label: string; value: string }[];
  links?: { label: string; href: string }[];
}

const MISSIONS: Mission[] = [
  {
    code: "M-01",
    codename: "ORACLE",
    title: "RAG KNOWLEDGE ENGINE",
    status: "DEPLOYED",
    difficulty: 5,
    objective:
      "Turn a sprawling document corpus into a precise, cited, real-time answer machine.",
    briefing:
      "Built a production Retrieval-Augmented Generation pipeline: chunking, embedding, hybrid vector + keyword search, and re-ranking feeding an LLM that answers with source citations. Sub-second retrieval over hundreds of thousands of documents.",
    tech: ["Python", "LangChain", "PostgreSQL", "pgvector", "OpenAI"],
    stats: [
      { label: "DOCS INDEXED", value: "480K+" },
      { label: "P95 LATENCY", value: "740ms" },
      { label: "ANSWER ACCURACY", value: "94%" },
    ],
    links: [
      { label: "SOURCE", href: "#" },
      { label: "LIVE", href: "#" },
    ],
  },
  {
    code: "M-02",
    codename: "SWARM",
    title: "MULTI-AGENT ORCHESTRATOR",
    status: "ACTIVE",
    difficulty: 5,
    objective:
      "Coordinate autonomous agents that plan, delegate, and execute long-horizon tasks without a human in the loop.",
    briefing:
      "A LangGraph-based orchestration layer where specialized agents (planner, researcher, coder, critic) pass state through a directed graph with retries, guardrails, and tool access. Runs unattended pipelines end-to-end.",
    tech: ["LangGraph", "Python", "Redis", "FastAPI", "LLMs"],
    stats: [
      { label: "AGENTS", value: "6" },
      { label: "TASK SUCCESS", value: "88%" },
      { label: "AUTONOMY", value: "FULL" },
    ],
    links: [{ label: "SOURCE", href: "#" }],
  },
  {
    code: "M-03",
    codename: "VELOCITY",
    title: "HIGH-THROUGHPUT API CORE",
    status: "DEPLOYED",
    difficulty: 4,
    objective:
      "Serve millions of requests a day with predictable latency and near-zero downtime.",
    briefing:
      "Designed an async backend with connection pooling, layered caching, and horizontal autoscaling. Cut p95 latency by 60% and held 99.9% uptime through traffic spikes and rolling deploys.",
    tech: ["Node.js", "TypeScript", "PostgreSQL", "Redis", "Docker"],
    stats: [
      { label: "REQ / DAY", value: "3.2M" },
      { label: "LATENCY ↓", value: "−60%" },
      { label: "UPTIME", value: "99.9%" },
    ],
    links: [
      { label: "SOURCE", href: "#" },
      { label: "LIVE", href: "#" },
    ],
  },
  {
    code: "M-04",
    codename: "FORGE",
    title: "FINE-TUNING PIPELINE",
    status: "DEPLOYED",
    difficulty: 4,
    objective:
      "Take a base model to a domain specialist with a reproducible, monitored training loop.",
    briefing:
      "Data curation, LoRA fine-tuning, evaluation harness, and automated deployment. Versioned datasets and experiment tracking make every run reproducible and every regression visible.",
    tech: ["Python", "PyTorch", "Transformers", "Weights & Biases"],
    stats: [
      { label: "EVAL GAIN", value: "+31%" },
      { label: "TRAIN COST ↓", value: "−45%" },
      { label: "RUNS TRACKED", value: "200+" },
    ],
    links: [{ label: "SOURCE", href: "#" }],
  },
  {
    code: "M-05",
    codename: "SENTINEL",
    title: "REAL-TIME DATA STREAM",
    status: "ACTIVE",
    difficulty: 3,
    objective:
      "Ingest, transform, and route high-volume event streams with exactly-once guarantees.",
    briefing:
      "An event-driven pipeline moving data from producers to consumers through a durable queue with backpressure, dead-letter handling, and live dashboards. Powers analytics and alerting in real time.",
    tech: ["Python", "Kafka", "Airflow", "PostgreSQL"],
    stats: [
      { label: "EVENTS / S", value: "12K" },
      { label: "DELIVERY", value: "EXACTLY-1" },
      { label: "LAG", value: "<2s" },
    ],
    links: [{ label: "SOURCE", href: "#" }],
  },
  {
    code: "M-06",
    codename: "CIPHER",
    title: "NEXT MISSION",
    status: "CLASSIFIED",
    difficulty: 5,
    objective: "Details sealed until the right team unlocks them.",
    briefing:
      "The next build is still on the drawing board — something ambitious at the edge of AI and systems. Clearance required. Recruit the architect to declassify.",
    tech: [],
    stats: [
      { label: "STATUS", value: "SEALED" },
      { label: "CLEARANCE", value: "PENDING" },
      { label: "IMPACT", value: "???" },
    ],
  },
];

const STATUS_META: Record<
  MissionStatus,
  { color: string; label: string }
> = {
  DEPLOYED: { color: "var(--status-ok)", label: "DEPLOYED" },
  ACTIVE: { color: "var(--ion)", label: "ACTIVE" },
  CLASSIFIED: { color: "var(--gold)", label: "CLASSIFIED" },
};

/* ============================================================
   MISSIONS MODULE
   ============================================================ */

export function MissionsModule() {
  const { setActiveModule } = useNexusStore();
  const [selected, setSelected] = useState(0);

  const close = useCallback(() => setActiveModule(null), [setActiveModule]);

  // ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  const mission = MISSIONS[selected];
  const meta = STATUS_META[mission.status];

  const deployed = MISSIONS.filter((m) => m.status === "DEPLOYED").length;
  const active = MISSIONS.filter((m) => m.status === "ACTIVE").length;

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
          boxShadow: "6px 0 50px rgba(0,0,0,0.7), 1px 0 0 rgba(0,212,255,0.08)",
        }}
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ duration: 0.46, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
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
              MODULE_02
            </span>
            <span
              className="font-display font-semibold text-sm tracking-widest"
              style={{ color: "var(--text-primary)" }}
            >
              {"// MISSIONS"}
            </span>
          </div>

          <CloseButton onClose={close} />
        </motion.div>

        {/* ── MAIN CONTENT ── */}
        <div className="flex flex-1 min-h-0">
          {/* LEFT: Mission roster */}
          <motion.aside
            className="flex flex-col gap-2 px-5 py-6 overflow-y-auto shrink-0"
            style={{
              width: 288,
              borderRight: "1px solid var(--glass-border)",
              scrollbarWidth: "thin",
              scrollbarColor: "var(--ferrari-dim) transparent",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <div className="px-2 mb-1">
              <SectionLabel>MISSION_ROSTER — {MISSIONS.length} FILES</SectionLabel>
            </div>

            {MISSIONS.map((m, i) => (
              <MissionListItem
                key={m.code}
                mission={m}
                index={i}
                active={i === selected}
                onSelect={() => setSelected(i)}
              />
            ))}
          </motion.aside>

          {/* RIGHT: Mission briefing */}
          <div
            className="flex-1 overflow-y-auto"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "var(--ferrari-dim) transparent",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={mission.code}
                className="px-8 py-6"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              >
                {/* Codename + status */}
                <div className="flex items-center gap-3 mb-1">
                  <span
                    className="font-hud text-xs tracking-widest"
                    style={{ color: "var(--text-dim)" }}
                  >
                    {mission.code}
                  </span>
                  <span
                    className="terminal-text px-1.5 py-0.5"
                    style={{
                      color: meta.color,
                      border: `1px solid ${meta.color}45`,
                      fontSize: 8.5,
                      letterSpacing: "0.09em",
                      background: `${meta.color}09`,
                    }}
                  >
                    {meta.label}
                  </span>
                  <DifficultyMeter level={mission.difficulty} />
                </div>

                {/* Codename */}
                <p
                  className="terminal-text mb-1"
                  style={{ color: "var(--ferrari)", fontSize: 11, letterSpacing: "0.14em" }}
                >
                  OPERATION {mission.codename}
                </p>

                {/* Title */}
                <h2
                  className="font-display font-bold text-2xl tracking-wider mb-4"
                  style={{
                    color: "var(--text-primary)",
                    textShadow: "0 0 30px rgba(232,244,255,0.08)",
                  }}
                >
                  {mission.title}
                </h2>

                {/* Objective */}
                <div className="mb-5">
                  <SectionLabel>OBJECTIVE</SectionLabel>
                  <p
                    className="terminal-text text-xs leading-relaxed mt-1.5"
                    style={{ color: "var(--ion)" }}
                  >
                    {mission.objective}
                  </p>
                </div>

                {/* Briefing */}
                <div className="mb-5">
                  <SectionLabel>BRIEFING</SectionLabel>
                  <p
                    className="terminal-text text-xs leading-relaxed mt-1.5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {mission.briefing}
                  </p>
                </div>

                {/* Impact stats */}
                <div className="mb-5">
                  <SectionLabel>IMPACT_METRICS</SectionLabel>
                  <div className="grid grid-cols-3 gap-3 mt-2.5">
                    {mission.stats.map((s, i) => (
                      <StatTile key={s.label} label={s.label} value={s.value} index={i} />
                    ))}
                  </div>
                </div>

                {/* Tech loadout */}
                {mission.tech.length > 0 && (
                  <div className="mb-5">
                    <SectionLabel>TECH_LOADOUT</SectionLabel>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {mission.tech.map((t) => (
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
                  </div>
                )}

                {/* Links */}
                {mission.links && mission.links.length > 0 && (
                  <div className="flex gap-2 mt-6">
                    {mission.links.map((l) => (
                      <MissionLink key={l.label} label={l.label} href={l.href} />
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── FOOTER: roster summary ── */}
        <motion.div
          className="flex items-center gap-6 px-8 py-4 shrink-0"
          style={{
            borderTop: "1px solid var(--glass-border)",
            /* pb clears the CommandHub bottom bar at z-30 */
            paddingBottom: "calc(1rem + 118px)",
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
        >
          <FooterStat label="TOTAL" value={String(MISSIONS.length)} color="var(--text-primary)" />
          <FooterStat label="DEPLOYED" value={String(deployed)} color="var(--status-ok)" />
          <FooterStat label="ACTIVE" value={String(active)} color="var(--ion)" />
          <span
            className="terminal-text ml-auto"
            style={{ color: "var(--text-dim)", fontSize: 9.5 }}
          >
            {"// SELECT A FILE TO VIEW BRIEFING"}
          </span>
        </motion.div>
      </motion.div>
    </>
  );
}

/* ============================================================
   MISSION LIST ITEM
   ============================================================ */

function MissionListItem({
  mission,
  index,
  active,
  onSelect,
}: {
  mission: Mission;
  index: number;
  active: boolean;
  onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const meta = STATUS_META[mission.status];
  const lit = active || hovered;

  return (
    <motion.button
      data-cursor="pointer"
      className="relative flex flex-col gap-1 px-3 py-2.5 text-left transition-colors duration-200 focus:outline-none"
      style={{
        border: `1px solid ${
          active
            ? "rgba(220,0,0,0.5)"
            : hovered
            ? "rgba(220,0,0,0.32)"
            : "rgba(0,212,255,0.08)"
        }`,
        background: active
          ? "rgba(220,0,0,0.09)"
          : hovered
          ? "rgba(220,0,0,0.045)"
          : "rgba(0,212,255,0.015)",
        boxShadow: active ? "0 0 12px var(--ferrari-glow)" : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onSelect}
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.35,
        delay: 0.3 + index * 0.05,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
    >
      {/* Active left bar */}
      <span
        className="absolute left-0 top-0 bottom-0 w-0.5 transition-all duration-200"
        style={{ background: active ? "var(--ferrari)" : "transparent" }}
      />

      <div className="flex items-center gap-2">
        <span
          className="font-hud text-xs tracking-widest"
          style={{ color: lit ? "var(--ferrari)" : "var(--text-dim)" }}
        >
          {mission.code}
        </span>
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: meta.color, boxShadow: `0 0 5px ${meta.color}` }}
        />
        <span
          className="terminal-text ml-auto"
          style={{ color: meta.color, fontSize: 8 }}
        >
          {meta.label}
        </span>
      </div>

      <span
        className="font-display font-semibold text-xs tracking-wider transition-colors duration-200"
        style={{ color: lit ? "var(--text-primary)" : "var(--text-secondary)" }}
      >
        {mission.title}
      </span>
      <span
        className="terminal-text"
        style={{ color: "var(--text-dim)", fontSize: 9, letterSpacing: "0.12em" }}
      >
        OP. {mission.codename}
      </span>
    </motion.button>
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
      {"// "}
      {children}
    </span>
  );
}

function DifficultyMeter({ level }: { level: number }) {
  return (
    <span className="flex items-center gap-0.5 ml-auto">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className="w-1.5 h-1.5"
          style={{
            transform: "rotate(45deg)",
            background: i < level ? "var(--ferrari)" : "transparent",
            border: `1px solid ${i < level ? "var(--ferrari)" : "var(--text-dim)"}`,
            boxShadow: i < level ? "0 0 4px var(--ferrari-glow)" : "none",
          }}
        />
      ))}
    </span>
  );
}

function StatTile({
  label,
  value,
  index,
}: {
  label: string;
  value: string;
  index: number;
}) {
  return (
    <motion.div
      className="flex flex-col gap-1 px-3 py-2.5"
      style={{
        border: "1px solid var(--glass-border)",
        background: "rgba(0,212,255,0.02)",
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: 0.1 + index * 0.06, ease: "easeOut" }}
    >
      <span
        className="font-hud text-lg"
        style={{ color: "var(--ferrari)", textShadow: "0 0 10px var(--ferrari-glow)" }}
      >
        {value}
      </span>
      <span
        className="terminal-text"
        style={{ color: "var(--text-dim)", fontSize: 8.5, letterSpacing: "0.08em" }}
      >
        {label}
      </span>
    </motion.div>
  );
}

function MissionLink({ label, href }: { label: string; href: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor="pointer"
      className="flex items-center gap-2 px-4 py-2 terminal-text text-xs tracking-widest transition-all duration-200"
      style={{
        border: `1px solid ${hovered ? "var(--ferrari)" : "var(--glass-border)"}`,
        color: hovered ? "var(--ferrari)" : "var(--text-secondary)",
        boxShadow: hovered ? "0 0 10px var(--ferrari-glow)" : "none",
        background: hovered ? "rgba(220,0,0,0.05)" : "transparent",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{ fontSize: 10 }}>↗</span>
      {label}
    </a>
  );
}

function FooterStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="terminal-text" style={{ color: "var(--text-dim)", fontSize: 9 }}>
        {label}
      </span>
      <span className="font-hud text-sm" style={{ color }}>
        {value}
      </span>
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
