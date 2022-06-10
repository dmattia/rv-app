import { AppSyncResolverEvent } from "aws-lambda";
import {
  LocationClient,
  SearchPlaceIndexForSuggestionsCommand,
} from "@aws-sdk/client-location";
import {
  LocationSuggestion,
  QuerySearchLocationArgs,
} from "@rv-app/generated-schema";
import { LambdaHandler, createHandler } from "@rv-app/backend/src/types";

interface Config {
  locationClient: LocationClient;
}

export const searchLocationHandler: LambdaHandler<
  AppSyncResolverEvent<QuerySearchLocationArgs>,
  Config,
  LocationSuggestion[]
> = async (event, context, { locationClient }) => {
  const { Results } = await locationClient.send(
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
};

export const searchLocation = createHandler(searchLocationHandler, () => ({
  locationClient: new LocationClient({}),
}));
