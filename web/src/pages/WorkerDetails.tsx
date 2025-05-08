
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { getWorker } from '@/utils/supabaseClient';
import { MigrantWorker } from '@/types/worker';

const WorkerDetails = () => {
  const { workerId } = useParams<{ workerId: string }>();
  const navigate = useNavigate();
  const [worker, setWorker] = useState<MigrantWorker | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkerDetails = async () => {
      if (!workerId) return;
      
      try {
        const { data, error } = await getWorker(workerId);
        
        if (error) {
          throw new Error(error.message);
        }
        
        setWorker(data);
      } catch (err) {
        toast.error('Failed to load worker details');
        console.error('Error loading worker details:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkerDetails();
  }, [workerId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-xl font-semibold mb-4">Worker not found</h2>
        <Button onClick={() => navigate('/workers')}>Back to Workers</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button 
        variant="outline" 
        className="mb-6 hover-scale" 
        onClick={() => navigate(-1)}
      >
        Back
      </Button>
      
      <Card className="w-full max-w-3xl mx-auto shadow-lg hover-glow">
        <CardHeader>
          <CardTitle className="text-2xl">Worker Details</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            {worker.photoUrl && (
              <div className="flex-shrink-0">
                <img 
                  src={worker.photoUrl} 
                  alt={worker.name} 
                  className="w-32 h-32 object-cover rounded-lg border-2 border-primary"
                />
              </div>
            )}
            
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-lg font-medium text-muted-foreground">Personal Information</h3>
                <p className="text-2xl font-semibold">{worker.name}</p>
                <p className="text-gray-500">ID: {worker.id}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p>{worker.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p>{worker.email || 'Not available'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Age</p>
                  <p>{worker.age}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <p className="capitalize">{worker.status}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h3 className="text-lg font-medium mb-3">Work Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Primary Skill</p>
                <p>{worker.primarySkill || worker["Primary Skill"]}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Origin State</p>
                <p>{worker.originState || worker["Origin State"]}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Registration Date</p>
                <p>{new Date(worker.registrationDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Assigned Business</p>
                <p>{worker.assignedBusinessId || 'Not assigned'}</p>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h3 className="text-lg font-medium mb-3">Identification</h3>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Aadhaar Number</p>
              <p>{worker.aadhaar || worker["Aadhaar Number"]}</p>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end space-x-4">
          <Button variant="outline" className="hover-scale">Edit Details</Button>
          <Button className="hover-scale">Assign to Business</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default WorkerDetails;
