import type { StateCreator } from 'zustand';
import type { OsInfoStore, NetworkActions } from './types';

export const createNetworkSlice: StateCreator<OsInfoStore, [], [], NetworkActions> = (set, get) => ({

    fetchSystemInfo: async () => {
        const { setLoading, setError, setOsData } = get();

        setLoading(true);
        setError(null);

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            const mockData = {
                osName: "Ubuntu Linux",
                kernelVersion: "6.8.0-generic",
                architecture: "x86_64",
                hostname: "ahmed-zenbook"
            };

            setOsData(mockData);
            set({ lastUpdated: new Date() });

        } catch (err) {
            setError("Failed to communicate with Tauri backend");
        } finally {
            setLoading(false);
        }
    },

    syncWithServer: async () => {
        // console.log("Syncing logic here...");
    }
});