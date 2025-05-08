
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { WorkersTable } from "@/components/admin/WorkersTable";
import { useWorkers } from "@/hooks/useWorkers";
import { MigrantWorker } from "@/types/worker";
import { toast } from "sonner";

interface AssignWorkersTabProps {
  businessId?: string;
  currentWorkers: MigrantWorker[];
}

export function AssignWorkersTab({ businessId, currentWorkers }: AssignWorkersTabProps) {
  const { workers } = useWorkers();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Ensure workers is properly typed as MigrantWorker[]
  const typedWorkers = workers as MigrantWorker[];
  
  // Filter workers that are not already assigned to this business
  const availableWorkers = typedWorkers.filter(
    worker => !currentWorkers.some(cw => cw.id === worker.id)
  );
  
  const filteredWorkers = searchTerm 
    ? availableWorkers.filter(
        worker => 
          worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          worker.skill.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : availableWorkers;
  
  const handleAssignWorker = (worker: MigrantWorker) => {
    // Here you would implement the actual assignment logic
    toast.success(`Worker ${worker.name} has been assigned to your business`);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assign Workers</CardTitle>
          <CardDescription>
            Find available workers and assign them to your business
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search by name or skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <div className="space-y-4">
            {filteredWorkers.length > 0 ? (
              <WorkersTable 
                workers={filteredWorkers} 
                onViewDetails={(worker) => handleAssignWorker(worker)} 
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No available workers found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
