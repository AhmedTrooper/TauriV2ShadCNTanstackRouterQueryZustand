import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useDownloadStore } from "@/stores/download";
import DownloadItem from "@/components/download-item";

export default function DownloadComponent() {
  const [fileUrl, setFileUrl] = useState<string>("");

  // Select only the IDs array to prevent unnecessary re-renders
  const ids = useDownloadStore((state) => state.ids);

  // Get actions
  const { startDownload, fetchDownloads, clearAllHistory } =
    useDownloadStore.getState();

  // Load history ONLY once on mount
  useEffect(() => {
    fetchDownloads();
  }, []);

  const handleStart = () => {
    if (!fileUrl) return;
    startDownload(fileUrl);
    setFileUrl("");
  };

  return (
    <div className="p-4 max-w-3xl mx-auto font-sans">
      <div className="bg-card p-6 rounded-lg shadow-xs mb-6 border border-border text-card-foreground">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Media Downloader
          </h1>

          {ids.length > 0 && (
            <Button
              variant="ghost"
              onClick={clearAllHistory}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs h-8"
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
            onKeyDown={(e) => e.key === "Enter" && handleStart()}
          />
          <Button
            onClick={handleStart}
            disabled={!fileUrl}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Download
          </Button>
        </div>
      </div>

      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
          Queue ({ids.length})
        </h2>

        {ids.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-lg bg-muted/30">
            <p>No downloads yet.</p>
          </div>
        ) : (
          ids.map((id) => <DownloadItem key={id} uniqueId={id} />)
        )}
      </div>
    </div>
  );
}
