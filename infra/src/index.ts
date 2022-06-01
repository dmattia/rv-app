import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

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
      // TODO: Restrict
      {
        Effect: "Allow",
        Action: ["*"],
        // Action: ["appsync:*"],
        Resource: ["*"],
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

const apiLogGroup = new aws.cloudwatch.LogGroup("api", {
  namePrefix: "rv-app-api",
  retentionInDays: 30,
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

const appSyncPolicy = new aws.iam.Policy("appSyncPolicy", {
  policy: {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Action: ["logs:*"],
        Resource: apiLogGroup.arn,
      },
      {
        Action: ["dynamodb:PutItem", "dynamodb:GetItem"],
        Resource: [destinations.arn],
        Effect: "Allow",
      },
    ],
  },
});

new aws.iam.PolicyAttachment("appSyncRolePolicy", {
  roles: [appSyncRole],
  policyArn: appSyncPolicy.arn,
});

const api = new aws.appsync.GraphQLApi("api", {
  name: "rv-app-backend",
  authenticationType: "AMAZON_COGNITO_USER_POOLS",
  schema: `
    type Query {
        getDestinationById(id: ID!): Destination
    }
    type Mutation {
        addDestination(input: CreateDestinationInput!): Destination!
    }
    input CreateDestinationInput {
        name: String!
        latitude: String!
        longitude: String!
    }
    type Destination {
        id: ID!
        name: String
        latitude: String
        longitude: String
    }
    schema {
        query: Query
        mutation: Mutation
    }
  `
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim(),
  xrayEnabled: true,
  userPoolConfig: {
    // Can I enable this?
    // appIdClientRegex: client.id,
    awsRegion: bucket.region,
    defaultAction: "DENY",
    userPoolId: pool.id,
  },
  // TODO: Where do I specify the log group to actually log to?
  // logConfig: {
  //   cloudwatchLogsRoleArn: appSyncRole.arn,
  //   excludeVerboseContent: true,
  //   fieldLogLevel: "ALL",
  // },
});

// Link a data source to the Dynamo DB Table
const destinationsDataSource = new aws.appsync.DataSource("destinations", {
  name: destinations.name,
  apiId: api.id,
  type: "AMAZON_DYNAMODB",
  dynamodbConfig: {
    tableName: destinations.name,
  },
  serviceRoleArn: appSyncRole.arn,
});

new aws.appsync.Resolver("get_destinations", {
  apiId: api.id,
  dataSource: destinationsDataSource.name,
  type: "Query",
  field: "getDestinationById",
  requestTemplate: `{
      "version": "2017-02-28",
      "operation": "GetItem",
      "key": {
          "id": $util.dynamodb.toDynamoDBJson($ctx.args.id),
      }
  }`,
  responseTemplate: `$util.toJson($ctx.result)`,
});

new aws.appsync.Resolver("add_destination", {
  apiId: api.id,
  dataSource: destinationsDataSource.name,
  type: "Mutation",
  field: "addDestination",
  requestTemplate: `{
      "version" : "2017-02-28",
      "operation" : "PutItem",
      "key" : {
          "id" : $util.dynamodb.toDynamoDBJson($util.autoId())
      },
      "attributeValues": $util.dynamodb.toMapValuesJson($ctx.args.input),
      "condition": {
        "expression": "attribute_not_exists(#id)",
        "expressionNames": {
          "#id": "id",
        },
      },
  }`,
  responseTemplate: `$util.toJson($ctx.result)`,
});

export const mapName = map.mapName;
export const mapIndexName = mapIndex.indexName;
export const cdnDomain = distribution.domainName;
export const region = bucket.region;
export const userPoolId = pool.id;
export const clientId = client.id;
export const identityPoolId = identityPool.id;
export const endpoint = api.uris["GRAPHQL"];
