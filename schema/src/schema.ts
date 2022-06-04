import { gql } from "apollo-server";

export const schema = gql`
  type Destination {
    id: ID!
    name: String
    latitude: String
    longitude: String
  }

  input CreateDestinationInput {
    name: String!
    latitude: String!
    longitude: String!
  }

  type Query {
    getDestinationById(id: ID!): Destination!
    listDestinations: [Destination!]!
  }

  type Mutation {
    addDestination(input: CreateDestinationInput!): Destination!
  }

  schema {
    query: Query
    mutation: Mutation
  }
`;

export default schema;
