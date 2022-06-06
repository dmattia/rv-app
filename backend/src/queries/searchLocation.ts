import { Context, AppSyncResolverEvent } from "aws-lambda";
import {
  LocationClient,
  SearchPlaceIndexForSuggestionsCommand,
} from "@aws-sdk/client-location";
import {
  LocationSuggestion,
  QuerySearchLocationArgs,
} from "@rv-app/generated-schema";

const client = new LocationClient({});

export async function searchLocation(
  event: AppSyncResolverEvent<QuerySearchLocationArgs>,
  context: Context
): Promise<LocationSuggestion[]> {
  const { Results } = await client.send(
    new SearchPlaceIndexForSuggestionsCommand({
      IndexName: process.env.INDEX_NAME,
      Text: event.arguments.query,
      FilterCountries: ["USA"],
      MaxResults: 5,
      Language: "en",
    })
  );

  return (
    Results?.flatMap(({ Text }) => (Text ? [{ address: Text }] : [])) ?? []
  );
}
