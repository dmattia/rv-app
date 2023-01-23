import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { schema } from "@rv-app/schema";
import { AppSyncApi, LambdaCron } from "./components";
import * as awsNative from "@pulumi/aws-native";
import { local } from "@pulumi/command";
import { readFileSync } from "fs";

// Create the frontend infra
const bucket = new aws.s3.Bucket("website-contents", {
  bucket: `rv-app-origin-bucket`,
  acl: "public-read",
  website: {
    indexDocument: "index.html",
    errorDocument: "index.html",
  },
  policy: JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: "*",
        Action: ["s3:GetObject"],
        Resource: [`arn:aws:s3:::rv-app-origin-bucket/*`],
      },
    ],
  }),
});

const distribution = new aws.cloudfront.Distribution("cdn", {
  origins: [
    {
      domainName: bucket.bucketRegionalDomainName,
      originId: bucket.bucket,
    },
  ],
  enabled: true,
  defaultRootObject: "index.html",
  defaultCacheBehavior: {
    allowedMethods: [
      "HEAD",
      "DELETE",
      "POST",
      "GET",
      "OPTIONS",
      "PUT",
      "PATCH",
    ],
    cachedMethods: ["GET", "HEAD"],
    targetOriginId: bucket.bucket,
    viewerProtocolPolicy: "redirect-to-https",
    forwardedValues: {
      queryString: false,
      cookies: { forward: "none" },
    },
  },
  viewerCertificate: {
    cloudfrontDefaultCertificate: true,
  },
  restrictions: {
    geoRestriction: {
      restrictionType: "whitelist",
      locations: ["US"],
    },
  },
  customErrorResponses: [
    {
      errorCode: 404,
      responseCode: 200,
      responsePagePath: "/index.html",
    },
  ],
});

// Create a map in the Location service
const map = new aws.location.Map(
  "main-map",
  {
    mapName: "rv-app-primary",
    description: "Primary map for the app",
    configuration: {
      style: "VectorEsriStreets",
    },
  },
  { deleteBeforeReplace: true }
);

const mapIndex = new aws.location.PlaceIndex("index", {
  dataSource: "Here",
  indexName: "here",
});

// Create a tracker for tracking device locations
const tracker = new awsNative.location.Tracker("tracker", {
  description: "Tracks the RV goin round dat country",
  trackerName: "RvTracker",
});

const geofenceCollection = new awsNative.location.GeofenceCollection("states", {
  collectionName: "us_states",
  description: "Each US State + DC and Puerto Rico",
});

const statePolygons = JSON.parse(
  readFileSync("../resources/geofences/converted.geojson", "utf8")
);
statePolygons.features.forEach((feature: any) => {
  const id = `${feature.properties.name.replace(/ /g, "-")}_${feature.id}`;
  new local.Command(
    `us_states_${id}`,
    {
      create: `aws location put-geofence --collection-name "$COLLECTION" --geofence-id "$ID" --geometry "$GEOMETRY"`,
      environment: {
        COLLECTION: geofenceCollection.collectionName,
        ID: id,
        GEOMETRY: JSON.stringify({ Polygon: feature.geometry.coordinates }),
      },
    },
    { replaceOnChanges: ["environment"] }
  );
});

new awsNative.location.TrackerConsumer("us_states", {
  trackerName: tracker.trackerName,
  consumerArn: geofenceCollection.collectionArn,
});

// Create the Authentication config
const pool = new aws.cognito.UserPool("pool", {
  name: "rv-app",
  passwordPolicy: {
    minimumLength: 14,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: true,
    requireUppercase: true,
    temporaryPasswordValidityDays: 7,
  },
});

const client = new aws.cognito.UserPoolClient("client", {
  name: "rv-app",
  userPoolId: pool.id,
  callbackUrls: [pulumi.interpolate`https://${distribution.domainName}`],
  logoutUrls: [pulumi.interpolate`https://${distribution.domainName}`],
  defaultRedirectUri: pulumi.interpolate`https://${distribution.domainName}`,
  allowedOauthFlowsUserPoolClient: true,
  allowedOauthFlows: ["code"],
  allowedOauthScopes: ["openid", "profile"],
  explicitAuthFlows: [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_ADMIN_USER_PASSWORD_AUTH",
  ],
  generateSecret: false, // The browser SDK does not support sending a secret
  preventUserExistenceErrors: "ENABLED",
  supportedIdentityProviders: ["COGNITO"],
});

