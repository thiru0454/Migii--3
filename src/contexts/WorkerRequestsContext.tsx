import { createContext, useContext, useState, ReactNode } from "react";
import { WorkerRequest } from "@/components/business/RequestWorkersForm";

interface WorkerRequestsContextType {
  requests: WorkerRequest[];
  addRequest: (request: WorkerRequest) => void;
  updateRequest: (businessId: string, status: "approved" | "rejected") => void;
}

const WorkerRequestsContext = createContext<WorkerRequestsContextType | undefined>(undefined);

export function WorkerRequestsProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<WorkerRequest[]>([]);

  const addRequest = (request: WorkerRequest) => {
    setRequests(prev => [...prev, request]);
  };

  const updateRequest = (businessId: string, status: "approved" | "rejected") => {
    setRequests(prev =>
      prev.map(request =>
        request.businessId === businessId
          ? { ...request, status }
          : request
      )
    );
  };

  return (
    <WorkerRequestsContext.Provider value={{ requests, addRequest, updateRequest }}>
      {children}
    </WorkerRequestsContext.Provider>
  );
}

export function useWorkerRequests() {
  const context = useContext(WorkerRequestsContext);
  if (context === undefined) {
    throw new Error("useWorkerRequests must be used within a WorkerRequestsProvider");
  }
  return context;
} 