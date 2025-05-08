
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export type HelpRequest = {
  id: string;
  workerId: string;
  workerName: string;
  workerPhoto?: string;
  requestDate: string;
  message: string;
  status: "pending" | "processing" | "resolved";
};

interface HelpRequestsListProps {
  requests: HelpRequest[];
  onStatusChange?: (requestId: string, newStatus: HelpRequest["status"]) => void;
}

export function HelpRequestsList({ requests, onStatusChange }: HelpRequestsListProps) {
  const [responses, setResponses] = useState<Record<string, string>>({});

  const handleResponseChange = (requestId: string, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [requestId]: value,
    }));
  };

  const handleSendResponse = (request: HelpRequest) => {
    const response = responses[request.id];
    if (!response?.trim()) {
      toast.error("Please enter a response message");
      return;
    }

    // In a real app, this would send the response to the worker
    toast.success("Response sent successfully!");
    
    // Clear the response input
    setResponses((prev) => ({
      ...prev,
      [request.id]: "",
    }));
    
    // Mark as resolved
    onStatusChange?.(request.id, "resolved");
  };

  // Function to render status badge
  const renderStatusBadge = (status: HelpRequest["status"]) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "processing":
        return <Badge className="bg-blue-500">Processing</Badge>;
      case "resolved":
        return <Badge className="bg-green-500">Resolved</Badge>;
      default:
        return null;
    }
  };

  // Group requests by status for better organization
  const pendingRequests = requests.filter((req) => req.status === "pending");
  const processingRequests = requests.filter((req) => req.status === "processing");
  const resolvedRequests = requests.filter((req) => req.status === "resolved");

  // Combine in this order: pending, processing, resolved
  const orderedRequests = [...pendingRequests, ...processingRequests, ...resolvedRequests];

  return (
    <div className="space-y-4">
      {orderedRequests.length > 0 ? (
        orderedRequests.map((request) => (
          <Card key={request.id} className={
            request.status === "pending" 
              ? "border-yellow-200" 
              : request.status === "processing" 
                ? "border-blue-200" 
                : "border-gray-200"
          }>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">
                Help Request #{request.id.slice(-5)}
              </CardTitle>
              {renderStatusBadge(request.status)}
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={request.workerPhoto} alt={request.workerName} />
                  <AvatarFallback className="bg-migii-muted text-migii-dark">
                    {request.workerName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-medium">{request.workerName}</h4>
                    <span className="text-xs text-muted-foreground">{request.requestDate}</span>
                  </div>
                  <p className="mt-2 text-muted-foreground">{request.message}</p>
                </div>
              </div>

              {request.status !== "resolved" && (
                <div className="mt-4">
                  <Textarea
                    placeholder="Type your response here..."
                    value={responses[request.id] || ""}
                    onChange={(e) => handleResponseChange(request.id, e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              )}
            </CardContent>
            
            {request.status !== "resolved" && (
              <CardFooter className="flex justify-between">
                {request.status === "pending" && (
                  <Button
                    variant="outline"
                    onClick={() => onStatusChange?.(request.id, "processing")}
                  >
                    Mark as Processing
                  </Button>
                )}
                <Button onClick={() => handleSendResponse(request)}>
                  Send Response
                </Button>
              </CardFooter>
            )}
          </Card>
        ))
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>No help requests at the moment.</p>
        </div>
      )}
    </div>
  );
}
