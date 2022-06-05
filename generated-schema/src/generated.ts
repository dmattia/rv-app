/* THIS FILE IS GENERATED. DO NOT EDIT MANUALLY, run `yarn workspace @rv-app/schema generate` */
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type CreateOrUpdateDestinationInput = {
  destinationName: Scalars['String'];
  id?: InputMaybe<Scalars['String']>;
  latitude: Scalars['String'];
  longitude: Scalars['String'];
};

export type Destination = {
  __typename?: 'Destination';
  destinationName?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  latitude?: Maybe<Scalars['String']>;
  longitude?: Maybe<Scalars['String']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createOrUpdateDestination: Destination;
};


export type MutationCreateOrUpdateDestinationArgs = {
  input: CreateOrUpdateDestinationInput;
};

export type Query = {
  __typename?: 'Query';
  getDestinationById: Destination;
  listDestinations: Array<Destination>;
};


export type QueryGetDestinationByIdArgs = {
  id: Scalars['ID'];
};

export type CreateOrUpdateDestinationMutationVariables = Exact<{
  input: CreateOrUpdateDestinationInput;
}>;


export type CreateOrUpdateDestinationMutation = { __typename?: 'Mutation', createOrUpdateDestination: { __typename?: 'Destination', id: string, destinationName?: string | null, latitude?: string | null, longitude?: string | null } };


export const CreateOrUpdateDestinationDocument = /*#__PURE__*/ gql`
    mutation createOrUpdateDestination($input: CreateOrUpdateDestinationInput!) {
  createOrUpdateDestination(input: $input) {
    id
    destinationName
    latitude
    longitude
  }
}
    `;
export function useCreateOrUpdateDestinationMutation(baseOptions?: Apollo.MutationHookOptions<CreateOrUpdateDestinationMutation, CreateOrUpdateDestinationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateOrUpdateDestinationMutation, CreateOrUpdateDestinationMutationVariables>(CreateOrUpdateDestinationDocument, options);
      }
export type CreateOrUpdateDestinationMutationHookResult = ReturnType<typeof useCreateOrUpdateDestinationMutation>;
