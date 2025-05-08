
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { Briefcase, Calendar, MapPin, Building, Search, Clock, Loader2 } from "lucide-react";
import { getActiveJobs, submitJobApplication } from "@/utils/supabaseClient";

interface Job {
  id: string;
  title: string;
  company: string;
  location?: string;
  job_type: string;
  category?: string;
  salary?: string;
  description: string;
  requirements?: string;
  contact_email?: string;
  posted_at: string;
  status: string;
}

export function AvailableJobsTab() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [applicationNote, setApplicationNote] = useState("");
  const [submittingApplication, setSubmittingApplication] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data, error } = await getActiveJobs();
      
      if (error) {
        console.error("Error fetching jobs:", error);
        toast.error("Failed to load available jobs.");
        return;
      }

      setJobs(data || []);
    } catch (err) {
      console.error("Exception fetching jobs:", err);
      toast.error("An error occurred while fetching jobs.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleApply = (job: Job) => {
    if (!currentUser) {
      toast.error("Please log in to apply for jobs.");
      return;
    }
    
    setSelectedJob(job);
    setApplicationNote("");
    setApplyDialogOpen(true);
  };

  const submitApplication = async () => {
    if (!selectedJob || !currentUser) return;
    
    setSubmittingApplication(true);
    
    try {
      const { error } = await submitJobApplication({
        job_id: selectedJob.id,
        worker_id: currentUser.id, // Use currentUser.id instead of uid
        worker_name: currentUser.name, // Use currentUser.name instead of displayName
        status: "pending",
        notes: applicationNote
      });
      
      if (error) {
        console.error("Error submitting application:", error);
        toast.error("Failed to submit application. Please try again.");
        return;
      }
      
      toast.success("Job application submitted successfully!");
      setApplyDialogOpen(false);
    } catch (err) {
      console.error("Exception submitting application:", err);
      toast.error("An error occurred while submitting your application.");
    } finally {
      setSubmittingApplication(false);
    }
  };

  // Get unique categories and locations for filters
  const categories = Array.from(new Set(jobs.map(job => job.category).filter(Boolean)));
  const locations = Array.from(new Set(jobs.map(job => job.location).filter(Boolean)));

  // Filter jobs based on search and filter criteria
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.description && job.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesCategory = !filterCategory || job.category === filterCategory;
    const matchesLocation = !filterLocation || job.location === filterLocation;
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="loader mb-4"></div>
        <p className="text-muted-foreground">Loading available jobs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by job title, company or keywords..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filterLocation} onValueChange={setFilterLocation}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Locations</SelectItem>
              {locations.map(location => (
                <SelectItem key={location} value={location}>{location}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <Card className="bg-card/30 text-center py-8">
          <CardContent>
            <p className="text-xl font-medium mb-2">No jobs found</p>
            <p className="text-muted-foreground mb-4">Try adjusting your search criteria</p>
            <Button variant="outline" onClick={() => {
              setSearchTerm("");
              setFilterCategory("");
              setFilterLocation("");
            }}>
              Clear filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="hover-glow hover-raise bg-gradient-to-br from-card to-background/80">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{job.title}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Building className="h-4 w-4 mr-1" />
                      {job.company}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className={
                    job.job_type === 'full-time' ? 'bg-green-100 text-green-800 hover:bg-green-100 border-green-200' :
                    job.job_type === 'part-time' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200' :
                    job.job_type === 'contract' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200' :
                    'bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-200'
                  }>
                    {job.job_type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-3 space-y-3">
                {job.location && (
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{job.location}</span>
                  </div>
                )}
                
                {job.salary && (
                  <div className="flex items-center text-sm">
                    <span className="font-medium mr-2">Salary:</span>
                    <span>{job.salary}</span>
                  </div>
                )}
                
                {job.category && (
                  <div className="flex items-center text-sm">
                    <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{job.category}</span>
                  </div>
                )}
                
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Posted: {formatDate(job.posted_at)}</span>
                </div>

                <Separator className="my-3" />
                
                <div className="text-sm line-clamp-3">
                  {job.description}
                </div>
              </CardContent>
              <CardFooter className="pt-2 flex justify-between">
                <Button variant="outline" size="sm" onClick={() => handleApply(job)}>
                  Apply Now
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedJob(job)}>
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Job Details Dialog */}
      <Dialog open={!!selectedJob && !applyDialogOpen} onOpenChange={(open) => !open && setSelectedJob(null)}>
        <DialogContent className="sm:max-w-3xl">
          {selectedJob && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedJob.title}</DialogTitle>
                <DialogDescription className="text-base text-foreground/80 flex items-center">
                  <Building className="h-5 w-5 mr-1" /> {selectedJob.company}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedJob.location && (
                    <div>
                      <Label className="text-muted-foreground">Location</Label>
                      <p className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        {selectedJob.location}
                      </p>
                    </div>
                  )}
                  
                  {selectedJob.salary && (
                    <div>
                      <Label className="text-muted-foreground">Salary</Label>
                      <p>{selectedJob.salary}</p>
                    </div>
                  )}
                  
                  <div>
                    <Label className="text-muted-foreground">Job Type</Label>
                    <p className="capitalize">{selectedJob.job_type}</p>
                  </div>
                  
                  {selectedJob.category && (
                    <div>
                      <Label className="text-muted-foreground">Category</Label>
                      <p>{selectedJob.category}</p>
                    </div>
                  )}
                  
                  <div>
                    <Label className="text-muted-foreground">Posted On</Label>
                    <p className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      {formatDate(selectedJob.posted_at)}
                    </p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <div className="mt-1 whitespace-pre-line">
                    {selectedJob.description}
                  </div>
                </div>
                
                {selectedJob.requirements && (
                  <div>
                    <Label className="text-muted-foreground">Requirements</Label>
                    <div className="mt-1 whitespace-pre-line">
                      {selectedJob.requirements}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button onClick={() => handleApply(selectedJob)} className="bg-gradient-primary hover:opacity-90">
                  Apply for this job
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Job Application Dialog */}
      <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Apply for Job</DialogTitle>
            <DialogDescription>
              {selectedJob?.title} at {selectedJob?.company}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="note">Why are you a good fit for this job? (Optional)</Label>
              <Textarea
                id="note"
                placeholder="Describe your relevant experience and skills..."
                value={applicationNote}
                onChange={(e) => setApplicationNote(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApplyDialogOpen(false)} disabled={submittingApplication}>
              Cancel
            </Button>
            <Button onClick={submitApplication} className="bg-gradient-primary hover:opacity-90" disabled={submittingApplication}>
              {submittingApplication ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : 'Submit Application'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
