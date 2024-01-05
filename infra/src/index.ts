import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { schema } from "@rv-app/schema";
import { AppSyncApi, LambdaCron } from "./components";

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
  ],
  environment: {
    RECREATION_GOV_TABLE: recreationGovSubs.name,
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

export const cdnDomain = distribution.domainName;
export const region = bucket.region;
export const userPoolId = pool.id;
export const clientId = client.id;
export const identityPoolId = identityPool.id;
export const endpoint = api.uri;
