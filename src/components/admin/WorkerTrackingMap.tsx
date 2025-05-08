import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MigrantWorker } from "@/types/worker";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/utils/supabaseClient";
import mongoDbService, { WorkerLocation } from "@/utils/mongoDbService";
import { geoAlertService, GeoZone } from "@/utils/geoAlertService";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Bell,
  MapPin,
  AlertTriangle,
  AlertCircle,
  Map,
  Layers,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { WorkerLocationDialog } from "./WorkerLocationDialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const MAPBOX_TOKEN = "pk.eyJ1IjoiZGVtb3VzZXIiLCJhIjoiY2xhd2lioTJzMGkwbzN5bXBwZjE2bnF1cCJ9.8rCpA8p9no3k4YrPQjd5dg";

export function WorkerTrackingMap() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Record<string, mapboxgl.Marker>>({});
  const zoneLayersRef = useRef<string[]>([]);
  const [workers, setWorkers] = useState<MigrantWorker[]>([]);
  const [workerLocations, setWorkerLocations] = useState<Record<string, WorkerLocation>>({});
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showZones, setShowZones] = useState(true);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<MigrantWorker | null>(null);
  const [showWorkerDialog, setShowWorkerDialog] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState<number>(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!mapContainer.current) return;
    
    console.log("Initializing worker tracking map");
    
    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [80.2707, 13.0827],
        zoom: 10,
        attributionControl: false
      });

      map.addControl(new mapboxgl.NavigationControl({ 
        showCompass: true,
        showZoom: true,
        visualizePitch: true
      }), "top-right");
      
      map.on('load', () => {
        console.log("Map loaded successfully");
        setMapInitialized(true);
        fetchWorkers();
      });
      
      map.on('error', (e) => {
        console.error("Map error:", e);
        toast.error("Error loading map");
      });
      
      mapRef.current = map;
      
      // Improve mobile responsiveness
      const resizeMap = () => {
        if (mapRef.current) {
          mapRef.current.resize();
        }
      };
      
      window.addEventListener('resize', resizeMap);
      return () => {
        window.removeEventListener('resize', resizeMap);
        if (mapRef.current) {
          mapRef.current.remove();
        }
      };
      
    } catch (error) {
      console.error("Failed to initialize map:", error);
      toast.error("Failed to initialize map");
    }
  }, []);

  useEffect(() => {
    const mockWebSocketConnection = async () => {
      try {
        // Check MongoDB connection status
        const isConnected = mongoDbService.isConnectedToDatabase();
        
        if (isConnected) {
          setConnected(true);
          toast.success("Connected to location service");
          
          startMockLocationUpdates();
        } else {
          toast.error("Failed to connect to location service");
          setConnected(false);
          
          // Force reconnect
          mongoDbService.forceReconnect();
        }
      } catch (error) {
        console.error("WebSocket error:", error);
        toast.error("Location service connection error");
      }
    };
    
    if (mapInitialized) {
      mockWebSocketConnection();
    }
    
    return () => {
      // Cleanup
    };
  }, [mapInitialized]);

  useEffect(() => {
    if (!mapRef.current || !mapInitialized) return;
    
    console.log("Updating worker locations on map:", Object.keys(workerLocations).length);
    
    // Update markers for worker locations
    Object.values(workerLocations).forEach((location) => {
      const { workerId, name, latitude, longitude } = location;
      
      if (markersRef.current[workerId]) {
        markersRef.current[workerId].setLngLat([longitude, latitude]);
      } else {
        const popup = new mapboxgl.Popup({ offset: 12 }).setHTML(
          `<div class="p-2">
            <strong>${name}</strong>
            <br>Worker ID: ${workerId}
            <br>Lat: ${latitude.toFixed(6)}
            <br>Long: ${longitude.toFixed(6)}
          </div>`
        );
        
        const marker = new mapboxgl.Marker({ color: "#8B5CF6" })
          .setLngLat([longitude, latitude])
          .setPopup(popup)
          .addTo(mapRef.current);
          
        markersRef.current[workerId] = marker;
        
        // Add click handler to marker element
        const markerElement = marker.getElement();
        markerElement.addEventListener('click', () => {
          const worker = workers.find(w => w.id === workerId);
          if (worker) {
            setSelectedWorker(worker);
            setShowWorkerDialog(true);
          }
        });
      }
    });

    if (Object.keys(workerLocations).length === 1) {
      const location = Object.values(workerLocations)[0];
      mapRef.current.flyTo({
        center: [location.longitude, location.latitude],
        zoom: 12,
        speed: 1.5
      });
    }
    
    // Update zones on map
    if (showZones) {
      displayGeoZones();
    } else {
      hideGeoZones();
    }
    
    if (showHistory) {
      displayHistoryPaths();
    }
  }, [workerLocations, showHistory, showZones, mapInitialized, workers]);

  // Check for unread alerts periodically
  useEffect(() => {
    const checkAlerts = () => {
      const unread = geoAlertService.getUnreadAlerts().length;
      setUnreadAlerts(unread);
    };
    
    // Initial check
    checkAlerts();
    
    // Set up interval
    const interval = setInterval(checkAlerts, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchWorkers = async () => {
    try {
      console.log("Fetching workers");
      const { data: workerData, error } = await supabase.from("workers").select("*");
      
      if (error || !workerData) {
        console.log("Error fetching from Supabase, using local storage");
        const localWorkers = getAllWorkersFromStorage();
        setWorkers(localWorkers);
      } else {
        console.log(`Loaded ${workerData.length} workers from Supabase`);
        setWorkers(workerData);
        
        // Also load all existing locations
        const existingLocations = mongoDbService.getAllWorkerLocations();
        if (Object.keys(existingLocations).length > 0) {
          console.log(`Loaded ${Object.keys(existingLocations).length} existing locations`);
          setWorkerLocations(existingLocations);
        }
      }
    } catch (error) {
      console.error("Error fetching workers:", error);
      toast.error("Failed to fetch workers");
    }
  };

  const updateWorkerLocation = (location: WorkerLocation) => {
    mongoDbService.updateWorkerLocation(location)
      .then(() => {
        setWorkerLocations(prev => ({
          ...prev,
          [location.workerId]: location
        }));
        
        // Check for geofence events
        const worker = workers.find(w => w.id === location.workerId);
        if (worker) {
          const alerts = geoAlertService.updateWorkerLocation(
            worker, 
            location.latitude, 
            location.longitude
          );
          
          // Update unread alerts count
          if (alerts.length > 0) {
            setUnreadAlerts(prev => prev + alerts.length);
          }
        }
      })
      .catch(error => {
        console.error("Failed to update worker location:", error);
      });
  };

  const displayHistoryPaths = () => {
    if (!mapRef.current) return;
    
    const map = mapRef.current;
    
    // Remove all existing layers and sources
    Object.keys(workerLocations).forEach(workerId => {
      const sourceId = `route-${workerId}`;
      const layerId = `route-layer-${workerId}`;
      
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    });

    // Get all location histories from MongoDB service
    const allHistories = mongoDbService.getAllLocationHistories();
    
    Object.entries(allHistories).forEach(([workerId, locations], index) => {
      if (locations.length < 2) return;
      
      const sourceId = `route-${workerId}`;
      const layerId = `route-layer-${workerId}`;
      
      const coordinates = locations.map(loc => [loc.longitude, loc.latitude]);
      
      const colors = ['#FF5733', '#33FF57', '#3357FF', '#F033FF', '#FF33A8'];
      const color = colors[index % colors.length];
      
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
          'line-color': color,
          'line-width': 3,
          'line-opacity': 0.7
        }
      });
    });
  };

  const displayGeoZones = () => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    
    // Clear previous zones
    hideGeoZones();
    
    // Get all zones
    const zones = geoAlertService.getAllGeoZones();
    
    // Add each zone to the map
    zones.forEach((zone, index) => {
      const zoneId = `zone-${zone.id}`;
      const zoneOutlineId = `zone-outline-${zone.id}`;
      
      // Zone colors based on type
      let fillColor;
      let outlineColor;
      
      switch (zone.type) {
        case 'work':
          fillColor = 'rgba(46, 204, 113, 0.2)';
          outlineColor = 'rgba(46, 204, 113, 0.8)';
          break;
        case 'restricted':
          fillColor = 'rgba(231, 76, 60, 0.2)';
          outlineColor = 'rgba(231, 76, 60, 0.8)';
          break;
        case 'safe':
          fillColor = 'rgba(52, 152, 219, 0.2)';
          outlineColor = 'rgba(52, 152, 219, 0.8)';
          break;
        default:
          fillColor = 'rgba(155, 89, 182, 0.2)';
          outlineColor = 'rgba(155, 89, 182, 0.8)';
      }
      
      // Create a circle representing the zone
      const center = [zone.center.longitude, zone.center.latitude];
      const radiusInKm = zone.radiusInMeters / 1000;
      
      // Create a source for the circle
      map.addSource(zoneId, {
        'type': 'geojson',
        'data': createGeoJSONCircle(center, radiusInKm)
      });
      
      // Add fill layer
      map.addLayer({
        'id': zoneId,
        'type': 'fill',
        'source': zoneId,
        'layout': {},
        'paint': {
          'fill-color': fillColor,
          'fill-opacity': 0.5
        }
      });
      
      // Add outline layer
      map.addLayer({
        'id': zoneOutlineId,
        'type': 'line',
        'source': zoneId,
        'layout': {},
        'paint': {
          'line-color': outlineColor,
          'line-width': 2
        }
      });
      
      // Add to tracking array
      zoneLayersRef.current.push(zoneId, zoneOutlineId);
      
      // Add zone label
      const labelId = `zone-label-${zone.id}`;
      
      map.addSource(labelId, {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'properties': {
            'description': zone.name
          },
          'geometry': {
            'type': 'Point',
            'coordinates': center
          }
        }
      });
      
      map.addLayer({
        'id': labelId,
        'type': 'symbol',
        'source': labelId,
        'layout': {
          'text-field': ['get', 'description'],
          'text-offset': [0, 0],
          'text-anchor': 'center',
          'text-size': 12
        },
        'paint': {
          'text-color': '#000000',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1
        }
      });
      
      zoneLayersRef.current.push(labelId);
    });
  };

  const hideGeoZones = () => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    
    // Remove all zone layers and sources
    zoneLayersRef.current.forEach(layerId => {
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(layerId)) map.removeSource(layerId);
    });
    
    zoneLayersRef.current = [];
  };

  // Create GeoJSON for a circle
  const createGeoJSONCircle = (center: number[], radiusInKm: number, points: number = 64) => {
    const coords = {
      latitude: center[1],
      longitude: center[0]
    };
    
    const km = radiusInKm;
    
    const ret = [];
    const distanceX = km / (111.320 * Math.cos((coords.latitude * Math.PI) / 180));
    const distanceY = km / 110.574;
    
    let theta, x, y;
    for (let i = 0; i < points; i++) {
      theta = (i / points) * (2 * Math.PI);
      x = distanceX * Math.cos(theta);
      y = distanceY * Math.sin(theta);
      
      ret.push([coords.longitude + x, coords.latitude + y]);
    }
    ret.push(ret[0]);
    
    return {
      'type': 'Feature' as const,
      'geometry': {
        'type': 'Polygon' as const,
        'coordinates': [ret]
      },
      'properties': {}
    };
  };

  const startMockLocationUpdates = () => {
    fetchWorkers().then(() => {
      const baseCoordinates = {
        latitude: 13.0827,
        longitude: 80.2707
      };
      
      workers.forEach((worker) => {
        // Check if worker already has a location
        const existingLocation = mongoDbService.getWorkerLocation(worker.id);
        
        if (!existingLocation) {
          const latitude = baseCoordinates.latitude + (Math.random() - 0.5) * 0.1;
          const longitude = baseCoordinates.longitude + (Math.random() - 0.5) * 0.1;
          
          const initialLocation = {
            workerId: worker.id,
            name: worker.name,
            latitude,
            longitude, 
            timestamp: Date.now()
          };
          
          updateWorkerLocation(initialLocation);
        } else {
          // Use existing location
          setWorkerLocations(prev => ({
            ...prev,
            [worker.id]: existingLocation
          }));
        }
      });
      
      const interval = setInterval(() => {
        if (!connected) {
          clearInterval(interval);
          return;
        }
        
        Object.values(workerLocations).forEach(location => {
          const newLocation = {
            ...location,
            latitude: location.latitude + (Math.random() - 0.5) * 0.005,
            longitude: location.longitude + (Math.random() - 0.5) * 0.005,
            timestamp: Date.now()
          };
          
          updateWorkerLocation(newLocation);
        });
      }, 3000);
      
      return () => clearInterval(interval);
    });
  };

  const toggleHistoryView = () => {
    setShowHistory(!showHistory);
  };

  const toggleZonesView = () => {
    setShowZones(!showZones);
  };

  const centerMap = () => {
    if (!mapRef.current || Object.keys(workerLocations).length === 0) return;
    
    const locations = Object.values(workerLocations);
    const totalLat = locations.reduce((sum, loc) => sum + loc.latitude, 0);
    const totalLng = locations.reduce((sum, loc) => sum + loc.longitude, 0);
    
    const avgLat = totalLat / locations.length;
    const avgLng = totalLng / locations.length;
    
    mapRef.current.flyTo({
      center: [avgLng, avgLat],
      zoom: 10,
      speed: 1
    });
  };

  const getAllWorkersFromStorage = (): MigrantWorker[] => {
    const workersStr = localStorage.getItem('workers');
    return workersStr ? JSON.parse(workersStr) : [];
  };
  
  const markAllAlertsAsRead = () => {
    const alerts = geoAlertService.getUnreadAlerts();
    alerts.forEach(alert => {
      geoAlertService.markAlertAsRead(alert.id);
    });
    setUnreadAlerts(0);
    toast.success("All alerts marked as read");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Worker Tracking</h2>
          <p className="text-sm text-muted-foreground">
            {connected ? 
              `Live tracking active: ${Object.keys(workerLocations).length} workers` : 
              'Connecting to tracking service...'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="relative hover-scale">
                <Bell className="h-4 w-4 mr-1" />
                Alerts
                {unreadAlerts > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {unreadAlerts}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={isMobile ? "w-[300px]" : "w-[350px]"}>
              <DropdownMenuLabel className="flex justify-between items-center">
                <span>Recent Alerts</span>
                {unreadAlerts > 0 && (
                  <Button variant="ghost" size="sm" className="h-7 text-xs hover-scale" onClick={markAllAlertsAsRead}>
                    Mark all as read
                  </Button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {geoAlertService.getAllAlerts().slice(0, 5).map(alert => (
                <DropdownMenuItem key={alert.id} className="p-3 cursor-default">
                  <div className="flex gap-3 w-full">
                    <div className="mt-0.5">
                      {alert.type === 'zone_entry' && <MapPin className="h-5 w-5 text-green-500" />}
                      {alert.type === 'zone_exit' && <MapPin className="h-5 w-5 text-yellow-500" />}
                      {alert.type === 'sos' && <AlertCircle className="h-5 w-5 text-red-500" />}
                      {alert.type === 'inactivity' && <AlertTriangle className="h-5 w-5 text-amber-500" />}
                    </div>
                    <div className="space-y-1 w-full">
                      <p className={`text-sm font-medium ${!alert.read ? "text-primary" : ""}`}>{alert.message}</p>
                      <div className="flex justify-between items-center w-full">
                        <p className="text-xs text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </p>
                        {!alert.read && <Badge variant="outline" className="h-5 text-[10px]">New</Badge>}
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
              {geoAlertService.getAllAlerts().length === 0 && (
                <div className="p-3 text-center text-sm text-muted-foreground">
                  No alerts yet
                </div>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center" asChild>
                <Button variant="ghost" size="sm" className="w-full hover-scale">
                  View All Alerts
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={toggleZonesView}
            className="hover-scale"
          >
            {showZones ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
            {showZones ? 'Hide Zones' : 'Show Zones'}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={toggleHistoryView}
            className="hover-scale"
          >
            <Layers className="h-4 w-4 mr-1" />
            {showHistory ? 'Hide History' : 'Show History'}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={centerMap}
            className="hover-scale"
          >
            <Map className="h-4 w-4 mr-1" />
            Center Map
          </Button>
        </div>
      </div>
      
      <div 
        ref={mapContainer} 
        className="w-full h-[60vh] md:h-[70vh] lg:h-[75vh] rounded-lg border shadow-lg relative overflow-hidden transition-all duration-300"
      >
        {(!mapInitialized || !connected) && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center space-y-4">
              <LoadingSpinner size="lg" />
              <p className="text-lg font-medium text-primary animate-pulse">
                {!mapInitialized ? 'Initializing map...' : 'Connecting to tracking service...'}
              </p>
            </div>
          </div>
        )}
      </div>
      
      {selectedWorker && (
        <WorkerLocationDialog
          worker={selectedWorker}
          open={showWorkerDialog}
          onOpenChange={setShowWorkerDialog}
        />
      )}
    </div>
  );
}
