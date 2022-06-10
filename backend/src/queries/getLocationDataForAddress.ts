import { AppSyncResolverEvent } from "aws-lambda";
import {
  LocationClient,
  SearchPlaceIndexForTextCommand,
} from "@aws-sdk/client-location";
import {
  LocationInformation,
  QueryGetLocationDataForAddressArgs,
} from "@rv-app/generated-schema";
import { LambdaHandler, createHandler } from "@rv-app/backend/src/types";

interface Config {
  locationClient: LocationClient;
}

export const getLocationDataForAddressHandler: LambdaHandler<
  AppSyncResolverEvent<QueryGetLocationDataForAddressArgs>,
  Config,
  LocationInformation
> = async (event, context, { locationClient }) => {
  const { Results } = await locationClient.send(
    new SearchPlaceIndexForTextCommand({
      IndexName: process.env.INDEX_NAME,
      Text: event.arguments.query,
      MaxResults: 1,
    })
  );

  if (Results?.length !== 1 || !Results[0].Place) {
    throw Error("Failed to find result for exact address");
  }
  const {
    Label,
    Geometry,
    Municipality,
    SubRegion,
    Region,
    Country,
    PostalCode,
    TimeZone,
  } = Results[0].Place;

  return {
    address: Label ?? event.arguments.query,
    longitude: Geometry?.Point?.[0],
    latitude: Geometry?.Point?.[1],
    municipality: Municipality,
    subRegion: SubRegion,
    regionName: Region,
    country: Country,
    postalCode: PostalCode,
    timeZone: TimeZone
      ? {
          name: TimeZone.Name,
          offset: TimeZone.Offset,
        }
      : undefined,
  };
};

export const getLocationDataForAddress = createHandler(
  getLocationDataForAddressHandler,
  () => ({
    locationClient: new LocationClient({}),
  })
);
