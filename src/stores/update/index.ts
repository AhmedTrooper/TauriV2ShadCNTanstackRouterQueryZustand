import { create } from "zustand";
import { persist } from "zustand/middleware";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import type { UpdateStore } from "./types";

export const useUpdateStore = create<UpdateStore>()(
    persist(
        (set, get) => ({
            isUpdateAvailable: false,
            checkedAt: null,
            version: null,
            status: "idle",
            progressPercent: 0,
            downloadedBytes: 0,
            totalBytes: 0,
            errorMessage: null,
            checkUpdate: async () => {
                if (get().status === "downloading" || get().status === "installing") {
                    return get().isUpdateAvailable;
                }

                set({ status: "checking", errorMessage: null });

                try {
                    const update = await check();

                    if (!update) {
                        set({
                            isUpdateAvailable: false,
                            version: null,
                            checkedAt: new Date().toISOString(),
                            status: "idle",
                        });
                        return false;
                    }

                    set({
                        isUpdateAvailable: true,
                        version: update.version,
                        checkedAt: new Date().toISOString(),
                        status: "available",
                    });

                    return true;
                } catch (error) {
                    const message = error instanceof Error ? error.message : String(error);
                    set({
                        status: "error",
                        errorMessage: message,
                        checkedAt: new Date().toISOString(),
                    });
                    return false;
                }
            },
            runUpdateProcess: async () => {
                const current = get();
                if (
                    current.status === "checking" ||
                    current.status === "downloading" ||
                    current.status === "installing"
                ) {
                    return;
                }

                set({
                    status: "checking",
                    errorMessage: null,
                    progressPercent: 0,
                    downloadedBytes: 0,
                    totalBytes: 0,
                });

                try {
                    const update = await check();

                    if (!update) {
                        set({
                            isUpdateAvailable: false,
                            version: null,
                            checkedAt: new Date().toISOString(),
                            status: "idle",
                        });
                        return;
                    }

                    set({
                        isUpdateAvailable: true,
                        version: update.version,
                        checkedAt: new Date().toISOString(),
                        status: "downloading",
                    });

                    let downloaded = 0;
                    let total = 0;

                    await update.downloadAndInstall((event) => {
                        switch (event.event) {
                            case "Started": {
                                total = event.data.contentLength ?? 0;
                                downloaded = 0;
                                set({
                                    status: "downloading",
                                    downloadedBytes: 0,
                                    totalBytes: total,
                                    progressPercent: 0,
                                });
                                break;
                            }
                            case "Progress": {
                                downloaded += event.data.chunkLength;
                                const progress = total > 0 ? (downloaded / total) * 100 : 0;
                                set({
                                    status: "downloading",
                                    downloadedBytes: downloaded,
                                    totalBytes: total,
                                    progressPercent: Math.min(100, progress),
                                });
                                break;
                            }
                            case "Finished": {
                                set({
                                    status: "installing",
                                    progressPercent: 100,
                                    downloadedBytes: total || downloaded,
                                    totalBytes: total,
                                });
                                break;
                            }
                        }
                    });

                    set({
                        status: "updated",
                        progressPercent: 100,
                        isUpdateAvailable: false,
                    });

                    await relaunch();
                } catch (error) {
                    const message = error instanceof Error ? error.message : String(error);
                    set({
                        status: "error",
                        errorMessage: message,
                    });
                }
            },
            resetUpdateStatus: () => {
                set({
                    status: get().isUpdateAvailable ? "available" : "idle",
                    errorMessage: null,
                    progressPercent: 0,
                    downloadedBytes: 0,
                    totalBytes: 0,
                });
            },
        }),
        {
            name: "update-storage",
            partialize: (state) => ({
                isUpdateAvailable: state.isUpdateAvailable,
                checkedAt: state.checkedAt,
                version: state.version,
            }),
        },
    ),
);