
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/utils/supabaseClient";
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

export function WorkerRequestsList() {
  const [requests, setRequests] = useState<WorkerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
    // Real-time subscription
    const channel = supabase
      .channel('worker_requests_worker_changes')
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
        .eq("assigned_worker_id", currentUser.id)
        .eq("status", "assigned")
        .order("created_at", { ascending: false });
        
      if (error) {
        throw error;
      }
      
      setRequests(data || []);
    } catch (error) {
      console.error("Error loading requests:", error);
      toast.error("Failed to load assigned requests");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (requestId: string, newStatus: "accepted" | "declined") => {
    setActionInProgress(requestId);
    try {
      const { error } = await supabase
        .from("worker_requests")
        .update({ status: newStatus })
        .eq("id", requestId);
        
      if (error) throw error;
      
      // Update local state
      setRequests(prev => 
        prev.map(req => req.id === requestId ? { ...req, status: newStatus } : req)
      );
      
      toast.success(`Request ${newStatus} successfully!`);
    } catch (error) {
      console.error(`Error changing request status to ${newStatus}:`, error);
      toast.error(`Failed to ${newStatus} the request`);
    } finally {
      setActionInProgress(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "assigned":
        return <Badge variant="secondary">Assigned</Badge>;
      case "accepted":
        return <Badge className="bg-green-500 text-white">Accepted</Badge>;
      case "declined":
        return <Badge variant="destructive">Declined</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="py-8 flex justify-center">
          <LoadingSpinner text="Loading assigned requests..." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Assigned Worker Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.length === 0 ? (
            <p className="text-center text-muted-foreground p-4">No assigned requests found</p>
          ) : (
            requests.map((request) => (
              <Card key={request.id} className="p-4 hover-glow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{request.business_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Skill: {request.skill}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Workers Needed: {request.workers_needed}
                    </p>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
                <div className="mt-2">
                  <p className="text-sm">
                    <span className="font-medium">Description:</span> {request.description}
                  </p>
                </div>
                {request.status === "assigned" && (
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      className="bg-green-500 text-white hover:bg-green-600"
                      onClick={() => handleStatusChange(request.id, "accepted")}
                      disabled={actionInProgress === request.id}
                    >
                      {actionInProgress === request.id ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-1" />
                          Processing...
                        </>
                      ) : 'Accept'}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleStatusChange(request.id, "declined")}
                      disabled={actionInProgress === request.id}
                    >
                      {actionInProgress === request.id ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-1" />
                          Processing...
                        </>
                      ) : 'Decline'}
                    </Button>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
