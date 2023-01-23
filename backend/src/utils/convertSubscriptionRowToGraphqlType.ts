import type { GetItemOutput } from "@aws-sdk/client-dynamodb";
import { RecreationGovSubscription } from "@rv-app/generated-schema";

export function convertSubscriptionRowToGraphqlType(
  row: GetItemOutput["Item"]
): RecreationGovSubscription {
  if (!row) {
    throw Error("Found invalid destination");
  }

  const { id, campsiteId, datesToWatch, campsiteName } = row;

  if (!id?.S) {
    throw Error("Could not find ID of row");
  }

  if (!campsiteId?.S || !datesToWatch?.SS || !campsiteName?.S) {
    throw Error(`Missing expected field in ${JSON.stringify(row)}`);
  }

  return {
    id: id.S,
    campsiteId: campsiteId?.S,
    datesToWatch: datesToWatch?.SS,
    campsiteName: campsiteName?.S,
  };
}
