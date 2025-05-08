import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MigrantWorker, WorkerLocation } from "@/types/worker";
import { supabase } from "@/utils/supabaseClient";
import { MapPin, Navigation, Clock } from "lucide-react";
import { toast } from "sonner";

const MAPBOX_TOKEN = "pk.eyJ1IjoiZGVtb3VzZXIiLCJhIjoiY2xhd2lioTJzMGkwbzN5bXBwZjE2bnF1cCJ9.8rCpA8p9no3k4YrPQjd5dg";

interface WorkerLocationDialogProps {
  worker: MigrantWorker | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WorkerLocationDialog({ worker, open, onOpenChange }: WorkerLocationDialogProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const routeLayerRef = useRef<string | null>(null);
  const routeSourceRef = useRef<string | null>(null);
  
  const [showHistory, setShowHistory] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<WorkerLocation | null>(null);
  const [locationHistory, setLocationHistory] = useState<WorkerLocation[]>([]);
  const [mapInitialized, setMapInitialized] = useState(false);

  // Initialize map when dialog opens
  useEffect(() => {
    if (!open || !worker || !mapContainer.current) return;
    
    setLoading(true);

    const initializeMap = () => {
      console.log("Initializing map in WorkerLocationDialog");
      
      if (mapRef.current) {
        // Map already exists, just resize it
        mapRef.current.resize();
      } else {
        // Initialize new map
        try {
          mapboxgl.accessToken = MAPBOX_TOKEN;
          const map = new mapboxgl.Map({
            container: mapContainer.current!,
            style: "mapbox://styles/mapbox/streets-v11",
            center: [80.2707, 13.0827], // Default center
            zoom: 12,
          });
          
          map.addControl(new mapboxgl.NavigationControl(), "top-right");
          
          map.on('load', () => {
            console.log("Map loaded successfully");
            setMapInitialized(true);
            fetchWorkerLocation();
          });
          
          map.on('error', (e) => {
            console.error("Map error:", e);
            toast.error("Error loading map");
          });
          
          mapRef.current = map;
        } catch (error) {
          console.error("Failed to initialize map:", error);
          toast.error("Failed to initialize map");
          setLoading(false);
        }
      }
    };
    
    // Small delay to ensure the container is properly rendered
    const timer = setTimeout(() => {
      initializeMap();
    }, 300);
    
    // Poll for location updates
    const interval = setInterval(fetchWorkerLocation, 10000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      
      if (!open) {
        cleanupMap();
      }
    };
  }, [open, worker]);
  
  // Update UI when location changes
  useEffect(() => {
    if (!mapInitialized || !mapRef.current || !location) return;

    updateMapWithLocation(location);
    setLastUpdated(new Date());
    setLoading(false);
  }, [location, mapInitialized]);
  
  // Update history display when toggled
  useEffect(() => {
    if (!mapInitialized || !mapRef.current || !worker) return;
    
    if (showHistory) {
      displayLocationHistory();
    } else {
      hideLocationHistory();
    }
  }, [showHistory, locationHistory, mapInitialized]);
  
  const fetchWorkerLocation = async () => {
    if (!worker) return;
    
    try {
      console.log(`Fetching location for worker: ${worker.id}`);
      const { data: locationData, error } = await supabase
        .from('worker_locations')
        .select('*')
        .eq('worker_id', worker.id)
        .eq('status', 'active')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No active location found, generate a mock one
          console.log("No location found, generating mock location");
          const mockLocation: WorkerLocation = {
            workerId: worker.id,
            name: worker.name,
            latitude: worker.latitude || 13.0827 + (Math.random() * 0.1 - 0.05),
            longitude: worker.longitude || 80.2707 + (Math.random() * 0.1 - 0.05),
            timestamp: Date.now()
          };
          
          await startLocationTracking(worker.id);
          setLocation(mockLocation);
        } else {
          throw error;
        }
      } else {
        console.log("Found existing location:", locationData);
        const location: WorkerLocation = {
          workerId: worker.id,
          name: worker.name,
          latitude: locationData.latitude || worker.latitude || 13.0827,
          longitude: locationData.longitude || worker.longitude || 80.2707,
          timestamp: new Date(locationData.started_at).getTime()
        };
        setLocation(location);
      }
      
      // Fetch location history
      const { data: historyData, error: historyError } = await supabase
        .from('worker_locations')
        .select('*')
        .eq('worker_id', worker.id)
        .order('created_at', { ascending: false });

      if (historyError) throw historyError;

      const history: WorkerLocation[] = historyData.map(loc => ({
        workerId: worker.id,
        name: worker.name,
        latitude: loc.latitude || worker.latitude || 13.0827,
        longitude: loc.longitude || worker.longitude || 80.2707,
        timestamp: new Date(loc.started_at).getTime()
      }));

      setLocationHistory(history);
    } catch (error) {
      console.error("Failed to fetch worker location:", error);
      toast.error("Failed to fetch worker location");
      setLoading(false);
    }
  };
  
  const updateMapWithLocation = (loc: WorkerLocation) => {
    if (!mapRef.current) return;
    
    const map = mapRef.current;
    
    // Create or update marker
    if (!markerRef.current) {
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<div class="p-2">
          <strong>${loc.name}</strong>
          <p class="text-sm mt-1">Last updated: ${new Date(loc.timestamp).toLocaleTimeString()}</p>
          <p class="text-xs text-gray-500">Lat: ${loc.latitude.toFixed(6)}, Lng: ${loc.longitude.toFixed(6)}</p>
        </div>`
      );
      
      markerRef.current = new mapboxgl.Marker({ color: "#8B5CF6" })
        .setLngLat([loc.longitude, loc.latitude])
        .setPopup(popup)
        .addTo(map);
    } else {
      markerRef.current.setLngLat([loc.longitude, loc.latitude]);
      
      const popup = markerRef.current.getPopup();
      popup.setHTML(
        `<div class="p-2">
          <strong>${loc.name}</strong>
          <p class="text-sm mt-1">Last updated: ${new Date(loc.timestamp).toLocaleTimeString()}</p>
          <p class="text-xs text-gray-500">Lat: ${loc.latitude.toFixed(6)}, Lng: ${loc.longitude.toFixed(6)}</p>
        </div>`
      );
    }
    
    // Center map on location
    map.flyTo({
      center: [loc.longitude, loc.latitude],
      zoom: 14,
      speed: 1.2
    });
  };
  
  const displayLocationHistory = () => {
    if (!mapRef.current || locationHistory.length < 2) return;
    
    const map = mapRef.current;
    const sourceId = `route-${worker?.id}`;
    const layerId = `route-layer-${worker?.id}`;
    
    // Clean up existing layer/source
    hideLocationHistory();
    
    // Add new route
    const coordinates = locationHistory.map(loc => [loc.longitude, loc.latitude]);
    
    map.addSource(sourceId, {
      'type': 'geojson',
      'data': {
        'type': 'Feature',
        'properties': {},
        'geometry': {
          'type': 'LineString',
          'coordinates': coordinates
        }
      }
    });
    
    map.addLayer({
      'id': layerId,
      'type': 'line',
      'source': sourceId,
      'layout': {
        'line-join': 'round',
        'line-cap': 'round'
      },
      'paint': {
        'line-color': '#8B5CF6',
        'line-width': 3,
        'line-opacity': 0.7
      }
    });
    
    routeSourceRef.current = sourceId;
    routeLayerRef.current = layerId;
    
    // Adjust map to show full route
    if (coordinates.length > 1) {
      const bounds = coordinates.reduce((bounds, coord) => {
        return bounds.extend(coord as [number, number]);
      }, new mapboxgl.LngLatBounds(
        coordinates[0] as [number, number], 
        coordinates[0] as [number, number]
      ));
      
      map.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15
      });
    }
  };
  
  const hideLocationHistory = () => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    
    if (routeLayerRef.current && map.getLayer(routeLayerRef.current)) {
      map.removeLayer(routeLayerRef.current);
    }
    
    if (routeSourceRef.current && map.getSource(routeSourceRef.current)) {
      map.removeSource(routeSourceRef.current);
    }
    
    routeLayerRef.current = null;
    routeSourceRef.current = null;
  };

  const cleanupMap = () => {
    if (mapRef.current && routeLayerRef.current) {
      if (mapRef.current.getLayer(routeLayerRef.current)) {
        mapRef.current.removeLayer(routeLayerRef.current);
      }
    }
    
    if (mapRef.current && routeSourceRef.current) {
      if (mapRef.current.getSource(routeSourceRef.current)) {
        mapRef.current.removeSource(routeSourceRef.current);
      }
    }
    
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
  };

  const startLocationTracking = async (workerId: string) => {
    try {
      const { error } = await supabase
        .from('worker_locations')
        .insert([
          {
            worker_id: workerId,
            status: 'active',
            started_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;
      toast.success('Location tracking started');
    } catch (error) {
      console.error('Error starting location tracking:', error);
      toast.error('Failed to start location tracking');
    }
  };

  const stopLocationTracking = async (workerId: string) => {
    try {
      const { error } = await supabase
        .from('worker_locations')
        .update({ status: 'inactive', ended_at: new Date().toISOString() })
        .eq('worker_id', workerId)
        .eq('status', 'active');

      if (error) throw error;
      toast.success('Location tracking stopped');
    } catch (error) {
      console.error('Error stopping location tracking:', error);
      toast.error('Failed to stop location tracking');
    }
  };

  const getLocationHistory = async (workerId: string) => {
    try {
      const { data, error } = await supabase
        .from('worker_locations')
        .select('*')
        .eq('worker_id', workerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching location history:', error);
      toast.error('Failed to fetch location history');
      return [];
    }
  };

  if (!worker) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] lg:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Worker Location Tracking</DialogTitle>
          <DialogDescription>
            Live location tracking for {worker.name} ({worker.id})
          </DialogDescription>
        </DialogHeader>
        
        <div className="h-[400px] relative border rounded-md overflow-hidden">
          <div ref={mapContainer} className="w-full h-full" />
          
          {loading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p>Loading location data...</p>
              </div>
            </div>
          )}
          
          <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-md p-2">
            <div className="text-xs text-muted-foreground">
              Last updated: {lastUpdated?.toLocaleTimeString() || 'Never'}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4" />
            <span>Current Location: </span>
            <span className="font-medium">
              {location ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` : 'Unknown'}
            </span>
          </div>
          
          {location && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <span>Last Movement: </span>
              <span className="font-medium">
                {new Date(location.timestamp).toLocaleString()}
              </span>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-between items-center sm:justify-between">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? 'Hide History' : 'Show Movement History'}
          </Button>
          
          <Button 
            variant="default" 
            size="sm"
            onClick={fetchWorkerLocation}
            className="flex items-center gap-1"
          >
            <Navigation className="h-4 w-4" />
            Refresh Location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
