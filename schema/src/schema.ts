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

  type LocationSuggestion {
    address: String!
  }

  type TimeZone {
    name: String
    offset: Int
  }

  type LocationInformation {
    address: String!
    latitude: Float
    longitude: Float
    municipality: String
    subRegion: String
    region: String
    country: String
    postalCode: String
    timeZone: TimeZone
  }

  type Query {
    getDestinationById(id: ID!): Destination!
    listDestinations: [Destination!]!
    searchLocation(query: String!): [LocationSuggestion!]!
    getLocationDataForAddress(query: String!): LocationInformation!
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
