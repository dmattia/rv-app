import { AppSyncResolverEvent } from "aws-lambda";
import {
  UpdateDeviceLocationMutationVariables,
  UpdateDeviceLocationOutput,
} from "@rv-app/generated-schema";
import {
  LocationClient,
  BatchUpdateDevicePositionCommand,
} from "@aws-sdk/client-location";
import { LambdaHandler, createHandler } from "@rv-app/backend/src/types";

interface Config {
  locationClient: LocationClient;
}

export const updateDeviceLocationHandler: LambdaHandler<
  AppSyncResolverEvent<UpdateDeviceLocationMutationVariables>,
  Config,
  UpdateDeviceLocationOutput
> = async (event, context, { locationClient }) => {
  const { accuracy, latitude, longitude, deviceName } = event.arguments.input;

  await locationClient.send(
    new BatchUpdateDevicePositionCommand({
      TrackerName: process.env.TRACKER_NAME,
      Updates: [
        {
          Accuracy: { Horizontal: accuracy ?? undefined },
          DeviceId: deviceName ?? undefined,
          Position: [longitude, latitude],
          SampleTime: new Date(),
        },
      ],
    })
  );

  return {
    success: true,
  };
};

export const updateDeviceLocation = createHandler(
  updateDeviceLocationHandler,
  () => ({
    locationClient: new LocationClient({}),
  })
);
