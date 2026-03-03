import { Outlet, createRootRoute, Link } from "@tanstack/react-router";
import { TitleBar } from "@/components/title-bar";
import { ThemeProvider } from "@/components/theme-provider";
import { getCurrentWindow } from "@tauri-apps/api/window";


export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
    const windowMaximizeOnDoubleClick = ()=>{
      const window = getCurrentWindow();
      window.isMaximized().then((maximized) => {
        if (maximized) {
          window.unmaximize();
        } else {
          window.maximize();
        }
      });
    }
  
  return (
    <ThemeProvider defaultTheme="system" storageKey="tauri-ui-theme">
      <div className="font-sans select-none min-h-screen bg-background text-foreground flex flex-col" onDoubleClick={windowMaximizeOnDoubleClick}>
        <div className="flex-1 flex flex-col pb-10">
          <nav className="flex items-center gap-6 px-6 h-12 border-b border-border bg-card sticky top-0 z-40">
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
