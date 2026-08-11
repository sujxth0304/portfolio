"use client";

import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import { NexusCursor } from "@/components/cursor/NexusCursor";
import { BootSequence } from "@/components/boot/BootSequence";
import { CommandHub } from "@/components/hud/CommandHub";
import { IdentityModule } from "@/components/modules/IdentityModule";
import { MissionsModule } from "@/components/modules/MissionsModule";
import { useNexusStore } from "@/stores/nexusStore";

function ModuleLayer() {
  const { activeModule } = useNexusStore();

  return (
    <AnimatePresence mode="wait">
      {activeModule === "identity" && (
        <IdentityModule key="identity" />
      )}
      {activeModule === "missions" && (
        <MissionsModule key="missions" />
      )}
      {/* Remaining modules (matrix, chronicle, transmission) added in future sprints */}
    </AnimatePresence>
  );
}

export function NexusApp() {
  const [bootDone, setBootDone] = useState(false);

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ background: "var(--void)" }}
    >
      {/* Custom cursor — always rendered */}
      <NexusCursor />

      {/* Boot sequence — exits with animation when done */}
      <AnimatePresence mode="wait">
        {!bootDone && (
          <BootSequence key="boot" onComplete={() => setBootDone(true)} />
        )}
      </AnimatePresence>

      {/* Command hub — persists after boot */}
      <AnimatePresence>
        {bootDone && <CommandHub key="hub" />}
      </AnimatePresence>

      {/* Module overlay — sits above hub, below cursor */}
      {bootDone && <ModuleLayer />}
    </div>
  );
}
