import "server-only";

import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import config from "@repo/config";

export const sesClient = new SESv2Client({
  region: process.env.TF_VAR_AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_SES_KEY_ID!,
    secretAccessKey: process.env.AWS_SES_KEY_SECRET!,
  },
});

export type SendEmailOptions = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
};

/**
 * Send Email
 * @description Sends an email to a user via AWS SES from the application.
 * @param to The recipint(s) of the email.
 * @param subject The subject of the email.
 * @param html The mail-safe html string that is rendered in the email.
 * @param text Optional text for the email.
 * @param from The sender of the email. (Must be authorized by AWS).
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  from = config.mail.defaultEmail,
}: SendEmailOptions) {
  const recipients = Array.isArray(to) ? to : [to];

  const command = new SendEmailCommand({
    FromEmailAddress: from,
    Destination: {
      ToAddresses: recipients,
    },
    Content: {
      Simple: {
        Subject: {
          Data: subject,
          Charset: "UTF-8",
        },
        Body: {
          Html: {
            Data: html,
            Charset: "UTF-8",
          },
          ...(text
            ? {
                Text: {
                  Data: text,
                  Charset: "UTF-8",
                },
              }
            : {}),
        },
      },
    },
    ConfigurationSetName: process.env.AWS_SES_CONFIG_SET,
  });

  try {
    await sesClient.send(command);
  } catch (error) {
    console.error("Email: Failed to send email:", error);
  }
}
