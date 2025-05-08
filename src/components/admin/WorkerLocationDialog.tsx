import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MigrantWorker, WorkerLocation } from "@/types/worker";
import { supabase } from "@/utils/supabaseClient";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

interface WorkerLocationDialogProps {
  worker: MigrantWorker | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WorkerLocationDialog({ worker, open, onOpenChange }: WorkerLocationDialogProps) {
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<WorkerLocation | null>(null);

  const fetchWorkerLocation = async () => {
    if (!worker) return;
    setLoading(true);
    try {
      console.log('Fetching location for worker:', worker.id);
      
      // First try to get from worker_locations table
      const { data: locationData, error } = await supabase
        .from('worker_locations')
        .select('*')
        .eq('worker_id', worker.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.log('No location found in worker_locations, checking worker profile');
        // If no location found, use worker's profile location
        setLocation({
          workerId: worker.id,
          name: worker.name,
          latitude: worker.latitude || 13.0827,
          longitude: worker.longitude || 80.2707,
          timestamp: Date.now()
        });
        return;
      }

      if (!locationData) {
        console.log('No location data found, using worker profile location');
        setLocation({
          workerId: worker.id,
          name: worker.name,
          latitude: worker.latitude || 13.0827,
          longitude: worker.longitude || 80.2707,
          timestamp: Date.now()
        });
        return;
      }

      console.log('Location data received:', locationData);
      setLocation({
        workerId: worker.id,
        name: worker.name,
        latitude: locationData.latitude || worker.latitude || 13.0827,
        longitude: locationData.longitude || worker.longitude || 80.2707,
        timestamp: new Date(locationData.created_at).getTime()
      });
      toast.success('Location updated successfully');
    } catch (e) {
      console.error('Exception while fetching worker location:', e);
      toast.error('An error occurred while fetching location');
      setLocation({
        workerId: worker.id,
        name: worker.name,
        latitude: worker.latitude || 13.0827,
        longitude: worker.longitude || 80.2707,
        timestamp: Date.now()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open || !worker) return;
    fetchWorkerLocation();
  }, [open, worker]);

  const position = location ? [location.latitude, location.longitude] : [13.0827, 80.2707];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Track Worker Location</DialogTitle>
          <DialogDescription>
            View the real-time location of the selected worker on the map.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <span>Loading map...</span>
          </div>
        ) : (
          <>
            <div className="w-full h-96">
              <MapContainer center={position} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position} icon={L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png', iconSize: [25, 41], iconAnchor: [12, 41] })}>
                  <Popup>
                    <div>
                      <strong>{worker?.name}</strong><br />
                      Lat: {position[0].toFixed(6)}, Lng: {position[1].toFixed(6)}
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Last updated: {location?.timestamp ? new Date(location.timestamp).toLocaleString() : 'N/A'}<br />
                Coordinates: {position[0].toFixed(6)}, {position[1].toFixed(6)}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchWorkerLocation}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh Location
              </Button>
            </div>
          </>
        )}
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
