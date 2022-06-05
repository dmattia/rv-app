import { Button, LocationSearch, MapView } from "@aws-amplify/ui-react";
import { useRef, useCallback } from "react";
import type { MapRef } from "react-map-gl";

export function MapComponent() {
  const mapRef = useRef<MapRef>();

  const flyHome = useCallback(() => {
    mapRef.current?.flyTo({ center: [-93.201399, 44.812432], zoom: 15 });
  }, []);

  return (
    <>
      <MapView
        initialViewState={{
          latitude: 37.8,
          longitude: -122.4,
          zoom: 14,
        }}
        ref={mapRef as any}
        style={{ width: "600px", height: "300px" }}
      >
        <LocationSearch />
      </MapView>
      <Button onClick={flyHome}>Fly Home</Button>
    </>
  );
}
