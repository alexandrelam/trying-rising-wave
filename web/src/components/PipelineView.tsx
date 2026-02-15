import { useEffect, useMemo, useState } from "react";
import { subscribeEvents, type PipelineEvent } from "@/lib/api";
import { DataTable } from "./DataTable";
import { EventLog } from "./EventLog";

const TABLES = [
  {
    key: "practitioners_mv",
    title: "Practitioners",
    columns: ["id", "name", "email"],
  },
  {
    key: "specialities_mv",
    title: "Specialities",
    columns: ["practitioner_id", "speciality"],
  },
  {
    key: "practitioners_with_specialities",
    title: "Joined View",
    columns: ["id", "name", "email", "speciality"],
  },
] as const;

export function PipelineView() {
  const [data, setData] = useState<PipelineEvent>({});

  useEffect(() => {
    return subscribeEvents(setData);
  }, []);

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
        />
      ))}
      <EventLog events={eventLog} />
    </div>
  );
}
