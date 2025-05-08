import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";

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
}

export function WorkerRequestsList() {
  const [requests, setRequests] = useState<WorkerRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    try {
      const storedRequests = JSON.parse(localStorage.getItem('workerRequests') || '[]');
      setRequests(storedRequests);
    } catch (error) {
      console.error("Error loading requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = (requestId: string, newStatus: "pending" | "approved" | "rejected") => {
    try {
      const updatedRequests = requests.map(request =>
        request.id === requestId ? { ...request, status: newStatus } : request
      );
      localStorage.setItem('workerRequests', JSON.stringify(updatedRequests));
      setRequests(updatedRequests);
      toast.success(`Request ${newStatus} successfully!`);
    } catch (error) {
      console.error("Error updating request status:", error);
      toast.error("Failed to update request status. Please try again.");
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
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig];

    return (
      <Badge className={`${config.color} text-white flex items-center`}>
        {config.icon}
        {config.text}
      </Badge>
    );
  };

  if (loading) {
    return <div>Loading requests...</div>;
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
                <TableHead>Contact Person</TableHead>
                <TableHead>Required Skills</TableHead>
                <TableHead>Workers Needed</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No requests found
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.businessName}</TableCell>
                    <TableCell>{request.contactPerson}</TableCell>
                    <TableCell>{request.requiredSkills}</TableCell>
                    <TableCell>{request.numberOfWorkers}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {request.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-green-500 text-white hover:bg-green-600"
                              onClick={() => updateRequestStatus(request.id, "approved")}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-red-500 text-white hover:bg-red-600"
                              onClick={() => updateRequestStatus(request.id, "rejected")}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // View details logic here
                            console.log("View details for request:", request.id);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
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