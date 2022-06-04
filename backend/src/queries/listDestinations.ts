import { Context, AppSyncResolverEvent } from "aws-lambda";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import type { Destination } from "@rv-app/schema";

const client = new DynamoDBClient({});

export async function listDestinations(
  event: AppSyncResolverEvent<void>,
  context: Context
): Promise<Destination[]> {
  // TODO: Should Paginate
  const { Items } = await client.send(
    new ScanCommand({
      TableName: process.env.DESTINATIONS_TABLE,
    })
  );

  return (
    Items?.map(({ id, name, latitude, longitude }) => {
      if (!id.S) {
        throw Error("Found invalid destination");
      }

      return {
        id: id.S,
        name: name.S,
        latitude: latitude.S,
        longitude: longitude.S,
      };
    }) ?? []
  );
}
