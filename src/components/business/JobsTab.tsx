import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/utils/supabaseClient";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";

interface JobFormData {
  title: string;
  company: string;
  location: string;
  type: string;
  category: string;
  salary: string;
  description: string;
  requirements: string;
  contact_email: string;
  workers_needed: number;
}

interface WorkerSkill {
  skill: string;
  count: number;
  workers: Array<{
    id: string;
    name: string;
    experience: number;
    rating: number;
  }>;
}

// Default skills that should always be available
const DEFAULT_SKILLS = [
  "Carpenter",
  "Plumber",
  "Cook",
  "Electrician",
  "Cleaner",
  "Mason",
  "Painter",
  "Welder",
  "Driver",
  "Security Guard"
];

export function JobsTab() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [workerSkills, setWorkerSkills] = useState<WorkerSkill[]>([]);
  const [selectedSkillDetails, setSelectedSkillDetails] = useState<WorkerSkill | null>(null);
  const [jobFormData, setJobFormData] = useState<JobFormData>({
    title: "",
    company: "",
    location: "",
    type: "full-time",
    category: "",
    salary: "",
    description: "",
    requirements: "",
    contact_email: "",
    workers_needed: 1,
  });

  useEffect(() => {
    fetchWorkerSkills();
  }, []);

  const fetchWorkerSkills = async () => {
    try {
      // Get available workers grouped by skill
      const { data: workers, error } = await supabase
        .from("workers")
        .select("id, name, skill, experience, rating")
        .eq("status", "Available");

      // Initialize with default skills regardless of error
      const skillMap = new Map<string, WorkerSkill>();
      DEFAULT_SKILLS.forEach(skill => {
        skillMap.set(skill, {
          skill,
          count: 0,
          workers: []
        });
      });

      if (error) {
        console.error("Error fetching workers:", error);
        // Continue with default skills even if there's an error
        setWorkerSkills(Array.from(skillMap.values()));
        return;
      }

      // Add workers to their respective skills
      workers?.forEach(worker => {
        if (skillMap.has(worker.skill)) {
          const skillData = skillMap.get(worker.skill)!;
          skillData.count++;
          skillData.workers.push({
            id: worker.id,
            name: worker.name,
            experience: worker.experience || 0,
            rating: worker.rating || 0
          });
        }
      });

      setWorkerSkills(Array.from(skillMap.values()));
    } catch (error) {
      console.error("Error in fetchWorkerSkills:", error);
      // Provide fallback with default skills
      const defaultSkills = DEFAULT_SKILLS.map(skill => ({
        skill,
        count: 0,
        workers: []
      }));
      setWorkerSkills(defaultSkills);
      toast.error("Failed to load available skills. Using default skills list.");
    }
  };

  const handleSkillChange = (skill: string) => {
    setJobFormData(prev => ({ ...prev, title: skill }));
    const skillDetails = workerSkills.find(s => s.skill === skill);
    setSelectedSkillDetails(skillDetails || null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setJobFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Step 1: Validate form data
      if (!jobFormData.title || !jobFormData.description) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Step 2: Get current user and business information
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
      const { data: businessData, error: businessError } = await supabase
        .from("businesses")
        .select("id, name")
        .eq("email", currentUser.email)
        .single();

      if (businessError) {
        console.error("Error fetching business data:", businessError);
        throw new Error("Failed to fetch business information");
      }

      // Step 3: Create job posting in database
      const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .insert([
          {
            title: jobFormData.title,
            company: businessData.name,
            location: jobFormData.location,
            job_type: jobFormData.type,
            category: jobFormData.category,
            salary: jobFormData.salary,
            description: jobFormData.description,
            requirements: jobFormData.requirements,
            contact_email: jobFormData.contact_email || currentUser.email,
            workers_needed: jobFormData.workers_needed,
            posted_at: new Date().toISOString(),
            status: "active", // Set status as active immediately
            business_id: businessData.id
          }
        ])
        .select()
        .single();

      if (jobError) {
        console.error("Error creating job:", jobError);
        throw new Error("Failed to create job posting");
      }

      // Step 4: Create admin notification (for information only)
      const { error: adminNotificationError } = await supabase
        .from("admin_notifications")
        .insert([
          {
            type: "new_job",
            job_id: jobData.id,
            business_id: businessData.id,
            business_name: businessData.name,
            skill: jobFormData.title,
            workers_needed: jobFormData.workers_needed,
            created_at: new Date().toISOString(),
            status: "info", // Changed to info status since no approval needed
            title: `New Job Posted: ${jobFormData.title}`,
            message: `${businessData.name} has posted a job for ${jobFormData.workers_needed} ${jobFormData.title}(s)`
          }
        ]);

      if (adminNotificationError) {
        console.error("Error creating admin notification:", adminNotificationError);
        // Continue execution even if admin notification fails
      }

      // Step 5: Find all workers with matching skill
      const { data: workers, error: workersError } = await supabase
        .from("workers")
        .select("id, name, email")
        .eq("skill", jobFormData.title);

      if (workersError) {
        console.error("Error fetching workers:", workersError);
        // Continue execution even if worker fetch fails
      }

      // Step 6: Create notifications for all workers with matching skill
      if (workers && workers.length > 0) {
        const workerNotifications = workers.map(worker => ({
          worker_id: worker.id,
          job_id: jobData.id,
          type: "job_available",
          created_at: new Date().toISOString(),
          status: "unread",
          title: `New ${jobFormData.title} job available`,
          message: `${businessData.name} is looking for ${jobFormData.workers_needed} ${jobFormData.title}(s)`,
          action_required: true, // Indicates worker needs to take action
          action_type: "accept_decline" // Specifies the type of action needed
        }));

        const { error: workerNotificationError } = await supabase
          .from("worker_notifications")
          .insert(workerNotifications);

        if (workerNotificationError) {
          console.error("Error creating worker notifications:", workerNotificationError);
          // Continue execution even if worker notifications fail
        }
      }

      toast.success("Job posted successfully! Workers will be notified.");
      
      // Reset form
      setJobFormData({
        title: "",
        company: "",
        location: "",
        type: "full-time",
        category: "",
        salary: "",
        description: "",
        requirements: "",
        contact_email: "",
        workers_needed: 1,
      });
      setSelectedSkillDetails(null);

    } catch (error) {
      console.error("Error submitting job:", error);
      toast.error("Failed to post job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl">Post a New Job</CardTitle>
        <CardDescription>Fill in the details to post a new job for workers</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Required Skill <span className="text-red-500">*</span></Label>
              <Select
                value={jobFormData.title}
                onValueChange={handleSkillChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select required skill" />
                </SelectTrigger>
                <SelectContent>
                  {DEFAULT_SKILLS.map((skill) => (
                    <SelectItem key={skill} value={skill}>
                      {skill}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="workers_needed">Number of Workers Needed <span className="text-red-500">*</span></Label>
              <Input
                id="workers_needed"
                name="workers_needed"
                type="number"
                min={1}
                value={jobFormData.workers_needed}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={jobFormData.location}
                onChange={handleChange}
                placeholder="e.g. Mumbai, Maharashtra"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Job Type</Label>
              <Select
                value={jobFormData.type}
                onValueChange={(value) => setJobFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full Time</SelectItem>
                  <SelectItem value="part-time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="temporary">Temporary</SelectItem>
                  <SelectItem value="seasonal">Seasonal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                name="category"
                value={jobFormData.category}
                onChange={handleChange}
                placeholder="e.g. Construction, Agriculture"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary">Salary</Label>
              <Input
                id="salary"
                name="salary"
                value={jobFormData.salary}
                onChange={handleChange}
                placeholder="e.g. ₹15,000 - ₹20,000/month"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Job Description <span className="text-red-500">*</span></Label>
            <Textarea
              id="description"
              name="description"
              value={jobFormData.description}
              onChange={handleChange}
              placeholder="Detailed description of the job responsibilities"
              rows={5}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea
              id="requirements"
              name="requirements"
              value={jobFormData.requirements}
              onChange={handleChange}
              placeholder="Skills, qualifications, experience required"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_email">Contact Email</Label>
            <Input
              id="contact_email"
              name="contact_email"
              type="email"
              value={jobFormData.contact_email}
              onChange={handleChange}
              placeholder="contact@company.com"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full md:w-auto transition-all hover:scale-105"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Posting Job...
              </>
            ) : 'Post Job'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 