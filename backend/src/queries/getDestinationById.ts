import { Context, AppSyncResolverEvent } from "aws-lambda";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import type {
  QueryGetDestinationByIdArgs,
  Destination,
} from "@rv-app/generated-schema";

const client = new DynamoDBClient({});

export async function getDestinationById(
  event: AppSyncResolverEvent<QueryGetDestinationByIdArgs>,
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
    locationInformation: {
      address: "TEST",
      latitude: Item.latitude.N ? parseFloat(Item.latitude.N) : undefined,
      longitude: Item.longitude.N ? parseFloat(Item.longitude.N) : undefined,
    },
  };
}
