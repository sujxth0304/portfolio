"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNexusStore } from "@/stores/nexusStore";

/* ============================================================
   DATA
   ============================================================ */

type CategoryId = "ai_ml" | "backend" | "frontend" | "infra" | "tools";

interface Category {
  id: CategoryId;
  label: string;
  color: string;
}

interface Skill {
  id: string;
  label: string;
  /** Shorter label used on the graph node itself, to avoid crowding in dense clusters. */
  graphLabel?: string;
  category: CategoryId;
  proficiency: number;
  years: number;
  description: string;
}

const CATEGORIES: Category[] = [
  { id: "ai_ml", label: "AI / ML", color: "var(--ferrari)" },
  { id: "backend", label: "BACKEND", color: "var(--ion)" },
  { id: "frontend", label: "FRONTEND", color: "var(--gold)" },
  { id: "infra", label: "INFRA", color: "var(--status-ok)" },
  { id: "tools", label: "TOOLS", color: "var(--ion-bright)" },
];

const SKILLS: Skill[] = [
  { id: "python", label: "Python", category: "ai_ml", proficiency: 98, years: 6, description: "Primary language for ML, backend, and automation — the one I reach for first." },
  { id: "pytorch", label: "PyTorch", category: "ai_ml", proficiency: 88, years: 3, description: "Training and fine-tuning models, from prototyping to production checkpoints." },
  { id: "langchain", label: "LangChain", category: "ai_ml", proficiency: 92, years: 2, description: "Chaining retrieval, tools, and LLM calls into coherent pipelines." },
  { id: "langgraph", label: "LangGraph", category: "ai_ml", proficiency: 85, years: 1, description: "Stateful multi-agent graphs with retries, branching, and human-in-the-loop nodes." },
  { id: "rag", label: "RAG Systems", graphLabel: "RAG", category: "ai_ml", proficiency: 95, years: 2, description: "Embedding, retrieval, and re-ranking pipelines that ground LLMs in real data." },
  { id: "vectordb", label: "Vector DBs", category: "ai_ml", proficiency: 90, years: 2, description: "pgvector, Pinecone, and FAISS for high-recall semantic search at scale." },

  { id: "nodejs", label: "Node.js", category: "backend", proficiency: 88, years: 5, description: "Async APIs and event-driven services running in production." },
  { id: "fastapi", label: "FastAPI", category: "backend", proficiency: 93, years: 3, description: "Typed, async Python APIs with automatic docs and validation." },
  { id: "postgres", label: "PostgreSQL", category: "backend", proficiency: 91, years: 5, description: "Schema design, indexing, and query tuning for systems under real load." },
  { id: "redis", label: "Redis", category: "backend", proficiency: 85, years: 4, description: "Caching, queues, and rate limiting for low-latency systems." },
  { id: "graphql", label: "GraphQL", category: "backend", proficiency: 78, years: 2, description: "Schema-first APIs for clients that need precise, nested data." },
  { id: "microservices", label: "Microservices", category: "backend", proficiency: 86, years: 3, description: "Decomposing monoliths into independently deployable services." },

  { id: "react", label: "React", category: "frontend", proficiency: 89, years: 5, description: "Component architecture, state management, and performance tuning." },
  { id: "nextjs", label: "Next.js", category: "frontend", proficiency: 87, years: 3, description: "App router, SSR/SSG, and edge-ready full-stack React." },
  { id: "typescript", label: "TypeScript", category: "frontend", proficiency: 94, years: 4, description: "Strict typing across the stack — fewer runtime surprises." },
  { id: "tailwind", label: "Tailwind CSS", category: "frontend", proficiency: 90, years: 3, description: "Utility-first styling for fast, consistent interfaces." },
  { id: "threejs", label: "Three.js", category: "frontend", proficiency: 74, years: 1, description: "WebGL scenes, shaders, and interactive 3D — this site included." },

  { id: "docker", label: "Docker", category: "infra", proficiency: 89, years: 4, description: "Containerizing services for reproducible builds and deploys." },
  { id: "kubernetes", label: "Kubernetes", category: "infra", proficiency: 72, years: 2, description: "Orchestrating containers across clusters — scaling without the pager going off." },
  { id: "aws", label: "AWS", category: "infra", proficiency: 81, years: 3, description: "EC2, S3, Lambda, and RDS for cloud-native infrastructure." },
  { id: "cicd", label: "CI/CD", category: "infra", proficiency: 88, years: 3, description: "Automated pipelines from commit to production, gated by tests." },
  { id: "airflow", label: "Airflow", category: "infra", proficiency: 80, years: 2, description: "Scheduling and monitoring data and ML pipelines as DAGs." },

  { id: "git", label: "Git", category: "tools", proficiency: 97, years: 6, description: "Branching strategies, rebases, and clean history as second nature." },
  { id: "linux", label: "Linux", category: "tools", proficiency: 90, years: 5, description: "Daily driver for development, servers, and everything in between." },
  { id: "figma", label: "Figma", category: "tools", proficiency: 70, years: 2, description: "Enough design fluency to prototype interfaces before writing code." },
  { id: "postman", label: "Postman", category: "tools", proficiency: 85, years: 4, description: "API testing, collections, and environment management." },
];

