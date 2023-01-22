import { Handler, Context } from "aws-lambda";

export type LambdaHandler<TEvent, TConfig, TResult> = (
  event: TEvent,
  context: Context,
  config: TConfig
) => Promise<TResult>;

export function createHandler<TEvent, TConfig, TResult>(
  handler: LambdaHandler<TEvent, TConfig, TResult>,
  configSupplier: () => TConfig
): Handler<TEvent, TResult> {
  return (event: TEvent, context: Context) =>
    handler(event, context, configSupplier());
}
