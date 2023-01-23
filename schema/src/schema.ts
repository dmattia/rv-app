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

  enum Priority {
    LOWEST
    LOW
    MEDIUM
    HIGH
    HIGHEST
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
    priority: Priority
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
    priority: Priority
  }

  type LocationSuggestion {
    address: String!
  }

  type TimeZone {
    name: String
    offset: Int
  }

  input UpdateDeviceLocationInput {
    accuracy: Int
    latitude: Float!
    longitude: Float!
    deviceName: String
  }

  type UpdateDeviceLocationOutput {
    success: Boolean
  }

  type RecreationGovSubscription {
    id: ID!
    campsiteId: String!
    datesToWatch: [String!]!
    campsiteName: String!
  }

  input CreateOrUpdateRecGovSubInput {
    id: ID
    campsiteId: String!
    datesToWatch: [String!]!
    campsiteName: String!
  }

  type Query {
    getDestinationById(id: ID!): Destination!
    listDestinations: [Destination!]!
    listRecreationGovSubs: [RecreationGovSubscription!]!
    searchLocation(query: String!): [LocationSuggestion!]!
    getLocationDataForAddress(query: String!): LocationInformation!
  }

  type Mutation {
    createOrUpdateDestination(
      input: CreateOrUpdateDestinationInput!
    ): Destination!
    createOrUpdateRecGovSub(
      input: CreateOrUpdateRecGovSubInput!
    ): RecreationGovSubscription!
    updateDeviceLocation(
      input: UpdateDeviceLocationInput!
    ): UpdateDeviceLocationOutput!
    deleteDestination(id: ID!): ID!
  }

  schema {
    query: Query
    mutation: Mutation
  }
`;

export default schema;
