export interface UpdateState {
    isUpdateAvailable: boolean;
    checkedAt: string | null;
    version: string | null;
    status: "idle" | "checking" | "available" | "downloading" | "installing" | "updated" | "error";
    progressPercent: number;
    downloadedBytes: number;
    totalBytes: number;
    errorMessage: string | null;
}

export interface UpdateActions {
    checkUpdate: () => Promise<boolean>;
    runUpdateProcess: () => Promise<void>;
    resetUpdateStatus: () => void;
}

export type UpdateStore = UpdateState & UpdateActions;