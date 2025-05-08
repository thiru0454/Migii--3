import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminDashboardHeader } from "@/components/admin/AdminDashboardHeader";
import { WorkersTab } from "@/components/admin/WorkersTab";
import { BusinessesTab } from "@/components/admin/BusinessesTab";
import { HelpRequestsTab } from "@/components/admin/HelpRequestsTab";
import { WorkersMap } from "@/components/admin/WorkersMap";
import { WorkerRequestsTab } from "@/components/admin/WorkerRequestsTab";
import { JobNotificationsTab } from "@/components/admin/JobNotificationsTab";
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
      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="overflow-x-auto w-full flex flex-nowrap lg:justify-start">
          <TabsTrigger value="workers" className="flex-shrink-0">Workers</TabsTrigger>
          <TabsTrigger value="businesses" className="flex-shrink-0">Businesses</TabsTrigger>
          <TabsTrigger value="help" className="flex-shrink-0">Help Requests</TabsTrigger>
          <TabsTrigger value="locations" className="flex-shrink-0">Live Map</TabsTrigger>
          <TabsTrigger value="requests" className="flex-shrink-0">Worker Requests</TabsTrigger>
          <TabsTrigger value="job-notifications" className="flex-shrink-0">Job Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="workers" className="animate-fade-in">
          <div className="mt-4">
            <WorkersTab />
          </div>
        </TabsContent>
        <TabsContent value="businesses" className="animate-fade-in">
          <div className="mt-4">
            <BusinessesTab />
          </div>
        </TabsContent>
        <TabsContent value="help" className="animate-fade-in">
          <div className="mt-4">
            <HelpRequestsTab />
          </div>
        </TabsContent>
        <TabsContent value="locations" className="animate-fade-in">
          <div className="mt-6">
            <WorkersMap />
          </div>
        </TabsContent>
        <TabsContent value="requests" className="animate-fade-in">
          <div className="mt-4">
            <WorkerRequestsTab />
          </div>
        </TabsContent>
        <TabsContent value="job-notifications" className="animate-fade-in">
          <div className="mt-4">
            <JobNotificationsTab />
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
