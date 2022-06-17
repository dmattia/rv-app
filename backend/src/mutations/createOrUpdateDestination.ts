import { AppSyncResolverEvent } from "aws-lambda";
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import {
  CreateOrUpdateDestinationMutationVariables,
  Destination,
  DestinationCategory,
} from "@rv-app/generated-schema";
import { v4 } from "uuid";
import { getEntries } from "@transcend-io/type-utils";
import { LambdaHandler, createHandler } from "@rv-app/backend/src/types";

interface Config {
  dynamoClient: DynamoDBClient;
}

export const createOrUpdateDestinationHandler: LambdaHandler<
  AppSyncResolverEvent<CreateOrUpdateDestinationMutationVariables>,
  Config,
  Destination
> = async (event, context, { dynamoClient }) => {
  const {
    id: rawId,
    destinationName,
    latitude,
    longitude,
    category,
    municipality,
    subRegion,
    regionName,
    country,
    postalCode,
    timeZoneName,
    timeZoneOffset,
  } = event.arguments.input;
  const id = rawId ?? v4();

  const inputAttributes = getEntries(event.arguments.input).filter(
    ([key]) => key !== "id"
  );
  const { Attributes } = await dynamoClient.send(
    new UpdateItemCommand({
      TableName: process.env.DESTINATIONS_TABLE,
      Key: { id: { S: id } },
      UpdateExpression: `SET ${inputAttributes
        .map(([name, val]) => (val != null ? `${name} = :${name}` : ""))
        .join(",")}`,
      ExpressionAttributeValues: Object.fromEntries(
        inputAttributes.flatMap(([name, val]) =>
          val != null
            ? [
                [
                  `:${name}`,
                  typeof val === "string" ? { S: val } : { N: val?.toString() },
                ],
              ]
            : []
        )
      ),
    })
  );

  const finalCategory = Attributes?.category?.S ?? category;
  const categoryEnum = finalCategory
    ? (finalCategory as DestinationCategory)
    : DestinationCategory.Other;
  return {
    id,
    destinationName: Attributes?.destinationName?.S ?? destinationName,
    category: categoryEnum,
    locationInformation: {
      latitude: Attributes?.latitude?.N
        ? parseFloat(Attributes?.latitude?.N)
        : latitude,
      longitude: Attributes?.longitude?.N
        ? parseFloat(Attributes?.longitude?.N)
        : longitude,
      municipality: Attributes?.municipality?.S ?? municipality,
      subRegion: Attributes?.subRegion?.S ?? subRegion,
      regionName: Attributes?.regionName?.S ?? regionName,
      country: Attributes?.country?.S ?? country,
      postalCode: Attributes?.postalCode?.S ?? postalCode,
      timeZone: {
        name: Attributes?.timeZoneName?.S ?? timeZoneName,
        offset: Attributes?.timeZoneOffset?.N
          ? parseInt(Attributes?.timeZoneOffset?.N)
          : timeZoneOffset,
      },
    },
  };
};

export const createOrUpdateDestination = createHandler(
  createOrUpdateDestinationHandler,
  () => ({
    dynamoClient: new DynamoDBClient({}),
  })
);
