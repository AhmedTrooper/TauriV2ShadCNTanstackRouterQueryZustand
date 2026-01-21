import { Outlet, createRootRoute, Link } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="p-4 font-sans">
      {/* Global Navigation Bar */}
      <nav className="flex gap-4 p-4 mb-4 border-b border-gray-300">
        <Link to="/" className="[&.active]:font-bold [&.active]:text-blue-600">
          Home
        </Link>
        <Link
          to="/about"
          className="[&.active]:font-bold [&.active]:text-blue-600"
        >
          About
        </Link>
        <Link
          to="/admin/dashboard"
          className="[&.active]:font-bold [&.active]:text-blue-600"
        >
          Admin Dashboard
        </Link>
      </nav>

      <Outlet />
    </div>
  );
}
