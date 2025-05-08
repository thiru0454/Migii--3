import { createClient } from '@supabase/supabase-js';
import { MigrantWorker } from '@/types/worker';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Worker registration
export async function registerWorker(workerData: Omit<MigrantWorker, 'id'>) {
  return await supabase
    .from('workers')
    .insert([
      {
        ...workerData
        // id is omitted; Supabase will auto-generate it
      }
    ])
    .select('*')
    .single();
}

// Get a single worker
export async function getWorker(id: string) {
  return await supabase
    .from('workers')
    .select('*')
    .eq('id', id)
    .single();
}

// Update worker details
export async function updateWorker(id: string, updates: Partial<MigrantWorker>) {
  return await supabase
    .from('workers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
}

// Delete worker
export async function deleteWorker(id: string) {
  return await supabase
    .from('workers')
    .delete()
    .eq('id', id);
}

// Get all workers
export async function getAllWorkers() {
  return await supabase
    .from('workers')
    .select('*')
    .order('created_at', { ascending: false });
}

// Subscribe to workers table changes
export function subscribeToWorkers(callback: () => void) {
  return supabase
    .channel('workers_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'workers'
      },
      () => {
        callback();
      }
    )
    .subscribe();
}

// Add the improved assignWorkerToBusiness function
export async function assignWorkerToBusiness(workerId: string, businessId: string) {
  console.log(`Assigning worker ${workerId} to business ${businessId}`);
  
  try {
    // Get the worker data first to verify it exists
    const { data: workerData, error: getError } = await getWorker(workerId);
    
    if (getError) {
      console.error('Error fetching worker:', getError);
      throw getError;
    }
    
    if (!workerData) {
      console.error('Worker not found');
      throw new Error('Worker not found');
    }
    
    console.log('Worker found:', workerData);
    
    // Ensure worker ID is in the correct format for Supabase
    let formattedWorkerId = String(workerId);
    
    // If it's a numeric ID, we need to convert it to a valid UUID format for Supabase
    if (/^\d+$/.test(formattedWorkerId)) {
      // Generate a UUID v4 based on the worker ID
      formattedWorkerId = `00000000-0000-4000-A000-${formattedWorkerId.padStart(12, '0')}`;
      console.log("Formatted worker ID for UUID field:", formattedWorkerId);
    }
    
    // Update the worker with the business assignment
    const { data, error } = await supabase
      .from('workers')
      .update({ 
        assignedBusinessId: businessId,
        updated_at: new Date().toISOString()
      })
      .eq('id', formattedWorkerId)
      .select()
      .single();
      
    if (error) {
      console.error('Error assigning worker:', error);
      throw error;
    }
    // Insert assignment notification for the worker
    const { error: insertError } = await supabase.from('worker_assignments').insert([
      {
        worker_id: formattedWorkerId,
        business_id: businessId,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]);
    if (insertError) {
      console.error('Error inserting into worker_assignments:', insertError);
    } else {
      console.log('Inserted into worker_assignments:', formattedWorkerId, businessId);
    }
    
    console.log('Worker successfully assigned:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Exception during worker assignment:', error);
    return { data: null, error };
  }
}

// Job management functions
interface Job {
  title: string;
  company: string;
  location?: string;
  job_type: string;
  category?: string;
  salary?: string;
  description: string;
  requirements?: string;
  contact_email?: string;
  status: string;
}

// Post a new job
export async function postJob(jobData: Job) {
  return await supabase
    .from('jobs')
    .insert([{
      ...jobData,
      posted_at: new Date().toISOString()
    }])
    .select();
}

// Get all jobs
export async function getAllJobs() {
  return await supabase
    .from('jobs')
    .select('*')
    .order('posted_at', { ascending: false });
}

// Get active jobs
export async function getActiveJobs() {
  return await supabase
    .from('jobs')
    .select('*')
    .eq('status', 'active')
    .order('posted_at', { ascending: false });
}

// Get a single job
export async function getJob(id: string) {
  return await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single();
}

// Update job details
export async function updateJob(id: string, updates: Partial<Job>) {
  return await supabase
    .from('jobs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
}

// Delete job
export async function deleteJob(id: string) {
  return await supabase
    .from('jobs')
    .delete()
    .eq('id', id);
}

// Job application functions
interface JobApplication {
  job_id: string;
  worker_id: string;
  worker_name?: string;
  status: string;
  notes?: string;
}

// Submit job application
export async function submitJobApplication(applicationData: JobApplication) {
  return await supabase
    .from('job_applications')
    .insert([{
      ...applicationData,
      applied_at: new Date().toISOString()
    }])
    .select();
}

// Get worker's job applications
export async function getWorkerApplications(workerId: string) {
  return await supabase
    .from('job_applications')
    .select(`
      *,
      jobs:job_id (*)
    `)
    .eq('worker_id', workerId);
}

// Get applications for a job
export async function getJobApplications(jobId: string) {
  return await supabase
    .from('job_applications')
    .select(`
      *,
      workers:worker_id (*)
    `)
    .eq('job_id', jobId);
}

// Update application status
export async function updateApplicationStatus(id: string, status: string, notes?: string) {
  return await supabase
    .from('job_applications')
    .update({ 
      status,
      notes,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
}

// Submit a new support request
type SupportRequest = {
  name: string;
  email: string;
  message: string;
};

export async function submitSupportRequest(request: SupportRequest) {
  return await supabase
    .from('support_requests')
    .insert([{ ...request }])
    .select()
    .single();
}

// Fetch all support requests
export async function getSupportRequests() {
  return await supabase
    .from('support_requests')
    .select('*')
    .order('created_at', { ascending: false });
}

// Update support request status
export async function updateSupportRequestStatus(id: string, status: string) {
  return await supabase
    .from('support_requests')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
}
