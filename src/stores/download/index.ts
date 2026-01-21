import { create } from "zustand";
import type { DownloadStore } from "./types";
import { createDownloadStateSlice } from "./state.slice";
import { createDownloadActionsSlice } from "./actions.slice";

export const useDownloadStore = create<DownloadStore>()((...a) => ({
    ...createDownloadStateSlice(...a),
    ...createDownloadActionsSlice(...a),
}));