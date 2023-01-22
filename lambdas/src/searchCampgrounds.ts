import { AppSyncResolverEvent } from "aws-lambda";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import type { Destination } from "@rv-app/generated-schema";
import { LambdaHandler, createHandler } from "@rv-app/lambdas/src/types";
import { convertDbRowToGraphqlType } from "@rv-app/lambdas/src/utils/convertDbRowToGraphqlType";

interface Config {
  dynamoClient: DynamoDBClient;
}

export const searchCampgroundsHandler: LambdaHandler<
  AppSyncResolverEvent<void>,
  Config,
  Destination[]
> = async (event, context, { dynamoClient }) => {
  console.log('test');
};

export const searchCampgrounds = createHandler(searchCampgroundsHandler, () => ({
  dynamoClient: new DynamoDBClient({}),
}));
