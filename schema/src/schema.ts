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

  enum DestinationCategory {
    FRIENDS_AND_FAMILY
    FOOD_AND_DRINK
    NATURE_THINGS
    HIKE
    PLACE_TO_STAY
    CULTURAL
    DOG_THINGS
    SHOPPING
    OTHER
  }

  type Destination {
    id: ID!
    # Name is a reserved keyword
    destinationName: String
    locationInformation: LocationInformation
    category: DestinationCategory
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
    category: DestinationCategory
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
    deleteDestination(id: ID!): ID!
  }

  schema {
    query: Query
    mutation: Mutation
  }
`;

export default schema;
