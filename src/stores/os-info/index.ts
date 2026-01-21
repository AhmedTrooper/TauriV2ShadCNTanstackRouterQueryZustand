import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { OsInfoStore } from './types';

import { createDataSlice } from './state.slice';
import { createNetworkSlice } from './network.slice';
import { createUiSlice } from './ui.slice';

export const useOsInfoStore = create<OsInfoStore>()(
    devtools((...a) => ({
        ...createDataSlice(...a),
        ...createNetworkSlice(...a),
        ...createUiSlice(...a),
    }))
);