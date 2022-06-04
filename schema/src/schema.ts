import { gql } from "apollo-server";

export const schema = gql`
  type Destination {
    id: ID!
    # Name is a reserved keyword
    destinationName: String
    latitude: String
    longitude: String
  }

  input CreateOrUpdateDestinationInput {
    id: String
    destinationName: String!
    latitude: String!
    longitude: String!
  }

  type Query {
    getDestinationById(id: ID!): Destination!
    listDestinations: [Destination!]!
  }

  type Mutation {
    createOrUpdateDestination(
      input: CreateOrUpdateDestinationInput!
    ): Destination!
  }

  schema {
    query: Query
    mutation: Mutation
  }
`;

export default schema;
