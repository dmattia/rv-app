import { Context, AppSyncResolverEvent } from "aws-lambda";
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import type {
  CreateOrUpdateDestinationMutationVariables,
  Destination,
} from "@rv-app/generated-schema";
import { v4 } from "uuid";
import { getEntries } from "@transcend-io/type-utils";

const client = new DynamoDBClient({});

export async function createOrUpdateDestination(
  event: AppSyncResolverEvent<CreateOrUpdateDestinationMutationVariables>,
  context: Context
): Promise<Destination> {
  const {
    id: rawId,
    destinationName,
    latitude,
    longitude,
    municipality,
    subRegion,
    regionName,
    country,
    postalCode,
    timeZoneName,
    timeZoneOffset,
  } = event.arguments.input;
  const id = rawId ?? v4();

  const inputAttributes = getEntries(event.arguments.input).filter(
    ([key]) => key !== "id"
  );
  const { Attributes } = await client.send(
    new UpdateItemCommand({
      TableName: process.env.DESTINATIONS_TABLE,
      Key: { id: { S: id } },
      UpdateExpression: `SET ${inputAttributes
        .map(([name, val]) => (val !== undefined ? `${name} = :${name}` : ""))
        .join(",")}`,
      ExpressionAttributeValues: Object.fromEntries(
        inputAttributes.flatMap(([name, val]) =>
          val !== undefined
            ? [
                [
                  `:${name}`,
                  typeof val === "string" ? { S: val } : { N: val.toString() },
                ],
              ]
            : []
        )
      ),
    })
  );

  return {
    id,
    destinationName: Attributes?.destinationName?.S ?? destinationName,
    locationInformation: {
      latitude: Attributes?.latitude?.N
        ? parseFloat(Attributes?.latitude?.N)
        : latitude,
      longitude: Attributes?.longitude?.N
        ? parseFloat(Attributes?.longitude?.N)
        : longitude,
      municipality: Attributes?.municipality?.S ?? municipality,
      subRegion: Attributes?.subRegion?.S ?? subRegion,
      regionName: Attributes?.regionName?.S ?? regionName,
      country: Attributes?.country?.S ?? country,
      postalCode: Attributes?.postalCode?.S ?? postalCode,
      timeZone: {
        name: Attributes?.timeZoneName?.S ?? timeZoneName,
        offset: Attributes?.timeZoneOffset?.N
          ? parseInt(Attributes?.timeZoneOffset?.N)
          : timeZoneOffset,
      },
    },
  };
}