const identityPool = new aws.cognito.IdentityPool("main", {
  identityPoolName: "rv-app",
  allowClassicFlow: false,
  allowUnauthenticatedIdentities: false,
  cognitoIdentityProviders: [
    {
      clientId: client.id,
      providerName: pulumi.interpolate`cognito-idp.us-east-1.amazonaws.com/${pool.id}`,
      serverSideTokenCheck: true,
    },
  ],
  developerProviderName: distribution.domainName,
});

const authenticatedRole = new aws.iam.Role("authenticatedRole", {
  assumeRolePolicy: {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: {
          Federated: "cognito-identity.amazonaws.com",
        },
        Action: "sts:AssumeRoleWithWebIdentity",
        Condition: {
          StringEquals: {
            "cognito-identity.amazonaws.com:aud": identityPool.id,
          },
          "ForAnyValue:StringLike": {
            "cognito-identity.amazonaws.com:amr": "authenticated",
          },
        },
      },
    ],
  },
});

new aws.iam.RolePolicy("authenticatedRolePolicy", {
  role: authenticatedRole.id,
  policy: {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Action: ["cognito-sync:*", "cognito-identity:*"],
        Resource: "*",
      },
      {
        Effect: "Allow",
        Action: [
          "geo:GetMapTile",
          "geo:GetMapSprites",
          "geo:GetMapGlyphs",
          "geo:GetMapStyleDescriptor",
        ],
        Resource: map.mapArn,
      },
      // TODO: Do we still want this? It is only used on the search bar inside the map
      {
        Effect: "Allow",
        Action: [
          "geo:SearchPlaceIndexForPosition",
          "geo:SearchPlaceIndexForText",
        ],
        Resource: mapIndex.indexArn,
      },
    ],
  },
});

new aws.cognito.IdentityPoolRoleAttachment("mainIdentityPoolRoleAttachment", {
  identityPoolId: identityPool.id,
  roles: {
    authenticated: authenticatedRole.arn,
  },
});

const commonTableParams = {
  hashKey: "id",
  attributes: [{ name: "id", type: "S" }],
  billingMode: "PAY_PER_REQUEST",
  pointInTimeRecovery: { enabled: false },
  serverSideEncryption: { enabled: true },
};

const destinations = new aws.dynamodb.Table("destinations", {
  ...commonTableParams,
  name: "destinations",
});

const recreationGovSubs = new aws.dynamodb.Table("recreationGovSubs", {
  ...commonTableParams,
  name: "recreationGovSubs",
});

const recreationGovSubsKnownAvailability = new aws.dynamodb.Table(
  "recreationGovSubsKnownAvailability",
  {
    ...commonTableParams,
    name: "recreationGovSubsKnownAvailability",
    attributes: [{ name: "campId:date", type: "S" }],
    hashKey: "campId:date",
  }
);

