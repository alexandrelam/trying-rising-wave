import { Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatusDot } from "./StatusDot";
import { ThemeToggle } from "./ThemeToggle";

interface AppHeaderProps {
  sseStatus: "connected" | "disconnected" | "loading";
  sources?: string[];
  materializedViews?: string[];
}

export function AppHeader({ sseStatus, sources, materializedViews }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-2.5">
          <Activity className="h-5 w-5 text-primary" />
          <span className="text-lg font-bold tracking-tight">
            <span className="text-primary">RisingWave</span> Pipeline
          </span>
        </div>

        <div className="flex items-center gap-3">
          {sources && (
            <Badge variant="secondary" className="text-xs">
              {sources.length} sources
            </Badge>
          )}
          {materializedViews && (
            <Badge variant="secondary" className="text-xs">
              {materializedViews.length} MVs
            </Badge>
          )}

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <StatusDot status={sseStatus} />
            <span className="hidden sm:inline">
              {sseStatus === "connected" ? "Live" : sseStatus === "loading" ? "Connecting" : "Offline"}
            </span>
          </div>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
