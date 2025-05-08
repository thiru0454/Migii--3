
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/utils/supabaseClient";

const MAPBOX_TOKEN = "pk.eyJ1IjoiZGVtb3VzZXIiLCJhIjoiY2xhd2lioTJzMGkwbzN5bXBwZjE2bnF1cCJ9.8rCpA8p9no3k4YrPQjd5dg"; // Demo public token, replace with your own if desired.

export function WorkersMap() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;
    let map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [80.2707, 13.0827], // Chennai default
      zoom: 7,
    });
    mapRef.current = map;

    // Fetch workers from Supabase and add markers
    let isMounted = true;
    async function loadMarkers() {
      let { data: workers } = await supabase.from("workers").select("id,name,skill,originState,latitude,longitude,phone");
      if (!workers) return;
      workers.forEach((worker: any) => {
        if (!worker.latitude || !worker.longitude) return;
        const popup = new mapboxgl.Popup({ offset: 12 }).setHTML(
          `<div>
            <strong>${worker.name}</strong>
            <br>Skill: ${worker.skill}
            <br>Phone: ${worker.phone}
            <br>Origin: ${worker.originState}
          </div>`
        );
        new mapboxgl.Marker({ color: "#8B5CF6" })
          .setLngLat([worker.longitude, worker.latitude])
          .setPopup(popup)
          .addTo(map);
      });
    }
    loadMarkers();

    return () => {
      isMounted = false;
      map.remove();
    };
  }, []);
  return (
    <div>
      <div className="text-lg font-semibold mb-2">Live Worker Locations</div>
      <div ref={mapContainer} className="w-full h-96 rounded-lg border shadow" />
    </div>
  );
}
