
import { toast } from "sonner";
import { MigrantWorker } from "@/types/worker";

export interface GeoZone {
  id: string;
  name: string;
  center: {
    latitude: number;
    longitude: number;
  };
  radiusInMeters: number;
  type: 'work' | 'restricted' | 'safe';
  description?: string;
}

export interface WorkerAlert {
  id: string;
  workerId: string;
  workerName: string;
  type: 'zone_entry' | 'zone_exit' | 'sos' | 'inactivity';
  message: string;
  timestamp: number;
  location?: {
    latitude: number;
    longitude: number;
  };
  zoneId?: string;
  read: boolean;
}

// Local storage keys
const ZONES_STORAGE_KEY = 'migii_geo_zones';
const WORKER_ZONE_STATUS_KEY = 'migii_worker_zone_status';
const ALERTS_STORAGE_KEY = 'migii_worker_alerts';

// In-memory cache for performance
let geoZones: GeoZone[] = [];
let alertsCache: WorkerAlert[] = [];
let workerZoneStatus: Record<string, Record<string, boolean>> = {};

// Initialize from localStorage
const initFromLocalStorage = () => {
  try {
    // Load geo zones
    const storedZones = localStorage.getItem(ZONES_STORAGE_KEY);
    if (storedZones) {
      geoZones = JSON.parse(storedZones);
    } else {
      // Initialize with default zones if none exist
      geoZones = [
        {
          id: 'work_zone_1',
          name: 'Main Construction Site',
          center: { latitude: 13.0827, longitude: 80.2707 },
          radiusInMeters: 500,
          type: 'work',
          description: 'Primary work zone for construction teams'
        },
        {
          id: 'restricted_zone_1',
          name: 'Hazardous Area',
          center: { latitude: 13.0927, longitude: 80.2807 },
          radiusInMeters: 200,
          type: 'restricted',
          description: 'Dangerous area - authorized personnel only'
        }
      ];
      localStorage.setItem(ZONES_STORAGE_KEY, JSON.stringify(geoZones));
    }

    // Load worker zone status
    const storedStatus = localStorage.getItem(WORKER_ZONE_STATUS_KEY);
    if (storedStatus) {
      workerZoneStatus = JSON.parse(storedStatus);
    }

    // Load alerts
    const storedAlerts = localStorage.getItem(ALERTS_STORAGE_KEY);
    if (storedAlerts) {
      alertsCache = JSON.parse(storedAlerts);
    }
  } catch (error) {
    console.error('Error initializing geo alert service:', error);
  }
};

// Calculate distance between two points using Haversine formula
const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

// Check if worker is in a zone
const isWorkerInZone = (
  workerLat: number, 
  workerLng: number, 
  zone: GeoZone
): boolean => {
  const distance = calculateDistance(
    workerLat,
    workerLng,
    zone.center.latitude,
    zone.center.longitude
  );
  return distance <= zone.radiusInMeters;
};

// Create an alert
const createAlert = (
  worker: MigrantWorker,
  type: WorkerAlert['type'],
  message: string,
  location?: { latitude: number; longitude: number },
  zoneId?: string
): WorkerAlert => {
  const alert: WorkerAlert = {
    id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    workerId: worker.id,
    workerName: worker.name,
    type,
    message,
    timestamp: Date.now(),
    location,
    zoneId,
    read: false
  };

  alertsCache = [alert, ...alertsCache];
  
  // Limit the number of stored alerts
  if (alertsCache.length > 100) {
    alertsCache = alertsCache.slice(0, 100);
  }
  
  localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alertsCache));

  // Show toast for admins
  toast.info(message, {
    description: `Worker: ${worker.name}, Type: ${type}`,
    duration: 5000,
  });

  return alert;
};