const CORE_ID = "core";

/* ============================================================
   LAYOUT — radial hub-and-spoke geometry
   ============================================================ */

const CX = 390;
const CY = 330;
const R1 = 175; // core -> hub radius
const R2_BASE = 92; // hub -> skill radius (inner ring)
const R2_STAGGER = 34; // extra radius on alternating nodes, avoids label crowding

interface LaidOutNode {
  id: string;
  x: number;
  y: number;
  angle: number;
}

function useLayout() {
  return useMemo(() => {
    const hubs: (LaidOutNode & { category: Category })[] = CATEGORIES.map(
      (cat, i) => {
        const angle = -Math.PI / 2 + i * ((2 * Math.PI) / CATEGORIES.length);
        return {
          id: cat.id,
          category: cat,
          angle,
          x: CX + R1 * Math.cos(angle),
          y: CY + R1 * Math.sin(angle),
        };
      }
    );

    const skillNodes: (LaidOutNode & { skill: Skill })[] = [];
    for (const hub of hubs) {
      const group = SKILLS.filter((s) => s.category === hub.category.id);
      const n = group.length;
      // Wider fan for bigger clusters so adjacent labels don't collide
      const spreadDeg = n > 1 ? Math.max(60, Math.min(150, 24 * (n - 1))) : 0;
      const spreadRad = (spreadDeg * Math.PI) / 180;
      group.forEach((skill, j) => {
        const offset = n > 1 ? (j - (n - 1) / 2) * (spreadRad / (n - 1)) : 0;
        const angle = hub.angle + offset;
        const radius = R2_BASE + (j % 2) * R2_STAGGER;
        skillNodes.push({
          id: skill.id,
          skill,
          angle,
          x: hub.x + radius * Math.cos(angle),
          y: hub.y + radius * Math.sin(angle),
        });
      });
    }

    return { hubs, skillNodes };
  }, []);
}

/* ============================================================
   HIGHLIGHT LOGIC
   ============================================================ */

function highlightSetFor(id: string | null): Set<string> | null {
  if (!id) return null;
  if (id === CORE_ID) {
    return new Set([CORE_ID, ...CATEGORIES.map((c) => c.id), ...SKILLS.map((s) => s.id)]);
  }
  const hub = CATEGORIES.find((c) => c.id === id);
  if (hub) {
    return new Set([
      CORE_ID,
      hub.id,
      ...SKILLS.filter((s) => s.category === hub.id).map((s) => s.id),
    ]);
  }
  const skill = SKILLS.find((s) => s.id === id);
  if (skill) {
    return new Set([CORE_ID, skill.category, skill.id]);
  }
  return null;
}

/* ============================================================
   SELECTION TYPES
   ============================================================ */

type Selection =
  | { type: "skill"; skill: Skill }
  | { type: "hub"; category: Category }
  | null;

/* ============================================================
   NEURAL MATRIX MODULE
   ============================================================ */

