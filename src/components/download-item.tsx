import { useDownloadStore } from "@/stores/download";
import { memo } from "react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "./ui/button";
import { Pause, Play, RefreshCw, XCircle } from "lucide-react";

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
        color: "bg-blue-100 text-blue-700 border-blue-200",
        label: "Downloading",
      };
    if (item.isPaused)
      return {
        color: "bg-amber-100 text-amber-700 border-amber-200",
        label: "Paused",
      };
    if (item.completed)
      return {
        color: "bg-green-100 text-green-700 border-green-200",
        label: "Success",
      };
    if (item.failed)
      return {
        color: "bg-red-100 text-red-700 border-red-200",
        label: "Failed",
      };
    return { color: "bg-gray-100 text-gray-700", label: "Unknown" };
  };

  const status = getStatusConfig();

  return (
    <div
      className={`p-4 border rounded-lg shadow-sm mb-3 transition-all bg-white ${item.active ? "border-blue-400 shadow-md" : "border-neutral-200"}`}
    >
      <div className="flex justify-between items-start mb-3 gap-4">
        <div className="flex-1 min-w-0">
          <h3
            className="font-medium text-neutral-900 truncate"
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
            <span className="text-xs text-neutral-400 font-mono">
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
              className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200"
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
              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
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
              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              onClick={() => resumeDownload(uniqueId)} // Retry logic is same as resume
              title="Retry Download"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* TERMINAL OUTPUT */}
      <div className="bg-neutral-950 text-neutral-300 p-2.5 rounded-md text-xs font-mono overflow-x-auto whitespace-pre-wrap border border-neutral-800 shadow-inner">
        <span className="text-green-500 mr-2">$</span>
        {item.tracking_message || "Waiting to start..."}
      </div>
    </div>
  );
};

export default memo(DownloadItem);
