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

export type ListDestinationsQueryVariables = Exact<{ [key: string]: never; }>;


export type ListDestinationsQuery = { __typename?: 'Query', listDestinations: Array<{ __typename?: 'Destination', id: string, destinationName?: string | null, latitude?: string | null, longitude?: string | null }> };


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

/**
 * __useCreateOrUpdateDestinationMutation__
 *
 * To run a mutation, you first call `useCreateOrUpdateDestinationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateOrUpdateDestinationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createOrUpdateDestinationMutation, { data, loading, error }] = useCreateOrUpdateDestinationMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateOrUpdateDestinationMutation(baseOptions?: Apollo.MutationHookOptions<CreateOrUpdateDestinationMutation, CreateOrUpdateDestinationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateOrUpdateDestinationMutation, CreateOrUpdateDestinationMutationVariables>(CreateOrUpdateDestinationDocument, options);
      }
export type CreateOrUpdateDestinationMutationHookResult = ReturnType<typeof useCreateOrUpdateDestinationMutation>;
export const ListDestinationsDocument = /*#__PURE__*/ gql`
    query listDestinations {
  listDestinations {
    id
    destinationName
    latitude
    longitude
  }
}
    `;

/**
 * __useListDestinationsQuery__
 *
 * To run a query within a React component, call `useListDestinationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useListDestinationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListDestinationsQuery({
 *   variables: {
 *   },
 * });
 */
export function useListDestinationsQuery(baseOptions?: Apollo.QueryHookOptions<ListDestinationsQuery, ListDestinationsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ListDestinationsQuery, ListDestinationsQueryVariables>(ListDestinationsDocument, options);
      }
export function useListDestinationsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListDestinationsQuery, ListDestinationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ListDestinationsQuery, ListDestinationsQueryVariables>(ListDestinationsDocument, options);
        }
export type ListDestinationsQueryHookResult = ReturnType<typeof useListDestinationsQuery>;
export type ListDestinationsLazyQueryHookResult = ReturnType<typeof useListDestinationsLazyQuery>;
