import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/item/$id")({
  component: ItemDetail,
});

function ItemDetail() {
  // Grab the ID from the URL
  const { id } = Route.useParams();

  useEffect(() => {
    // console.log(`🟢 MOUNTED: Item ${id}`);
    // return () => console.log(`🔴 UNMOUNTED: Item ${id}`);
  }, [id]);

  return (
    <div className="p-2">
      <h2 className="text-xl font-bold">Item Details: {id}</h2>
      <p>You are viewing dynamic route for item {id}.</p>

      <div className="flex gap-4 mt-4">
        <Link
          to="/item/$id"
          params={{ id: "100" }}
          className="bg-blue-100 px-2 py-1 rounded"
        >
          Go to Item 100
        </Link>
        <Link
          to="/item/$id"
          params={{ id: "200" }}
          className="bg-blue-100 px-2 py-1 rounded"
        >
          Go to Item 200
        </Link>
      </div>
    </div>
  );
}
