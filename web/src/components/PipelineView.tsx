import { useEffect, useState } from "react";
import { subscribeEvents, type PipelineEvent } from "@/lib/api";
import { DataTable } from "./DataTable";

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

  return (
    <div className="grid gap-4">
      {TABLES.map((t) => (
        <DataTable
          key={t.key}
          title={t.title}
          columns={[...t.columns]}
          rows={data[t.key]?.latest ?? []}
          count={data[t.key]?.count ?? 0}
        />
      ))}
    </div>
  );
}
