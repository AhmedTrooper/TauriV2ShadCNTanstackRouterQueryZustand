import { useState, useEffect, useMemo } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { getName } from "@tauri-apps/api/app";
import { open } from "@tauri-apps/plugin-shell";
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
  ExternalLink,
} from "lucide-react";
import { useTheme } from "./theme-provider";
import { useRouter } from "@tanstack/react-router";
import { useUpdateStore } from "@/stores/update";

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);
  const [appName, setAppName] = useState("");

  const appWindow = useMemo(() => getCurrentWindow(), []);
  const xyzLink = "https://example.com";
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const {
    isUpdateAvailable,
    version,
    status,
    progressPercent,
    downloadedBytes,
    totalBytes,
    errorMessage,
    checkUpdate,
    runUpdateProcess,
    resetUpdateStatus,
  } = useUpdateStore();

  useEffect(() => {
    getName().then(setAppName);

    const timer = window.setTimeout(() => {
      void checkUpdate();
    }, 1200);

    const unlisten = appWindow.listen("tauri://resize", async () => {
      setIsMaximized(await appWindow.isMaximized());
    });

    return () => {
      window.clearTimeout(timer);
      unlisten.then((f) => f());
    };
  }, [checkUpdate]);

  const handleUpdateProcess = async () => {
    await runUpdateProcess();
  };

  const handleOpenXyzLink = async () => {
    await open(xyzLink);
  };

  const isBusy =
    status === "checking" || status === "downloading" || status === "installing";

  const dotClass =
    status === "error"
      ? "text-destructive"
      : isBusy
        ? "text-yellow-500 animate-spin"
        : isUpdateAvailable
          ? "text-red-500 animate-pulse cursor-pointer hover:scale-125"
          : "text-green-500";

  const updateLabel =
    status === "downloading" || status === "installing"
      ? `${Math.round(progressPercent)}%`
      : status === "checking"
        ? "CHK"
        : status === "error"
          ? "ERR"
          : isUpdateAvailable && version
            ? `v${version}`
            : null;

  const updateTitle = errorMessage
    ? `Update error: ${errorMessage}`
    : isBusy
      ? "Updating..."
      : isUpdateAvailable
        ? "Update available (click to install)"
        : "App is up to date";

  const formatMB = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  const detailStatusText =
    status === "checking"
      ? "Checking updates"
      : status === "downloading"
        ? "Downloading update"
        : status === "installing"
          ? "Installing update"
          : status === "error"
            ? "Update failed"
            : isUpdateAvailable
              ? `Update ready${version ? ` (${version})` : ""}`
              : "Up to date";

  const showUpdaterDetail =
    status === "checking" ||
    status === "downloading" ||
    status === "installing" ||
    status === "error";

  const showByteProgress =
    (status === "downloading" || status === "installing") && totalBytes > 0;

  return (
    <div
      data-tauri-drag-region
      className="h-10 fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between 
      bg-card border-t border-border
      select-none"
    >
      <div className="flex items-center h-full">
        <div className="flex items-center px-2 border-r border-border/50 h-full">
          <button
            onClick={() => void handleOpenXyzLink()}
            title="Visit website"
            className="h-7 px-2 flex items-center justify-center gap-1.5 rounded bg-muted text-foreground/90 hover:bg-accent text-[10px] font-bold tracking-wide transition-all active:scale-95"
          >
            <ExternalLink className="w-3 h-3" />
            Visit Website
          </button>
        </div>

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
          <span title={updateTitle} className="inline-flex">
            <Circle
              onClick={handleUpdateProcess}
              className={`w-2 h-2 fill-current transition-all ${dotClass}`}
            />
          </span>
          {updateLabel && (
            <span className="text-[10px] font-bold text-muted-foreground tabular-nums">
              {updateLabel}
            </span>
          )}
          {showUpdaterDetail && (
            <div className="h-6 px-2 rounded-md border border-border bg-muted/60 flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="font-semibold text-foreground/80">{detailStatusText}</span>
              {showByteProgress && (
                <span className="tabular-nums">
                  {formatMB(downloadedBytes)} / {formatMB(totalBytes)}
                </span>
              )}
              {status === "error" && (
                <>
                  <button
                    onClick={() => void runUpdateProcess()}
                    className="px-1.5 py-0.5 rounded bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Retry
                  </button>
                  <button
                    onClick={resetUpdateStatus}
                    className="px-1.5 py-0.5 rounded border border-border hover:bg-accent"
                  >
                    Dismiss
                  </button>
                </>
              )}
            </div>
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
