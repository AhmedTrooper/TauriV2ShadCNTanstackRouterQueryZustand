import DownloadComponent from "@/components/download-component";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  useEffect(() => {
    console.log("🟢 MOUNTED: Home Page");
    return () => console.log("🔴 UNMOUNTED: Home Page");
  }, []);

  return (
    <div className="p-2">
      <h3 className="text-2xl font-bold mb-4">Welcome Home!</h3>

      <div className="flex flex-col gap-2 max-w-xs">
        <Link
          to="/item/$id"
          params={{ id: "42" }}
          className="bg-black text-white px-4 py-2 rounded text-center"
        >
          View Item 42 (Dynamic)
        </Link>
        <Link
          to="/item/$id"
          params={{ id: "88" }}
          className="bg-black text-white px-4 py-2 rounded text-center"
        >
          View Item 88 (Dynamic)
        </Link>
        <Link
          to="/admin/dashboard"
          className="bg-red-600 text-white px-4 py-2 rounded text-center"
        >
          Go to Admin
        </Link>
      </div>

      <DownloadComponent />
    </div>
  );
}
