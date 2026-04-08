import { create } from "zustand";
import { persist } from "zustand/middleware";

interface NavState {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
}

export const useNavStore = create<NavState>()(
  persist(
    (set) => ({
      activeIndex: 0, // default to first navLink
      setActiveIndex: (index: number) => set({ activeIndex: index }),
    }),
    {
      name: "nav-storage", // key in localStorage
    },
  ),
);
