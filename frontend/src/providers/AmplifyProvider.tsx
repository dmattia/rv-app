import Amplify from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";

import "@aws-amplify/ui-react/styles.css";

Amplify.configure({
  Auth: {
    identityPoolId: process.env.RV_APP_IDENTITY_POOL_ID,
    region: process.env.RV_APP_AWS_REGION,
    userPoolId: process.env.RV_APP_USER_POOL_ID,
    userPoolWebClientId: process.env.RV_APP_COGNITO_CLIENT_ID,
    mandatorySignIn: true,
  },
  // See: https://docs.amplify.aws/lib/geo/existing-resources/q/platform/js/#authorization-permissions
  geo: {
    AmazonLocationService: {
      maps: {
        items: {
          [process.env.RV_APP_MAP_NAME as string]: {
            style: "VectorEsriStreets",
          },
        },
        default: process.env.RV_APP_MAP_NAME,
      },
      search_indices: {
        items: [process.env.RV_APP_SEARCH_INDEX],
        default: process.env.RV_APP_SEARCH_INDEX,
      },
      region: process.env.RV_APP_AWS_REGION,
    },
  },
  aws_appsync_graphqlEndpoint: process.env.RV_APP_API_ENDPOINT,
  aws_appsync_region: process.env.RV_APP_AWS_REGION,
  aws_appsync_authenticationType: "AMAZON_COGNITO_USER_POOLS",
});

export function AmplifyProvider({
  children,
}: React.PropsWithChildren<{ children: React.ReactNode }>) {
  return <Authenticator hideSignUp={true}>{children}</Authenticator>;
}
