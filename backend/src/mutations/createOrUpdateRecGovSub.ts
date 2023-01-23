import { AppSyncResolverEvent } from "aws-lambda";
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import {
  CreateOrUpdateRecGovSubMutationVariables,
  RecreationGovSubscription,
} from "@rv-app/generated-schema";
import { v4 } from "uuid";
import { getEntries } from "@transcend-io/type-utils";
import { LambdaHandler, createHandler } from "@rv-app/backend/src/types";

interface Config {
  dynamoClient: DynamoDBClient;
}

export const createOrUpdateRecGovSubHandler: LambdaHandler<
  AppSyncResolverEvent<CreateOrUpdateRecGovSubMutationVariables>,
  Config,
  RecreationGovSubscription
> = async (event, context, { dynamoClient }) => {
  const {
    id: rawId,
    campsiteId,
    campsiteName,
    datesToWatch,
  } = event.arguments.input;
  const id = rawId ?? v4();

  const inputAttributes = getEntries(event.arguments.input).filter(
    ([key]) => key !== "id"
  );
  const { Attributes } = await dynamoClient.send(
    new UpdateItemCommand({
      TableName: process.env.RECREATION_GOV_TABLE,
      Key: { id: { S: id } },
      UpdateExpression: `SET ${inputAttributes
        .map(([name, val]) =>
          val != null ? `${name as string} = :${name as string}` : ""
        )
        .join(",")}`,
      ExpressionAttributeValues: Object.fromEntries(
        inputAttributes.flatMap(([name, val]) =>
          val != null
            ? [
                [
                  `:${name as string}`,
                  typeof val === "string" ? { S: val } : { SS: val },
                ],
              ]
            : []
        )
      ),
    })
  );

  return {
    id,
    campsiteId: Attributes?.campsiteId?.S ?? campsiteId,
    campsiteName: Attributes?.campsiteName?.S ?? campsiteName,
    datesToWatch: Attributes?.datesToWatch?.SS ?? datesToWatch,
  };
};

export const createOrUpdateRecGovSub = createHandler(
  createOrUpdateRecGovSubHandler,
  () => ({
    dynamoClient: new DynamoDBClient({}),
  })
);
