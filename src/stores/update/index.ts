import { create } from "zustand";
import { persist } from "zustand/middleware";
import { check } from "@tauri-apps/plugin-updater";
import type { UpdateStore } from "./types";

export const useUpdateStore = create<UpdateStore>()(
    persist(
        (set) => ({
            isUpdateAvailable: false,
            checkedAt: null,
            version: null,
            checkUpdate: async () => {
                try {
                    const update = await check();
                    set({
                        isUpdateAvailable: !!update,
                        version: update?.version ?? null,
                        checkedAt: new Date().toISOString(),
                    });
                } catch (error) {
                    console.error(error);
                }
            },
        }),
        { name: "update-storage" }
    )
);