import assert from "assert";
import { Context, AppSyncResolverEvent } from "aws-lambda";
import sinon from "sinon";

import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";

import { listDestinationsHandler } from "@rv-app/backend/src/queries/listDestinations";

const sandbox = sinon.createSandbox();

chai.use(chaiAsPromised);

const FAKE_ID = "60F03770-18C6-45E9-BED9-89CBAB61ED39";
const FAKE_DESTINATION = "Hogwarts";
const FAKE_LATITUDE = 12.345;
const FAKE_LONGITUDE = -6.789;
const FAKE_MUNICIPALITY = "London";
const FAKE_SUB_REGION = "Platform 9 3/4";
const FAKE_REGION = "King's Cross Station";
const FAKE_POSTAL_CODE = "12345"; // but no post on Sundays
const FAKE_TIME_ZONE = "London Time";
const FAKE_TIME_ZONE_OFFSET = 3600;

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
      dynamoClient: dbClientStub,
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
      Items: [
        {
          id: { S: FAKE_ID },
          destinationName: { S: FAKE_DESTINATION },
          latitude: { N: FAKE_LATITUDE },
          longitude: { N: FAKE_LONGITUDE },
          municipality: { S: FAKE_MUNICIPALITY },
          subRegion: { S: FAKE_SUB_REGION },
          regionName: { S: FAKE_REGION },
          postalCode: { S: FAKE_POSTAL_CODE },
          timeZoneName: { S: FAKE_TIME_ZONE },
          timeZoneOffset: { N: FAKE_TIME_ZONE_OFFSET },
        },
      ],
    });

    const destinations = await runHandler();
    expect(destinations).to.have.length(1);
    expect(destinations).to.have.deep.members([
      {
        id: FAKE_ID,
        destinationName: FAKE_DESTINATION,
        locationInformation: {
          latitude: FAKE_LATITUDE,
          longitude: FAKE_LONGITUDE,
          municipality: FAKE_MUNICIPALITY,
          subRegion: FAKE_SUB_REGION,
          regionName: FAKE_REGION,
          postalCode: FAKE_POSTAL_CODE,
          timeZone: {
            offset: FAKE_TIME_ZONE_OFFSET,
            name: FAKE_TIME_ZONE,
          },
        },
      },
    ]);
  });
});
