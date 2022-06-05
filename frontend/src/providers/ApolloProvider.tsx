import {
  ApolloProvider,
  createHttpLink,
  ApolloClient,
  InMemoryCache,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { useAuthenticator } from "@aws-amplify/ui-react";

export function Apollo({
  children,
}: React.PropsWithChildren<{ children: React.ReactNode }>) {
  const { user } = useAuthenticator((context) => [context.user]);

  const httpLink = createHttpLink({
    uri: process.env.RV_APP_API_ENDPOINT,
  });

  const authLink = setContext((_, { headers }) => {
    // return the headers to the context so httpLink can read them
    return {
      headers: {
        ...headers,
        authorization: user
          .getSignInUserSession()
          ?.getAccessToken()
          ?.getJwtToken(),
      },
    };
  });

  const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
