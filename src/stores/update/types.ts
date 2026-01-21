export interface UpdateState {
    isUpdateAvailable: boolean;
    checkedAt: string | null;
    version: string | null;
}

export interface UpdateActions {
    checkUpdate: () => Promise<void>;
}

export type UpdateStore = UpdateState & UpdateActions;