
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { WorkerRequestsList } from "@/components/admin/WorkerRequestsList";
import { AssignWorkersTab } from "@/components/admin/AssignWorkersTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkersTab } from "@/components/admin/WorkersTab";
import { WorkerTrackingMap } from "@/components/admin/WorkerTrackingMap";
import { useWorkersContext } from "@/contexts/WorkersContext";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import mongoDbService from "@/utils/mongoDbService";

export default function AdminDashboard() {
  const { workers } = useWorkersContext();
  const [isMongoConnected, setIsMongoConnected] = useState<boolean | null>(null);
  const [showConnectionAlert, setShowConnectionAlert] = useState(false);

  // Check MongoDB connection on component mount
  useEffect(() => {
    const checkConnection = () => {
      const connected = mongoDbService.isConnectedToDatabase();
      setIsMongoConnected(connected);
      
      if (!connected) {
        setShowConnectionAlert(true);
      }
    };
    
    // Check after a slight delay to allow connection to initialize
    const timer = setTimeout(checkConnection, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          
          {isMongoConnected !== null && (
            <div className="flex items-center gap-2">
              <span className="text-sm">MongoDB Status:</span>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${isMongoConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium">{isMongoConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
          )}
        </div>
        
        <Tabs defaultValue="workers" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="workers">Workers</TabsTrigger>
            <TabsTrigger value="requests">Worker Requests</TabsTrigger>
            <TabsTrigger value="assign">Assign Workers</TabsTrigger>
            <TabsTrigger value="tracking">Live Tracking</TabsTrigger>
          </TabsList>
          
          <TabsContent value="workers">
            <DashboardCard title="Registered Workers">
              <WorkersTab />
            </DashboardCard>
          </TabsContent>
          
          <TabsContent value="requests">
            <DashboardCard title="Worker Requests">
              <WorkerRequestsList />
            </DashboardCard>
          </TabsContent>
          
          <TabsContent value="assign">
            <DashboardCard title="Assign Workers">
              <AssignWorkersTab />
            </DashboardCard>
          </TabsContent>
          
          <TabsContent value="tracking">
            <DashboardCard title="Live Worker Tracking">
              <WorkerTrackingMap />
            </DashboardCard>
          </TabsContent>
        </Tabs>
      </div>
      
      <AlertDialog open={showConnectionAlert} onOpenChange={setShowConnectionAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Database Connection Notice</AlertDialogTitle>
            <AlertDialogDescription>
              This application is currently using a simulated MongoDB connection for demonstration purposes. 
              In a production environment, worker location data would be securely stored in MongoDB.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Understood</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
