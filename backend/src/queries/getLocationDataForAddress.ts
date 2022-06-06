import { Context, AppSyncResolverEvent } from "aws-lambda";
import {
  LocationClient,
  SearchPlaceIndexForTextCommand,
} from "@aws-sdk/client-location";
import {
  LocationInformation,
  QueryGetLocationDataForAddressArgs,
} from "@rv-app/generated-schema";

const client = new LocationClient({});

export async function getLocationDataForAddress(
  event: AppSyncResolverEvent<QueryGetLocationDataForAddressArgs>,
  context: Context
): Promise<LocationInformation> {
  const { Results } = await client.send(
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
    region: Region,
    country: Country,
    postalCode: PostalCode,
    timeZone: TimeZone
      ? {
          name: TimeZone.Name,
          offset: TimeZone.Offset,
        }
      : undefined,
  };
}
