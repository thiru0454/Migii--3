import { MigrantWorker } from "@/types/worker";
import { useWorkersContext } from "@/contexts/WorkersContext";
import { DataTable } from "@/components/ui/data-table";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { WorkerDetailsDialog } from "./WorkerDetailsDialog";
import { WorkerLocationDialog } from "./WorkerLocationDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, User, MapPin } from "lucide-react";
import { toast } from "sonner";
import { getAllWorkers } from "@/utils/supabaseClient";

interface WorkersTabProps {
  onViewDetails?: (worker: MigrantWorker) => void;
}

export function WorkersTab({ onViewDetails = () => {} }: WorkersTabProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<MigrantWorker | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { workers, updateWorker } = useWorkersContext();

  // Add direct data fetching
  useEffect(() => {
    console.log("Fetching workers directly...");
    getAllWorkers().then(({ data, error }) => {
      console.log("Direct Supabase response:", { data, error });
      if (error) {
        toast.error("Failed to fetch workers directly");
      }
      setIsLoading(false);
    });
  }, []);

  // Debug log for workers from context
  useEffect(() => {
    console.log("Workers from context:", workers);
  }, [workers]);

  const updateWorkerStatus = (worker: MigrantWorker, newStatus: "active" | "inactive" | "pending") => {
    updateWorker(worker.id, { status: newStatus });
    toast.success("Worker status updated", {
      description: `${worker.name}'s status has been updated to ${newStatus}`,
    });
  };

  const columns: ColumnDef<MigrantWorker>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      accessorKey: "skill",
      header: "Skill",
      cell: ({ row }) => {
        const skill = row.original.skill;
        return (
          <div className="flex flex-wrap gap-1">
            <span className="px-2 py-1 bg-primary/10 rounded-full text-sm">
              {skill}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "originState",
      header: "Origin State",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const worker = row.original;
        return (
          <select
            className="border rounded px-2 py-1"
            value={worker.status}
            onChange={(e) => {
              const newStatus = e.target.value as "active" | "inactive" | "pending";
              updateWorkerStatus(worker, newStatus);
            }}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const worker = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setSelectedWorker(worker);
                  setIsDetailsDialogOpen(true);
                }}
              >
                <User className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedWorker(worker);
                  setIsLocationDialogOpen(true);
                }}
              >
                <MapPin className="mr-2 h-4 w-4" />
                Track Location
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: workers,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="space-y-4">
      <DataTable table={table} />
      
      {selectedWorker && (
        <>
          <WorkerDetailsDialog
            worker={selectedWorker}
            open={isDetailsDialogOpen}
            onOpenChange={setIsDetailsDialogOpen}
          />
          
          <WorkerLocationDialog
            worker={selectedWorker}
            open={isLocationDialogOpen}
            onOpenChange={setIsLocationDialogOpen}
          />
        </>
      )}
    </div>
  );
}
