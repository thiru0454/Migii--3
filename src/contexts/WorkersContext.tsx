import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { MigrantWorker } from "@/types/worker";
import { getAllWorkers, subscribeToWorkers } from "@/utils/supabaseClient";
import { toast } from "sonner";

interface WorkersContextType {
  workers: MigrantWorker[];
  addWorker: (worker: MigrantWorker) => void;
  updateWorker: (workerId: string, updates: Partial<MigrantWorker>) => void;
  removeWorker: (workerId: string) => void;
  isLoading: boolean;
}

const WorkersContext = createContext<WorkersContextType | undefined>(undefined);

export function WorkersProvider({ children }: { children: ReactNode }) {
  const [workers, setWorkers] = useState<MigrantWorker[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial workers data
  useEffect(() => {
    console.log("WorkersContext: Initial fetch starting...");
    let unsubscribeFunc: (() => void) | undefined;

    const fetchWorkers = async () => {
      try {
        const { data, error } = await getAllWorkers();
        console.log("WorkersContext: Initial fetch result:", { data, error });
        
        if (error) {
          toast.error("Failed to fetch workers");
          console.error("Error fetching workers:", error);
        } else {
          // Ensure all worker IDs are strings
          const formattedWorkers = data?.map(worker => ({
            ...worker,
            id: String(worker.id),
            skill: worker.primary_skill || worker.skill,
            originState: worker.origin_state || worker.originState
          })) || [];
          setWorkers(formattedWorkers);
        }
      } catch (err) {
        console.error("Error in fetchWorkers:", err);
        toast.error("Failed to fetch workers");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkers();

    // Set up real-time subscription
    const subscription = subscribeToWorkers(() => {
      console.log("WorkersContext: Subscription triggered, fetching updates...");
      fetchWorkers();
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

  const addWorker = (worker: MigrantWorker) => {
    console.log("WorkersContext: Adding worker:", worker);
    setWorkers(prev => [...prev, worker]);
  };

  const updateWorker = (workerId: string, updates: Partial<MigrantWorker>) => {
    console.log("WorkersContext: Updating worker:", { workerId, updates });
    setWorkers(prev =>
      prev.map(worker =>
        worker.id === workerId
          ? { ...worker, ...updates }
          : worker
      )
    );
  };

  const removeWorker = (workerId: string) => {
    console.log("WorkersContext: Removing worker:", workerId);
    setWorkers(prev => prev.filter(worker => worker.id !== workerId));
  };

  const value = {
    workers,
    addWorker,
    updateWorker,
    removeWorker,
    isLoading
  };

  return (
    <WorkersContext.Provider value={value}>
      {children}
    </WorkersContext.Provider>
  );
}

export function useWorkersContext() {
  const context = useContext(WorkersContext);
  if (context === undefined) {
    throw new Error("useWorkersContext must be used within a WorkersProvider");
  }
  return context;
}
