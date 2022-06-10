import { gql } from "apollo-server";

export const schema = gql`
  type LocationInformation {
    address: String
    latitude: Float
    longitude: Float
    municipality: String
    subRegion: String
    # region is a reserved word in DynamoDb
    regionName: String
    country: String
    postalCode: String
    timeZone: TimeZone
  }

  type Destination {
    id: ID!
    # Name is a reserved keyword
    destinationName: String
    locationInformation: LocationInformation
  }

  input CreateOrUpdateDestinationInput {
    id: String
    destinationName: String
    address: String
    latitude: Float
    longitude: Float
    municipality: String
    subRegion: String
    regionName: String
    country: String
    postalCode: String
    timeZoneName: String
    timeZoneOffset: Int
  }

  type LocationSuggestion {
    address: String!
  }

  type TimeZone {
    name: String
    offset: Int
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
