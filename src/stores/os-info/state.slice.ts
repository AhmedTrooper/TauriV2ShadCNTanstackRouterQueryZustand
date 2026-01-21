import type { StateCreator } from 'zustand';
import type { OsInfoStore, OsDataState, OsDataActions } from './types';

const initialDataState: OsDataState = {
    osName: null,
    kernelVersion: null,
    architecture: null,
    hostname: null,
};

export const createDataSlice: StateCreator<OsInfoStore, [], [], OsDataState & OsDataActions> = (set) => ({
    ...initialDataState,

    setOsData: (data) => set((state) => ({
        ...state,
        ...data
    })),

    clearOsData: () => set(() => ({
        ...initialDataState
    })),
});