"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";

const TRAIL_LENGTH = 8;
const TRAIL_INTERVAL_MS = 40;

export function NexusCursor() {
  const [mounted, setMounted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [trail, setTrail] = useState<{ x: number; y: number; id: number }[]>(
    []
  );

  /* --- dot: exact position --- */
  const dotX = useMotionValue(-200);
  const dotY = useMotionValue(-200);

  /* --- ring: spring-lagged position --- */
  const ringX = useSpring(dotX, { stiffness: 380, damping: 26, mass: 0.6 });
  const ringY = useSpring(dotY, { stiffness: 380, damping: 26, mass: 0.6 });

  const trailIdRef = useRef(0);
  const lastTrailTime = useRef(0);

  useEffect(() => {
    setMounted(true);

    const onMove = (e: MouseEvent) => {
      dotX.set(e.clientX);
      dotY.set(e.clientY);

      const now = Date.now();
      if (now - lastTrailTime.current > TRAIL_INTERVAL_MS) {
        lastTrailTime.current = now;
        const id = ++trailIdRef.current;
        setTrail((prev) =>
          [...prev, { x: e.clientX, y: e.clientY, id }].slice(-TRAIL_LENGTH)
        );
      }
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const interactive = t.closest(
        'button, a, [role="button"], input, textarea, select, [data-cursor]'
      );
      setIsHovering(!!interactive);
    };

    const onDown = () => setIsClicking(true);
    const onUp = () => setIsClicking(false);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dotX, dotY]);

  if (!mounted) return null;

  return (
    <>
      {/* Trail dots */}
      {trail.map((pos, i) => {
        const age = i / trail.length; // 0 = oldest, 1 = newest
        return (
          <div
            key={pos.id}
            className="fixed pointer-events-none rounded-full"
            style={{
              left: pos.x - 2,
              top: pos.y - 2,
              width: 4,
              height: 4,
              backgroundColor: "var(--ferrari)",
              opacity: age * 0.35,
              zIndex: "var(--z-cursor)",
              transition: "opacity 0.3s ease",
            }}
          />
        );
      })}

      {/* Outer ring — spring-lagged */}
      <motion.div
        className="fixed pointer-events-none rounded-full"
        style={{
          left: ringX,
          top: ringY,
          translateX: "-50%",
          translateY: "-50%",
          zIndex: "var(--z-cursor)" as never,
          border: "1px solid",
        }}
        animate={{
          width: isHovering ? 38 : isClicking ? 12 : 22,
          height: isHovering ? 38 : isClicking ? 12 : 22,
          borderColor: isHovering
            ? "var(--ferrari)"
            : "rgba(0,212,255,0.75)",
          boxShadow: isHovering
            ? "0 0 10px var(--ferrari-glow)"
            : "0 0 6px var(--ion-glow-sm)",
          opacity: 0.85,
        }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      />

      {/* Inner dot — exact position */}
      <motion.div
        className="fixed pointer-events-none rounded-full"
        style={{
          left: dotX,
          top: dotY,
          translateX: "-50%",
          translateY: "-50%",
          zIndex: ("var(--z-cursor)" as never),
          backgroundColor: "var(--ferrari)",
          boxShadow: "0 0 6px var(--ferrari), 0 0 12px var(--ferrari-glow)",
        }}
        animate={{
          width: isHovering ? 0 : isClicking ? 7 : 4,
          height: isHovering ? 0 : isClicking ? 7 : 4,
          scale: isClicking ? 1.6 : 1,
        }}
        transition={{ duration: 0.1, ease: "easeOut" }}
      />

      {/* Click ripple */}
      <AnimatePresence>
        {isClicking && (
          <motion.div
            key="ripple"
            className="fixed pointer-events-none rounded-full border"
            style={{
              left: dotX,
              top: dotY,
              translateX: "-50%",
              translateY: "-50%",
              zIndex: "var(--z-cursor)" as never,
              borderColor: "var(--ferrari)",
            }}
            initial={{ width: 8, height: 8, opacity: 0.8 }}
            animate={{ width: 40, height: 40, opacity: 0 }}
            exit={{}}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
