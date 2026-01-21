import type { StateCreator } from "zustand";
import type { DownloadStore, DownloadItem } from "./types";
import { downloadDir } from "@tauri-apps/api/path";
import { Command, Child } from "@tauri-apps/plugin-shell";
import Database from "@tauri-apps/plugin-sql";
import { nanoid } from "nanoid";

// Global map to hold active child processes
// We use this to kill specific instances without relying on PIDs
const activeDownloads = new Map<string, Child>();

export const createDownloadActionsSlice: StateCreator<
    DownloadStore, [], [],
    Pick<DownloadStore, "fetchDownloads" | "startDownload" | "pauseDownload" | "resumeDownload" | "clearAllHistory">
> = (set, get) => {

    // Helper to spawn the process (used by Start and Resume)
    const spawnYtDlp = async (uniqueId: string, url: string) => {
        try {
            const downloadDirectory = await downloadDir();

            // NOTE: We update state to Active immediately
            get().updateDownloadState(uniqueId, {
                active: true,
                isPaused: false,
                failed: false,
                tracking_message: "Starting..."
            });

            const command = Command.create("yt-dlp", [
                "-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
                "--extractor-args", "youtube:player_client=android",
                // Important: Output template must match to allow auto-resume
                "--rm-cache-dir", "-o", `${downloadDirectory}/OSGUI/%(title)s.%(ext)s`,
                url, "--newline",
            ]);

            command.stdout.on("data", (line) => {
                const msg = line.trim();
                if (msg.includes("Removing cache")) return;
                // Live update of progress
                get().updateDownloadState(uniqueId, { tracking_message: msg });
            });

            command.stderr.on("data", (line) => {
                console.log(`[${uniqueId}] stderr:`, line);
            });

            const child = await command.spawn();

            // Store the child process reference globally
            activeDownloads.set(uniqueId, child);

            // Wait for completion
            const output = await command.execute(); // This waits until the process exits

            // Process finished (either success, error, or killed)
            activeDownloads.delete(uniqueId);

            // If the code is 0, it's a success. 
            // If it was killed manually, we usually handle that in the pause action, 
            // but we check here to ensure state consistency.
            const isSuccess = output.code === 0;

            // Only update to "Completed" if it wasn't paused manually
            // We check the current state to see if it was marked as paused
            const currentState = get().byId[uniqueId];
            if (!currentState?.isPaused) {
                get().updateDownloadState(uniqueId, {
                    active: false,
                    completed: isSuccess,
                    failed: !isSuccess,
                    tracking_message: isSuccess ? "Done" : "Stopped/Failed",
                });
            }

        } catch (error) {
            console.error(`Download Error [${uniqueId}]:`, error);
            get().updateDownloadState(uniqueId, {
                active: false,
                failed: true,
                tracking_message: "Process Error"
            });
            activeDownloads.delete(uniqueId);
        }
    };

    return {
        fetchDownloads: async () => {
            try {
                const db = await Database.load("sqlite:mydatabase.db");
                const rows = await db.select<DownloadItem[]>(
                    "SELECT * FROM DownloadList ORDER BY id DESC LIMIT 50"
                );
                get().setDownloads(rows);
            } catch (error) {
                console.error(error);
                get().setError("Failed to load download history");
            }
        },

        clearAllHistory: async () => {
            try {
                get().clearState();
                const db = await Database.load("sqlite:mydatabase.db");
                await db.execute("DELETE FROM DownloadList");
            } catch (error) {
                console.error(error);
            }
        },

        startDownload: async (url: string) => {
            if (!url) return;
            try {
                const now = new Date();
                const mainId = now.getTime() + Math.floor(Math.random() * 10000);
                const uniqueId = nanoid(20);

                const newItem: DownloadItem = {
                    id: mainId, unique_id: uniqueId, active: true, failed: false, completed: false,
                    format_id: "best", web_url: url, title: "Initializing...",
                    tracking_message: "Queued...", isPaused: false,
                };

                // 1. Add to State
                get().addDownloadToState(newItem);

                // 2. Add to DB
                const db = await Database.load("sqlite:mydatabase.db");
                await db.execute(
                    `INSERT INTO DownloadList (id, unique_id, active, failed, completed, format_id, web_url, title, tracking_message, isPaused) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                    [newItem.id, newItem.unique_id, newItem.active, newItem.failed, newItem.completed, newItem.format_id, newItem.web_url, newItem.title, newItem.tracking_message, newItem.isPaused]
                );

                // 3. Spawn Process
                spawnYtDlp(uniqueId, url);

            } catch (error) {
                console.error(error);
                get().setError("Failed to start download");
            }
        },

        pauseDownload: async (uniqueId: string) => {
            const child = activeDownloads.get(uniqueId);
            if (child) {
                try {
                    // KILL the specific process instance
                    await child.kill();
                    activeDownloads.delete(uniqueId);

                    // Update state to Paused
                    get().updateDownloadState(uniqueId, {
                        active: false,
                        isPaused: true,
                        tracking_message: "Paused"
                    });

                    // Update DB (Optional, for persistence across restarts)
                    const db = await Database.load("sqlite:mydatabase.db");
                    await db.execute("UPDATE DownloadList SET isPaused = 1, active = 0 WHERE unique_id = $1", [uniqueId]);

                } catch (e) {
                    console.error("Failed to kill process:", e);
                }
            }
        },

        resumeDownload: async (uniqueId: string) => {
            const item = get().byId[uniqueId];
            if (!item) return;

            // If already active, do nothing
            if (activeDownloads.has(uniqueId)) return;

            // Update DB
            const db = await Database.load("sqlite:mydatabase.db");
            await db.execute("UPDATE DownloadList SET isPaused = 0, active = 1 WHERE unique_id = $1", [uniqueId]);

            // Re-Spawn (yt-dlp will handle the file resume logic)
            spawnYtDlp(uniqueId, item.web_url);
        }
    };
};