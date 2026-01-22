import { useState, useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { getName } from "@tauri-apps/api/app";
import { relaunch } from "@tauri-apps/plugin-process";
import {
  Minus,
  Square,
  X,
  Maximize2,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Circle,
} from "lucide-react";
import { useTheme } from "./theme-provider";
import { useRouter } from "@tanstack/react-router";
import { useUpdateStore } from "@/stores/update";

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);
  const [appName, setAppName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [progress, setProgress] = useState(0);

  const appWindow = getCurrentWindow();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { isUpdateAvailable, checkUpdate } = useUpdateStore();

  useEffect(() => {
    getName().then(setAppName);
    checkUpdate();

    const unlisten = appWindow.listen("tauri://resize", async () => {
      setIsMaximized(await appWindow.isMaximized());
    });
    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  const handleUpdateProcess = async () => {
    if (!isUpdateAvailable || isUpdating) return;

    try {
      const { check } = await import("@tauri-apps/plugin-updater");
      const update = await check();

      if (update) {
        setIsUpdating(true);
        console.log(
          `found update ${update.version} from ${update.date} with notes ${update.body}`,
        );
        let downloaded = 0;
        let contentLength = 0;

        await update.downloadAndInstall((event) => {
          switch (event.event) {
            case "Started":
              contentLength = event.data.contentLength || 0;
              setProgress(0);
              console.log(
                `started downloading ${event.data.contentLength} bytes`,
              );
              break;
            case "Progress":
              downloaded += event.data.chunkLength;
              if (contentLength > 0) {
                setProgress((downloaded / contentLength) * 100);
              }
              console.log(`downloaded ${downloaded} from ${contentLength}`);
              break;
            case "Finished":
              setProgress(100);
              console.log("download finished");
              break;
          }
        });

        await relaunch();
      }
    } catch (err) {
      console.error("Update failed:", err);
      setIsUpdating(false);
    }
  };

  return (
    <div
      data-tauri-drag-region
      className="h-10 fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between 
      bg-background/90 backdrop-blur-xl border-t border-border/50
      transition-colors duration-300 select-none"
    >
      <div className="flex items-center h-full">
        <div className="flex items-center px-2 gap-0.5 border-r border-border/50 h-full">
          <button
            onClick={() => router.history.back()}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-all active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => router.history.forward()}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-all active:scale-95"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="pl-3 flex items-center gap-2">
          <Circle
            onClick={handleUpdateProcess}
            className={`w-2 h-2 fill-current transition-all 
              ${
                isUpdating
                  ? "text-yellow-500 animate-spin"
                  : isUpdateAvailable
                    ? "text-red-500 animate-pulse cursor-pointer hover:scale-125"
                    : "text-green-500"
              }
            `}
          />
          {isUpdating && (
            <span className="text-[10px] font-bold text-muted-foreground tabular-nums">
              {Math.round(progress)}%
            </span>
          )}
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/70 pointer-events-none">
            {appName}
          </span>
        </div>
      </div>

      <div data-tauri-drag-region className="flex-1 h-full mx-2" />

      <div className="flex items-center h-full mr-1 gap-0.5">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-9 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
        >
          {theme === "dark" ? (
            <Sun className="w-3.5 h-3.5" />
          ) : (
            <Moon className="w-3.5 h-3.5" />
          )}
        </button>

        <div className="w-px h-3 bg-border mx-1" />

        <button
          onClick={() => appWindow.minimize()}
          className="w-9 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
        >
          <Minus className="w-3.5 h-3.5" strokeWidth={2} />
        </button>

        <button
          onClick={() => appWindow.toggleMaximize()}
          className="w-9 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
        >
          {isMaximized ? (
            <Maximize2 className="w-3 h-3" strokeWidth={2} />
          ) : (
            <Square className="w-3 h-3" strokeWidth={2} />
          )}
        </button>

        <button
          onClick={() => appWindow.close()}
          className="w-9 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-white hover:bg-destructive transition-all"
        >
          <X className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
