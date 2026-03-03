import { useDownloadStore } from "@/stores/download";
import { memo } from "react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "./ui/button";
import { Pause, Play, RefreshCw } from "lucide-react";

interface Props {
  uniqueId: string;
}

const DownloadItem = ({ uniqueId }: Props) => {
  // 1. Subscribe to the specific item data
  const item = useDownloadStore(useShallow((state) => state.byId[uniqueId]));

  // 2. Get actions (stable references)
  const { pauseDownload, resumeDownload } = useDownloadStore.getState();

  if (!item) return null;

  // Helper to determine status color and text
  const getStatusConfig = () => {
    if (item.active)
      return {
        color: "bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-500/35",
        label: "Downloading",
      };
    if (item.isPaused)
      return {
        color: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/35",
        label: "Paused",
      };
    if (item.completed)
      return {
        color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/35",
        label: "Success",
      };
    if (item.failed)
      return {
        color: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/35",
        label: "Failed",
      };
    return {
      color: "bg-muted text-muted-foreground border-border",
      label: "Unknown",
    };
  };

  const status = getStatusConfig();

  return (
    <div
      className={`p-4 border rounded-lg shadow-xs mb-3 transition-colors bg-card ${item.active ? "border-primary/60" : "border-border"}`}
    >
      <div className="flex justify-between items-start mb-3 gap-4">
        <div className="flex-1 min-w-0">
          <h3
            className="font-medium text-foreground truncate"
            title={item.web_url}
          >
            {item.title || item.web_url}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${status.color}`}
            >
              {status.label}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              ID: {item.unique_id.slice(0, 8)}
            </span>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex gap-2">
          {item.active && (
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 border-amber-500/30"
              onClick={() => pauseDownload(uniqueId)}
              title="Pause Download"
            >
              <Pause className="h-4 w-4" />
            </Button>
          )}

          {item.isPaused && (
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 border-emerald-500/30"
              onClick={() => resumeDownload(uniqueId)}
              title="Resume Download"
            >
              <Play className="h-4 w-4" />
            </Button>
          )}

          {item.failed && (
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 text-red-700 dark:text-red-300 hover:bg-red-500/10 border-red-500/30"
              onClick={() => resumeDownload(uniqueId)} // Retry logic is same as resume
              title="Retry Download"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* TERMINAL OUTPUT */}
      <div className="bg-muted/55 text-foreground/90 p-2.5 rounded-md text-xs font-mono overflow-x-auto whitespace-pre-wrap border border-border shadow-inner">
        <span className="text-primary mr-2">$</span>
        {item.tracking_message || "Waiting to start..."}
      </div>
    </div>
  );
};

export default memo(DownloadItem);
