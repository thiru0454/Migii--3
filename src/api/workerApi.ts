
import { MigrantWorker } from '@/types/worker';

// Use explicit backend URL
const API_URL = 'http://127.0.0.1:3000/api';

console.log('API URL:', API_URL);

const MAX_RETRIES = 2;
const RETRY_DELAY = 2000; // 2 seconds
const HEALTH_CHECK_TIMEOUT = 5000; // 5 seconds
const REGISTRATION_TIMEOUT = 30000; // 30 seconds

async function fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function fetchWithRetry(url: string, options: RequestInit, timeout: number, retries = MAX_RETRIES): Promise<Response> {
  try {
    console.log(`Attempting to fetch ${url} (${retries} retries left)`);
    
    const response = await fetchWithTimeout(url, {
      ...options,
      mode: 'cors',
      headers: {
        ...options.headers,
        'Origin': window.location.origin,
      }
    }, timeout);
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      console.error('API Error:', error);
      throw new Error(error.message || 'Failed to fetch');
    }
    
    console.log(`Successfully fetched ${url}`);
    return response;
  } catch (error: any) {
    console.error(`Fetch error for ${url}:`, error);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    
    if (retries > 0) {
      console.log(`Retrying in ${RETRY_DELAY}ms...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, timeout, retries - 1);
    }
    
    throw error;
  }
}

export async function registerWorker(workerData: MigrantWorker) {
  try {
    console.log('Attempting to register worker:', workerData);
    
    // First check if server is available
    const isHealthy = await checkServerHealth();
    if (!isHealthy) {
      throw new Error('Server is not available. Please try again later.');
    }
    
    const response = await fetchWithRetry(
      `${API_URL}/workers/register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(workerData),
      },
      REGISTRATION_TIMEOUT
    );

    const data = await response.json();
    console.log('Worker registered successfully:', data);
    return data;
  } catch (error: any) {
    console.error('Error registering worker:', error);
    if (error.message.includes('timed out')) {
      throw new Error('Registration request timed out. Please try again.');
    }
    throw new Error(error.message || 'Failed to register worker');
  }
}

export async function assignWorker(workerId: string, businessId: string) {
  try {
    console.log('Attempting to assign worker:', { workerId, businessId });
    
    // First check if server is available
    const isHealthy = await checkServerHealth();
    if (!isHealthy) {
      // If server is not available, use a local fallback
      console.log('Server unavailable, using local fallback for assignment');
      
      // Get current workers from local storage or create empty array
      const storedWorkers = JSON.parse(localStorage.getItem('workers') || '[]');
      
      // Update the assigned business for the worker
      const updatedWorkers = storedWorkers.map((worker: MigrantWorker) => 
        worker.id === workerId ? { ...worker, assignedBusinessId: businessId } : worker
      );
      
      // Save back to local storage
      localStorage.setItem('workers', JSON.stringify(updatedWorkers));
      
      // Return mock success response
      return { success: true, workerId, businessId };
    }
    
    const response = await fetchWithRetry(
      `${API_URL}/workers/assign`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ workerId, businessId }),
      },
      REGISTRATION_TIMEOUT
    );

    const data = await response.json();
    console.log('Worker assigned successfully:', data);
    return data;
  } catch (error: any) {
    console.error('Error assigning worker:', error);
    if (error.message.includes('timed out')) {
      throw new Error('Assignment request timed out. Please try again.');
    }
    throw new Error(error.message || 'Failed to assign worker');
  }
}

export async function checkServerHealth() {
  try {
    console.log('Checking server health...');
    const response = await fetchWithTimeout(
      `${API_URL}/health`,
      {
        mode: 'cors',
        headers: {
          'Origin': window.location.origin,
        }
      },
      HEALTH_CHECK_TIMEOUT
    );
    
    console.log('Health check response status:', response.status);
    
    if (!response.ok) {
      console.error('Health check failed with status:', response.status);
      return false;
    }
    
    const data = await response.json();
    console.log('Server health status:', data);
    
    if (data.mongodb !== 'connected') {
      console.error('MongoDB is not connected');
      return false;
    }
    
    return data.status === 'ok';
  } catch (error) {
    console.error('Server health check failed:', error);
    return false;
  }
}
