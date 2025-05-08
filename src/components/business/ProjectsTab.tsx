
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Edit, Trash, Users } from "lucide-react";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "pending" | "in-progress" | "completed";
  completionPercentage: number;
  workersAssigned: number;
  location: string;
}

// Mock projects data
const mockProjects: Project[] = [
  {
    id: "PRJ-001",
    name: "Commercial Building Construction",
    description: "10-storey commercial building construction in Chennai IT Park",
    startDate: "2025-01-15",
    endDate: "2025-12-31",
    status: "in-progress",
    completionPercentage: 45,
    workersAssigned: 24,
    location: "Chennai",
  },
  {
    id: "PRJ-002",
    name: "Road Maintenance",
    description: "Road repair and maintenance in central Coimbatore",
    startDate: "2025-02-10",
    endDate: "2025-06-30",
    status: "in-progress",
    completionPercentage: 68,
    workersAssigned: 15,
    location: "Coimbatore",
  },
  {
    id: "PRJ-003",
    name: "Apartment Complex",
    description: "Construction of a 120-unit residential apartment complex",
    startDate: "2025-03-01",
    endDate: "2026-02-28",
    status: "pending",
    completionPercentage: 0,
    workersAssigned: 0,
    location: "Madurai",
  },
  {
    id: "PRJ-004",
    name: "Hospital Renovation",
    description: "Renovation of existing hospital facilities",
    startDate: "2024-11-10",
    endDate: "2025-03-31",
    status: "completed",
    completionPercentage: 100,
    workersAssigned: 0,
    location: "Chennai",
  },
];

interface ProjectsTabProps {
  businessId?: string;
}

export function ProjectsTab({ businessId }: ProjectsTabProps) {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: "",
    description: "",
    location: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    status: "pending",
    completionPercentage: 0,
    workersAssigned: 0,
  });

  const handleAddProject = () => {
    if (!newProject.name || !newProject.description || !newProject.location || !newProject.startDate || !newProject.endDate) {
      toast.error("Please fill all required fields");
      return;
    }

    // Create a new project
    const projectId = `PRJ-${(projects.length + 1).toString().padStart(3, "0")}`;
    
    const project: Project = {
      id: projectId,
      name: newProject.name,
      description: newProject.description,
      startDate: newProject.startDate,
      endDate: newProject.endDate,
      status: "pending",
      completionPercentage: 0,
      workersAssigned: 0,
      location: newProject.location,
    };

    setProjects([...projects, project]);
    setNewProject({
      name: "",
      description: "",
      location: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      status: "pending",
      completionPercentage: 0,
      workersAssigned: 0,
    });
    
    setIsAddDialogOpen(false);
    toast.success("Project added successfully!");
  };

  const handleViewProject = (project: Project) => {
    setCurrentProject(project);
    setIsDetailDialogOpen(true);
  };

  const getStatusBadge = (status: Project["status"]) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xl">Your Projects</CardTitle>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            New Project
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Workers</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.id}</TableCell>
                  <TableCell>{project.name}</TableCell>
                  <TableCell>{project.location}</TableCell>
                  <TableCell>{getStatusBadge(project.status)}</TableCell>
                  <TableCell>
                    <div className="w-[100px]">
                      <Progress value={project.completionPercentage} className="h-2" />
                      <span className="text-xs text-muted-foreground">{project.completionPercentage}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {project.workersAssigned > 0 ? (
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{project.workersAssigned}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewProject(project)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Project Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                placeholder="Enter project name"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter project description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Enter project location"
                value={newProject.location}
                onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newProject.startDate}
                  onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newProject.endDate}
                  onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddProject}>Add Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Project Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Project Details</DialogTitle>
          </DialogHeader>
          {currentProject && (
            <div className="py-4">
              <div className="grid grid-cols-2 gap-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Project ID</p>
                  <p className="text-sm">{currentProject.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <p className="text-sm">{getStatusBadge(currentProject.status)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-sm">{currentProject.name}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p className="text-sm">{currentProject.description}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Location</p>
                  <p className="text-sm">{currentProject.location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Workers Assigned</p>
                  <p className="text-sm">{currentProject.workersAssigned}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                  <p className="text-sm">{new Date(currentProject.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">End Date</p>
                  <p className="text-sm">{new Date(currentProject.endDate).toLocaleDateString()}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Progress</p>
                  <Progress value={currentProject.completionPercentage} className="h-2 mt-1" />
                  <span className="text-xs text-muted-foreground">{currentProject.completionPercentage}% complete</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>Close</Button>
            <Button>Edit Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
