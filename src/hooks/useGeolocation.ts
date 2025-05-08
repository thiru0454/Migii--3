
import { useEffect, useState } from "react";

type Geolocation = {
  latitude: number | null;
  longitude: number | null;
  error?: string;
  loading: boolean;
};

export const useGeolocation = () => {
  const [state, setState] = useState<Geolocation>({
    latitude: null,
    longitude: null,
    loading: true,
    error: undefined,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((s) => ({
        ...s,
        loading: false,
        error: "Geolocation is not supported",
      }));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          loading: false,
        });
      },
      (err) =>
        setState((s) => ({
          ...s,
          loading: false,
          error: err.message,
        }))
    );
  }, []);
  return state;
};
