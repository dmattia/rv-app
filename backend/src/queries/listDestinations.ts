import { AppSyncResolverEvent } from "aws-lambda";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import type { Destination } from "@rv-app/generated-schema";
import { LambdaHandler, createHandler } from "@rv-app/backend/src/types";
import { convertDestinationRowToGraphqlType } from "../utils/convertDestinationRowToGraphqlType";

interface Config {
  dynamoClient: DynamoDBClient;
}

export const listDestinationsHandler: LambdaHandler<
  AppSyncResolverEvent<void>,
  Config,
  Destination[]
> = async (event, context, { dynamoClient }) => {
  // TODO: Should Paginate
  const { Items } = await dynamoClient.send(
    new ScanCommand({
      TableName: process.env.DESTINATIONS_TABLE,
    })
  );

  return Items?.map(convertDestinationRowToGraphqlType) ?? [];
};

export const listDestinations = createHandler(listDestinationsHandler, () => ({
  dynamoClient: new DynamoDBClient({}),
}));
