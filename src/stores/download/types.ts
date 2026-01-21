export interface DownloadItem {
    id: number;
    unique_id: string;
    title: string;
    web_url: string;
    tracking_message: string;
    completed: boolean;
    failed: boolean;
    active: boolean;
    isPaused: boolean;
    format_id: string;
}

export interface DownloadState {
    byId: Record<string, DownloadItem>;
    ids: string[];
    isLoading: boolean;
    error: string | null;
}

export interface DownloadActions {
    setDownloads: (list: DownloadItem[]) => void;
    addDownloadToState: (item: DownloadItem) => void;
    updateDownloadState: (uniqueId: string, updates: Partial<DownloadItem>) => void;
    clearState: () => void;
    setError: (error: string | null) => void;
    fetchDownloads: () => Promise<void>;
    startDownload: (url: string) => Promise<void>;
    // NEW ACTIONS
    pauseDownload: (uniqueId: string) => Promise<void>;
    resumeDownload: (uniqueId: string) => Promise<void>;
    clearAllHistory: () => Promise<void>;
}

export type DownloadStore = DownloadState & DownloadActions;