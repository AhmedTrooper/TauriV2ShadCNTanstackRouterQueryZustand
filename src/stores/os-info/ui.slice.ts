import type { StateCreator } from 'zustand';
import type { OsInfoStore, OsUiState, OsUiActions } from './types';

const initialUiState: OsUiState = {
    isLoading: false,
    errorMessage: null,
    lastUpdated: null,
};

export const createUiSlice: StateCreator<OsInfoStore, [], [], OsUiState & OsUiActions> = (set) => ({
    ...initialUiState,

    setLoading: (status) => set({ isLoading: status }),

    setError: (msg) => set({ errorMessage: msg }),
});