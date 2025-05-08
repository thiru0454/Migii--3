import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { WorkerRequestForm } from "@/components/worker/WorkerRequestForm";
import { BusinessRequestsTab } from "@/components/business/BusinessRequestsTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BusinessUserDetails } from "@/components/business/BusinessUserDetails";
import { getBusinessUserById } from "@/utils/businessDatabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { supabase, getAllWorkers } from "@/utils/supabaseClient";
import { JobsTab } from "@/components/business/JobsTab";
import { JobNotificationsTab } from "@/components/business/JobNotificationsTab";

export default function BusinessDashboard() {
  const [activeTab, setActiveTab] = useState("business-details");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [form, setForm] = useState({
    workersNeeded: 1,
    skill: "",
    priority: "Normal",
    duration: "",
    description: ""
  });
  const [business, setBusiness] = useState<any>(null);

  useEffect(() => {
    const fetchBusiness = async () => {
      // Get current user from localStorage
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
      // Fetch from Supabase using email
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("email", currentUser.email)
        .single();
      setBusiness(data);
    };
    fetchBusiness();
  }, []);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelect = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!business || !business.id) {
      alert("Business not loaded. Please wait and try again.");
      return;
    }
    setConfirmOpen(false);
    setDialogOpen(false);
    // Save to Supabase
    const { data: request, error } = await supabase.from("worker_requests").insert([
      {
        business_id: business.id,
        business_name: business.name,
        workers_needed: form.workersNeeded,
        skill: form.skill,
        priority: form.priority,
        duration: form.duration,
        description: form.description,
        status: "pending",
        created_at: new Date().toISOString(),
      },
    ]).select().single();
    if (error) {
      alert("Failed to submit request: " + error.message);
      return;
    }
    // Fetch top 3 available workers with the required skill
    const { data: workers, error: workerError } = await supabase
      .from("workers")
      .select("id, name, skill, status")
      .eq("skill", form.skill)
      .eq("status", "Available")
      .limit(3);
    if (workerError) {
      alert("Request submitted, but failed to suggest workers: " + workerError.message);
      return;
    }
    const names = workers && workers.length > 0 ? workers.map((w: any) => w.name).join(", ") : "No available workers found.";
    alert(`Request submitted! Top matches: ${names}`);
    // TODO: Real-time update for admin dashboard
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Business Dashboard</h1>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="business-details">Business Details</TabsTrigger>
            <TabsTrigger value="worker-request">Worker Request</TabsTrigger>
            <TabsTrigger value="view-requests">View Requests</TabsTrigger>
            <TabsTrigger value="jobs">Post Jobs</TabsTrigger>
            <TabsTrigger value="job-notifications">Job Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="business-details">
            <DashboardCard title="Business Details">
              {business ? (
                <BusinessUserDetails business={business} onEdit={() => {}} />
              ) : (
                <div>No business details found.</div>
              )}
            </DashboardCard>
          </TabsContent>

          <TabsContent value="worker-request">
            <DashboardCard title="Worker Request">
              <Button onClick={() => setDialogOpen(true)} className="mb-4" disabled={!business}>
                Request Worker
              </Button>
              <Dialog open={dialogOpen && !!business} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Request Worker</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Number of Workers Needed</label>
                        <Input type="number" name="workersNeeded" min={1} value={form.workersNeeded} onChange={handleChange} required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Required Skill</label>
                        <Select value={form.skill} onValueChange={v => handleSelect("skill", v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select skill" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Carpenter">Carpenter</SelectItem>
                            <SelectItem value="Plumber">Plumber</SelectItem>
                            <SelectItem value="Cook">Cook</SelectItem>
                            <SelectItem value="Electrician">Electrician</SelectItem>
                            <SelectItem value="Cleaner">Cleaner</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Priority Level</label>
                        <Select value={form.priority} onValueChange={v => handleSelect("priority", v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Normal">Normal</SelectItem>
                            <SelectItem value="Urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Estimated Duration</label>
                        <Input type="text" name="duration" value={form.duration} onChange={handleChange} placeholder="e.g., 2 days, 1 week" required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Description (optional)</label>
                      <Input type="text" name="description" value={form.description} onChange={handleChange} />
                    </div>
                    <DialogFooter>
                      <Button type="submit">Submit Request</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              {/* Confirmation Dialog */}
              <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Confirm Submission</DialogTitle>
                  </DialogHeader>
                  <div>Do you want to submit this request?</div>
                  <DialogFooter>
                    <Button onClick={handleConfirm}>OK</Button>
                    <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </DashboardCard>
          </TabsContent>

          <TabsContent value="view-requests">
            <DashboardCard title="Your Requests">
              <BusinessRequestsTab />
            </DashboardCard>
          </TabsContent>

          <TabsContent value="jobs">
            <DashboardCard title="Post Jobs">
              <JobsTab />
            </DashboardCard>
          </TabsContent>

          <TabsContent value="job-notifications">
            <DashboardCard title="Job Notifications">
              <JobNotificationsTab />
            </DashboardCard>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
} 