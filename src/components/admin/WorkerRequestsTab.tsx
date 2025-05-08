import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/utils/supabaseClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWorkers } from "@/hooks/useWorkers";
import { MigrantWorker } from "@/types/worker";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface WorkerRequest {
  id: string;
  business_id: string;
  business_name: string;
  workers_needed: number;
  skill: string;
  priority: string;
  duration: string;
  description: string;
  status: string;
  created_at: string;
  assigned_worker_id?: string;
  assigned_worker_name?: string;
}

export function WorkerRequestsTab() {
  const [requests, setRequests] = useState<WorkerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<WorkerRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>("");
  const { workers, isLoadingWorkers } = useWorkers();

  // Filter available workers based on skill and active status
  const getAvailableWorkers = (skill: string) => {
    return workers.filter(
      (worker) => 
        worker.status === "active" && 
        (worker.primarySkill?.toLowerCase().includes(skill.toLowerCase()) ||
         (worker["Primary Skill"] && worker["Primary Skill"].toLowerCase().includes(skill.toLowerCase())) ||
         (worker.skill && worker.skill.toLowerCase().includes(skill.toLowerCase())))
    );
  };

  useEffect(() => {
    loadRequests();
    // Add real-time subscription
    const channel = supabase
      .channel('worker_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'worker_requests',
        },
        () => {
          loadRequests();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("worker_requests")
        .select("*")
        .order("created_at", { ascending: false });
        
      if (error) {
        console.error("Error loading requests:", error);
        setRequests([]);
        toast.error("Failed to load worker requests");
      } else {
        console.log("Worker requests loaded:", data);
        setRequests(data || []);
      }
    } catch (err) {
      console.error("Exception during request loading:", err);
      setRequests([]);
      toast.error("Failed to load worker requests");
    } finally {
      setLoading(false);
    }
  };

  const handleViewRequest = (request: WorkerRequest) => {
    setSelectedRequest(request);
    setDialogOpen(true);
  };

  const handleApproveReject = (action: "approve" | "reject") => {
    setConfirmAction(action);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedRequest || !confirmAction) return;
    
    try {
      const newStatus = confirmAction === "approve" ? "approved" : "rejected";
      const { error } = await supabase
        .from("worker_requests")
        .update({ status: newStatus })
        .eq("id", selectedRequest.id);
        
      if (error) {
        throw error;
      }
      
      toast.success(`Request ${newStatus} successfully!`);
      
      // Update local state
      setRequests(prev => 
        prev.map(req => 
          req.id === selectedRequest.id ? { ...req, status: newStatus } : req
        )
      );
    } catch (err) {
      console.error("Error updating request status:", err);
      toast.error("Failed to update request status");
    } finally {
      setConfirmOpen(false);
      setDialogOpen(false);
      setSelectedRequest(null);
      setConfirmAction(null);
    }
  };

  // Open assign dialog and get available workers
  const handleAssignWorker = () => {
    if (!selectedRequest) return;
    setAssignDialogOpen(true);
    setSelectedWorkerId("");
  };

  // Assign worker to request - Fixed the worker ID format issue
  const handleConfirmAssign = async () => {
    if (!selectedRequest || !selectedWorkerId) {
      toast.error("Please select a worker");
      return;
    }
    
    try {
      const worker = workers.find(w => String(w.id) === selectedWorkerId);
      
      if (!worker) {
        throw new Error("Selected worker not found");
      }
      
      console.log("Assigning worker:", worker);
      console.log("Worker ID type:", typeof worker.id, "Value:", worker.id);
      
      // Format the worker ID as UUID if needed
      // This is a simple check - in a real application, you'd want to ensure proper UUID format
      let formattedWorkerId = String(worker.id);
      
      // If it's a numeric ID, we need to convert it to a valid UUID format for Supabase
      if (/^\d+$/.test(formattedWorkerId)) {
        // Generate a UUID v4 based on the worker ID
        formattedWorkerId = `00000000-0000-4000-A000-${formattedWorkerId.padStart(12, '0')}`;
        console.log("Formatted worker ID:", formattedWorkerId);
      }
      
      const { error } = await supabase
        .from("worker_requests")
        .update({
          assigned_worker_id: formattedWorkerId,
          assigned_worker_name: worker.name,
          status: "assigned"
        })
        .eq("id", selectedRequest.id);
        
      if (error) {
        console.error("Error in assignment:", error);
        throw error;
      }
      
      toast.success("Worker assigned successfully!");
      
      // Update local state
      setRequests(prev => 
        prev.map(req => 
          req.id === selectedRequest.id 
            ? { 
                ...req, 
                status: "assigned",
                assigned_worker_id: formattedWorkerId,
                assigned_worker_name: worker.name
              } 
            : req
        )
      );
    } catch (err) {
      console.error("Error assigning worker:", err);
      toast.error("Failed to assign worker");
    } finally {
      setAssignDialogOpen(false);
      setDialogOpen(false);
      setSelectedRequest(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        color: "bg-yellow-500",
        icon: <AlertCircle className="h-4 w-4 mr-1" />,
        text: "Pending"
      },
      approved: {
        color: "bg-green-500",
        icon: <CheckCircle2 className="h-4 w-4 mr-1" />,
        text: "Approved"
      },
      rejected: {
        color: "bg-red-500",
        icon: <XCircle className="h-4 w-4 mr-1" />,
        text: "Rejected"
      },
      assigned: {
        color: "bg-blue-500",
        icon: <CheckCircle2 className="h-4 w-4 mr-1" />,
        text: "Assigned"
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <Badge className={`${config.color} text-white flex items-center`}>
        {config.icon}
        {config.text}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Worker Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business Name</TableHead>
                <TableHead>Required Skills</TableHead>
                <TableHead>Workers Needed</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No requests found
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow key={request.id} className="hover-glow">
                    <TableCell>{request.business_name}</TableCell>
                    <TableCell>{request.skill}</TableCell>
                    <TableCell>{request.workers_needed}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewRequest(request)}
                        className="hover-scale"
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Request Details Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Worker Request Details</DialogTitle>
              <DialogDescription>
                View and manage request details
              </DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Business Information</h3>
                  <p><span className="text-muted-foreground">Name:</span> {selectedRequest.business_name}</p>
                  <p><span className="text-muted-foreground">Business ID:</span> {selectedRequest.business_id}</p>
                </div>
                
                <div>
                  <h3 className="font-medium">Request Details</h3>
                  <p><span className="text-muted-foreground">Skill Required:</span> {selectedRequest.skill}</p>
                  <p><span className="text-muted-foreground">Workers Needed:</span> {selectedRequest.workers_needed}</p>
                  <p><span className="text-muted-foreground">Priority:</span> {selectedRequest.priority || 'Normal'}</p>
                  <p><span className="text-muted-foreground">Duration:</span> {selectedRequest.duration || 'Not specified'}</p>
                </div>
                
                <div>
                  <h3 className="font-medium">Description</h3>
                  <p className="text-sm bg-muted p-3 rounded-md">{selectedRequest.description}</p>
                </div>
                
                <div>
                  <h3 className="font-medium">Status</h3>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                  
                  {selectedRequest.assigned_worker_id && (
                    <div className="mt-2">
                      <p><span className="text-muted-foreground">Assigned Worker:</span> {selectedRequest.assigned_worker_name} (ID: {selectedRequest.assigned_worker_id})</p>
                    </div>
                  )}
                </div>
                
                {/* Action buttons based on status */}
                <div className="pt-4 flex flex-wrap gap-3">
                  {selectedRequest.status === "pending" && (
                    <>
                      <Button 
                        className="bg-green-500 text-white hover:bg-green-600 hover-scale" 
                        onClick={() => handleApproveReject("approve")}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button 
                        className="bg-red-500 text-white hover:bg-red-600 hover-scale" 
                        onClick={() => handleApproveReject("reject")}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                  
                  {selectedRequest.status === "approved" && (
                    <Button 
                      className="bg-blue-600 text-white hover:bg-blue-700 hover-scale" 
                      onClick={handleAssignWorker}
                    >
                      Assign Worker
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Confirmation Dialog */}
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Confirm Action</DialogTitle>
              <DialogDescription>
                Please confirm your action
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              Are you sure you want to <span className="font-semibold">{confirmAction}</span> this request?
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleConfirm} 
                className={confirmAction === 'approve' ? 'bg-green-500' : 'bg-red-500'}
              >
                Yes, {confirmAction}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Assign Worker Dialog */}
        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Worker</DialogTitle>
              <DialogDescription>
                Select a worker to assign to this request
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {isLoadingWorkers ? (
                <div className="flex justify-center py-4">
                  <LoadingSpinner />
                </div>
              ) : selectedRequest ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Request</p>
                    <p className="font-medium">{selectedRequest.business_name} - {selectedRequest.skill}</p>
                  </div>
                
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Worker:</label>
                    <Select
                      value={selectedWorkerId}
                      onValueChange={setSelectedWorkerId}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a worker" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableWorkers(selectedRequest.skill).length > 0 ? (
                          getAvailableWorkers(selectedRequest.skill).map((worker: MigrantWorker) => (
                            <SelectItem key={worker.id} value={String(worker.id)}>
                              {worker.name} - {worker.primarySkill || worker["Primary Skill"] || worker.skill}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            No matching workers available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : null}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmAssign}
                disabled={!selectedWorkerId || isLoadingWorkers}
              >
                Assign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
