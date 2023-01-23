import { AppSyncResolverEvent } from "aws-lambda";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import type {
  QueryGetDestinationByIdArgs,
  Destination,
} from "@rv-app/generated-schema";
import { LambdaHandler, createHandler } from "@rv-app/backend/src/types";
import { convertDestinationRowToGraphqlType } from "@rv-app/backend/src/utils/convertDestinationRowToGraphqlType";

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

  return convertDestinationRowToGraphqlType(Item);
};

export const getDestinationById = createHandler(
  getDestinationByIdHandler,
  () => ({
    dynamoClient: new DynamoDBClient({}),
  })
);
