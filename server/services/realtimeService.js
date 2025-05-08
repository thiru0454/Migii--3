import mongoose from 'mongoose';
import { Worker } from '../models/worker.js';

class RealtimeService {
  constructor() {
    this.changeStreams = new Map();
    this.clients = new Map();
    this.isReplicaSet = false;
  }

  // Initialize change streams for all collections
  async initializeChangeStreams() {
    try {
      // Check if we're connected to a replica set
      const adminDb = mongoose.connection.db.admin();
      const status = await adminDb.serverStatus();
      this.isReplicaSet = status.repl?.setName ? true : false;

      if (this.isReplicaSet) {
        // Watch for changes in the workers collection
        const workerStream = Worker.watch([], { fullDocument: 'updateLookup' });
        
        workerStream.on('change', (change) => {
          this.broadcastChange('workers', change);
        });

        this.changeStreams.set('workers', workerStream);
        console.log('MongoDB change streams initialized successfully');
      } else {
        console.log('MongoDB is not running in replica set mode. Real-time updates will be limited.');
        // Set up polling as a fallback
        this.setupPolling();
      }
    } catch (error) {
      console.error('Error initializing change streams:', error);
      console.log('Falling back to polling for updates');
      this.setupPolling();
    }
  }

  // Set up polling for non-replica set environments
  setupPolling() {
    // Poll for changes every 5 seconds
    setInterval(async () => {
      try {
        const latestWorkers = await Worker.find()
          .sort({ updatedAt: -1 })
          .limit(10)
          .lean();

        this.broadcastChange('workers', {
          operationType: 'update',
          fullDocument: latestWorkers
        });
      } catch (error) {
        console.error('Error polling for updates:', error);
      }
    }, 5000);
  }

  // Add a new client to receive real-time updates
  addClient(clientId, ws) {
    this.clients.set(clientId, ws);
    console.log(`Client ${clientId} connected`);
  }

  // Remove a client
  removeClient(clientId) {
    this.clients.delete(clientId);
    console.log(`Client ${clientId} disconnected`);
  }

  // Broadcast changes to all connected clients
  broadcastChange(collection, change) {
    const message = JSON.stringify({
      type: 'change',
      collection,
      operation: change.operationType,
      document: change.fullDocument
    });

    this.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(message);
      }
    });
  }

  // Clean up change streams when server shuts down
  cleanup() {
    this.changeStreams.forEach((stream) => {
      stream.close();
    });
    this.changeStreams.clear();
    this.clients.clear();
  }
}

export const realtimeService = new RealtimeService(); 