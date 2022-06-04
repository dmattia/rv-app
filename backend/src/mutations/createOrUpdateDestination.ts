import { Context, AppSyncResolverEvent } from "aws-lambda";
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import type {
  CreateOrUpdateDestinationInput,
  Destination,
} from "@rv-app/schema";
import { v4 } from "uuid";

const client = new DynamoDBClient({});

export async function createOrUpdateDestination(
  event: AppSyncResolverEvent<{ input: CreateOrUpdateDestinationInput }>,
  context: Context
): Promise<Destination> {
  const id = event.arguments.input.id ?? v4();
  const { Attributes } = await client.send(
    new UpdateItemCommand({
      TableName: process.env.DESTINATIONS_TABLE,
      Key: { id: { S: id } },
      UpdateExpression: `
            SET destinationName = :destinationName,
                latitude = :latitude,
                longitude = :longitude
          `,
      ExpressionAttributeValues: {
        ":destinationName": { S: event.arguments.input.destinationName },
        ":latitude": { S: event.arguments.input.latitude },
        ":longitude": { S: event.arguments.input.longitude },
      },
    })
  );

  return {
    id,
    destinationName:
      Attributes?.destinationName?.S ?? event.arguments.input.destinationName,
    latitude: Attributes?.latitude?.S ?? event.arguments.input.latitude,
    longitude: Attributes?.longitude?.S ?? event.arguments.input.longitude,
  };
}
