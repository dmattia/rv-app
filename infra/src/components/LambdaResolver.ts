import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { build } from "esbuild";
import { pnpPlugin } from "@yarnpkg/esbuild-plugin-pnp";
import { join } from "path";

/**
 * Arguments for the ComponentResource
 */
export interface LambdaResolverArgs {
  /** The name of the resolver */
  name: string;
  /** The entrypoint to the resolver*/
  entrypoint: string;
  /** The AWS permissions the function can use */
  iamPermissions: pulumi.Input<aws.iam.PolicyStatement>[];
  /** Env vars for the function */
  environment?: pulumi.Input<{
    [key: string]: pulumi.Input<string>;
  }>;
  /** The AppSync API to add this resolver to */
  appSyncApi: aws.appsync.GraphQLApi;
  /** Type of the resolver */
  type: "Query" | "Mutation";
}

/**
 * Creates an AppSync resolver via a lambda function
 */
export class LambdaResolver extends pulumi.ComponentResource {
  /**
   * Constructor
   *
   * @param name - name of this component in state
   * @param inputs - inputs to create the component, described above
   * @param opts - Any additional options to pass to all pulumi resources
   */
  constructor(
    name: string,
    inputs: LambdaResolverArgs,
    opts?: pulumi.ComponentResourceOptions
  ) {
    super("rv-app:LambdaResolver", name, {}, opts);
    const defaultOpts = { ...opts, parent: this };

    // Build our lambda code
    const outputDir = join("dist", inputs.entrypoint);
    const buildOutput = build({
      plugins: [pnpPlugin()],
      bundle: true,
      entryPoints: [require.resolve(inputs.entrypoint)],
      outdir: outputDir,
      minify: true,
      platform: "node",
    });
    const outputDirPromise = buildOutput.then(() => outputDir);

    const iamForLambda = new aws.iam.Role(
      `${inputs.name}-role`,
      {
        assumeRolePolicy: {
          Version: "2012-10-17",
          Statement: [
            {
              Action: "sts:AssumeRole",
              Principal: { Service: "lambda.amazonaws.com" },
              Effect: "Allow",
            },
          ],
        },
      },
      defaultOpts
    );

    const invokeFunctionRole = new aws.iam.Role(
      `${name}-invoke`,
      {
        namePrefix: `${inputs.name}-invoke`,
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

    const lambda = new aws.lambda.Function(
      name,
      {
        architectures: ["arm64"],
        code: new pulumi.asset.FileArchive(outputDirPromise),
        handler: `${inputs.name}.${inputs.name}`,
        memorySize: 256,
        name: inputs.name,
        role: iamForLambda.arn,
        runtime: "nodejs16.x",
        environment: {
          variables: inputs.environment,
        },
        publish: true,
      },
      defaultOpts
    );

    const invokeFunctionPolicy = new aws.iam.Policy(
      `${name}-invoke`,
      {
        policy: {
          Version: "2012-10-17",
          Statement: [
            {
              Action: ["lambda:InvokeFunction"],
              Resource: [lambda.arn],
              Effect: "Allow",
            },
          ],
        },
      },
      defaultOpts
    );

    const dataSource = new aws.appsync.DataSource(
      inputs.name,
      {
        name: inputs.name,
        apiId: inputs.appSyncApi.id,
        type: "AWS_LAMBDA",
        lambdaConfig: {
          functionArn: lambda.arn,
        },
        serviceRoleArn: invokeFunctionRole.arn,
      },
      defaultOpts
    );

    new aws.appsync.Resolver(
      name,
      {
        apiId: inputs.appSyncApi.id,
        dataSource: dataSource.name,
        type: inputs.type,
        field: inputs.name,
        requestTemplate: pulumi.interpolate`{
            "version": "2017-02-28",
            "operation": "Invoke",
            "payload": {
              "field": "${lambda.name}",
              "arguments":  $utils.toJson($context.arguments)
            }
          }`,
        responseTemplate: `$util.toJson($ctx.result)`,
      },
      defaultOpts
    );

    const lambdaPolicy = new aws.iam.Policy(
      `${name}-lambdaPolicy`,
      {
        policy: {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Action: [
                "logs:CreateLogStream",
                "logs:CreateLogGroup",
                "logs:PutLogEvents",
                "xray:PutTraceSegments",
                "xray:PutTelemetryRecords",
              ],
              Resource: "*",
            },
            ...inputs.iamPermissions,
          ],
        },
      },
      defaultOpts
    );

    new aws.iam.RolePolicyAttachment(
      `${name}-lambdaRolePolicy`,
      {
        role: iamForLambda,
        policyArn: lambdaPolicy.arn,
      },
      defaultOpts
    );
    new aws.iam.RolePolicyAttachment(
      `${name}-invokePolicy`,
      {
        role: invokeFunctionRole,
        policyArn: invokeFunctionPolicy.arn,
      },
      defaultOpts
    );

    this.registerOutputs();
  }
}
