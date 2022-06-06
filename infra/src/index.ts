import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { build } from "esbuild";
import { pnpPlugin } from "@yarnpkg/esbuild-plugin-pnp";
import { schema } from "@rv-app/schema";
import { LambdaResolver } from "./components";

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
  dataSource: "Esri",
  indexName: "esri",
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

// Dynamo DB table to hold data for the GraphQL endpoint
const destinations = new aws.dynamodb.Table("destinations", {
  hashKey: "id",
  name: "destinations",
  attributes: [{ name: "id", type: "S" }],
  billingMode: "PAY_PER_REQUEST",
  pointInTimeRecovery: { enabled: false },
  serverSideEncryption: { enabled: true },
});

const appSyncRole = new aws.iam.Role("appSyncRole", {
  namePrefix: "appSyncRole",
  assumeRolePolicy: JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Action: "sts:AssumeRole",
        Effect: "Allow",
        Principal: {
          Service: "appsync.amazonaws.com",
        },
      },
    ],
  }),
});

const api = new aws.appsync.GraphQLApi("api", {
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
  logConfig: {
    cloudwatchLogsRoleArn: appSyncRole.arn,
    excludeVerboseContent: true,
    fieldLogLevel: "ALL",
  },
});

// TODO: Can I make each handler build individually?
// Build our lambda code
const buildOutput = build({
  plugins: [pnpPlugin()],
  bundle: true,
  entryPoints: [require.resolve("@rv-app/backend")],
  outdir: "dist",
  minify: true,
  platform: "node",
});
const outputDir = buildOutput.then(() => "dist");

new LambdaResolver("getDestinationById", {
  name: "getDestinationById",
  type: "Query",
  appSyncApi: api,
  code: new pulumi.asset.FileArchive(outputDir),
  iamPermissions: [
    {
      Action: ["dynamodb:GetItem"],
      Resource: [destinations.arn],
      Effect: "Allow",
    },
  ],
  environment: {
    DESTINATIONS_TABLE: destinations.name,
  },
});

new LambdaResolver("searchLocation", {
  name: "searchLocation",
  type: "Query",
  appSyncApi: api,
  code: new pulumi.asset.FileArchive(outputDir),
  iamPermissions: [
    {
      Action: ["geo:SearchPlaceIndexForSuggestions"],
      Resource: [mapIndex.indexArn],
      Effect: "Allow",
    },
  ],
  environment: {
    INDEX_NAME: mapIndex.indexName,
  },
});

new LambdaResolver("listDestinations", {
  name: "listDestinations",
  type: "Query",
  appSyncApi: api,
  code: new pulumi.asset.FileArchive(outputDir),
  iamPermissions: [
    {
      Action: ["dynamodb:Scan"],
      Resource: [destinations.arn],
      Effect: "Allow",
    },
  ],
  environment: {
    DESTINATIONS_TABLE: destinations.name,
  },
});

new LambdaResolver("createOrUpdateDestination", {
  name: "createOrUpdateDestination",
  type: "Mutation",
  appSyncApi: api,
  code: new pulumi.asset.FileArchive(outputDir),
  iamPermissions: [
    {
      Action: ["dynamodb:UpdateItem"],
      Resource: [destinations.arn],
      Effect: "Allow",
    },
  ],
  environment: {
    DESTINATIONS_TABLE: destinations.name,
  },
});

const accountId = aws.getCallerIdentity({}).then(({ accountId }) => accountId);
const appSyncPolicy = new aws.iam.Policy("appSyncPolicy", {
  policy: {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Action: ["logs:*"],
        Resource: pulumi.interpolate`arn:aws:logs:us-east-1:${accountId}:log-group:/aws/appsync/apis/${api.id}`,
      },
    ],
  },
});

new aws.iam.RolePolicyAttachment("appSyncRolePolicy", {
  role: appSyncRole,
  policyArn: appSyncPolicy.arn,
});

export const mapName = map.mapName;
export const mapIndexName = mapIndex.indexName;
export const cdnDomain = distribution.domainName;
export const region = bucket.region;
export const userPoolId = pool.id;
export const clientId = client.id;
export const identityPoolId = identityPool.id;
export const endpoint = api.uris["GRAPHQL"];
