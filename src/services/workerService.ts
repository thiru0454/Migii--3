import { MigrantWorker } from '@/types/worker';
import { 
  registerWorker, 
  getWorker, 
  updateWorker, 
  deleteWorker, 
  getAllWorkers,
  subscribeToWorkers 
} from '@/utils/supabaseClient';
import { toast } from 'sonner';

export async function registerNewWorker(workerData: Omit<{
  name: string;
  age: number;
  phone: string;
  email?: string;
  originState: string;
  skill: string;
  aadhaar: string;
  photoUrl?: string;
  latitude?: number;
  longitude?: number;
}, "id">) {
  try {
    // Improved validation for required fields
    const parsedAge = Number(workerData.age);
    if (
      !workerData.name?.trim() ||
      isNaN(parsedAge) || parsedAge <= 0 ||
      !workerData.phone?.trim() ||
      !workerData.aadhaar?.trim() ||
      !workerData.originState?.trim() ||
      !workerData.skill?.trim() || workerData.skill === "Select your primary skill"
    ) {
      throw new Error('Missing required fields');
    }

    // Map fields to match Supabase table columns (with spaces and casing)
    const {
      originState,
      photoUrl,
      name,
      age,
      phone,
      email,
      aadhaar,
      skill,
      ...rest
    } = workerData;

    // Build the worker object with defaults and correct types
    const newWorker = {
      name: name || "",
      age: parsedAge,
      phone: phone || "",
      email: email || "",
      aadhaar: aadhaar || "",
      primary_skill: skill || "",
      origin_state: originState || "",
      photo_url: photoUrl || null,
      status: "active",
      latitude: typeof workerData.latitude === 'number' ? workerData.latitude : null,
      longitude: typeof workerData.longitude === 'number' ? workerData.longitude : null
      // id is intentionally omitted
    };
    console.log('Worker data being sent:', newWorker);

    const { data, error } = await registerWorker(newWorker);
    
    if (error) {
      // User-friendly error handling
      if (error.message.includes('duplicate key value') && error.message.includes('workers_phone_key')) {
        toast.error('This phone number is already registered. Please use a different phone number.');
        return null;
      }
      if (error.message.includes('violates not-null constraint')) {
        toast.error('A required field is missing. Please fill in all required fields.');
        return null;
      }
      if (error.message.includes('invalid input syntax for type')) {
        toast.error('Invalid input format. Please check your entries.');
        return null;
      }
      toast.error(error.message || 'Failed to register worker');
      throw error;
    }
    toast.success('Worker registered successfully!');
    return data;
  } catch (error) {
    console.error('Error registering worker:', error);
    toast.error(error.message || 'Failed to register worker');
    throw error;
  }
}

export async function getWorkerById(id: string) {
  try {
    const { data, error } = await getWorker(id);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching worker:', error);
    throw error;
  }
}

export async function updateWorkerDetails(id: string, updates: Partial<MigrantWorker>) {
  try {
    // Create a new object with the updates, but remove any updated_at field
    // since it's not part of the MigrantWorker type
    const { updated_at, ...workerUpdates } = updates as Partial<MigrantWorker & { updated_at?: string }>;
    
    // Now pass the cleaned updates object to the updateWorker function
    // and add the updated_at as a separate parameter if needed by the API
    const { data, error } = await updateWorker(id, workerUpdates);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating worker:', error);
    throw error;
  }
}

export async function deleteWorkerById(id: string) {
  try {
    const { error } = await deleteWorker(id);
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting worker:', error);
    throw error;
  }
}

export async function getAllRegisteredWorkers() {
  try {
    const { data, error } = await getAllWorkers();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching workers:', error);
    throw error;
  }
}

export function subscribeToWorkerUpdates(callback: () => void) {
  return subscribeToWorkers(callback);
}

// Add a new function to assign workers with proper error handling
export async function assignWorkerToBusiness(workerId: string, businessId: string) {
  try {
    console.log(`Attempting to assign worker ${workerId} to business ${businessId}`);
    
    // First, get the worker data to make sure it exists
    const { data: workerData, error: workerError } = await getWorker(workerId);
    
    if (workerError) {
      console.error('Error fetching worker for assignment:', workerError);
      throw new Error(`Failed to find worker: ${workerError.message}`);
    }
    
    if (!workerData) {
      throw new Error('Worker not found');
    }
    
    // Prepare update with assignedBusinessId
    const updates = {
      ...workerData,
      assignedBusinessId: businessId
    };
    
    // Update the worker with the business assignment
    const { data, error } = await updateWorker(workerId, { 
      assignedBusinessId: businessId 
    });
    
    if (error) {
      console.error('Error assigning worker to business:', error);
      throw error;
    }
    
    console.log('Worker assigned successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in assignWorkerToBusiness:', error);
    toast.error(error.message || 'Failed to assign worker to business');
    throw error;
  }
}