export function NeuralMatrixModule() {
  const { setActiveModule } = useNexusStore();
  const { hubs, skillNodes } = useLayout();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Selection>(null);

  const close = useCallback(() => setActiveModule(null), [setActiveModule]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  const activeId =
    hoveredId ??
    (selected
      ? selected.type === "skill"
        ? selected.skill.id
        : selected.category.id
      : null);
  const highlightSet = highlightSetFor(activeId);
  const isDimmed = (id: string) => !!highlightSet && !highlightSet.has(id);

  const avgProficiency = Math.round(
    SKILLS.reduce((sum, s) => sum + s.proficiency, 0) / SKILLS.length
  );

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
          width: "min(88vw, 1280px)",
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
              MODULE_03
            </span>
            <span
              className="font-display font-semibold text-sm tracking-widest"
              style={{ color: "var(--text-primary)" }}
            >
              {"// NEURAL MATRIX"}
            </span>
          </div>

          <CloseButton onClose={close} />
        </motion.div>

        {/* ── MAIN CONTENT ── */}
        <div className="flex flex-1 min-h-0">
          {/* LEFT: legend + detail */}
          <motion.aside
            className="flex flex-col gap-6 px-7 py-6 overflow-y-auto shrink-0"
            style={{
              width: 300,
              borderRight: "1px solid var(--glass-border)",
              scrollbarWidth: "thin",
              scrollbarColor: "var(--ferrari-dim) transparent",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            {/* Category legend */}
            <div className="flex flex-col gap-2.5">
              <SectionLabel>SKILL_CLUSTERS</SectionLabel>
              {CATEGORIES.map((cat, i) => {
                const count = SKILLS.filter((s) => s.category === cat.id).length;
                const isSel = selected?.type === "hub" && selected.category.id === cat.id;
                return (
                  <motion.button
                    key={cat.id}
                    data-cursor="pointer"
                    className="flex items-center gap-2.5 px-2.5 py-1.5 text-left transition-all duration-200 focus:outline-none"
                    style={{
                      border: `1px solid ${isSel ? cat.color : "transparent"}`,
                      background: isSel ? `${cat.color}12` : "transparent",
                    }}
                    onMouseEnter={() => setHoveredId(cat.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() =>
                      setSelected(isSel ? null : { type: "hub", category: cat })
                    }
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: cat.color, boxShadow: `0 0 6px ${cat.color}` }}
                    />
                    <span
                      className="terminal-text tracking-widest flex-1"
                      style={{ color: "var(--text-secondary)", fontSize: 10.5 }}
                    >
                      {cat.label}
                    </span>
                    <span className="font-hud text-xs" style={{ color: cat.color }}>
                      {count}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            <div className="h-px w-full" style={{ background: "var(--glass-border)" }} />

            {/* Detail card */}
            <AnimatePresence mode="wait">
              {selected ? (
                <DetailCard key={activeId} selection={selected} />
              ) : (
                <OverviewCard key="overview" avgProficiency={avgProficiency} />
              )}
            </AnimatePresence>
          </motion.aside>

          {/* RIGHT: graph canvas */}
          <div className="flex-1 flex items-center justify-center px-4 py-4 overflow-hidden">
            <svg
              viewBox="0 0 780 660"
              className="w-full h-full"
              style={{ maxHeight: "100%" }}
              preserveAspectRatio="xMidYMid meet"
            >
              {/* ── LINES: core -> hub ── */}
              {hubs.map((hub, i) => {
                const dim = isDimmed(hub.id) && isDimmed(CORE_ID);
                return (
                  <motion.path
                    key={`line-core-${hub.id}`}
                    d={`M ${CX} ${CY} L ${hub.x} ${hub.y}`}
                    stroke={hub.category.color}
                    strokeWidth={1.2}
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{
                      pathLength: 1,
                      opacity: dim ? 0.08 : 0.4,
                    }}
                    transition={{
                      pathLength: { duration: 0.6, delay: 0.3 + i * 0.06, ease: "easeOut" },
                      opacity: { duration: 0.25 },
                    }}
                  />
                );
              })}

              {/* ── LINES: hub -> skill ── */}
              {skillNodes.map((node, i) => {
                const hub = hubs.find((h) => h.category.id === node.skill.category)!;
                const dim = isDimmed(node.id) && isDimmed(hub.id);
                return (
                  <motion.path
                    key={`line-skill-${node.id}`}
                    d={`M ${hub.x} ${hub.y} L ${node.x} ${node.y}`}
                    stroke={hub.category.color}
                    strokeWidth={0.75}
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{
                      pathLength: 1,
                      opacity: dim ? 0.05 : 0.28,
                    }}
                    transition={{
                      pathLength: { duration: 0.4, delay: 0.5 + i * 0.02, ease: "easeOut" },
                      opacity: { duration: 0.25 },
                    }}
                  />
                );
              })}

              {/* ── CORE NODE ── */}
              <g
                data-cursor="pointer"
                onMouseEnter={() => setHoveredId(CORE_ID)}
                onMouseLeave={() => setHoveredId(null)}
                style={{ cursor: "pointer" }}
              >
                <motion.circle
                  cx={CX}
                  cy={CY}
                  r={15}
                  fill="var(--void)"
                  stroke="var(--ferrari)"
                  strokeWidth={1.5}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
                  style={{ filter: "drop-shadow(0 0 8px var(--ferrari))" }}
                />
                <motion.text
                  x={CX}
                  y={CY + 32}
                  textAnchor="middle"
                  className="terminal-text"
                  fill="var(--text-primary)"
                  fontSize={10}
                  letterSpacing="0.15em"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.35 }}
                >
                  S.S CORE
                </motion.text>
              </g>

              {/* ── HUB NODES ── */}
              {hubs.map((hub, i) => {
                const dim = isDimmed(hub.id);
                const labelDx = Math.cos(hub.angle) >= 0 ? 14 : -14;
                const anchor = Math.cos(hub.angle) >= 0 ? "start" : "end";
                return (
                  <g
                    key={hub.id}
                    data-cursor="pointer"
                    onMouseEnter={() => setHoveredId(hub.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() =>
                      setSelected((prev) =>
                        prev?.type === "hub" && prev.category.id === hub.id
                          ? null
                          : { type: "hub", category: hub.category }
                      )
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <motion.circle
                      cx={hub.x}
                      cy={hub.y}
                      r={10}
                      fill="var(--void)"
                      stroke={hub.category.color}
                      strokeWidth={1.3}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{
                        scale: 1,
                        opacity: dim ? 0.25 : 1,
                      }}
                      transition={{ duration: 0.35, delay: 0.4 + i * 0.06, ease: [0.34, 1.56, 0.64, 1] }}
                      style={{ filter: `drop-shadow(0 0 6px ${hub.category.color})` }}
                    />
                    <motion.text
                      x={hub.x + labelDx}
                      y={hub.y + 3}
                      textAnchor={anchor}
                      className="font-hud"
                      fill={hub.category.color}
                      fontSize={10.5}
                      letterSpacing="0.1em"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: dim ? 0.3 : 1 }}
                      transition={{ duration: 0.3, delay: 0.5 + i * 0.06 }}
                    >
                      {hub.category.label}
                    </motion.text>
                  </g>
                );
              })}

              {/* ── SKILL NODES ── */}
              {skillNodes.map((node, i) => {
                const dim = isDimmed(node.id);
                const isSel = selected?.type === "skill" && selected.skill.id === node.id;
                const color = CATEGORIES.find((c) => c.id === node.skill.category)!.color;
                const cosA = Math.cos(node.angle);
                const sinA = Math.sin(node.angle);
                const nearVertical = Math.abs(cosA) < 0.32;
                const labelDx = nearVertical ? 0 : cosA >= 0 ? 9 : -9;
                const labelDy = nearVertical ? (sinA >= 0 ? 15 : -9) : 3;
                const anchor = nearVertical ? "middle" : cosA >= 0 ? "start" : "end";
                return (
                  <g
                    key={node.id}
                    data-cursor="pointer"
                    onMouseEnter={() => setHoveredId(node.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() =>
                      setSelected((prev) =>
                        prev?.type === "skill" && prev.skill.id === node.id
                          ? null
                          : { type: "skill", skill: node.skill }
                      )
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <motion.circle
                      cx={node.x}
                      cy={node.y}
                      r={isSel ? 6.5 : 5}
                      fill={isSel ? color : "var(--void)"}
                      stroke={color}
                      strokeWidth={1.1}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{
                        scale: 1,
                        opacity: dim ? 0.2 : 1,
                      }}
                      transition={{ duration: 0.3, delay: 0.55 + i * 0.015, ease: [0.34, 1.56, 0.64, 1] }}
                      style={{ filter: `drop-shadow(0 0 4px ${color})` }}
                    />
                    <motion.text
                      x={node.x + labelDx}
                      y={node.y + labelDy}
                      textAnchor={anchor}
                      className="terminal-text"
                      fill={dim ? "var(--text-dim)" : "var(--text-secondary)"}
                      fontSize={8.5}
                      letterSpacing="0.02em"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: dim ? 0.25 : 1 }}
                      transition={{ duration: 0.3, delay: 0.6 + i * 0.015 }}
                    >
                      {node.skill.graphLabel ?? node.skill.label}
                    </motion.text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <motion.div
          className="flex items-center gap-6 px-8 py-4 shrink-0"
          style={{
            borderTop: "1px solid var(--glass-border)",
            paddingBottom: "calc(1rem + 118px)",
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
        >
          <FooterStat label="NODES" value={String(SKILLS.length)} color="var(--text-primary)" />
          <FooterStat label="CLUSTERS" value={String(CATEGORIES.length)} color="var(--ion)" />
          <FooterStat label="AVG SIGNAL" value={`${avgProficiency}%`} color="var(--ferrari)" />
          <span
            className="terminal-text ml-auto"
            style={{ color: "var(--text-dim)", fontSize: 9.5 }}
          >
            {"// HOVER TO TRACE CONNECTIONS — CLICK TO LOCK"}
          </span>
        </motion.div>
      </motion.div>
    </>
  );
}

/* ============================================================
   DETAIL / OVERVIEW CARDS
   ============================================================ */

function DetailCard({ selection }: { selection: Selection }) {
  if (!selection) return null;

  if (selection.type === "skill") {
    const { skill } = selection;
    const color = CATEGORIES.find((c) => c.id === skill.category)!.color;
    return (
      <motion.div
        className="flex flex-col gap-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        <SectionLabel>NODE_DETAIL</SectionLabel>
        <div>
          <h3
            className="font-display font-semibold text-base tracking-wide"
            style={{ color: "var(--text-primary)" }}
          >
            {skill.label}
          </h3>
          <span
            className="terminal-text"
            style={{ color, fontSize: 9, letterSpacing: "0.1em" }}
          >
            {CATEGORIES.find((c) => c.id === skill.category)!.label}
          </span>
        </div>

        <p
          className="terminal-text text-xs leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          {skill.description}
        </p>

        <ProficiencyBar value={skill.proficiency} color={color} />

        <div className="flex items-center gap-2">
          <span className="terminal-text" style={{ color: "var(--text-dim)", fontSize: 9 }}>
            EXPERIENCE
          </span>
          <span className="font-hud text-xs" style={{ color: "var(--text-primary)" }}>
            {skill.years} {skill.years === 1 ? "YEAR" : "YEARS"}
          </span>
        </div>
      </motion.div>
    );
  }

  const { category } = selection;
  const group = SKILLS.filter((s) => s.category === category.id);
  const avg = Math.round(group.reduce((sum, s) => sum + s.proficiency, 0) / group.length);

  return (
    <motion.div
      className="flex flex-col gap-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <SectionLabel>CLUSTER_DETAIL</SectionLabel>
      <h3
        className="font-display font-semibold text-base tracking-wide"
        style={{ color: category.color }}
      >
        {category.label}
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <MiniStat label="NODES" value={String(group.length)} />
        <MiniStat label="AVG SIGNAL" value={`${avg}%`} />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {group.map((s) => (
          <span
            key={s.id}
            className="terminal-text px-2 py-0.5"
            style={{
              border: `1px solid ${category.color}40`,
              color: category.color,
              fontSize: 9,
              background: `${category.color}08`,
            }}
          >
            {s.label}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

function OverviewCard({ avgProficiency }: { avgProficiency: number }) {
  return (
    <motion.div
      className="flex flex-col gap-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <SectionLabel>MATRIX_OVERVIEW</SectionLabel>
      <div className="grid grid-cols-2 gap-3">
        <MiniStat label="TOTAL NODES" value={String(SKILLS.length)} />
        <MiniStat label="CLUSTERS" value={String(CATEGORIES.length)} />
        <MiniStat label="AVG SIGNAL" value={`${avgProficiency}%`} />
        <MiniStat label="STATUS" value="SYNCED" />
      </div>
      <p
        className="terminal-text text-xs leading-relaxed"
        style={{ color: "var(--text-dim)" }}
      >
        Hover a cluster or node to trace its connections. Click to lock the
        detail readout in place.
      </p>
    </motion.div>
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

function ProficiencyBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="terminal-text" style={{ color: "var(--text-dim)", fontSize: 9 }}>
          SIGNAL STRENGTH
        </span>
        <span className="font-hud text-xs" style={{ color }}>
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
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="terminal-text" style={{ color: "var(--text-dim)", fontSize: 8.5 }}>
        {label}
      </span>
      <span className="font-hud text-sm" style={{ color: "var(--text-primary)" }}>
        {value}
      </span>
    </div>
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
