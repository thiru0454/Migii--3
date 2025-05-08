import { MigrantWorker } from "@/types/worker";

// MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://thirumalai0454:6936MlsrTO5SYslL@cluster0.zwlpnzk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Interface for worker location data
export interface WorkerLocation {
  workerId: string;
  name: string;
  latitude: number;
  longitude: number;
  timestamp: number;
}

// Simulated MongoDB Service for frontend
// In a production environment, these operations would be performed through a backend API
class MongoDbService {
  private isConnected: boolean = false;
  private workers: Record<string, any> = {};
  private workerLocations: Record<string, WorkerLocation> = {};
  private locationHistory: Record<string, WorkerLocation[]> = {};
  private collections: Record<string, any[]> = {
    workers: [],
    locations: [],
    locationHistory: []
  };

  constructor() {
    console.log('MongoDB Service initializing...');
    this.loadStoredData();
    this.connectToDatabase();
  }

  private async connectToDatabase(): Promise<void> {
    try {
      // In a real implementation, this would use an API endpoint to connect to MongoDB
      console.log(`Attempting to connect to MongoDB at: ${MONGODB_URI}`);
      
      // Simulating connection delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, create collections if they don't exist
      this.ensureCollectionsExist();
      
      this.isConnected = true;
      console.log("Connected to MongoDB successfully");
      
      // Load any stored data
      this.loadWorkersFromStorage();
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      this.isConnected = false;
    }
  }

  private ensureCollectionsExist(): void {
    // Simulated collection creation - in a real MongoDB implementation, 
    // this would check for collections and create them if they don't exist
    if (!localStorage.getItem('mongodb_collections')) {
      localStorage.setItem('mongodb_collections', JSON.stringify(this.collections));
      console.log("Created MongoDB collections");
    } else {
      // Load existing collections
      try {
        this.collections = JSON.parse(localStorage.getItem('mongodb_collections') || '{}');
      } catch (error) {
        console.error("Failed to parse collections from storage:", error);
        // Reset to default if corrupted
        localStorage.setItem('mongodb_collections', JSON.stringify(this.collections));
      }
    }
  }

  private loadStoredData(): void {
    try {
      // Load worker locations
      const storedLocations = localStorage.getItem('worker_locations');
      if (storedLocations) {
        this.workerLocations = JSON.parse(storedLocations);
        console.log(`Loaded ${Object.keys(this.workerLocations).length} worker locations`);
      }

      // Load location history
      const historyKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('worker_location_history_')
      );
      
      historyKeys.forEach(key => {
        const workerId = key.replace('worker_location_history_', '');
        const history = localStorage.getItem(key);
        if (history) {
          this.locationHistory[workerId] = JSON.parse(history);
        }
      });
      
      console.log(`Loaded location history for ${historyKeys.length} workers`);
    } catch (error) {
      console.error("Error loading stored data:", error);
    }
  }

  private loadWorkersFromStorage(): void {
    try {
      const storedWorkers = localStorage.getItem('workers');
      if (storedWorkers) {
        const parsedWorkers = JSON.parse(storedWorkers);
        // Index workers by ID for easier access
        parsedWorkers.forEach((worker: any) => {
          this.workers[worker.id] = worker;
        });
        console.log(`Loaded ${parsedWorkers.length} workers from storage`);
        
        // Update MongoDB collections (simulated)
        this.collections.workers = parsedWorkers;
        this.saveCollections();
      }
    } catch (error) {
      console.error("Failed to load workers from storage:", error);
    }
  }

  private saveCollections(): void {
    try {
      localStorage.setItem('mongodb_collections', JSON.stringify(this.collections));
    } catch (error) {
      console.error("Failed to save collections to storage:", error);
    }
  }

  public isConnectedToDatabase(): boolean {
    return this.isConnected;
  }

  public async getWorkers(): Promise<any[]> {
    return Object.values(this.workers);
  }

  public async updateWorkerLocation(location: WorkerLocation): Promise<void> {
    if (!this.isConnected) {
      console.error("Cannot update worker location: MongoDB not connected");
      return;
    }

    try {
      // Update current location
      this.workerLocations[location.workerId] = location;
      localStorage.setItem('worker_locations', JSON.stringify(this.workerLocations));
      
      // Update location history
      if (!this.locationHistory[location.workerId]) {
        this.locationHistory[location.workerId] = [];
      }
      this.locationHistory[location.workerId].push(location);
      
      // Keep only the last 100 location points
      if (this.locationHistory[location.workerId].length > 100) {
        this.locationHistory[location.workerId] = this.locationHistory[location.workerId].slice(-100);
      }
      
      // Store in localStorage for persistence
      this.storeLocationHistory(location.workerId);
      
      // Update MongoDB collections (simulated)
      this.collections.locations = Object.values(this.workerLocations);
      this.collections.locationHistory = Object.entries(this.locationHistory).map(([id, history]) => ({
        workerId: id,
        locations: history
      }));
      
      this.saveCollections();
      
      console.log(`Updated location for worker ${location.workerId} at ${new Date(location.timestamp).toLocaleTimeString()}`);
    } catch (error) {
      console.error("Failed to update worker location:", error);
    }
  }

  private storeLocationHistory(workerId: string): void {
    try {
      const historyKey = `worker_location_history_${workerId}`;
      localStorage.setItem(
        historyKey, 
        JSON.stringify(this.locationHistory[workerId])
      );
    } catch (error) {
      console.error("Failed to store location history:", error);
    }
  }

  public getWorkerLocation(workerId: string): WorkerLocation | null {
    return this.workerLocations[workerId] || null;
  }

  public getAllWorkerLocations(): Record<string, WorkerLocation> {
    return this.workerLocations;
  }

  public getWorkerLocationHistory(workerId: string): WorkerLocation[] {
    return this.locationHistory[workerId] || [];
  }

  public getAllLocationHistories(): Record<string, WorkerLocation[]> {
    return this.locationHistory;
  }

  public forceReconnect(): void {
    this.isConnected = false;
    this.connectToDatabase();
  }
}

// Create singleton instance
const mongoDbService = new MongoDbService();

export default mongoDbService;
