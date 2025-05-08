import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Navigation, AlertTriangle } from 'lucide-react-native';
import { fetchWorkerLocations } from '../services/api';

interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  status: 'active' | 'inactive' | 'alert';
}

export default function LocationScreen() {
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const { data: workerLocations, isLoading } = useQuery({
    queryKey: ['workerLocations'],
    queryFn: fetchWorkerLocations
  });

  useEffect(() => {
    // Get user's current location
    Geolocation.getCurrentPosition(
      position => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      error => console.log(error),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  }, []);

  const getMarkerColor = (status: Location['status']) => {
    switch (status) {
      case 'active':
        return '#4F46E5'; // Indigo
      case 'inactive':
        return '#6B7280'; // Gray
      case 'alert':
        return '#EF4444'; // Red
      default:
        return '#4F46E5';
    }
  };

  if (isLoading || !userLocation) {
    return (
      <View className="flex-1 items-center justify-center">
        <View className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></View>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Map */}
      <MapView
        provider={PROVIDER_GOOGLE}
        className="flex-1"
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {/* User Location */}
        <Marker
          coordinate={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          }}
          title="Your Location"
        >
          <View className="w-8 h-8 bg-indigo-500 rounded-full border-2 border-white" />
        </Marker>

        {/* Worker Locations */}
        {workerLocations?.map((worker: Location) => (
          <Marker
            key={worker.id}
            coordinate={{
              latitude: worker.latitude,
              longitude: worker.longitude,
            }}
            title={worker.name}
          >
            <View className="items-center">
              <View 
                className="w-6 h-6 rounded-full border-2 border-white"
                style={{ backgroundColor: getMarkerColor(worker.status) }}
              />
              <Text className="text-xs font-medium mt-1">{worker.name}</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Controls */}
      <View className="absolute bottom-6 left-4 right-4">
        <View className="flex-row justify-between">
          <TouchableOpacity className="bg-white p-4 rounded-full shadow-lg">
            <Navigation size={24} color="#4F46E5" />
          </TouchableOpacity>
          <TouchableOpacity className="bg-white p-4 rounded-full shadow-lg">
            <MapPin size={24} color="#4F46E5" />
          </TouchableOpacity>
          <TouchableOpacity className="bg-white p-4 rounded-full shadow-lg">
            <AlertTriangle size={24} color="#4F46E5" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
} 