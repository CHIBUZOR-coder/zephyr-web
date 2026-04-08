import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SettingsTab =
  | "Account"
  | "Wallets"
  | "Trading"
  | "Privacy"
  | "Notifications"
  | "Integrations";

interface SettingsState {
  activeTab: SettingsTab;
  setActiveTab: (tab: SettingsTab) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      activeTab: "Account",

      setActiveTab: (tab) =>
        set({
          activeTab: tab,
        }),
    }),
    {
      name: "settings-storage",
    },
  ),
);
