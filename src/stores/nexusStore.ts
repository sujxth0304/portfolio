"use client";

import { create } from "zustand";

export type BootPhase = "init" | "terminal" | "exploding" | "complete";
export type ActiveModule =
  | "identity"
  | "missions"
  | "matrix"
  | "chronicle"
  | "transmission"
  | null;

interface NexusState {
  bootPhase: BootPhase;
  activeModule: ActiveModule;
  soundEnabled: boolean;
  achievements: string[];

  setBootPhase: (phase: BootPhase) => void;
  setActiveModule: (module: ActiveModule) => void;
  toggleSound: () => void;
  unlockAchievement: (id: string) => void;
}

export const useNexusStore = create<NexusState>((set) => ({
  bootPhase: "init",
  activeModule: null,
  soundEnabled: false,
  achievements: [],

  setBootPhase: (phase) => set({ bootPhase: phase }),
  setActiveModule: (module) => set({ activeModule: module }),
  toggleSound: () =>
    set((state) => ({ soundEnabled: !state.soundEnabled })),
  unlockAchievement: (id) =>
    set((state) => ({
      achievements: state.achievements.includes(id)
        ? state.achievements
        : [...state.achievements, id],
    })),
}));
