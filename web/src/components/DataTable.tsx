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
  onUpdate?: (row: Record<string, unknown>) => void;
}

function QueueCard({
  row,
  columns,
  isDeleted,
  index,
  onUpdate,
}: {
  row: Record<string, unknown>;
  columns: string[];
  isDeleted: boolean;
  index: number;
  onUpdate?: (row: Record<string, unknown>) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const name = String(row["name"] ?? row["id"] ?? "");
  const id = String(row["id"] ?? "");

  return (
    <div
      className="shrink-0 animate-[slide-in-right_0.3s_ease-out] flex flex-col items-center"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Index label like array notation */}
      <span className="text-[10px] font-mono text-muted-foreground/60 mb-0.5">[{index}]</span>

      <div
        className={`flex cursor-pointer flex-col items-center justify-center border-2 transition-all duration-200 ${
          expanded ? "shadow-lg bg-accent" : ""
        } ${
          isDeleted
            ? "border-red-400 bg-red-50/80 opacity-60 dark:border-red-700 dark:bg-red-950/80"
            : "border-foreground/20 bg-card/70 backdrop-blur-sm hover:border-primary/50 hover:shadow-[0_0_12px_-3px] hover:shadow-primary/20"
        }`}
        style={{
          width: expanded ? "220px" : "120px",
          minHeight: "56px",
          transition: "width 0.2s ease, box-shadow 0.2s ease",
        }}
      >
        <span className={`font-mono font-semibold text-sm truncate px-2 ${isDeleted ? "line-through" : ""}`}>
          {name}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">id:{id}</span>
        {isDeleted && (
          <Badge variant="destructive" className="text-[10px] mt-0.5 px-1 py-0">DEL</Badge>
        )}

        {expanded && (
          <div className="mt-1.5 border-t border-dashed border-foreground/20 pt-1.5 pb-1 px-2 w-full space-y-0.5 animate-[fade-in_0.15s_ease-out]">
            {columns.filter((col) => col !== "id" && col !== "name").map((col) => (
              <div key={col} className="flex flex-col">
                <span className="text-[9px] font-mono text-muted-foreground">{col}:</span>
                <span className="text-[11px] font-mono break-all">{React.isValidElement(formatCell(row[col])) ? formatCell(row[col]) : String(row[col] ?? "")}</span>
              </div>
            ))}
            {onUpdate && !isDeleted && (
              <button
                type="button"
                className="mt-1 w-full text-[11px] font-mono px-2 py-0.5 border border-foreground/20 rounded hover:bg-foreground/10 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdate(row);
                }}
              >
                Update
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function DataTable({ title, columns, rows, count, deletedKeys, layout = "table", onUpdate }: DataTableProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollLeft = el.scrollWidth;
    }
  }, [rows.length]);

  return (
    <Card className="glass-card">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <Badge variant="outline">{count}</Badge>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2 opacity-40"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
            <p className="text-sm">No data yet</p>
            <p className="text-xs mt-1">Set up the pipeline and produce some events</p>
          </div>
        ) : layout === "queue" ? (
          <div className="flex items-center gap-0">
            {/* Enqueue side label */}
            <div className="flex flex-col items-center shrink-0 mr-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">enqueue</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-muted-foreground">
                <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* Queue bracket left */}
            <div className="w-2 shrink-0 self-stretch border-y-2 border-l-2 border-dashed border-muted-foreground/40 rounded-l-md" />

            {/* Queue body */}
            <div ref={scrollRef} className="flex items-center overflow-x-auto py-3 px-1">
              {[...rows].reverse().map((row, i) => {
                const key = String(row["id"] ?? row["practitioner_id"] ?? i);
                const isDeleted = deletedKeys?.has(key) ?? false;
                return (
                  <React.Fragment key={key}>
                    <QueueCard row={row} columns={columns} isDeleted={isDeleted} index={rows.length - 1 - i} onUpdate={onUpdate} />
                    {i < rows.length - 1 && (
                      <svg width="20" height="16" viewBox="0 0 20 16" fill="none" className="shrink-0 text-muted-foreground/50 mx-0.5">
                        <path d="M0 8H16M16 8L10 2M16 8L10 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Queue bracket right */}
            <div className="w-2 shrink-0 self-stretch border-y-2 border-r-2 border-dashed border-muted-foreground/40 rounded-r-md" />

            {/* Dequeue side label */}
            <div className="flex flex-col items-center shrink-0 ml-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">dequeue</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-muted-foreground">
                <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
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
