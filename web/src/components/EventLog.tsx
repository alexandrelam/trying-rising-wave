import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { EventLogEntry } from "@/lib/api";

interface EventLogProps {
  events: EventLogEntry[];
}

export function EventLog({ events }: EventLogProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Event Log</CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">No events yet</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {[...events].reverse().map((evt, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 rounded-md border p-2 text-sm ${
                  evt.type === "TOMBSTONE"
                    ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950"
                    : "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950"
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
