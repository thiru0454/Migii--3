
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MigrantWorker } from "@/types/worker";
import { getAllWorkers, subscribeToWorkers, assignWorkerToBusiness } from "@/utils/supabaseClient";

export function useWorkers() {
  const [workers, setWorkers] = useState<MigrantWorker[]>([]);
  const [isLoadingWorkers, setIsLoadingWorkers] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribeFunc: (() => void) | undefined;
    setIsLoadingWorkers(true);
    
    // Initial fetch from Supabase
    getAllWorkers()
      .then(({ data, error }) => {
        if (error) {
          console.error("Failed to fetch workers:", error);
          toast.error("Failed to fetch workers from Supabase");
          setWorkers([]);
          setError(error.message);
        } else {
          console.log("Workers fetched successfully:", data);
          // Ensure all worker IDs are strings
          const formattedWorkers = data?.map(worker => ({
            ...worker,
            id: String(worker.id)
          })) || [];
          setWorkers(formattedWorkers);
          setError(null);
        }
        setIsLoadingWorkers(false);
      });

    // Real-time subscription
    const subscription = subscribeToWorkers(() => {
      console.log("Worker subscription triggered, fetching updated data...");
      getAllWorkers()
        .then(({ data, error }) => {
          if (!error) {
            // Ensure all worker IDs are strings
            const formattedWorkers = data?.map(worker => ({
              ...worker,
              id: String(worker.id)
            })) || [];
            setWorkers(formattedWorkers);
          } else {
            console.error("Error in subscription update:", error);
          }
        });
    });
    
    unsubscribeFunc = () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };

    return () => {
      if (unsubscribeFunc) unsubscribeFunc();
    };
  }, []);

  // Function to assign a worker to a business with improved error handling
  const assignWorker = async (workerId: string, businessId: string) => {
    setIsAssigning(true);
    try {
      console.log(`Assigning worker ${workerId} to business ${businessId}`);
      
      // Use our enhanced service function
      const { data, error } = await assignWorkerToBusiness(workerId, businessId);
      
      if (error) {
        throw error;
      }
      
      if (!data) {
        throw new Error("Failed to assign worker - no data returned");
      }
      
      // Update local state
      setWorkers(prev => 
        prev.map(worker => 
          worker.id === workerId 
            ? { ...worker, assignedBusinessId: businessId }
            : worker
        )
      );
      
      toast.success("Worker assigned successfully");
      setIsAssigning(false);
      return true;
    } catch (error: any) {
      console.error("Error assigning worker:", error);
      toast.error(error.message || "Failed to assign worker");
      setIsAssigning(false);
      return false;
    }
  };

  return {
    workers,
    isLoadingWorkers,
    isAssigning,
    error,
    assignWorker,
  };
}
