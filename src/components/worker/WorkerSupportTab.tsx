
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface SupportRequest {
  id: string;
  date: string;
  issue: string;
  status: string;
}

interface WorkerSupportTabProps {
  supportHistory: SupportRequest[];
}

export function WorkerSupportTab({ supportHistory }: WorkerSupportTabProps) {
  const [message, setMessage] = useState("");
  const [issueType, setIssueType] = useState("accommodation");
  const [requests, setRequests] = useState(supportHistory);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }
    
    // Create new support request
    const newRequest = {
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleDateString(),
      issue: `${issueType.charAt(0).toUpperCase() + issueType.slice(1)} request: ${message.slice(0, 30)}${message.length > 30 ? "..." : ""}`,
      status: "Pending"
    };
    
    // Add to history
    setRequests([newRequest, ...requests]);
    
    // Clear form
    setMessage("");
    setIssueType("accommodation");
    
    toast.success("Support request submitted successfully!", {
      description: "Our team will review your request as soon as possible.",
    });
  };

  const getBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-500";
      case "resolved":
        return "bg-green-500";
      case "in progress":
      case "processing":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Submit a Support Request</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="issueType">Request Type</Label>
              <Select value={issueType} onValueChange={setIssueType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select request type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="accommodation">Accommodation</SelectItem>
                  <SelectItem value="payment">Payment Issue</SelectItem>
                  <SelectItem value="health">Health & Safety</SelectItem>
                  <SelectItem value="document">Document Request</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Your Message</Label>
              <Textarea
                id="message"
                placeholder="Please describe your issue or request in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
            <Button type="submit" className="w-full">Submit Request</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Support History</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="border rounded-md p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium">{request.date}</p>
                      <p className="mt-1">{request.issue}</p>
                    </div>
                    <Badge className={getBadgeColor(request.status)}>
                      {request.status}
                    </Badge>
                  </div>
                  
                  {request.status.toLowerCase() === "resolved" && (
                    <div className="mt-2 bg-gray-50 p-3 rounded-md">
                      <p className="text-sm font-medium">Response from support:</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your request has been addressed. Please contact us again if you need further assistance.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No support history yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
