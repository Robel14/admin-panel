// lib/apollo-client.js
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

// Apollo client setup using environment variables
const client = new ApolloClient({
  link: new HttpLink({
    uri: process.env.NEXT_PUBLIC_HASURA_URL,
    headers: {
      'x-hasura-role': process.env.NEXT_PUBLIC_HASURA_ROLE, // Use 'public' or your custom role
    },
  }),
  cache: new InMemoryCache(),
});

export default client;
