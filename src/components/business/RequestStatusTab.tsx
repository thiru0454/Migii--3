import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WorkerRequest } from "@/components/business/RequestWorkersForm";
import { useWorkerRequests } from "@/contexts/WorkerRequestsContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export function RequestStatusTab() {
  const { requests } = useWorkerRequests();
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const filteredRequests = requests.filter(request => 
    filter === "all" ? true : request.status === filter
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending Review</Badge>;
      case "approved":
        return <Badge variant="success">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50";
      case "approved":
        return "bg-green-50";
      case "rejected":
        return "bg-red-50";
      default:
        return "bg-gray-50";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Worker Requests</h2>
        <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Requests</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="py-6">
              <p className="text-center text-muted-foreground">No requests found</p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request, index) => (
            <Card key={index} className={getStatusColor(request.status)}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Request #{index + 1}</CardTitle>
                  {getStatusBadge(request.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Number of Workers</p>
                      <p className="font-medium">{request.numberOfWorkers}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Required Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {request.skillsRequired.map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Start Date</p>
                      <p className="font-medium">{request.startDate || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">End Date</p>
                      <p className="font-medium">{request.endDate || "Not specified"}</p>
                    </div>
                  </div>
                  {request.additionalNotes && (
                    <div>
                      <p className="text-sm text-muted-foreground">Additional Notes</p>
                      <p className="font-medium">{request.additionalNotes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 