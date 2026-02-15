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

interface DataTableProps {
  title: string;
  columns: string[];
  rows: Record<string, unknown>[];
  count: number;
  deletedKeys?: Set<string>;
}

export function DataTable({ title, columns, rows, count, deletedKeys }: DataTableProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <Badge variant="outline">{count}</Badge>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data yet</p>
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
                        {String(row[col] ?? "")}
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
