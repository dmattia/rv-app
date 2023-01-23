import { Twilio } from "twilio";
import { SSMClient, GetParametersCommand } from "@aws-sdk/client-ssm";
import { mapSeries } from "bluebird";

export async function sendMessage(
  ssmClient: SSMClient,
  message: string
): Promise<void> {
  const params = await ssmClient.send(
    new GetParametersCommand({
      Names: [
        "TWILIO_ACCOUNT_SID",
        "TWILIO_AUTH_TOKEN",
        "TWILIO_PHONE_NUMBER",
        "RECIPIENT_NUMBERS",
      ],
      WithDecryption: true,
    })
  );
  const findParam = (name: string): string | undefined =>
    params.Parameters?.find(({ Name }) => Name === name)?.Value;

  const accountSid = findParam("TWILIO_ACCOUNT_SID");
  const authToken = findParam("TWILIO_AUTH_TOKEN");
  const twilioNumber = findParam("TWILIO_PHONE_NUMBER");
  const recipientNumbers = findParam("RECIPIENT_NUMBERS")?.split(",");

  if (!accountSid || !authToken || !twilioNumber || !recipientNumbers) {
    throw Error("Failed to find twilio params");
  }
  const client = new Twilio(accountSid, authToken);

  await mapSeries(recipientNumbers, async (number) =>
    client.messages.create({
      from: twilioNumber,
      to: number,
      body: message,
    })
  );
}
