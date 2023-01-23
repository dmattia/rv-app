import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { build } from "esbuild";
import { pnpPlugin } from "@yarnpkg/esbuild-plugin-pnp";
import { join } from "path";

/**
 * Arguments for the ComponentResource
 */
export interface LambdaCronArgs {
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
  /** The scheduling expression. For example, cron(0 20 * * ? *) or rate(5 minutes) */
  schedule: string;
  /** Overrides for lambda params */
  overrides?: Partial<aws.lambda.FunctionArgs>;
}

/**
 * Creates a scheduled lambda function
 */
export class LambdaCron extends pulumi.ComponentResource {
  /**
   * Constructor
   *
   * @param name - name of this component in state
   * @param inputs - inputs to create the component, described above
   * @param opts - Any additional options to pass to all pulumi resources
   */
  constructor(
    name: string,
    inputs: LambdaCronArgs,
    opts?: pulumi.ComponentResourceOptions
  ) {
    super("rv-app:LambdaCron", name, {}, opts);
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

    const lambda = new aws.lambda.Function(
      name,
      {
        architectures: ["arm64"],
        code: new pulumi.asset.FileArchive(outputDirPromise),
        handler: `${inputs.name}.${inputs.name}`,
        memorySize: 512,
        name: inputs.name,
        role: iamForLambda.arn,
        runtime: "nodejs14.x",
        environment: {
          variables: inputs.environment,
        },
        timeout: 10,
        publish: true,
        ...(inputs.overrides ?? {}),
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

    // Create a cron schedule
    const rule = new aws.cloudwatch.EventRule(
      `${name}-rule`,
      {
        isEnabled: true,
        scheduleExpression: inputs.schedule,
        name: name,
      },
      defaultOpts
    );

    // Ensure there are perms for the cron to trigger the lambda
    new aws.lambda.Permission(
      `${name}-perm`,
      {
        principal: "events.amazonaws.com",
        function: lambda,
        action: "lambda:invokeFunction",
        sourceArn: rule.arn,
      },
      defaultOpts
    );

    // Connect the cron to the lambda
    new aws.cloudwatch.EventTarget(
      `${name}-target`,
      {
        arn: lambda.arn,
        rule: rule.name,
      },
      defaultOpts
    );

    new aws.lambda.FunctionEventInvokeConfig(name, {
      functionName: lambda.name,
      maximumEventAgeInSeconds: 60,
      maximumRetryAttempts: 0,
    });

    this.registerOutputs();
  }
}
