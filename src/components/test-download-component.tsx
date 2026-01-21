import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState, useEffect } from "react";
import { downloadDir } from "@tauri-apps/api/path";
import { Command } from "@tauri-apps/plugin-shell";
import { nanoid } from "nanoid";
import Database from "@tauri-apps/plugin-sql";

interface DownloadItem {
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

export default function TestDownloadComponent() {
  const [fileUrl, setFileUrl] = useState<string>("");
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);

  // ---------------------------------------------------------------------------
  // 1. POLLING EFFECT
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;
    const fetchDownloads = async () => {
      try {
        const db = await Database.load("sqlite:mydatabase.db");
        // Only fetch if we are NOT in the middle of clearing logic to avoid flickering
        const rows = await db.select<DownloadItem[]>(
          "SELECT * FROM DownloadList ORDER BY id DESC LIMIT 20",
        );
        if (isMounted) setDownloads(rows);
      } catch (error) {
        console.error("Failed to fetch downloads:", error);
      }
    };

    fetchDownloads();
    const intervalId = setInterval(fetchDownloads, 1000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // 2. CLEAR ALL LOGIC (NEW)
  // ---------------------------------------------------------------------------
  const clearAllDownloads = async () => {
    try {
      // 1. Clear UI immediately for responsiveness
      setDownloads([]);

      // 2. Clear Database
      const db = await Database.load("sqlite:mydatabase.db");
      await db.execute("DELETE FROM DownloadList");

      // console.log("Download history cleared");
    } catch (error) {
      console.error("Failed to clear history:", error);
    }
  };

  // ---------------------------------------------------------------------------
  // 3. START DOWNLOAD LOGIC
  // ---------------------------------------------------------------------------
  const startDownload = async () => {
    if (!fileUrl) return;
    const currentUrl = fileUrl.trim();
    setFileUrl("");

    try {
      const downloadDirectory = await downloadDir();
      const now = new Date();
      const mainId = now.getTime() + Math.floor(Math.random() * 10000);
      const uniqueId = nanoid(20);

      const db = await Database.load("sqlite:mydatabase.db");

      await db.execute(
        `INSERT INTO DownloadList (
          id, unique_id, active, failed, completed, format_id, web_url, title, tracking_message, isPaused
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          mainId,
          uniqueId,
          true,
          false,
          false,
          "best",
          currentUrl,
          `Initializing...`,
          "Starting download process...",
          false,
        ],
      );

      const command = Command.create("yt-dlp", [
        "-f",
        "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
        "--extractor-args",
        "youtube:player_client=android",
        "--rm-cache-dir",
        "-o",
        `${downloadDirectory}/OSGUI/%(title)s.%(ext)s`,
        currentUrl,
        "--newline",
      ]);

      command.stdout.on("data", async (line) => {
        const msg = line.trim();
        if (msg.includes("Removing cache")) return;
        try {
          await db.execute(
            "UPDATE DownloadList SET tracking_message = $1 WHERE unique_id = $2",
            [msg, uniqueId],
          );
        } catch (e) {}
      });

      command.stderr.on("data", (line) =>
        console.warn(`[STDERR ${uniqueId}]:`, line),
      );

      command.on("close", async (data) => {
        const isSuccess = data.code === 0;
        const finalStatus = isSuccess
          ? "Download Completed Successfully"
          : "Download Failed";
        try {
          await db.execute(
            `UPDATE DownloadList SET active = false, completed = $1, failed = $2, tracking_message = $3 WHERE unique_id = $4`,
            [isSuccess, !isSuccess, finalStatus, uniqueId],
          );
        } catch (e) {}
      });

      command.on("error", async (error) => {
        await db.execute(
          `UPDATE DownloadList SET active = false, failed = true, tracking_message = $1 WHERE unique_id = $2`,
          [`System Error: ${error}`, uniqueId],
        );
      });

      await command.spawn();
    } catch (error) {
      console.error("Critical Error starting download:", error);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto font-sans">
      <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-neutral-200">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-neutral-800">
            Media Downloader
          </h1>

          {/* NEW: Clear History Button */}
          {downloads.length > 0 && (
            <Button
              variant="destructive" // Makes it red if using shadcn defaults
              onClick={clearAllDownloads}
              className="bg-red-600 hover:bg-red-700 text-white text-xs h-8"
            >
              Clear History
            </Button>
          )}
        </div>

        <div className="flex gap-3">
          <Input
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            type="text"
            placeholder="Paste YouTube or Media URL here..."
            className="flex-1"
          />
          <Button
            onClick={startDownload}
            disabled={!fileUrl}
            className="bg-black text-white hover:bg-neutral-800 transition-colors"
          >
            Add to Queue
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-neutral-700">
          History & Queue ({downloads.length})
        </h2>

        {downloads.length === 0 ? (
          <div className="text-center py-10 text-neutral-400 border-2 border-dashed rounded-lg">
            No downloads yet. Add a URL to start.
          </div>
        ) : (
          downloads.map((item) => (
            <div
              key={item.unique_id}
              className={`p-4 border rounded-lg shadow-sm transition-all ${
                item.active
                  ? "bg-blue-50 border-blue-200 animate-pulse-slow"
                  : item.completed
                    ? "bg-white border-green-200"
                    : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3
                    className="font-medium text-neutral-900 truncate max-w-md"
                    title={item.web_url}
                  >
                    {item.web_url}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    ID: {item.unique_id.slice(0, 8)}...
                  </p>
                </div>

                <span
                  className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                    item.active
                      ? "bg-blue-200 text-blue-800"
                      : item.completed
                        ? "bg-green-200 text-green-800"
                        : "bg-red-200 text-red-800"
                  }`}
                >
                  {item.active
                    ? "Downloading"
                    : item.completed
                      ? "Success"
                      : "Failed"}
                </span>
              </div>

              <div className="bg-neutral-900 text-green-400 p-2 rounded text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                {">"} {item.tracking_message || "Waiting for process..."}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
