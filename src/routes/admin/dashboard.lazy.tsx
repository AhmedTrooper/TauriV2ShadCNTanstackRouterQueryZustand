import { createLazyFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createLazyFileRoute("/admin/dashboard")({
  component: AdminDashboard,
});

function AdminDashboard() {
  useEffect(() => {
    console.log("🟢 MOUNTED: Admin Dashboard");
    return () => console.log("🔴 UNMOUNTED: Admin Dashboard");
  }, []);

  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded">
      <h2 className="text-xl font-bold text-red-800">Admin Dashboard</h2>
      <p>This is a protected area route.</p>
    </div>
  );
}
