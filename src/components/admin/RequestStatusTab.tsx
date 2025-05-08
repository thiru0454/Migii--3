
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, AlertCircle, Clock } from "lucide-react";
import { toast } from "sonner";

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
  updatedAt?: string;
}

export function RequestStatusTab() {
  const [requests, setRequests] = useState<WorkerRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load requests from localStorage
    const loadRequests = () => {
      try {
        const storedRequests = JSON.parse(localStorage.getItem('workerRequests') || '[]');
        setRequests(storedRequests);
      } catch (error) {
        console.error("Error loading worker requests:", error);
        toast.error("Failed to load worker requests");
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
    // Check for updates periodically
    const interval = setInterval(loadRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = (requestId: string, newStatus: "pending" | "approved" | "rejected") => {
    try {
      const updatedRequests = requests.map(request => {
        if (request.id === requestId) {
          return { 
            ...request, 
            status: newStatus,
            updatedAt: new Date().toISOString()
          };
        }
        return request;
      });

      localStorage.setItem('workerRequests', JSON.stringify(updatedRequests));
      setRequests(updatedRequests);
      toast.success(`Request status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating request status:", error);
      toast.error("Failed to update request status");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "approved":
        return <Check className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-500 flex items-center gap-1"><Check className="h-3 w-3" /> Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="flex items-center gap-1"><X className="h-3 w-3" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Worker Request Status</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="mx-auto h-8 w-8 mb-2" />
              <p>No worker requests found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map(request => (
                <Card key={request.id} className="overflow-hidden">
                  <div className="p-4 border-l-4 border-l-primary">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{request.businessName}</h3>
                        <p className="text-sm text-muted-foreground">Contact: {request.contactPerson} | {request.phone}</p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                    
                    <div className="mt-3 grid gap-2">
                      <div>
                        <span className="text-sm font-medium">Required Skills:</span>
                        <span className="text-sm ml-2">{request.requiredSkills}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Workers Needed:</span>
                        <span className="text-sm ml-2">{request.numberOfWorkers}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Description:</span>
                        <p className="text-sm mt-1">{request.description}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        Requested: {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                      
                      {request.status === "pending" && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleStatusChange(request.id, "approved")}
                          >
                            <Check className="mr-1 h-4 w-4" /> Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleStatusChange(request.id, "rejected")}
                          >
                            <X className="mr-1 h-4 w-4" /> Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
