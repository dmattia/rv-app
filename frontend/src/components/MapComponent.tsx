import { Button, LocationSearch } from "@aws-amplify/ui-react";
import { useCallback, useState } from "react";
import { MapRef, FullscreenControl, GeolocateControl } from "react-map-gl";
import { CustomMapView } from "./CustomMapView";
import { DestinationMarker } from "./DestinationMarker";
import { useListDestinationsQuery } from "@rv-app/generated-schema";

export function MapComponent() {
  const { data, loading, error } = useListDestinationsQuery();
  const [map, setMap] = useState<MapRef | undefined>(undefined);

  const mapRef = useCallback((map: MapRef | null) => {
    if (map) {
      setMap(map);
    }
  }, []);

  const flyHome = useCallback(() => {
    map?.flyTo({ center: [-93.201399, 44.812432], zoom: 15 });
  }, [map]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error || !data) {
    console.error(error);
    return <p>An error occurred</p>;
  }

  return (
    <>
      <CustomMapView
        initialViewState={{
          latitude: 37.8,
          longitude: -122.4,
          zoom: 5,
        }}
        ref={mapRef}
      >
        <LocationSearch />
        <FullscreenControl />
        <GeolocateControl />
        {(data.listDestinations ?? []).map((destination) => (
          <DestinationMarker key={destination.id} destination={destination} />
        ))}
      </CustomMapView>
      <Button onClick={flyHome}>Fly Home</Button>
    </>
  );
}
