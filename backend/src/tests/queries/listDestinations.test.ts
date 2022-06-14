import { Context, AppSyncResolverEvent } from "aws-lambda";
import sinon from "sinon";

import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { AwsClientStub, mockClient } from "aws-sdk-client-mock";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";

import { listDestinationsHandler } from "@rv-app/backend/src/queries/listDestinations";
import {
  FAKE_DESTINATION_DB_ROW,
  FAKE_DESTINATION_GRAPHQL_TYPE,
} from "@rv-app/backend/src/tests/mockData";

const sandbox = sinon.createSandbox();

chai.use(chaiAsPromised);

describe("listDestinations", () => {
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
    listDestinationsHandler({} as AppSyncResolverEvent<void>, {} as Context, {
      dynamoClient: dbClient,
    });

  it("returns nothing when no rows are in the db", async () => {
    dbClientStub.on(ScanCommand).resolves({ Items: [] });

    const destinations = await runHandler();
    expect(destinations).to.have.length(0);
  });

  it("errors when the db is not accessible", async () => {
    dbClientStub.on(ScanCommand).rejects("ahhhhh");

    const promise = runHandler();
    expect(promise).to.be.rejectedWith("ahhhhh");
  });

  it("can return an item", async () => {
    dbClientStub.on(ScanCommand).resolves({
      Items: [FAKE_DESTINATION_DB_ROW],
    });

    const destinations = await runHandler();
    expect(destinations).to.have.length(1);
    expect(destinations).to.have.deep.members([FAKE_DESTINATION_GRAPHQL_TYPE]);
  });
});
