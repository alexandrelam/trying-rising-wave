import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity } from "lucide-react";
import type { EventLogEntry } from "@/lib/api";

interface EventLogProps {
  events: EventLogEntry[];
}

export function EventLog({ events }: EventLogProps) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-base">Event Log</CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Activity className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-sm">No events yet</p>
            <p className="text-xs mt-1">Events will appear here as data flows through the pipeline</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {[...events].reverse().map((evt, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 rounded-md border-l-4 bg-card/50 p-2 text-sm animate-[slide-in-up_0.2s_ease-out] ${
                  evt.type === "TOMBSTONE"
                    ? "border-l-red-500"
                    : "border-l-emerald-500"
                }`}
              >
                <Badge
                  variant={evt.type === "TOMBSTONE" ? "destructive" : "default"}
                  className="shrink-0"
                >
                  {evt.type}
                </Badge>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{evt.topic}</span>
                    <span className="text-muted-foreground">key={evt.key}</span>
                  </div>
                  {evt.value ? (
                    <pre className="mt-1 truncate text-xs text-muted-foreground">
                      {JSON.stringify(evt.value)}
                    </pre>
                  ) : (
                    <span className="mt-1 text-xs text-red-500">null (tombstone)</span>
                  )}
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {new Date(evt.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
