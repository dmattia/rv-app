import type { GetItemOutput } from "@aws-sdk/client-dynamodb";
import {
  Destination,
  DestinationCategory,
  Priority,
} from "@rv-app/generated-schema";

export function convertDestinationRowToGraphqlType(
  row: GetItemOutput["Item"]
): Destination {
  if (!row) {
    throw Error("Found invalid destination");
  }

  const {
    id,
    category,
    priority,
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
    category: category?.S
      ? (category?.S as DestinationCategory)
      : DestinationCategory.Other,
    priority: priority?.S ? (priority?.S as Priority) : undefined,
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
