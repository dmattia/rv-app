import Amplify from "aws-amplify";
import { Authenticator, MapView } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure({
  Auth: {
    identityPoolId: process.env.RV_APP_IDENTITY_POOL_ID,
    region: process.env.RV_APP_AWS_REGION,
    userPoolId: process.env.RV_APP_USER_POOL_ID,
    userPoolWebClientId: process.env.RV_APP_COGNITO_CLIENT_ID,
    mandatorySignIn: true,
    // cookieStorage: {
    //   domain: window.location.host,
    //   expires: 7,
    //   sameSite: 'strict',
    //   secure: true,
    // },
    // authenticationFlowType: 'USER_PASSWORD_AUTH',
    //   oauth: {
    //     domain: 'your_cognito_domain',
    //     scope: ['phone', 'email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
    //     redirectSignIn: 'http://localhost:3000/',
    //     redirectSignOut: 'http://localhost:3000/',
    //     responseType: 'code' // or 'token', note that REFRESH token will only be generated when the responseType is code
    // }
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
      region: process.env.RV_APP_AWS_REGION,
    },
  },
});

function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div>
          <p>Bri and David's RV Website</p>

          <p>{user?.username}</p>

          <MapView
            initialViewState={{
              latitude: 37.8,
              longitude: -122.4,
              zoom: 14,
            }}
          />
        </div>
      )}
    </Authenticator>
  );
}

export default App;
