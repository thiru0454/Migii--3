
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, HomeIcon, AlertTriangle, PhoneIcon, MapPinIcon } from "lucide-react";

interface WorkerData {
  workerId: string;
  name: string;
  phone: string;
  skill: string;
  originState: string;
  status: string;
  supportHistory: any[];
}

interface WorkerDashboardTabProps {
  workerData: WorkerData;
}

export function WorkerDashboardTab({ workerData }: WorkerDashboardTabProps) {
  // Get count of pending support requests
  const pendingRequests = workerData.supportHistory.filter(
    (req) => req.status.toLowerCase() === "pending"
  ).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Worker Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">{workerData.name}</h2>
                <div className="flex items-center mt-1 text-muted-foreground">
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    {workerData.status}
                  </Badge>
                </div>
              </div>
              <div>
                <Badge variant="outline" className="text-base font-mono">
                  {workerData.workerId}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Personal Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <PhoneIcon className="h-4 w-4 mr-3 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-sm text-muted-foreground">{workerData.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-3 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Origin State</p>
                        <p className="text-sm text-muted-foreground">{workerData.originState}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-3 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Registration Date</p>
                        <p className="text-sm text-muted-foreground">April 12, 2025</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Work Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">Skill</p>
                      <p className="text-sm text-muted-foreground">{workerData.skill}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Current Assignment</p>
                      <p className="text-sm text-muted-foreground">ABC Construction Company</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Project Location</p>
                      <p className="text-sm text-muted-foreground">Chennai, Tamil Nadu</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Support & Assistance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingRequests > 0 ? (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <AlertTriangle className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm leading-5 font-medium text-yellow-800">
                            You have {pendingRequests} pending support {pendingRequests === 1 ? 'request' : 'requests'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm leading-5 font-medium text-green-800">
                            No pending support requests
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button className="flex-1" asChild>
                      <a href="#support">Submit Support Request</a>
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <HomeIcon className="h-4 w-4 mr-2" />
                      Housing Support
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Government Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 border rounded-md">
                    <div>
                      <p className="font-medium">Health Insurance</p>
                      <p className="text-sm text-muted-foreground">Under Tamil Nadu Workers Welfare Scheme</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-md">
                    <div>
                      <p className="font-medium">Housing Benefit</p>
                      <p className="text-sm text-muted-foreground">Rental subsidy available</p>
                    </div>
                    <Button variant="outline" size="sm">Apply Now</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
