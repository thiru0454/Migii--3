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
  const [tab, setTab] = useState("jobs");

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
      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="overflow-x-auto w-full flex flex-nowrap lg:justify-start">
          <TabsTrigger value="jobs" className="flex-shrink-0 animate-pulse">Post Jobs</TabsTrigger>
        </TabsList>
        <TabsContent value="jobs" className="animate-fade-in">
          <div className="mt-4">
            <JobsTab />
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
} 