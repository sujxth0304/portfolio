"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { NexusCursor } from "@/components/cursor/NexusCursor";
import { BootSequence } from "@/components/boot/BootSequence";
import { CommandHub } from "@/components/hud/CommandHub";

export function NexusApp() {
  const [bootDone, setBootDone] = useState(false);

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: "var(--void)" }}>
      {/* Custom cursor — always rendered */}
      <NexusCursor />

      {/* Boot sequence — exits with animation when done */}
      <AnimatePresence mode="wait">
        {!bootDone && (
          <BootSequence key="boot" onComplete={() => setBootDone(true)} />
        )}
      </AnimatePresence>

      {/* Command hub — enters after boot */}
      <AnimatePresence>
        {bootDone && <CommandHub key="hub" />}
      </AnimatePresence>
    </div>
  );
}