// Update worker location and check for geofence events
const updateWorkerLocation = (
  worker: MigrantWorker,
  latitude: number,
  longitude: number
): WorkerAlert[] => {
  // Initialize worker status if not exists
  if (!workerZoneStatus[worker.id]) {
    workerZoneStatus[worker.id] = {};
    geoZones.forEach(zone => {
      workerZoneStatus[worker.id][zone.id] = false;
    });
  }

  const alerts: WorkerAlert[] = [];

  // Check each zone for entry/exit
  geoZones.forEach(zone => {
    const isInZone = isWorkerInZone(latitude, longitude, zone);
    const wasInZone = workerZoneStatus[worker.id][zone.id];

    // Zone entry
    if (isInZone && !wasInZone) {
      workerZoneStatus[worker.id][zone.id] = true;
      const alert = createAlert(
        worker,
        'zone_entry',
        `${worker.name} entered ${zone.name} (${zone.type} zone)`,
        { latitude, longitude },
        zone.id
      );
      alerts.push(alert);
    }
    // Zone exit
    else if (!isInZone && wasInZone) {
      workerZoneStatus[worker.id][zone.id] = false;
      const alert = createAlert(
        worker,
        'zone_exit',
        `${worker.name} left ${zone.name} (${zone.type} zone)`,
        { latitude, longitude },
        zone.id
      );
      alerts.push(alert);
    }
  });

  // Update local storage
  localStorage.setItem(WORKER_ZONE_STATUS_KEY, JSON.stringify(workerZoneStatus));

  return alerts;
};

// Create an SOS alert
const createSOSAlert = (
  worker: MigrantWorker,
  latitude: number,
  longitude: number,
  message?: string
): WorkerAlert => {
  return createAlert(
    worker,
    'sos',
    message || `EMERGENCY: ${worker.name} has requested urgent assistance!`,
    { latitude, longitude }
  );
};

// Create an inactivity alert
const createInactivityAlert = (
  worker: MigrantWorker,
  lastLocation?: { latitude: number; longitude: number }
): WorkerAlert => {
  return createAlert(
    worker,
    'inactivity',
    `${worker.name} has been inactive for more than 4 hours`,
    lastLocation
  );
};

// Get all alerts for a worker
const getWorkerAlerts = (workerId: string): WorkerAlert[] => {
  return alertsCache.filter(alert => alert.workerId === workerId);
};

// Get all unread alerts
const getUnreadAlerts = (): WorkerAlert[] => {
  return alertsCache.filter(alert => !alert.read);
};

// Mark alert as read
const markAlertAsRead = (alertId: string): void => {
  alertsCache = alertsCache.map(alert => 
    alert.id === alertId ? { ...alert, read: true } : alert
  );
  localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alertsCache));
};

// Add a new geo zone
const addGeoZone = (zone: Omit<GeoZone, 'id'>): GeoZone => {
  const newZone = {
    ...zone,
    id: `zone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
  geoZones.push(newZone);
  localStorage.setItem(ZONES_STORAGE_KEY, JSON.stringify(geoZones));
  
  // Initialize zone status for all workers
  Object.keys(workerZoneStatus).forEach(workerId => {
    workerZoneStatus[workerId][newZone.id] = false;
  });
  localStorage.setItem(WORKER_ZONE_STATUS_KEY, JSON.stringify(workerZoneStatus));
  
  return newZone;
};

// Remove a geo zone
const removeGeoZone = (zoneId: string): boolean => {
  const initialLength = geoZones.length;
  geoZones = geoZones.filter(zone => zone.id !== zoneId);
  
  if (geoZones.length !== initialLength) {
    localStorage.setItem(ZONES_STORAGE_KEY, JSON.stringify(geoZones));
    
    // Remove zone status for all workers
    Object.keys(workerZoneStatus).forEach(workerId => {
      delete workerZoneStatus[workerId][zoneId];
    });
    localStorage.setItem(WORKER_ZONE_STATUS_KEY, JSON.stringify(workerZoneStatus));
    
    return true;
  }
  
  return false;
};

// Get all geo zones
const getAllGeoZones = (): GeoZone[] => {
  return [...geoZones];
};

// Update a geo zone
const updateGeoZone = (zoneId: string, updates: Partial<Omit<GeoZone, 'id'>>): GeoZone | null => {
  const zoneIndex = geoZones.findIndex(zone => zone.id === zoneId);
  if (zoneIndex === -1) return null;
  
  geoZones[zoneIndex] = { ...geoZones[zoneIndex], ...updates };
  localStorage.setItem(ZONES_STORAGE_KEY, JSON.stringify(geoZones));
  
  return geoZones[zoneIndex];
};

// Get all alerts
const getAllAlerts = (): WorkerAlert[] => {
  return [...alertsCache];
};

// Initialize the service
initFromLocalStorage();

// Export the API
export const geoAlertService = {
  updateWorkerLocation,
  createSOSAlert,
  createInactivityAlert,
  getWorkerAlerts,
  getUnreadAlerts,
  markAlertAsRead,
  addGeoZone,
  removeGeoZone,
  getAllGeoZones,
  updateGeoZone,
  getAllAlerts
};
