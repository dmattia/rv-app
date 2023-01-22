import { AppSyncResolverEvent } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { LambdaHandler, createHandler } from "@rv-app/lambdas/src/types";

interface Config {
  dynamoClient: DynamoDBClient;
}

export const searchCampgroundsHandler: LambdaHandler<
  AppSyncResolverEvent<void>,
  Config,
  void
> = async (event, context, { dynamoClient }) => {
  console.log("test");
};

export const searchCampgrounds = createHandler(
  searchCampgroundsHandler,
  () => ({
    dynamoClient: new DynamoDBClient({}),
  })
);
