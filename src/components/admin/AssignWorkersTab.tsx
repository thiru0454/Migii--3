import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { MigrantWorker, Worker } from "@/types/worker";
import { useWorkers } from "@/hooks/useWorkers";
import { assignWorkerToBusiness } from "@/utils/supabaseClient";

interface WorkerRequest {
  id: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  email: string;
  requiredSkills: string;
  numberOfWorkers: number;
  description: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  assignedWorkers?: string[];
}

export function AssignWorkersTab() {
  const [requests, setRequests] = useState<WorkerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkers, setSelectedWorkers] = useState<{ [key: string]: string[] }>({});
  const { workers, isLoadingWorkers } = useWorkers();
  const [assigningWorkers, setAssigningWorkers] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      // Load approved requests
      const storedRequests = JSON.parse(localStorage.getItem('workerRequests') || '[]');
      const approvedRequests = storedRequests.filter((request: WorkerRequest) => 
        request.status === "approved"
      );
      setRequests(approvedRequests);

      // Initialize selected workers for each request
      const initialSelectedWorkers: { [key: string]: string[] } = {};
      approvedRequests.forEach((request: WorkerRequest) => {
        initialSelectedWorkers[request.id] = request.assignedWorkers || [];
      });
      setSelectedWorkers(initialSelectedWorkers);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Convert MigrantWorker array to Worker array with consistent types
  const getAvailableWorkers = () => {
    return workers.filter((worker: MigrantWorker) => 
      worker.status === "active"
    ).map((worker: MigrantWorker): Worker => ({
      id: String(worker.id),
      name: worker.name,
      phone: worker.phone,
      skill: worker.skill || worker.primarySkill || worker["Primary Skill"] || "",
      status: worker.status,
      originState: worker.originState,
      age: worker.age,
      email: worker.email,
      photoUrl: worker.photoUrl,
      aadhaar: worker.aadhaar
    }));
  };

  const handleWorkerSelection = (requestId: string, workerId: string) => {
    setSelectedWorkers(prev => {
      const currentWorkers = prev[requestId] || [];
      if (currentWorkers.includes(workerId)) {
        return {
          ...prev,
          [requestId]: currentWorkers.filter(id => id !== workerId)
        };
      } else {
        return {
          ...prev,
          [requestId]: [...currentWorkers, workerId]
        };
      }
    });
  };

  const assignWorkers = async (requestId: string) => {
    try {
      const request = requests.find(r => r.id === requestId);
      if (!request) return;

      if (selectedWorkers[requestId].length > request.numberOfWorkers) {
        toast.error(`Cannot assign more than ${request.numberOfWorkers} workers`);
        return;
      }
      
      setAssigningWorkers(prev => ({ ...prev, [requestId]: true }));

      // Ensure all worker IDs are strings before sending them to Supabase
      const workersToAssign = selectedWorkers[requestId].map(id => String(id));
      
      console.log('Workers to assign:', workersToAssign);

      // Assign each worker to the business
      const workerPromises = workersToAssign.map(async (workerId) => {
        try {
          console.log(`Attempting to assign worker ${workerId} to business ${request.id}`);
          const result = await assignWorkerToBusiness(workerId, request.id);
          
          if (result.error) {
            console.error(`Error assigning worker ${workerId}:`, result.error);
            return false;
          }
          
          console.log(`Successfully assigned worker ${workerId} to business ${request.id}`);
          return true;
        } catch (err) {
          console.error(`Exception assigning worker ${workerId}:`, err);
          return false;
        }
      });

      const results = await Promise.all(workerPromises);
      
      // Check if all workers were assigned successfully
      if (results.every(r => r === true)) {
        const updatedRequests = requests.map(r => {
          if (r.id === requestId) {
            return {
              ...r,
              assignedWorkers: selectedWorkers[requestId]
            };
          }
          return r;
        });

        localStorage.setItem('workerRequests', JSON.stringify(updatedRequests));
        setRequests(updatedRequests);
        toast.success("Workers assigned successfully!");
      } else {
        toast.error("Failed to assign one or more workers. Please try again.");
      }
    } catch (error) {
      console.error("Error assigning workers:", error);
      toast.error("Failed to assign workers. Please try again.");
    } finally {
      setAssigningWorkers(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const getWorkerName = (workerId: string) => {
    const availableWorkers = getAvailableWorkers();
    const worker = availableWorkers.find(w => w.id === workerId);
    return worker ? `${worker.name} (${worker.skill})` : "Unknown Worker";
  };

  if (loading || isLoadingWorkers) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loader text-primary text-xl"></div>
        <span className="ml-3 text-muted-foreground">Loading data...</span>
      </div>
    );
  }

  const availableWorkers = getAvailableWorkers();

  console.log("Available workers:", availableWorkers);
  console.log("Request requiredSkills:", request.requiredSkills);

  return (
    <Card className="bg-gradient-to-br from-card to-background border border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl md:text-2xl text-gradient-primary">Assign Workers to Approved Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto max-w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business Name</TableHead>
                <TableHead className="hidden sm:table-cell">Required Skills</TableHead>
                <TableHead className="hidden sm:table-cell">Workers Needed</TableHead>
                <TableHead>Available Workers</TableHead>
                <TableHead>Assigned Workers</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No approved requests found
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.businessName}</TableCell>
                    <TableCell className="hidden sm:table-cell">{request.requiredSkills}</TableCell>
                    <TableCell className="hidden sm:table-cell">{request.numberOfWorkers}</TableCell>
                    <TableCell>
                      <Select
                        onValueChange={(value) => handleWorkerSelection(request.id, value)}
                      >
                        <SelectTrigger className="w-full sm:w-[200px]">
                          <SelectValue placeholder="Select worker" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableWorkers
                            .filter(worker => 
                              worker.status === "active" &&
                              !selectedWorkers[request.id]?.includes(worker.id)
                            )
                            .map(worker => (
                              <SelectItem key={worker.id} value={worker.id}>
                                {worker.name} ({worker.skill})
                              </SelectItem>
                            ))}
                          {availableWorkers.filter(worker =>
                            worker.status === "active" &&
                            !selectedWorkers[request.id]?.includes(worker.id)
                          ).length === 0 && (
                            <div className="px-4 py-2 text-muted-foreground">No matching workers available</div>
                          )}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {selectedWorkers[request.id]?.map(workerId => (
                          <div key={workerId} className="flex items-center justify-between">
                            <span className="text-sm truncate max-w-[120px] sm:max-w-[180px]">{getWorkerName(workerId)}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleWorkerSelection(request.id, workerId)}
                              className="ml-2"
                            >
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => assignWorkers(request.id)}
                        disabled={!selectedWorkers[request.id]?.length || assigningWorkers[request.id]}
                        className="bg-primary text-white hover:bg-primary/90 w-full sm:w-auto"
                      >
                        {assigningWorkers[request.id] ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Assigning...
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Assign Workers
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
