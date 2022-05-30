import Amplify from "aws-amplify";
import {
  Authenticator,
  Badge,
  Button,
  LocationSearch,
  MapView,
} from "@aws-amplify/ui-react";
import { useRef, useCallback } from "react";
import type { MapRef } from "react-map-gl";

import "@aws-amplify/ui-react/styles.css";

Amplify.configure({
  Auth: {
    identityPoolId: process.env.RV_APP_IDENTITY_POOL_ID,
    region: process.env.RV_APP_AWS_REGION,
    userPoolId: process.env.RV_APP_USER_POOL_ID,
    userPoolWebClientId: process.env.RV_APP_COGNITO_CLIENT_ID,
    mandatorySignIn: true,
  },
  // See: https://docs.amplify.aws/lib/geo/existing-resources/q/platform/js/#authorization-permissions
  geo: {
    AmazonLocationService: {
      maps: {
        items: {
          [process.env.RV_APP_MAP_NAME as string]: {
            style: "VectorEsriStreets",
          },
        },
        default: process.env.RV_APP_MAP_NAME,
      },
      region: process.env.RV_APP_AWS_REGION,
    },
  },
});

function App() {
  const mapRef = useRef<MapRef>();

  const flyHome = useCallback(() => {
    mapRef.current?.flyTo({ center: [-93.201399, 44.812432], zoom: 15 });
  }, []);

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div>
          <p>Bri and David's RV Website</p>

          <Badge>{user?.username}</Badge>
          <Button onClick={signOut}>Log Out</Button>

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
        </div>
      )}
    </Authenticator>
  );
}

export default App;
