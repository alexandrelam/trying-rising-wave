import { useEffect, useMemo, useState } from "react";
import { useSSEConnection, type PipelineEvent, type SSEStatus } from "@/lib/api";
import { DataTable } from "./DataTable";
import { EventLog } from "./EventLog";

const TABLES = [
  {
    key: "practitioners_mv",
    title: "Practitioners",
    columns: ["id", "name", "email", "speciality_ids", "created_at"],
    layout: "queue" as const,
  },
  {
    key: "specialities_mv",
    title: "Specialities",
    columns: ["id", "name"],
    layout: "queue" as const,
  },
  {
    key: "practitioners_with_specialities",
    title: "Joined View",
    columns: ["id", "name", "email", "specialities", "created_at"],
    layout: "table" as const,
  },
] as const;

interface PipelineViewProps {
  onUpdate?: (data: { id: string; name: string; email: string; specialityIds: string }) => void;
  onSSEStatusChange?: (status: SSEStatus) => void;
}

export function PipelineView({ onUpdate, onSSEStatusChange }: PipelineViewProps) {
  const [data, setData] = useState<PipelineEvent>({});

  const sseStatus = useSSEConnection(setData);

  useEffect(() => {
    onSSEStatusChange?.(sseStatus);
  }, [sseStatus, onSSEStatusChange]);

  const eventLog = data.event_log ?? [];

  const deletedKeys = useMemo(() => {
    const lastByKey = new Map<string, string>();
    for (const evt of eventLog) {
      if (evt.topic === "practitioners") {
        lastByKey.set(evt.key, evt.type);
      }
    }
    const keys = new Set<string>();
    for (const [key, type] of lastByKey) {
      if (type === "TOMBSTONE") keys.add(key);
    }
    return keys;
  }, [eventLog]);

  return (
    <div className="grid gap-4">
      {TABLES.map((t) => (
        <DataTable
          key={t.key}
          title={t.title}
          columns={[...t.columns]}
          rows={data[t.key]?.latest ?? []}
          count={data[t.key]?.count ?? 0}
          deletedKeys={t.key === "practitioners_mv" ? deletedKeys : undefined}
          layout={t.layout}
          onUpdate={t.key === "practitioners_mv" && onUpdate ? (row) => onUpdate({ id: String(row.id ?? ""), name: String(row.name ?? ""), email: String(row.email ?? ""), specialityIds: String(row.speciality_ids ?? "") }) : undefined}
        />
      ))}
      <EventLog events={eventLog} />
    </div>
  );
}
