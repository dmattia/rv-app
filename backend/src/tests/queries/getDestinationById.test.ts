import assert from "assert";
import { Context, AppSyncResolverEvent } from "aws-lambda";
import sinon from "sinon";

import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import type {
  QueryGetDestinationByIdArgs,
  Destination,
} from "@rv-app/generated-schema";

import { getDestinationByIdHandler } from "@rv-app/backend/src/queries/getDestinationById";
import {
  FAKE_ID,
  FAKE_DESTINATION_DB_ROW,
  FAKE_DESTINATION_GRAPHQL_TYPE,
} from "@rv-app/backend/src/tests/mockData";

const sandbox = sinon.createSandbox();

chai.use(chaiAsPromised);

describe("getDestinationById", () => {
  const dbClient = new DynamoDBClient({
    credentials: {
      accessKeyId: "FOOBAR",
      secretAccessKey: "FOOBARBAZZ",
    },
  });
  let dbClientStub: AwsClientStub<DynamoDBClient>;

  before(() => {
    dbClientStub = mockClient(dbClient);
  });

  afterEach(() => {
    sandbox.restore();
    dbClientStub.reset();
  });

  const runHandler = () =>
    getDestinationByIdHandler(
      {
        arguments: { id: FAKE_ID },
      } as AppSyncResolverEvent<QueryGetDestinationByIdArgs>,
      {} as Context,
      {
        dynamoClient: dbClientStub,
      }
    );

  it("errors when the db is not accessible", async () => {
    dbClientStub.on(GetItemCommand).rejects("ahhhhh");

    const promise = runHandler();
    expect(promise).to.be.rejectedWith("ahhhhh");
  });

  it("errors when the specified row does not exist", async () => {
    dbClientStub.on(GetItemCommand).resolves({});

    const promise = runHandler();
    expect(promise).to.be.rejectedWith("Item could not be found");
  });

  it("can return info about a destination", async () => {
    dbClientStub.on(GetItemCommand).resolves({
      Item: FAKE_DESTINATION_DB_ROW,
    });

    const destination = await runHandler();
    expect(destination).to.deep.equal(FAKE_DESTINATION_GRAPHQL_TYPE);
  });
});
