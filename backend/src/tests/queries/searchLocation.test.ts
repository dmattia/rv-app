import assert from "assert";
import { Context, AppSyncResolverEvent } from "aws-lambda";
import sinon from "sinon";

import {
  LocationClient,
  SearchPlaceIndexForSuggestionsCommand,
} from "@aws-sdk/client-location";
import { mockClient } from "aws-sdk-client-mock";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import type {
  QuerySearchLocationArgs,
  Destination,
} from "@rv-app/generated-schema";

import { searchLocationHandler } from "@rv-app/backend/src/queries/searchLocation";
// import {} from "@rv-app/backend/src/tests/mockData";

const sandbox = sinon.createSandbox();

chai.use(chaiAsPromised);

describe("searchLocation", () => {
  const locationClient = new LocationClient({
    credentials: {
      accessKeyId: "FOOBAR",
      secretAccessKey: "FOOBARBAZZ",
    },
  });
  let locationClientStub: AwsClientStub<LocationClient>;

  before(() => {
    locationClientStub = mockClient(locationClient);
  });

  afterEach(() => {
    sandbox.restore();
    locationClientStub.reset();
  });

  const runHandler = () =>
    searchLocationHandler(
      {
        arguments: { query: "some query text" },
      } as AppSyncResolverEvent<QuerySearchLocationArgs>,
      {} as Context,
      {
        locationClient: locationClientStub,
      }
    );

  it("errors when the location service is not accessible", async () => {
    locationClientStub
      .on(SearchPlaceIndexForSuggestionsCommand)
      .rejects("ahhhhh");

    const promise = runHandler();
    expect(promise).to.be.rejectedWith("ahhhhh");
  });

  it("returns an empty response if no suggestions match the query", async () => {
    locationClientStub.on(SearchPlaceIndexForSuggestionsCommand).resolves({
      Results: [],
    });

    const suggestions = await runHandler();
    expect(suggestions).to.have.length(0);
  });

  it("returns suggestions for a query", async () => {
    locationClientStub.on(SearchPlaceIndexForSuggestionsCommand).resolves({
      Results: [{ Text: "suggestion 1" }, { Text: "suggestion 2" }],
    });

    const suggestions = await runHandler();
    expect(suggestions).to.have.length(2);
    expect(suggestions).to.deep.equal([
      { address: "suggestion 1" },
      { address: "suggestion 2" },
    ]);
  });
});
