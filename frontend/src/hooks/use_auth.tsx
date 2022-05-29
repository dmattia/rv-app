import { useState, useContext, createContext } from "react";
import * as AmazonCognitoIdentity from "amazon-cognito-identity-js";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";

const userPool = new AmazonCognitoIdentity.CognitoUserPool({
  UserPoolId: process.env.VITE_USER_POOL_ID,
  ClientId: process.env.VITE_COGNITO_CLIENT_ID,
});

const cognitoIdentityClient = new CognitoIdentityClient({
  region: "us-east-1",
});

const authContext = createContext<
  | {
      credentials: CognitoIdentityCredentials | null;
      signIn: (username: string, password: string) => Promise<void>;
      signOut: () => void;
    }
  | undefined
>(undefined);

// CognitoIdentityCredentials is not exported :(
type CognitoIdentityCredentials = Awaited<
  ReturnType<Awaited<ReturnType<typeof fromCognitoIdentityPool>>>
>;

// Provider component that wraps your app and makes auth object ...
// ... available to any child component that calls useAuth().
export function ProvideAuth({ children }: { children: JSX.Element }) {
  const auth = useProvideAuth();
  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

// Hook for child components to get the auth object ...
// ... and re-render when it changes.
export const useAuth = () => {
  return useContext(authContext);
};

export function signOut(): void {
  const currentUser = userPool.getCurrentUser();
  if (currentUser) {
    currentUser.signOut();
  }
}

// This file inspired from https://github.com/aws-amplify/amplify-js/issues/9639#issuecomment-1049158277
function signIn(
  username: string,
  password: string
): Promise<AmazonCognitoIdentity.CognitoUserSession> {
  return new Promise((resolve, reject) => {
    const authenticationDetails =
      new AmazonCognitoIdentity.AuthenticationDetails({
        Username: username,
        Password: password,
      });
    const cognitoUser = new AmazonCognitoIdentity.CognitoUser({
      Username: username,
      Pool: userPool,
    });
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => resolve(result),
      onFailure: (error) => reject(error),
      // newPasswordRequired: () => reject(new Error('not implemented: new password required')),
      newPasswordRequired: () => {
        cognitoUser.completeNewPasswordChallenge(
          password,
          {},
          { onSuccess: resolve, onFailure: reject }
        );
      },
      mfaRequired: () => reject(new Error("not implemented: mfa required")),
      totpRequired: () => reject(new Error("not implemented: totp required")),
      customChallenge: () =>
        reject(new Error("not implemented: custom challenge")),
      mfaSetup: () => reject(new Error("not implemented: mfa setup")),
      selectMFAType: () =>
        reject(new Error("not implemented: select mfa type")),
    });
  });
}

// Provider hook that creates auth object and handles state
function useProvideAuth() {
  const [credentials, setCredentials] =
    useState<CognitoIdentityCredentials | null>(null);

  const signInUser = async (username: string, password: string) => {
    const user = await signIn(username, password);
    const credsProvider = await fromCognitoIdentityPool({
      identityPoolId: process.env.VITE_IDENTITY_POOL_ID,
      logins: {
        [`cognito-idp.${process.env.VITE_AWS_REGION}.amazonaws.com/${process.env.VITE_USER_POOL_ID}`]:
          user.getIdToken().getJwtToken(),
      },
      client: cognitoIdentityClient,
    });
    setCredentials(await credsProvider());
  };

  const signOutUser = () => {
    signOut();
    setCredentials(null);
  };

  // Return the user object and auth methods
  return {
    credentials,
    signIn: signInUser,
    signOut: signOutUser,
  };
}
