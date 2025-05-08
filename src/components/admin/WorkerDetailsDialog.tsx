
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WorkerIDCard } from "@/components/worker/WorkerIDCard";
import { MigrantWorker } from "@/types/worker";
import { mockHelpRequests } from "@/data/mockData";

export interface WorkerDetailsDialogProps {
  worker: MigrantWorker | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WorkerDetailsDialog({ worker, open, onOpenChange }: WorkerDetailsDialogProps) {
  if (!worker) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Worker Details</DialogTitle>
          <DialogDescription>
            Detailed information about the selected worker
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{worker.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Age</p>
                  <p className="font-medium">{worker.age}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{worker.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Skill</p>
                  <p className="font-medium">{worker.skill}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Origin State</p>
                  <p className="font-medium">{worker.originState}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registration Date</p>
                  <p className="font-medium">{worker.registrationDate}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Support History</h3>
              <div className="border rounded-md mt-2">
                {mockHelpRequests.filter(req => req.workerId === worker.id).length > 0 ? (
                  <div className="divide-y">
                    {mockHelpRequests
                      .filter(req => req.workerId === worker.id)
                      .map((req) => (
                        <div key={req.id} className="p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium">{req.requestDate}</p>
                              <p className="text-sm text-muted-foreground">{req.message}</p>
                            </div>
                            <div className="text-xs font-medium">
                              {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No support history found
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button>Update Details</Button>
              <Button variant="outline">Send Message</Button>
            </div>
          </div>
          
          <div>
            <WorkerIDCard
              workerId={worker.id}
              name={worker.name}
              phone={worker.phone}
              skill={worker.skill}
              originState={worker.originState}
              photoUrl={worker.photoUrl}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
