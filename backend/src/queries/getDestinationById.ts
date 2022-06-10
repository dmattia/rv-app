import { AppSyncResolverEvent } from "aws-lambda";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import type {
  QueryGetDestinationByIdArgs,
  Destination,
} from "@rv-app/generated-schema";
import { LambdaHandler, createHandler } from "@rv-app/backend/src/types";

interface Config {
  dynamoClient: DynamoDBClient;
}

export const getDestinationByIdHandler: LambdaHandler<
  AppSyncResolverEvent<QueryGetDestinationByIdArgs>,
  Config,
  Destination
> = async (event, context, { dynamoClient }) => {
  const { Item } = await dynamoClient.send(
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
};

export const getDestinationById = createHandler(
  getDestinationByIdHandler,
  () => ({
    dynamoClient: new DynamoDBClient({}),
  })
);
