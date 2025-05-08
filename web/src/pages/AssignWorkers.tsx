
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWorkers } from '@/hooks/useWorkers';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { LoadingSpinner, PageLoadingSpinner } from '@/components/ui/loading-spinner';
import { MigrantWorker } from '@/types/worker';
import { toast } from 'sonner';

interface Business {
  id: string;
  name: string;
}

const AssignWorkers = () => {
  const navigate = useNavigate();
  const { workers, isLoadingWorkers, isAssigning, assignWorker } = useWorkers();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState<MigrantWorker | null>(null);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);

  // Fetch businesses
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        // Mock data - replace with actual API call
        const mockBusinesses = [
          { id: 'business-001', name: 'ABC Construction' },
          { id: 'business-002', name: 'XYZ Industries' },
          { id: 'business-003', name: 'Global Services Ltd' },
        ];
        
        setBusinesses(mockBusinesses);
      } catch (error) {
        console.error('Error fetching businesses:', error);
        toast.error('Failed to load businesses');
      } finally {
        setIsLoadingBusinesses(false);
      }
    };
    
    fetchBusinesses();
  }, []);

  const handleOpenAssignDialog = (worker: MigrantWorker) => {
    setSelectedWorker(worker);
    setSelectedBusinessId('');
    setAssignDialogOpen(true);
  };

  const handleAssign = async () => {
    if (!selectedWorker || !selectedBusinessId) {
      toast.error('Please select a business to assign the worker');
      return;
    }

    // Display loading state
    setIsAssigning(true);

    try {
      const success = await assignWorker(selectedWorker.id, selectedBusinessId);
      
      if (success) {
        setAssignDialogOpen(false);
        toast.success(`Worker ${selectedWorker.name} successfully assigned to business!`);
      } else {
        toast.error('Failed to assign worker. Please try again.');
      }
    } catch (error) {
      console.error('Error during worker assignment:', error);
      toast.error('An error occurred while assigning the worker');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleNavigate = (path: string) => {
    setIsNavigating(true);
    setTimeout(() => {
      navigate(path);
    }, 500); // Small delay for the loading spinner to show
  };

  const filteredWorkers = workers.filter(worker => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = worker.name?.toLowerCase().includes(searchLower);
    const skillMatch = (worker.primarySkill || worker["Primary Skill"] || worker.skill || '')
      .toLowerCase().includes(searchLower);
    const phoneMatch = worker.phone?.includes(searchTerm);
    
    return nameMatch || skillMatch || phoneMatch;
  });

  if (isLoadingWorkers || isLoadingBusinesses) {
    return <PageLoadingSpinner text="Loading worker data..." />;
  }

  return (
    <>
      {isNavigating && <PageLoadingSpinner text="Navigating to dashboard..." />}
      {isAssigning && <LoadingSpinner variant="overlay" size="lg" text="Assigning worker..." />}
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Assign Workers</h1>
            <p className="text-muted-foreground">Assign workers to businesses</p>
          </div>
          <Button 
            variant="outline" 
            className="hover-scale" 
            onClick={() => handleNavigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search Workers</CardTitle>
            <CardDescription>Find workers by name, skill, or phone number</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkers.length > 0 ? (
            filteredWorkers.map((worker) => (
              <Card key={worker.id} className="hover-glow">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span>{worker.name}</span>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      worker.status === 'active' ? 'bg-green-100 text-green-800' : 
                      worker.status === 'inactive' ? 'bg-gray-100 text-gray-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {worker.status}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    ID: {worker.id} • Skill: {worker.primarySkill || worker["Primary Skill"] || worker.skill}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm flex"><strong>Phone:</strong> <span className="ml-2">{worker.phone}</span></p>
                  {worker.email && (
                    <p className="text-sm flex"><strong>Email:</strong> <span className="ml-2">{worker.email}</span></p>
                  )}
                  <p className="text-sm flex">
                    <strong>Assigned:</strong> 
                    <span className="ml-2">
                      {worker.assignedBusinessId ? 
                        businesses.find(b => b.id === worker.assignedBusinessId)?.name || worker.assignedBusinessId : 
                        'Not assigned'}
                    </span>
                  </p>
                </CardContent>
                <div className="p-4 pt-0 flex justify-end">
                  <Button
                    onClick={() => handleOpenAssignDialog(worker)}
                    disabled={worker.status !== 'active'}
                    className="hover-scale"
                  >
                    {worker.assignedBusinessId ? 'Reassign' : 'Assign'}
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex justify-center items-center h-40">
              <p className="text-muted-foreground">No workers found matching your search criteria</p>
            </div>
          )}
        </div>

        {/* Assign Worker Dialog */}
        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Worker</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              {selectedWorker && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">Worker</p>
                  <p className="font-medium">{selectedWorker.name} ({selectedWorker.primarySkill || selectedWorker["Primary Skill"] || selectedWorker.skill})</p>
                </div>
              )}
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Select Business:</p>
                <Select 
                  value={selectedBusinessId} 
                  onValueChange={setSelectedBusinessId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a business" />
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
            </div>
            <DialogFooter className="sm:justify-end">
              <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAssign}
                disabled={isAssigning || !selectedBusinessId}
              >
                {isAssigning ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Assigning...
                  </>
                ) : 'Assign'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default AssignWorkers;
