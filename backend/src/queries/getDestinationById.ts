import { Context, AppSyncResolverEvent } from "aws-lambda";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import type { Scalars, Destination } from "@rv-app/generated-schema";

const client = new DynamoDBClient({});

export async function getDestinationById(
  event: AppSyncResolverEvent<{ id: Scalars["ID"] }>,
  context: Context
): Promise<Destination> {
  const { Item } = await client.send(
    new GetItemCommand({
      TableName: process.env.DESTINATIONS_TABLE,
      Key: { id: { S: event.arguments.id } },
    })
  );

  if (!Item?.id?.S) {
    throw Error("Item could not be found");
  }

  return {
    id: Item.id.S,
    destinationName: Item.destinationName.S,
    latitude: Item.latitude.S,
    longitude: Item.longitude.S,
  };
}
