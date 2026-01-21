import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createLazyFileRoute("/about")({
  component: About,
});

function About() {
  useEffect(() => {
    console.log("🟢 MOUNTED: About Page");
    return () => console.log("🔴 UNMOUNTED: About Page");
  }, []);

  return (
    <div className="p-2">
      <h2 className="text-xl font-bold">About Page</h2>
      <p>Check your console to see the lifecycle logs.</p>
      <div className="mt-4">
        <Link to="/" className="bg-neutral-200 px-4 py-2 rounded">
          Back Home
        </Link>
      </div>
    </div>
  );
}
