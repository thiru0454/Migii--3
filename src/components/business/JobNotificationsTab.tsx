import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/utils/supabaseClient";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface JobNotification {
  id: string;
  job_id: string;
  business_id: string;
  business_name: string;
  skill: string;
  workers_needed: number;
  created_at: string;
  status: string;
  job_details?: {
    title: string;
    description: string;
    location: string;
    salary: string;
    job_type: string;
  };
}

export function JobNotificationsTab() {
  const [notifications, setNotifications] = useState<JobNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    // Subscribe to real-time updates
    const subscription = supabase
      .channel('business_notifications')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'admin_notifications' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotifications(prev => [payload.new as JobNotification, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setNotifications(prev =>
              prev.map(notification =>
                notification.id === payload.new.id
                  ? { ...notification, ...payload.new }
                  : notification
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      // Get current user from localStorage
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

      // First get the business ID from the businesses table
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('id')
        .eq('email', currentUser.email)
        .single();

      if (businessError) throw businessError;

      // Fetch notifications for this business with job details
      const { data, error } = await supabase
        .from('admin_notifications')
        .select(`
          *,
          job:jobs!inner (
            title,
            description,
            location,
            salary,
            job_type
          )
        `)
        .eq('business_id', businessData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to include job details
      const transformedData = data.map(notification => ({
        ...notification,
        job_details: notification.job
      }));

      setNotifications(transformedData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" } = {
      pending: "default",
      approved: "secondary",
      rejected: "destructive"
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Job Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading notifications...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Notifications</CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-4">No notifications found</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Skill</TableHead>
                <TableHead>Workers Needed</TableHead>
                <TableHead>Posted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Job Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell>{notification.skill}</TableCell>
                  <TableCell>{notification.workers_needed}</TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell>{getStatusBadge(notification.status)}</TableCell>
                  <TableCell>
                    {notification.job_details && (
                      <div className="text-sm">
                        <div><strong>Title:</strong> {notification.job_details.title}</div>
                        <div><strong>Location:</strong> {notification.job_details.location}</div>
                        <div><strong>Type:</strong> {notification.job_details.job_type}</div>
                        <div><strong>Salary:</strong> {notification.job_details.salary}</div>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
} 