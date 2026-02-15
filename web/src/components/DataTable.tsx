import React, { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatCell(value: unknown): React.ReactNode {
  if (value == null) return "";
  if (Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1">
        {value.map((item, i) => (
          <Badge key={i} variant="secondary" className="text-xs">
            {String(item)}
          </Badge>
        ))}
      </div>
    );
  }
  return String(value);
}

interface DataTableProps {
  title: string;
  columns: string[];
  rows: Record<string, unknown>[];
  count: number;
  deletedKeys?: Set<string>;
  layout?: "table" | "queue";
}

function QueueCard({
  row,
  columns,
  isDeleted,
}: {
  row: Record<string, unknown>;
  columns: string[];
  isDeleted: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const name = String(row["name"] ?? row["id"] ?? "");
  const id = String(row["id"] ?? "");

  return (
    <div
      className="shrink-0 animate-[slide-in-right_0.3s_ease-out]"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div
        className={`flex cursor-pointer flex-col gap-1 rounded-lg border p-3 text-sm transition-all duration-200 ${
          expanded ? "shadow-lg" : ""
        } ${
          isDeleted
            ? "border-red-300 bg-red-50 opacity-60 dark:border-red-800 dark:bg-red-950"
            : "border-border bg-card"
        }`}
        style={{ width: expanded ? "240px" : "150px", transition: "width 0.2s ease, box-shadow 0.2s ease" }}
      >
        <span className={`font-semibold truncate ${isDeleted ? "line-through" : ""}`}>
          {name}
        </span>
        <span className="text-xs text-muted-foreground">#{id}</span>
        {isDeleted && (
          <Badge variant="destructive" className="text-xs w-fit">deleted</Badge>
        )}

        {expanded && (
          <div className="mt-1 border-t pt-1.5 space-y-0.5 animate-[fade-in_0.15s_ease-out]">
            {columns.filter((col) => col !== "id" && col !== "name").map((col) => (
              <div key={col} className="flex flex-col">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{col}</span>
                <span className="text-xs break-all">{React.isValidElement(formatCell(row[col])) ? formatCell(row[col]) : String(row[col] ?? "")}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function DataTable({ title, columns, rows, count, deletedKeys, layout = "table" }: DataTableProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollLeft = el.scrollWidth;
    }
  }, [rows.length]);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <Badge variant="outline">{count}</Badge>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data yet</p>
        ) : layout === "queue" ? (
          <div ref={scrollRef} className="flex gap-2 overflow-x-auto pb-2">
            {rows.map((row, i) => {
              const key = String(row["id"] ?? row["practitioner_id"] ?? i);
              const isDeleted = deletedKeys?.has(key) ?? false;
              return <QueueCard key={key} row={row} columns={columns} isDeleted={isDeleted} />;
            })}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col}>{col}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, i) => {
                const key = String(row["id"] ?? row["practitioner_id"] ?? i);
                const isDeleted = deletedKeys?.has(key);
                return (
                  <TableRow key={i} className={isDeleted ? "opacity-50" : ""}>
                    {columns.map((col) => (
                      <TableCell
                        key={col}
                        className={isDeleted ? "line-through" : ""}
                      >
                        {formatCell(row[col])}
                      </TableCell>
                    ))}
                    {isDeleted && (
                      <TableCell>
                        <Badge variant="destructive" className="text-xs">
                          deleted
                        </Badge>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
