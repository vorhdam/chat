import config from "@repo/config";

type VerifySchema = {
  header: string;
  main: string;
  otp: string;
  footer: string;
};

/**
 * ## Verify Email
 * @description Creates an HTML markup that can be used in emails to display verification codes.
 * @param header The header of the email. (usually holds a greeting message).
 * @param main The main part of the email holding contents and the aim of the email.
 * @param otp The code that is displayed in the center of the email.
 * @param footer The footer of the email. (goodbye message without the signature).
 * @returns HTML document processable by emails.
 */
export function VerifyEmail({
  header,
  main,
  otp,
  footer,
}: VerifySchema): string {
  return `
  <!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light only" />
    <meta name="supported-color-schemes" content="light" />
    <title>Verification Email</title>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #f4f4f5;
      font-family: Arial, sans-serif;
    "
  >
    <table
      role="presentation"
      cellpadding="0"
      cellspacing="0"
      width="100%"
      style="background-color: #f4f4f5; height: 100%; margin: 0; padding: 0;"
    >
      <tr>
        <td align="center" style="padding: 40px 10px;">
          <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            width="100%"
            style="
              max-width: 600px;
              background-color: #18181b;
              background-image: linear-gradient(#18181b, #18181b);
              color: #eeeeeeff;
              border-radius: 4px;
            "
          >
            <tr>
              <td align="center" style="padding: 30px 40px 10px 40px">
                <img
                  src="${config.url.logo}"
                  alt="${config.name} Logo"
                  height="15"
                  style="display: block; margin: 0 auto"
                />
              </td>
            </tr>
            <tr>
              <td style="padding: 0 40px">
                <hr
                  style="
                    border: 0;
                    border-top: 1px solid #3f3f46;
                    margin: 20px 0;
                  "
                />
              </td>
            </tr>
            <tr>
              <td style="padding: 0 40px 20px 40px; color: #eeeeeeff">
                <h1
                  style="margin: 0 0 20px 0; font-size: 24px; font-weight: bold; color: #eeeeeeff;"
                >
                  ${header}
                </h1>
                <p
                  style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.5; text-align: justify; color: #eeeeeeff;"
                >
                  ${main}
                </p>
                <div
                  style="
                    font-size: 32px;
                    font-weight: bold;
                    text-align: center;
                    margin: 15px 0;
                    color: #eeeeeeff;
                  "
                >
                  ${otp}
                </div>
                <p style="margin: 0; font-size: 16px; color: #eeeeeeff;">
                  ${footer}, <br /><strong style="color: #eeeeeeff;">${config.name}</strong>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
}
