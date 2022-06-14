import type { GetItemOutput } from "@aws-sdk/client-dynamodb";
import type { Destination } from "@rv-app/generated-schema";

export function convertDbRowToGraphqlType(
  row: GetItemOutput["Item"]
): Destination {
  if (!row) {
    throw Error("Found invalid destination");
  }

  const {
    id,
    destinationName,
    address,
    latitude,
    longitude,
    municipality,
    subRegion,
    regionName,
    postalCode,
    timeZoneName,
    timeZoneOffset,
  } = row;

  if (!id?.S) {
    throw Error("Could not find ID of row");
  }

  return {
    id: id.S,
    destinationName: destinationName?.S,
    locationInformation: {
      address: address?.S,
      latitude: latitude?.N ? parseFloat(latitude?.N) : undefined,
      longitude: longitude?.N ? parseFloat(longitude?.N) : undefined,
      municipality: municipality?.S,
      subRegion: subRegion?.S,
      regionName: regionName?.S,
      postalCode: postalCode?.S,
      timeZone: {
        offset: timeZoneOffset?.N ? parseInt(timeZoneOffset?.N, 10) : undefined,
        name: timeZoneName?.S,
      },
    },
  };
}
