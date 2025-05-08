
import { useEffect, useState } from "react";
import { useGeolocation } from "@/hooks/useGeolocation";
import mongoDbService, { WorkerLocation } from "@/utils/mongoDbService";
import { toast } from "sonner";

interface UseLocationTrackingProps {
  workerId: string;
  name: string;
  enabled?: boolean;
  updateInterval?: number;
  onLocationUpdate?: (location: WorkerLocation) => void;
}

export const useLocationTracking = ({
  workerId,
  name,
  enabled = true,
  updateInterval = 30000, // 30 seconds
  onLocationUpdate,
}: UseLocationTrackingProps) => {
  const { latitude, longitude, error, loading } = useGeolocation();
  const [isTracking, setIsTracking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !workerId) return;

    // Check MongoDB connection
    if (!mongoDbService.isConnectedToDatabase()) {
      setTrackingError("MongoDB connection unavailable");
      toast.error("Location tracking unavailable", {
        description: "Database connection failed. Please try again later."
      });
      return;
    }

    // Only start tracking when we have valid coordinates and no errors
    if (loading) {
      console.log("Waiting for geolocation...");
      return;
    }

    if (error) {
      setTrackingError(`Geolocation error: ${error}`);
      toast.error("Location access error", {
        description: error
      });
      return;
    }

    if (latitude === null || longitude === null) {
      setTrackingError("No location data available");
      return;
    }

    setIsTracking(true);
    setTrackingError(null);

    // Initial location update
    updateLocation(latitude, longitude);

    // Set up interval for regular updates
    const intervalId = setInterval(() => {
      // Re-check geolocation on each update
      if (latitude !== null && longitude !== null) {
        updateLocation(latitude, longitude);
      }
    }, updateInterval);

    return () => {
      clearInterval(intervalId);
      setIsTracking(false);
    };
  }, [workerId, name, enabled, latitude, longitude, loading, error, updateInterval]);

  // Helper function to update location
  const updateLocation = (lat: number, lng: number) => {
    try {
      const location: WorkerLocation = {
        workerId,
        name,
        latitude: lat,
        longitude: lng,
        timestamp: Date.now(),
      };

      mongoDbService.updateWorkerLocation(location)
        .then(() => {
          setLastUpdate(new Date());
          if (onLocationUpdate) {
            onLocationUpdate(location);
          }
        })
        .catch(error => {
          console.error("Failed to update location in MongoDB:", error);
          setTrackingError("Failed to update location");
        });
    } catch (error) {
      console.error("Error updating location:", error);
      setTrackingError("Error processing location data");
    }
  };

  return {
    isTracking,
    lastUpdate,
    currentLocation: latitude !== null && longitude !== null
      ? { latitude, longitude }
      : null,
    error: trackingError || error,
    loading,
  };
};
