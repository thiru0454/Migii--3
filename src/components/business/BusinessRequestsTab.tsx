import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getAllWorkersFromStorage } from "@/utils/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle2, XCircle, User, Phone, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/utils/supabaseClient";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { SKILLS } from "@/constants/skills";

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
  assigned_worker_name?: string;
  assigned_worker_id?: string;
  assignedWorkers?: string[];
  selectedWorkers?: string[];
}

interface Worker {
  id: string;
  name: string;
  phone: string;
  skill: string;
  status: string;
}

export function BusinessRequestsTab() {
  const [requests, setRequests] = useState<WorkerRequest[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // For tracking individual actions

  useEffect(() => {
    loadRequests();
    loadWorkers();
    
    // Real-time subscription
    const channel = supabase
      .channel('worker_requests_business_changes')
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
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const { data, error } = await supabase
        .from("worker_requests")
        .select("*")
        .eq("business_id", currentUser.id)
        .order("created_at", { ascending: false });
        
      if (error) {
        throw error;
      }
      
      setRequests(data || []);
    } catch (error) {
      console.error("Error loading requests:", error);
      toast.error("Failed to load worker requests");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };
  
  const loadWorkers = async () => {
    try {
      const workersData = await getAllWorkersFromStorage();
      setWorkers(workersData || []);
    } catch (error) {
      console.error("Error loading workers:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getWorkerDetails = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    if (!worker) return null;
    return {
      name: worker.name,
      skill: worker.skill,
      phone: worker.phone
    };
  };

  const handleCallWorker = (phone: string) => {
    setActionLoading("calling");
    try {
      window.location.href = `tel:${phone}`;
    } finally {
      // Reset after short delay
      setTimeout(() => setActionLoading(null), 1000);
    }
  };

  const handleMessageWorker = (phone: string) => {
    setActionLoading("messaging");
    try {
      window.location.href = `sms:${phone}`;
    } finally {
      // Reset after short delay
      setTimeout(() => setActionLoading(null), 1000);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <LoadingSpinner text="Loading worker requests..." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Worker Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request Date</TableHead>
                <TableHead>Required Skills</TableHead>
                <TableHead>Workers Needed</TableHead>
                <TableHead>Assigned Worker</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Selected Workers</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No requests found
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{request.skill}</TableCell>
                    <TableCell>{request.workers_needed}</TableCell>
                    <TableCell>
                      {request.assigned_worker_name ? (
                        <span className="font-medium text-blue-700">{request.assigned_worker_name}</span>
                      ) : (
                        <span className="text-muted-foreground">Not assigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {request.status === "pending" && getStatusBadge(request.status)}
                      {request.status === "approved" && (
                        <div className="text-green-600 text-xs">Worker request approved by admin</div>
                      )}
                      {request.status === "rejected" && (
                        <div className="text-red-600 text-xs">Worker request rejected by admin</div>
                      )}
                      {request.status === "assigned" && (
                        <div className="text-blue-600 text-xs">Worker assigned, awaiting response</div>
                      )}
                      {request.status === "accepted" && (
                        <div className="text-green-700 text-xs">Worker accepted assignment</div>
                      )}
                      {request.status === "declined" && (
                        <div className="text-red-700 text-xs">Worker declined assignment</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {request.status === "approved" && request.selectedWorkers && request.selectedWorkers.length > 0 ? (
                        <div className="space-y-2">
                          {request.selectedWorkers.map(workerId => {
                            const worker = getWorkerDetails(workerId);
                            return worker ? (
                              <div key={workerId} className="flex items-center justify-between p-2 border rounded-lg">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  <div>
                                    <div className="font-medium">{worker.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {worker.skill} • {worker.phone}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleCallWorker(worker.phone)}
                                    disabled={actionLoading === "calling"}
                                  >
                                    {actionLoading === "calling" ? (
                                      <LoadingSpinner size="sm" />
                                    ) : (
                                      <Phone className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleMessageWorker(worker.phone)}
                                    disabled={actionLoading === "messaging"}
                                  >
                                    {actionLoading === "messaging" ? (
                                      <LoadingSpinner size="sm" />
                                    ) : (
                                      <MessageSquare className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            ) : null;
                          })}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No workers selected</span>
                      )}
                    </TableCell>
                    <TableCell>{request.description}</TableCell>
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
