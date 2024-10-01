import { ApolloClient, InMemoryCache, createHttpLink, split } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import { useAuthStore } from "../stores/authStore";

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_HTTP_SERVER_URL
});

const wsLink = new GraphQLWsLink(createClient({
  url: import.meta.env.VITE_WS_SERVER_URL,
  connectionParams: () => {
    const { token } = useAuthStore.getState();
    return {
      Authorization: token ? `Bearer ${token}` : "",
    };
  },
}));

const authLink = setContext((_, { headers }) => {
  const { token } = useAuthStore.getState();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink),
);

const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

export default apolloClient;