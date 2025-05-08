
import { MigrantWorker } from "@/types/worker";
import { supabase } from "./supabaseClient";
import mongoDbService from "./mongoDbService";

// Add worker to both Supabase and mock MongoDB
export const addWorker = async (worker: MigrantWorker): Promise<MigrantWorker> => {
  try {
    // First attempt to add to Supabase (if available)
    try {
      const { data, error } = await supabase.from("workers").insert(worker).select().single();
      if (error) {
        console.warn("Failed to add worker to Supabase, falling back to local storage", error);
        throw error; // Force using fallback
      }
      if (data) {
        // Also update MongoDB
        storeWorkerInMongoDB(data);
        return data;
      }
    } catch (supabaseError) {
      console.warn("Failed to add worker to Supabase, falling back to local storage", supabaseError);
    }
    
    // Add to local storage as fallback
    const workers = getAllWorkers();
    const updatedWorkers = [...workers, worker];
    localStorage.setItem("workers", JSON.stringify(updatedWorkers));
    
    // Also update our MongoDB service (for location tracking)
    storeWorkerInMongoDB(worker);
    
    return worker;
  } catch (error) {
    console.error("Error adding worker:", error);
    throw new Error("Failed to add worker");
  }
};

// Function to store worker data in MongoDB
const storeWorkerInMongoDB = (worker: MigrantWorker): void => {
  // Ensure we have initial location data if available
  if (worker.latitude && worker.longitude) {
    mongoDbService.updateWorkerLocation({
      workerId: worker.id,
      name: worker.name,
      latitude: worker.latitude,
      longitude: worker.longitude,
      timestamp: Date.now()
    });
  }
};

// Get all workers from both sources
export const getAllWorkers = (): MigrantWorker[] => {
  try {
    const storedWorkers = localStorage.getItem("workers");
    return storedWorkers ? JSON.parse(storedWorkers) : [];
  } catch (error) {
    console.error("Error getting workers:", error);
    return [];
  }
};

// Update worker data in both systems
export const updateWorkerData = async (
  workerId: string,
  updates: Partial<MigrantWorker>
): Promise<MigrantWorker> => {
  try {
    // Try Supabase first
    try {
      const { data, error } = await supabase
        .from("workers")
        .update(updates)
        .eq("id", workerId)
        .select()
        .single();
        
      if (error) throw error;
      if (data) {
        // Update MongoDB if location changed
        if (updates.latitude && updates.longitude) {
          mongoDbService.updateWorkerLocation({
            workerId: data.id,
            name: data.name,
            latitude: updates.latitude,
            longitude: updates.longitude,
            timestamp: Date.now()
          });
        }
        return data;
      }
    } catch (supabaseError) {
      console.warn("Failed to update worker in Supabase, falling back to local storage", supabaseError);
    }
    
    // Update in localStorage as fallback
    const workers = getAllWorkers();
    const workerIndex = workers.findIndex((w) => w.id === workerId);
    
    if (workerIndex === -1) {
      throw new Error(`Worker with ID ${workerId} not found`);
    }
    
    const updatedWorker = { ...workers[workerIndex], ...updates };
    workers[workerIndex] = updatedWorker;
    
    localStorage.setItem("workers", JSON.stringify(workers));
    
    // Update location in MongoDB service if lat/lng changed
    if (updates.latitude && updates.longitude) {
      mongoDbService.updateWorkerLocation({
        workerId: updatedWorker.id,
        name: updatedWorker.name,
        latitude: updates.latitude,
        longitude: updates.longitude,
        timestamp: Date.now()
      });
    }
    
    return updatedWorker;
  } catch (error) {
    console.error("Error updating worker:", error);
    throw new Error("Failed to update worker");
  }
};
