import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Building, Calendar, Check, MapPin, MoreHorizontal, Plus, User, Users } from "lucide-react";
import { toast } from "sonner";
import { BusinessUser, getAllBusinessUsers } from "@/utils/businessDatabase";

interface Project {
  id: string;
  name: string;
  description: string;
  location: string;
  status: "planning" | "active" | "completed" | "on-hold";
  startDate: string;
  endDate?: string;
  businessId: string;
  businessName: string;
  workersNeeded: number;
  workersAssigned: number;
  createdAt: string;
}

export function ProjectsTab() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [businesses, setBusinesses] = useState<BusinessUser[]>([]);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    status: "planning" as "planning" | "active" | "completed" | "on-hold",
    startDate: "",
    endDate: "",
    businessId: "",
    workersNeeded: "1",
  });

  useEffect(() => {
    const storedProjects = JSON.parse(localStorage.getItem("projects") || "[]");
    setProjects(storedProjects);
    
    const businessUsers = getAllBusinessUsers();
    setBusinesses(businessUsers);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddProject = () => {
    setCurrentProject(null);
    setFormData({
      name: "",
      description: "",
      location: "",
      status: "planning",
      startDate: "",
      endDate: "",
      businessId: "",
      workersNeeded: "1",
    });
    setProjectDialogOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setCurrentProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      location: project.location,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate || "",
      businessId: project.businessId,
      workersNeeded: project.workersNeeded.toString(),
    });
    setProjectDialogOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const selectedBusiness = businesses.find(b => b.id === formData.businessId);
      
      if (!selectedBusiness) {
        toast.error("Please select a valid business");
        return;
      }
      
      const projectData: Project = {
        id: currentProject?.id || `proj_${Date.now()}`,
        name: formData.name,
        description: formData.description,
        location: formData.location,
        status: formData.status,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        businessId: formData.businessId,
        businessName: selectedBusiness.name,
        workersNeeded: parseInt(formData.workersNeeded),
        workersAssigned: currentProject?.workersAssigned || 0,
        createdAt: currentProject?.createdAt || new Date().toISOString(),
      };
      
      let updatedProjects: Project[];
      
      if (currentProject) {
        updatedProjects = projects.map(p => 
          p.id === currentProject.id ? projectData : p
        );
        toast.success("Project updated successfully!");
      } else {
        updatedProjects = [...projects, projectData];
        toast.success("Project added successfully!");
      }
      
      setProjects(updatedProjects);
      localStorage.setItem("projects", JSON.stringify(updatedProjects));
      setProjectDialogOpen(false);
      
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error("Failed to save project");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "planning":
        return <Badge variant="secondary">Planning</Badge>;
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "completed":
        return <Badge variant="outline" className="border-green-500 text-green-500">Completed</Badge>;
      case "on-hold":
        return <Badge variant="destructive">On Hold</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="all" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="all">All Projects</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="planning">Planning</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <Button onClick={handleAddProject}>
            <Plus className="mr-1 h-4 w-4" /> Add Project
          </Button>
        </div>
        
        <TabsContent value="all" className="space-y-4">
          {projects.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center pt-6 pb-6">
                <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Projects Found</h3>
                <p className="text-sm text-muted-foreground mt-2 mb-4">
                  Create your first project to start assigning workers.
                </p>
                <Button onClick={handleAddProject}>
                  <Plus className="mr-1 h-4 w-4" /> Add Project
                </Button>
              </CardContent>
            </Card>
          ) : (
            projects.map((project) => (
              <Card key={project.id} className="overflow-hidden">
                <div className="p-4 border-l-4 border-l-primary">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{project.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Building className="h-3.5 w-3.5" /> {project.businessName}
                      </div>
                    </div>
                    {getStatusBadge(project.status)}
                  </div>
                  
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{project.location}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm mt-1">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{new Date(project.startDate).toLocaleDateString()}</span>
                        {project.endDate && (
                          <>
                            <span>-</span>
                            <span>{new Date(project.endDate).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <p className="line-clamp-2">{project.description}</p>
                    </div>
                    
                    <div className="flex items-center justify-end gap-4">
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{project.workersAssigned}/{project.workersNeeded} Workers</span>
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditProject(project)}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="active" className="space-y-4">
          {projects.filter(p => p.status === 'active').map((project) => (
            <Card key={project.id} className="overflow-hidden">
              <div className="p-4 border-l-4 border-l-primary">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">{project.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Building className="h-3.5 w-3.5" /> {project.businessName}
                    </div>
                  </div>
                  {getStatusBadge(project.status)}
                </div>
                
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{project.location}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm mt-1">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{new Date(project.startDate).toLocaleDateString()}</span>
                      {project.endDate && (
                        <>
                          <span>-</span>
                          <span>{new Date(project.endDate).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <p className="line-clamp-2">{project.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-end gap-4">
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{project.workersAssigned}/{project.workersNeeded} Workers</span>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditProject(project)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="planning" className="space-y-4">
          {projects.filter(p => p.status === 'planning').map((project) => (
            <Card key={project.id} className="overflow-hidden">
              <div className="p-4 border-l-4 border-l-primary">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">{project.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Building className="h-3.5 w-3.5" /> {project.businessName}
                    </div>
                  </div>
                  {getStatusBadge(project.status)}
                </div>
                
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{project.location}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm mt-1">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{new Date(project.startDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <p className="line-clamp-2">{project.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-end gap-4">
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{project.workersAssigned}/{project.workersNeeded} Workers</span>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditProject(project)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          {projects.filter(p => p.status === 'completed').map((project) => (
            <Card key={project.id} className="overflow-hidden">
              <div className="p-4 border-l-4 border-l-primary">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">{project.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Building className="h-3.5 w-3.5" /> {project.businessName}
                    </div>
                  </div>
                  {getStatusBadge(project.status)}
                </div>
                
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{project.location}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm mt-1">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{new Date(project.startDate).toLocaleDateString()}</span>
                      {project.endDate && (
                        <>
                          <span>-</span>
                          <span>{new Date(project.endDate).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <p className="line-clamp-2">{project.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-end gap-4">
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{project.workersAssigned}/{project.workersNeeded} Workers</span>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditProject(project)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{currentProject ? "Edit Project" : "Add New Project"}</DialogTitle>
            <DialogDescription>
              {currentProject 
                ? "Update project details and assignments" 
                : "Enter the details for the new project"}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleFormSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="businessId">Business</Label>
                  <Select
                    value={formData.businessId}
                    onValueChange={(value) => handleSelectChange("businessId", value)}
                    required
                  >
                    <SelectTrigger id="businessId">
                      <SelectValue placeholder="Select Business" />
                    </SelectTrigger>
                    <SelectContent>
                      {businesses.map((business) => (
                        <SelectItem key={business.id} value={business.id}>
                          {business.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleSelectChange("status", value as "planning" | "active" | "completed" | "on-hold")}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="workersNeeded">Workers Needed</Label>
                  <Input
                    id="workersNeeded"
                    name="workersNeeded"
                    type="number"
                    min="1"
                    value={formData.workersNeeded}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setProjectDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{currentProject ? "Update Project" : "Create Project"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
