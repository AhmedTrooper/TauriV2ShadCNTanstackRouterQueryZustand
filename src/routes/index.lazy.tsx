import DownloadComponent from "@/components/download-component";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  useEffect(() => {
    // console.log("🟢 MOUNTED: Home Page");
    // return () => console.log("🔴 UNMOUNTED: Home Page");
  }, []);

  return (
    <div className="p-2">
      <h3 className="text-2xl font-bold mb-4">Welcome Home!</h3>

      <DownloadComponent />
    </div>
  );
}
