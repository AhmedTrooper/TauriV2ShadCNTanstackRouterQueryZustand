export interface OsDataState {
    osName: string | null;
    kernelVersion: string | null;
    architecture: string | null;
    hostname: string | null;
}

export interface OsDataActions {
    setOsData: (data: Partial<OsDataState>) => void;
    clearOsData: () => void;
}

export interface NetworkActions {
    fetchSystemInfo: () => Promise<void>;
    syncWithServer: () => Promise<void>;
}

export interface OsUiState {
    isLoading: boolean;
    errorMessage: string | null;
    lastUpdated: Date | null;
}

export interface OsUiActions {
    setLoading: (status: boolean) => void;
    setError: (msg: string | null) => void;
}

export type OsInfoStore =
    & OsDataState & OsDataActions
    & NetworkActions
    & OsUiState & OsUiActions;