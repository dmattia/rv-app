import { AppSyncResolverEvent } from "aws-lambda";
import { LambdaHandler, createHandler } from "@rv-app/lambdas/src/types";
import { findAvailableSitesForCampground, Month, MonthAndYear, sendMessage } from "./utils";
import {
  DynamoDBClient,
  ScanCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { SSMClient } from "@aws-sdk/client-ssm";
import { mapSeries } from "bluebird";

import { convertSubscriptionRowToGraphqlType } from "@rv-app/backend/src/utils/convertSubscriptionRowToGraphqlType";

import groupBy from "lodash/groupBy";

interface Config {
  dynamoClient: DynamoDBClient;
  ssmClient: SSMClient;
}

export const searchCampgroundsHandler: LambdaHandler<
  AppSyncResolverEvent<void>,
  Config,
  void
> = async (event, context, { dynamoClient, ssmClient }) => {
  // TODO: Should Paginate
  const { Items: SubscriptionItems } = await dynamoClient.send(
    new ScanCommand({
      TableName: process.env.RECREATION_GOV_TABLE,
    })
  );

  // Lookup the results from the most recent run
  const { Items: KnownInfoItems } = await dynamoClient.send(
    new ScanCommand({
      TableName: process.env.KNOWN_INFO_TABLE,
    })
  );
  const knownInfoMap = new Map<string, boolean>();
  KnownInfoItems?.forEach((row) => {
    const key = row["campId:date"]?.S;
    const isAvailable = row.availability?.BOOL;
    if (key && isAvailable !== undefined) {
      knownInfoMap.set(key, isAvailable);
    }
  });

  let campgroundsAvailable = [] as {
    campgroundName: string;
    date: string;
    campsites: string[];
    campsiteId: string;
  }[];
  await mapSeries(
    (SubscriptionItems ?? []).map(convertSubscriptionRowToGraphqlType),
    async ({ campsiteId, campsiteName, datesToWatch }) => {
      console.info(
        `Checking ${campsiteName} for availability on [${datesToWatch.join(
          ", "
        )}]`
      );

      let monthsToCheck: MonthAndYear[] = [];
      datesToWatch.forEach(dateString => {
        const year = parseInt(dateString.split("-")[0], 10);
        const month = dateString.split('-')[1] as Month;
        if (!monthsToCheck.some(existingMonth => existingMonth.month === month && existingMonth.year === year)) {
          monthsToCheck.push({ month, year });
        }
      });
      const campgrounds = await findAvailableSitesForCampground(
        campsiteId,
        monthsToCheck
      );

      // Update the known availability database so that on future runs we know what
      // information was previously known to avoid sending redundant messages
      await mapSeries(datesToWatch, async (date) => {
        // We can skip any updates if the latest known info already matches the new info
        if (
          knownInfoMap.get(`${campsiteId}:${date}`) === campgrounds.has(date)
        ) {
          return;
        }

        // Send a text message when a campground is available
        const campsites = campgrounds.get(date);
        if (campsites !== undefined) {
          campgroundsAvailable = [
            ...campgroundsAvailable,
            { campgroundName: campsiteName, date, campsites, campsiteId },
          ];
        }

        await dynamoClient.send(
          new UpdateItemCommand({
            TableName: process.env.KNOWN_INFO_TABLE,
            Key: { "campId:date": { S: `${campsiteId}:${date}` } },
            UpdateExpression: `SET availability = :availability`,
            ExpressionAttributeValues: {
              ":availability": { BOOL: campgrounds.has(date) },
            },
          })
        );
      });
    }
  );

  // Send notifications for any newly available campgrounds
  await mapSeries(
    Object.entries(groupBy(campgroundsAvailable, "campsiteId")),
    async ([campsiteId, availability]) => {
      const campgroundName = availability[0].campgroundName;
      const allDates = [...new Set(availability.flatMap(({ date }) => [date]))];
      const dateMessage =
        allDates.length > 1
          ? `dates: [${allDates.join(", ")}]`
          : `date: ${allDates[0]}`;
      const message = [
        `In ${campgroundName}, there is new availability on the following ${dateMessage}.`,
        `You may book this campground via https://www.recreation.gov/camping/campgrounds/${campsiteId}`,
      ].join("\n\n");

      console.log(`Sending message: ${message}`);
      await sendMessage(ssmClient, message);
    }
  );
};

export const searchCampgrounds = createHandler(
  searchCampgroundsHandler,
  () => ({
    dynamoClient: new DynamoDBClient({}),
    ssmClient: new SSMClient({}),
  })
);
