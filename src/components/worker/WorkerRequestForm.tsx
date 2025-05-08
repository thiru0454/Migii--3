
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllWorkersFromStorage } from "@/utils/firebase";
import { MigrantWorker, Worker } from "@/types/worker";

interface WorkerRequest {
  businessName: string;
  contactPerson: string;
  phone: string;
  email: string;
  requiredSkills: string;
  numberOfWorkers: number;
  description: string;
  status: "pending" | "approved" | "rejected";
  selectedWorkers?: string[];
}

export function WorkerRequestForm() {
  const [request, setRequest] = useState<WorkerRequest>({
    businessName: "",
    contactPerson: "",
    phone: "",
    email: "",
    requiredSkills: "",
    numberOfWorkers: 1,
    description: "",
    status: "pending",
    selectedWorkers: []
  });

  const [availableWorkers, setAvailableWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAvailableWorkers();
  }, []);

  const loadAvailableWorkers = () => {
    try {
      const migrantWorkers = getAllWorkersFromStorage();
      // Convert MigrantWorker[] to Worker[]
      const activeWorkers: Worker[] = migrantWorkers
        .filter(worker => worker.status === "active")
        .map(worker => ({
          id: worker.id,
          name: worker.name,
          phone: worker.phone,
          skill: worker.skill || worker["Primary Skill"] || "",
          status: worker.status,
          originState: worker.originState,
          age: worker.age,
          email: worker.email,
          photoUrl: worker.photoUrl,
          aadhaar: worker.aadhaar
        }));
      setAvailableWorkers(activeWorkers);
    } catch (error) {
      console.error("Error loading workers:", error);
      toast.error("Failed to load available workers");
    } finally {
      setLoading(false);
    }
  };

  const handleWorkerSelection = (workerId: string) => {
    setRequest(prev => ({
      ...prev,
      selectedWorkers: prev.selectedWorkers?.includes(workerId)
        ? prev.selectedWorkers.filter(id => id !== workerId)
        : [...(prev.selectedWorkers || []), workerId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Get current business user
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      if (!currentUser || currentUser.userType !== 'business') {
        toast.error("Please log in as a business user to submit requests");
        return;
      }

      // Save to localStorage
      const existingRequests = JSON.parse(localStorage.getItem('workerRequests') || '[]');
      const newRequest = {
        ...request,
        businessName: currentUser.name,
        contactPerson: currentUser.name,
        phone: currentUser.phone || "",
        email: currentUser.email,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        status: request.selectedWorkers?.length ? "approved" : "pending"
      };
      
      localStorage.setItem('workerRequests', JSON.stringify([...existingRequests, newRequest]));
      
      // Clear form
      setRequest({
        businessName: "",
        contactPerson: "",
        phone: "",
        email: "",
        requiredSkills: "",
        numberOfWorkers: 1,
        description: "",
        status: "pending",
        selectedWorkers: []
      });
      
      toast.success("Request submitted successfully!");
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error("Failed to submit request. Please try again.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Worker Request</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="requiredSkills">Required Skills</Label>
              <Input
                id="requiredSkills"
                value={request.requiredSkills}
                onChange={(e) => setRequest({ ...request, requiredSkills: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numberOfWorkers">Number of Workers Needed</Label>
              <Input
                id="numberOfWorkers"
                type="number"
                min="1"
                value={request.numberOfWorkers}
                onChange={(e) => setRequest({ ...request, numberOfWorkers: parseInt(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Job Description</Label>
            <Textarea
              id="description"
              value={request.description}
              onChange={(e) => setRequest({ ...request, description: e.target.value })}
              required
            />
          </div>

          {!loading && (
            <div className="space-y-2">
              <Label>Available Workers</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {availableWorkers
                  .filter(worker => worker.skill.toLowerCase().includes(request.requiredSkills.toLowerCase()))
                  .map(worker => (
                    <div
                      key={worker.id}
                      className={`p-3 border rounded-lg cursor-pointer ${
                        request.selectedWorkers?.includes(worker.id)
                          ? 'border-primary bg-primary/10'
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => handleWorkerSelection(worker.id)}
                    >
                      <div className="font-medium">{worker.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {worker.skill} • {worker.phone}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <Button type="submit" className="w-full">
            Submit Request
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
