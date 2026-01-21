import type { StateCreator } from "zustand";
import type { DownloadStore, DownloadItem } from "./types";

export const createDownloadStateSlice: StateCreator<
    DownloadStore,
    [],
    [],
    Pick<DownloadStore, "byId" | "ids" | "isLoading" | "error" | "setDownloads" | "addDownloadToState" | "updateDownloadState" | "clearState" | "setError">
> = (set) => ({
    byId: {},
    ids: [],
    isLoading: false,
    error: null,

    setDownloads: (list) => {
        const byId: Record<string, DownloadItem> = {};
        const ids: string[] = [];

        list.forEach((item) => {
            byId[item.unique_id] = item;
            ids.push(item.unique_id);
        });

        set({ byId, ids });
    },

    addDownloadToState: (item) =>
        set((state) => ({
            byId: { ...state.byId, [item.unique_id]: item },
            ids: [item.unique_id, ...state.ids]
        })),

    updateDownloadState: (uniqueId, updates) =>
        set((state) => {
            const currentItem = state.byId[uniqueId];
            if (!currentItem) return state;

            return {
                byId: {
                    ...state.byId,
                    [uniqueId]: { ...currentItem, ...updates }
                }
            };
        }),

    clearState: () => set({ byId: {}, ids: [], error: null }),

    setError: (error) => set({ error }),
});