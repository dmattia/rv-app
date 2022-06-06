import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { LambdaResolverArgs, LambdaResolver } from "./LambdaResolver";

/**
 * Arguments for the ComponentResource
 */
interface AppSyncApiArgs extends Omit<aws.appsync.GraphQLApiArgs, "logConfig"> {
  /** The queries/mutations of the GraphQL API */
  resolvers: Pick<
    LambdaResolverArgs,
    "name" | "iamPermissions" | "entrypoint" | "type"
  >[];
  /** Env vars for the functions */
  environment?: pulumi.Input<{
    [key: string]: pulumi.Input<string>;
  }>;
}

/**
 * Creates an AppSync API
 */
export class AppSyncApi extends pulumi.ComponentResource {
  public readonly uri: pulumi.Output<string>;

  /**
   * Constructor
   *
   * @param name - name of this component in state
   * @param inputs - inputs to create the component, described above
   * @param opts - Any additional options to pass to all pulumi resources
   */
  constructor(
    name: string,
    inputs: AppSyncApiArgs,
    opts?: pulumi.ComponentResourceOptions
  ) {
    super("rv-app:AppSyncApi", name, {}, opts);
    const defaultOpts = { ...opts, parent: this };

    const appSyncRole = new aws.iam.Role(
      `${name}-appsync-logs`,
      {
        namePrefix: inputs.name,
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
      },
      defaultOpts
    );

    const api = new aws.appsync.GraphQLApi(
      name,
      {
        name: inputs.name,
        authenticationType: inputs.authenticationType,
        schema: inputs.schema,
        xrayEnabled: inputs.xrayEnabled,
        userPoolConfig: inputs.userPoolConfig,
        logConfig: {
          cloudwatchLogsRoleArn: appSyncRole.arn,
          excludeVerboseContent: true,
          fieldLogLevel: "ALL",
        },
      },
      defaultOpts
    );

    const accountId = aws
      .getCallerIdentity({})
      .then(({ accountId }) => accountId);
    const appSyncPolicy = new aws.iam.Policy(
      "appSyncPolicy",
      {
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
      },
      defaultOpts
    );

    new aws.iam.RolePolicyAttachment(
      "appSyncRolePolicy",
      {
        role: appSyncRole,
        policyArn: appSyncPolicy.arn,
      },
      defaultOpts
    );

    inputs.resolvers.forEach((resolverInfo) => {
      new LambdaResolver(
        resolverInfo.name,
        {
          ...resolverInfo,
          appSyncApi: api,
          environment: inputs.environment,
        },
        defaultOpts
      );
    });

    this.uri = api.uris["GRAPHQL"];

    this.registerOutputs();
  }
}