const api = new AppSyncApi("api", {
  name: "rv-app-backend",
  authenticationType: "AMAZON_COGNITO_USER_POOLS",
  schema: schema.loc!.source.body,
  xrayEnabled: true,
  userPoolConfig: {
    appIdClientRegex: client.id,
    awsRegion: bucket.region,
    defaultAction: "ALLOW",
    userPoolId: pool.id,
  },
  resolvers: [
    {
      name: "getDestinationById",
      type: "Query",
      entrypoint: "@rv-app/backend/src/queries/getDestinationById",
      iamPermissions: [
        {
          Action: ["dynamodb:GetItem"],
          Resource: [destinations.arn],
          Effect: "Allow",
        },
      ],
    },
    {
      name: "searchLocation",
      type: "Query",
      entrypoint: "@rv-app/backend/src/queries/searchLocation",
      iamPermissions: [
        {
          Action: ["geo:SearchPlaceIndexForSuggestions"],
          Resource: [mapIndex.indexArn],
          Effect: "Allow",
        },
      ],
    },
    {
      name: "getLocationDataForAddress",
      type: "Query",
      entrypoint: "@rv-app/backend/src/queries/getLocationDataForAddress",
      iamPermissions: [
        {
          Action: ["geo:SearchPlaceIndexForText"],
          Resource: [mapIndex.indexArn],
          Effect: "Allow",
        },
      ],
    },
    {
      name: "listDestinations",
      type: "Query",
      entrypoint: "@rv-app/backend/src/queries/listDestinations",
      iamPermissions: [
        {
          Action: ["dynamodb:Scan"],
          Resource: [destinations.arn],
          Effect: "Allow",
        },
      ],
    },
    {
      name: "listRecreationGovSubs",
      type: "Query",
      entrypoint: "@rv-app/backend/src/queries/listRecreationGovSubs",
      iamPermissions: [
        {
          Action: ["dynamodb:Scan"],
          Resource: [recreationGovSubs.arn],
          Effect: "Allow",
        },
      ],
    },
    {
      name: "createOrUpdateRecGovSub",
      type: "Mutation",
      entrypoint: "@rv-app/backend/src/mutations/createOrUpdateRecGovSub",
      iamPermissions: [
        {
          Action: ["dynamodb:UpdateItem"],
          Resource: [recreationGovSubs.arn],
          Effect: "Allow",
        },
      ],
    },
    {
      name: "createOrUpdateDestination",
      type: "Mutation",
      entrypoint: "@rv-app/backend/src/mutations/createOrUpdateDestination",
      iamPermissions: [
        {
          Action: ["dynamodb:UpdateItem"],
          Resource: [destinations.arn],
          Effect: "Allow",
        },
      ],
    },
    {
      name: "deleteDestination",
      type: "Mutation",
      entrypoint: "@rv-app/backend/src/mutations/deleteDestination",
      iamPermissions: [
        {
          Action: ["dynamodb:DeleteItem"],
          Resource: [destinations.arn],
          Effect: "Allow",
        },
      ],
    },
    {
      name: "updateDeviceLocation",
      type: "Mutation",
      entrypoint: "@rv-app/backend/src/mutations/updateDeviceLocation",
      iamPermissions: [
        {
          Action: ["geo:BatchUpdateDevicePosition"],
          Resource: [tracker.arn],
          Effect: "Allow",
        },
      ],
    },
  ],
  environment: {
    DESTINATIONS_TABLE: destinations.name,
    RECREATION_GOV_TABLE: recreationGovSubs.name,
    INDEX_NAME: mapIndex.indexName,
    TRACKER_NAME: tracker.trackerName,
  },
});

// Create Twilio secrets to be accessed in the lambda
const twilioSecrets = [
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_PHONE_NUMBER",
  "RECIPIENT_NUMBERS",
].map(
  (name) =>
    new aws.ssm.Parameter(name, {
      name,
      type: "SecureString",
      value: process.env[name]!,
    })
);

// Create scheduled cron jobs
new LambdaCron("searchCampgrounds", {
  name: "searchCampgrounds",
  entrypoint: "@rv-app/lambdas/src/searchCampgrounds",
  iamPermissions: [
    {
      Action: ["dynamodb:scan"],
      Resource: [recreationGovSubs.arn, recreationGovSubsKnownAvailability.arn],
      Effect: "Allow",
    },
    {
      Action: [
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:GetItem",
      ],
      Resource: [recreationGovSubsKnownAvailability.arn],
      Effect: "Allow",
    },
    {
      Action: ["ssm:GetParameters"],
      Resource: twilioSecrets.map((secret) => secret.arn),
      Effect: "Allow",
    },
  ],
  schedule: "rate(1 minute)",
  environment: {
    RECREATION_GOV_TABLE: recreationGovSubs.name,
    KNOWN_INFO_TABLE: recreationGovSubsKnownAvailability.name,
  },
  overrides: { timeout: 50 },
});

export const mapName = map.mapName;
export const mapIndexName = mapIndex.indexName;
export const cdnDomain = distribution.domainName;
export const region = bucket.region;
export const userPoolId = pool.id;
export const clientId = client.id;
export const identityPoolId = identityPool.id;
export const endpoint = api.uri;
