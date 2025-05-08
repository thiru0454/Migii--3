import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/utils/supabaseClient";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface JobNotification {
  id: string;
  job_id: string;
  title: string;
  message: string;
  created_at: string;
  status: string;
  action_required: boolean;
  action_type: string;
  job: {
    title: string;
    company: string;
    location: string;
    job_type: string;
    salary: string;
    description: string;
    requirements: string;
    workers_needed: number;
  };
}

export function JobNotificationsTab() {
  const [notifications, setNotifications] = useState<JobNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobNotification | null>(null);
  const [showJobDetails, setShowJobDetails] = useState(false);

  useEffect(() => {
    fetchNotifications();
    subscribeToNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
      
      const { data, error } = await supabase
        .from("worker_notifications")
        .select(`
          *,
          job:jobs(*)
        `)
        .eq("worker_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    
    const subscription = supabase
      .channel("worker_notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "worker_notifications",
          filter: `worker_id=eq.${currentUser.id}`,
        },
        (payload) => {
          setNotifications((current) => [payload.new as JobNotification, ...current]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleViewDetails = (notification: JobNotification) => {
    setSelectedJob(notification);
    setShowJobDetails(true);
  };

  const handleJobResponse = async (notificationId: string, jobId: string, response: "accept" | "decline") => {
    setProcessingAction(notificationId);
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

      // Update notification status
      const { error: notificationError } = await supabase
        .from("worker_notifications")
        .update({ 
          status: response === "accept" ? "accepted" : "declined",
          action_required: false
        })
        .eq("id", notificationId);

      if (notificationError) throw notificationError;

      // Create job application record
      if (response === "accept") {
        const { error: applicationError } = await supabase
          .from("job_applications")
          .insert([
            {
              job_id: jobId,
              worker_id: currentUser.id,
              status: "pending",
              applied_at: new Date().toISOString()
            }
          ]);

        if (applicationError) throw applicationError;
      }

      // Update notifications list
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, status: response === "accept" ? "accepted" : "declined", action_required: false }
            : notification
        )
      );

      setShowJobDetails(false);
      toast.success(`Job ${response}ed successfully`);
    } catch (error) {
      console.error(`Error ${response}ing job:`, error);
      toast.error(`Failed to ${response} job`);
    } finally {
      setProcessingAction(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      unread: { variant: "default", label: "New" },
      accepted: { variant: "success", label: "Accepted" },
      declined: { variant: "destructive", label: "Declined" }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { variant: "secondary", label: status };
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Job Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No job notifications yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Posted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell>{getStatusBadge(notification.status)}</TableCell>
                    <TableCell>{notification.job.title}</TableCell>
                    <TableCell>{notification.job.company}</TableCell>
                    <TableCell>{notification.job.location}</TableCell>
                    <TableCell>
                      {new Date(notification.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {notification.action_required ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(notification)}
                          >
                            View Details
                          </Button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          {notification.status === "accepted" ? "Accepted" : "Declined"}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showJobDetails} onOpenChange={setShowJobDetails}>
        <DialogContent className="max-w-2xl">
          {selectedJob && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedJob.job.title}</DialogTitle>
                <DialogDescription>
                  {selectedJob.job.company} • {selectedJob.job.location}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-1">Job Type</h4>
                    <p className="text-sm text-muted-foreground capitalize">
                      {selectedJob.job.job_type.replace("-", " ")}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Salary</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedJob.job.salary}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Workers Needed</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedJob.job.workers_needed}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Posted</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedJob.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-1">Description</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedJob.job.description}
                  </p>
                </div>

                {selectedJob.job.requirements && (
                  <div>
                    <h4 className="font-medium mb-1">Requirements</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedJob.job.requirements}
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowJobDetails(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleJobResponse(selectedJob.id, selectedJob.job_id, "decline")}
                  disabled={!!processingAction}
                >
                  {processingAction === selectedJob.id ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : null}
                  Decline
                </Button>
                <Button
                  onClick={() => handleJobResponse(selectedJob.id, selectedJob.job_id, "accept")}
                  disabled={!!processingAction}
                >
                  {processingAction === selectedJob.id ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : null}
                  Accept Job
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 