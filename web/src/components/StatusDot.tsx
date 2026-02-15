type Status = "connected" | "disconnected" | "loading";

const colorMap: Record<Status, string> = {
  connected: "bg-emerald-500",
  disconnected: "bg-red-500",
  loading: "bg-yellow-500",
};

export function StatusDot({ status }: { status: Status }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span
        className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${colorMap[status]}`}
      />
      <span
        className={`relative inline-flex h-2.5 w-2.5 rounded-full ${colorMap[status]}`}
      />
    </span>
  );
}
