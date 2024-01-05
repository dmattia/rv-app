import { gql } from "apollo-server";

export const schema = gql`
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
    listRecreationGovSubs: [RecreationGovSubscription!]!
  }

  type Mutation {
    createOrUpdateRecGovSub(
      input: CreateOrUpdateRecGovSubInput!
    ): RecreationGovSubscription!
  }

  schema {
    query: Query
    mutation: Mutation
  }
`;

export default schema;
