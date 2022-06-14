import { AppSyncResolverEvent } from "aws-lambda";
import { DynamoDBClient, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import type {
  DeleteDestinationMutationVariables,
  Scalars,
} from "@rv-app/generated-schema";
import { LambdaHandler, createHandler } from "@rv-app/backend/src/types";

interface Config {
  dynamoClient: DynamoDBClient;
}

export const deleteDestinationHandler: LambdaHandler<
  AppSyncResolverEvent<DeleteDestinationMutationVariables>,
  Config,
  Scalars["ID"]
> = async (event, context, { dynamoClient }) => {
  await dynamoClient.send(
    new DeleteItemCommand({
      TableName: process.env.DESTINATIONS_TABLE,
      Key: { id: { S: event.arguments.id } },
    })
  );

  return event.arguments.id;
};

export const deleteDestination = createHandler(
  deleteDestinationHandler,
  () => ({
    dynamoClient: new DynamoDBClient({}),
  })
);
