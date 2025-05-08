import { ColumnDef } from "@tanstack/react-table";
import { MigrantWorker } from "@/types/worker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

export const columns: ColumnDef<MigrantWorker>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "skill",
    header: "Skill",
  },
  {
    accessorKey: "originState",
    header: "Origin State",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={
            status === "approved"
              ? "success"
              : status === "rejected"
              ? "destructive"
              : "secondary"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "registrationDate",
    header: "Registration Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("registrationDate"));
      return date.toLocaleDateString();
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const worker = row.original;
      const onStatusChange = (worker: MigrantWorker, status: 'approved' | 'rejected') => {
        // This will be handled by the parent component
        window.dispatchEvent(new CustomEvent('workerStatusChange', {
          detail: { workerId: worker.id, status }
        }));
      };

      if (worker.status === 'pending') {
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onStatusChange(worker, 'approved')}
            >
              <Check className="h-4 w-4 text-green-500" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onStatusChange(worker, 'rejected')}
            >
              <X className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        );
      }
      return null;
    },
  },
]; 