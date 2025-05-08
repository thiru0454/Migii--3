
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/utils/supabaseClient";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function JobsTab() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobFormData, setJobFormData] = useState({
    title: "",
    company: "",
    location: "",
    type: "full-time",
    category: "",
    salary: "",
    description: "",
    requirements: "",
    contact_email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setJobFormData({ ...jobFormData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setJobFormData({ ...jobFormData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form data
      if (!jobFormData.title || !jobFormData.description || !jobFormData.company) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Add job to Supabase
      const { data, error } = await supabase
        .from("jobs")
        .insert([
          {
            title: jobFormData.title,
            company: jobFormData.company,
            location: jobFormData.location,
            job_type: jobFormData.type,
            category: jobFormData.category,
            salary: jobFormData.salary,
            description: jobFormData.description,
            requirements: jobFormData.requirements,
            contact_email: jobFormData.contact_email,
            posted_at: new Date().toISOString(),
            status: "active"
          }
        ])
        .select();

      if (error) {
        console.error("Error adding job:", error);
        throw error;
      }

      toast.success("Job posted successfully!");
      
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
      });

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
              <Label htmlFor="title">Job Title <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                name="title"
                value={jobFormData.title}
                onChange={handleChange}
                placeholder="e.g. Construction Worker"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">Company Name <span className="text-red-500">*</span></Label>
              <Input
                id="company"
                name="company"
                value={jobFormData.company}
                onChange={handleChange}
                placeholder="e.g. ABC Construction Ltd"
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
                onValueChange={(value) => handleSelectChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="temporary">Temporary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Job Category</Label>
              <Input
                id="category"
                name="category"
                value={jobFormData.category}
                onChange={handleChange}
                placeholder="e.g. Construction, Manufacturing"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="salary">Salary Range</Label>
              <Input
                id="salary"
                name="salary"
                value={jobFormData.salary}
                onChange={handleChange}
                placeholder="e.g. ₹15,000 - ₹20,000 per month"
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
