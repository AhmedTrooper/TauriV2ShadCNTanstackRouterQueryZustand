import { useState, useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { getName } from "@tauri-apps/api/app";
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

        <div className="pl-3 flex items-center gap-2 pointer-events-none">
          <Circle
            className={`w-2 h-2 fill-current ${isUpdateAvailable ? "text-red-500 animate-pulse" : "text-green-500"}`}
          />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/70">
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
