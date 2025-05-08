import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RequestWorkersFormProps {
  businessId: string;
  onSubmit: (request: WorkerRequest) => void;
}

export interface WorkerRequest {
  businessId: string;
  numberOfWorkers: number;
  skillsRequired: string[];
  startDate: string;
  endDate: string;
  additionalNotes: string;
  status: "pending" | "approved" | "rejected";
}

export function RequestWorkersForm({ businessId, onSubmit }: RequestWorkersFormProps) {
  const [formData, setFormData] = useState<WorkerRequest>({
    businessId,
    numberOfWorkers: 1,
    skillsRequired: [],
    startDate: "",
    endDate: "",
    additionalNotes: "",
    status: "pending"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Workers</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="numberOfWorkers">Number of Workers Needed</Label>
            <Input
              id="numberOfWorkers"
              type="number"
              min="1"
              value={formData.numberOfWorkers}
              onChange={(e) => setFormData({ ...formData, numberOfWorkers: parseInt(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Required Skills</Label>
            <Select
              onValueChange={(value) => {
                setFormData({
                  ...formData,
                  skillsRequired: [...formData.skillsRequired, value]
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select skills" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="construction">Construction</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
                <SelectItem value="cooking">Cooking</SelectItem>
                <SelectItem value="driving">Driving</SelectItem>
                <SelectItem value="gardening">Gardening</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.skillsRequired.map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-primary/10 rounded-full text-sm"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        skillsRequired: formData.skillsRequired.filter((_, i) => i !== index)
                      });
                    }}
                    className="ml-2 text-primary"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.additionalNotes}
              onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
              placeholder="Any additional requirements or notes..."
            />
          </div>

          <Button type="submit" className="w-full">
            Submit Request
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 