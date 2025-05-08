import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { ProfileTab } from "@/components/worker/ProfileTab";
import { JobsTab } from "@/components/worker/JobsTab";
import { JobNotificationsTab } from "@/components/worker/JobNotificationsTab";

export default function WorkerDashboard() {
  return (
    <div className="container mx-auto p-6">
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="jobs">Available Jobs</TabsTrigger>
          <TabsTrigger value="notifications">Job Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <DashboardCard>
            <ProfileTab />
          </DashboardCard>
        </TabsContent>

        <TabsContent value="jobs">
          <DashboardCard>
            <JobsTab />
          </DashboardCard>
        </TabsContent>

        <TabsContent value="notifications">
          <DashboardCard>
            <JobNotificationsTab />
          </DashboardCard>
        </TabsContent>
      </Tabs>
    </div>
  );
} 