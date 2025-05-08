
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";
import { HelpRequestsList, HelpRequest } from "@/components/admin/HelpRequestsList";
import { mockHelpRequests } from "@/data/mockData";

export function HelpRequestsTab() {
  const [requestFilter, setRequestFilter] = useState("all");

  const handleRequestStatusChange = (requestId: string, newStatus: HelpRequest["status"]) => {
    console.log(`Request ${requestId} status changed to ${newStatus}`);
  };

  const filteredRequests = requestFilter === "all" 
    ? mockHelpRequests 
    : mockHelpRequests.filter(req => req.status === requestFilter);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl">Help Requests</CardTitle>
        <div className="flex items-center gap-2">
          <Select value={requestFilter} onValueChange={setRequestFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All requests</SelectItem>
              <SelectItem value="pending">Pending only</SelectItem>
              <SelectItem value="processing">In progress only</SelectItem>
              <SelectItem value="resolved">Resolved only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <HelpRequestsList 
          requests={filteredRequests} 
          onStatusChange={handleRequestStatusChange}
        />
      </CardContent>
    </Card>
  );
}
