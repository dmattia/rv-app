import { Context, AppSyncResolverEvent } from "aws-lambda";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import type { Destination } from "@rv-app/generated-schema";

interface ListDestinationConfig {
  dynamoClient: DynamoDBClient;
}

export type LambdaHandler<TEvent, TConfig, TResult> = (
  event: TEvent,
  context: Context,
  config: TConfig
) => Promise<TResult>;

export const listDestinationsHandler: LambdaHandler<
  AppSyncResolverEvent<void>,
  ListDestinationConfig,
  Destination[]
> = async (event, context, { dynamoClient }) => {
  // TODO: Should Paginate
  const { Items } = await dynamoClient.send(
    new ScanCommand({
      TableName: process.env.DESTINATIONS_TABLE,
    })
  );

  return (
    Items?.map(
      ({
        id,
        destinationName,
        latitude,
        longitude,
        municipality,
        subRegion,
        regionName,
        postalCode,
        timeZoneName,
        timeZoneOffset,
      }) => {
        if (!id.S) {
          throw Error("Found invalid destination");
        }

        return {
          id: id?.S,
          destinationName: destinationName?.S,
          locationInformation: {
            latitude: latitude?.N ? parseFloat(latitude?.N) : undefined,
            longitude: longitude?.N ? parseFloat(longitude?.N) : undefined,
            municipality: municipality?.S,
            subRegion: subRegion?.S,
            regionName: regionName?.S,
            postalCode: postalCode?.S,
            timeZone: {
              offset: timeZoneOffset?.N
                ? parseInt(timeZoneOffset?.N, 10)
                : undefined,
              name: timeZoneName?.S,
            },
          },
        };
      }
    ) ?? []
  );
};

export const listDestinations = (
  event: AppSyncResolverEvent<void>,
  context: Context
) =>
  listDestinationsHandler(event, context, {
    dynamoClient: new DynamoDBClient({}),
  });
