import { cn } from "@/lib/utils";
import { STATUS_CLASS, type Status } from "@/lib/applications";

export function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_CLASS[status as Status] ?? "";
  return <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold", cls)}>{status}</span>;
}
