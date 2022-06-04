import Amplify, { API } from "aws-amplify";
import {
  Authenticator,
  Badge,
  Button,
  LocationSearch,
  MapView,
  Alert,
} from "@aws-amplify/ui-react";
import { useRef, useState, useCallback } from "react";
import type { MapRef } from "react-map-gl";
import { useForm, SubmitHandler } from "react-hook-form";
import type { Destination } from "@rv-app/schema";

import "@aws-amplify/ui-react/styles.css";

type Inputs = {
  name: string;
  latitude: string;
  longitude: string;
};

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
      search_indices: {
        items: [process.env.RV_APP_SEARCH_INDEX],
        default: process.env.RV_APP_SEARCH_INDEX,
      },
      region: process.env.RV_APP_AWS_REGION,
    },
  },
  aws_appsync_graphqlEndpoint: process.env.RV_APP_API_ENDPOINT,
  aws_appsync_region: process.env.RV_APP_AWS_REGION,
  aws_appsync_authenticationType: "AMAZON_COGNITO_USER_POOLS",
});

function App() {
  const mapRef = useRef<MapRef>();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const [newDestination, setDestination] = useState<Destination | undefined>();
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const {
      data: { createOrUpdateDestination },
    } = await API.graphql({
      query: `
        mutation MyMutation($input: CreateOrUpdateDestinationInput!) {
          createOrUpdateDestination(input: $input) {
            id
            destinationName
            latitude
            longitude
          }
        }`.trim(),
      variables: {
        input: {
          latitude: data.latitude,
          longitude: data.longitude,
          destinationName: data.name,
        },
      },
      authMode: "AMAZON_COGNITO_USER_POOLS",
    });
    setDestination(createOrUpdateDestination);
  };

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

          <h2>Create a destination</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <input
              {...register("name", { required: true })}
              placeholder="Destination name"
            />
            {errors.name && <span>This field is required</span>}
            <input
              {...register("latitude", { required: true })}
              placeholder="latitude"
            />
            {errors.latitude && <span>This field is required</span>}
            <input
              {...register("longitude", { required: true })}
              placeholder="longitude"
            />
            {errors.longitude && <span>This field is required</span>}

            <input type="submit" />
          </form>
          {newDestination && (
            <Alert
              isDismissible={true}
              hasIcon={true}
              variation="success"
              heading="Success!"
            >
              Created a new destination with ID: {newDestination.id}
            </Alert>
          )}
        </div>
      )}
    </Authenticator>
  );
}

export default App;
