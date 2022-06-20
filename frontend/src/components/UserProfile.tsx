import { Badge, useAuthenticator } from "@aws-amplify/ui-react";
import { Button, Loading } from "@nextui-org/react";
import { useUpdateDeviceLocationMutation } from "@rv-app/generated-schema";

export function UserProfile() {
  const { user, signOut } = useAuthenticator((context) => [context.user]);

  const [updateDeviceLocation, updateDeviceLocationResult] =
    useUpdateDeviceLocationMutation();

  const updateLocation = () => {
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude, accuracy } }) => {
        updateDeviceLocation({
          variables: {
            input: {
              accuracy,
              latitude,
              longitude,
              deviceName: "Rv",
            },
          },
        });
      }
    );
  };

  if (updateDeviceLocationResult.loading) {
    return <Loading />;
  }

  return (
    <>
      <span>
        Logged in Username: <Badge>{user?.username}</Badge>
      </span>
      <Button
        className="m-2 w-24"
        color="primary"
        ghost
        auto
        onClick={updateLocation}
      >
        Update position
      </Button>
      {updateDeviceLocationResult.data?.updateDeviceLocation?.success ===
        true && <p>Successfully updated location</p>}
      {updateDeviceLocationResult.error && <p>Failed to update location</p>}
      <Button className="m-2 w-24" color="primary" ghost auto onClick={signOut}>
        Log Out
      </Button>
    </>
  );
}
