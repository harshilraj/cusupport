import type { LeadStatus } from "@/lib/data";

const statusStyles: Record<LeadStatus, string> = {
  HOT: "bg-green-50 text-green-700 ring-green-200",
  WARM: "bg-yellow-50 text-yellow-700 ring-yellow-200",
  COLD: "bg-neutral-100 text-neutral-600 ring-neutral-200"
};

export function StatusChip({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`inline-flex min-w-16 items-center justify-center rounded-full px-3 py-1 font-mono text-xs font-bold ring-1 ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}
