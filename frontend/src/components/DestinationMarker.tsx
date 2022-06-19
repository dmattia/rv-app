import { Marker, Popup, MapboxEvent } from "react-map-gl";
import { useState } from "react";
import { Heading, Text } from "@aws-amplify/ui-react";
import { Destination } from "@rv-app/generated-schema";

interface DestinationMarkerProps {
  destination?: Destination;
}

export function DestinationMarker({ destination }: DestinationMarkerProps) {
  const [showPopup, setShowPopup] = useState(false);

  const handleMarkerClick = ({ originalEvent }: MapboxEvent<MouseEvent>) => {
    originalEvent.stopPropagation();
    setShowPopup(true);
  };

  const latitude = destination?.locationInformation?.latitude;
  const longitude = destination?.locationInformation?.longitude;
  if (latitude == undefined || longitude == undefined) {
    return <></>;
  }

  return (
    <>
      <Marker
        onClick={handleMarkerClick}
        latitude={latitude}
        longitude={longitude}
      ></Marker>
      {showPopup && (
        <Popup
          latitude={latitude}
          longitude={longitude}
          offset={{ bottom: [0, -40] }}
          onClose={() => setShowPopup(false)}
        >
          <Heading level={4}>
            {destination?.destinationName ?? "Some destination"}
          </Heading>
          <Text>{destination?.locationInformation?.address}</Text>
          <Text>Priority: {destination?.priority ?? "not set"}</Text>
          <Text>Category: {destination?.category ?? "not set"}</Text>
        </Popup>
      )}
    </>
  );
}
