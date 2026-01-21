import { Outlet, createRootRoute, Link } from "@tanstack/react-router";
import { TitleBar } from "@/components/title-bar";
import { ThemeProvider } from "@/components/theme-provider";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="tauri-ui-theme">
      <div className="font-sans min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
        <div className="flex-1 flex flex-col pb-10">
          <nav className="flex items-center gap-6 px-6 h-12 border-b border-border bg-card/30 backdrop-blur-md sticky top-0 z-40">
            <Link
              to="/"
              className="text-xs font-bold uppercase tracking-tight text-muted-foreground hover:text-foreground transition-colors [&.active]:text-primary [&.active]:border-b-2 [&.active]:border-primary h-full flex items-center"
            >
              Dashboard
            </Link>
            <Link
              to="/about"
              className="text-xs font-bold uppercase tracking-tight text-muted-foreground hover:text-foreground transition-colors [&.active]:text-primary [&.active]:border-b-2 [&.active]:border-primary h-full flex items-center"
            >
              Network
            </Link>
          </nav>

          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>

        <TitleBar />
      </div>
    </ThemeProvider>
  );
}
