
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminDashboardHeader } from "@/components/admin/AdminDashboardHeader";
import { WorkersTab } from "@/components/admin/WorkersTab";
import { BusinessesTab } from "@/components/admin/BusinessesTab";
import { HelpRequestsTab } from "@/components/admin/HelpRequestsTab";
import { WorkersMap } from "@/components/admin/WorkersMap";
import { WorkerRequestsTab } from "@/components/admin/WorkerRequestsTab";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useWorkers } from "@/hooks/useWorkers";
import { useWorkerRequests } from "@/contexts/WorkerRequestsContext";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [tab, setTab] = useState("workers");
  const { workers } = useWorkers();
  const { requests, updateRequest } = useWorkerRequests();

  const handleUpdateRequest = (businessId: string, status: "approved" | "rejected") => {
    updateRequest(businessId, status);
    toast.success(`Request ${status} successfully!`);
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <AdminDashboardHeader onLogout={logout} workers={workers} />
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="workers">Workers</TabsTrigger>
          <TabsTrigger value="businesses">Businesses</TabsTrigger>
          <TabsTrigger value="help">Help Requests</TabsTrigger>
          <TabsTrigger value="locations">Live Map</TabsTrigger>
          <TabsTrigger value="requests">Worker Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="workers">
          <div className="mt-4">
            <WorkersTab />
          </div>
        </TabsContent>
        <TabsContent value="businesses">
          <div className="mt-4">
            <BusinessesTab />
          </div>
        </TabsContent>
        <TabsContent value="help">
          <div className="mt-4">
            <HelpRequestsTab />
          </div>
        </TabsContent>
        <TabsContent value="locations">
          <div className="mt-6">
            <WorkersMap />
          </div>
        </TabsContent>
        <TabsContent value="requests">
          <div className="mt-4">
            {/* Remove the props as they're not needed - WorkerRequestsTab manages its own state */}
            <WorkerRequestsTab />
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
