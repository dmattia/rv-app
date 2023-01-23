import { AppSyncResolverEvent } from "aws-lambda";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import type { RecreationGovSubscription } from "@rv-app/generated-schema";
import { LambdaHandler, createHandler } from "@rv-app/backend/src/types";
import { convertSubscriptionRowToGraphqlType } from "@rv-app/backend/src/utils/convertSubscriptionRowToGraphqlType";

interface Config {
  dynamoClient: DynamoDBClient;
}

export const listRecreationGovSubsHandler: LambdaHandler<
  AppSyncResolverEvent<void>,
  Config,
  RecreationGovSubscription[]
> = async (event, context, { dynamoClient }) => {
  // TODO: Should Paginate
  const { Items } = await dynamoClient.send(
    new ScanCommand({
      TableName: process.env.RECREATION_GOV_TABLE,
    })
  );

  return Items?.map(convertSubscriptionRowToGraphqlType) ?? [];
};

export const listRecreationGovSubs = createHandler(
  listRecreationGovSubsHandler,
  () => ({
    dynamoClient: new DynamoDBClient({}),
  })
);
