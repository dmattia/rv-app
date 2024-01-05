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

export type CreateOrUpdateRecGovSubInput = {
  campsiteId: Scalars['String'];
  campsiteName: Scalars['String'];
  datesToWatch: Array<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createOrUpdateRecGovSub: RecreationGovSubscription;
};


export type MutationCreateOrUpdateRecGovSubArgs = {
  input: CreateOrUpdateRecGovSubInput;
};

export type Query = {
  __typename?: 'Query';
  listRecreationGovSubs: Array<RecreationGovSubscription>;
};

export type RecreationGovSubscription = {
  __typename?: 'RecreationGovSubscription';
  campsiteId: Scalars['String'];
  campsiteName: Scalars['String'];
  datesToWatch: Array<Scalars['String']>;
  id: Scalars['ID'];
};

export type CreateOrUpdateRecGovSubMutationVariables = Exact<{
  input: CreateOrUpdateRecGovSubInput;
}>;


export type CreateOrUpdateRecGovSubMutation = { __typename?: 'Mutation', createOrUpdateRecGovSub: { __typename?: 'RecreationGovSubscription', id: string, campsiteId: string, datesToWatch: Array<string>, campsiteName: string } };

export type ListRecreationGovSubsQueryVariables = Exact<{ [key: string]: never; }>;


export type ListRecreationGovSubsQuery = { __typename?: 'Query', listRecreationGovSubs: Array<{ __typename?: 'RecreationGovSubscription', id: string, campsiteId: string, campsiteName: string, datesToWatch: Array<string> }> };


export const CreateOrUpdateRecGovSubDocument = /*#__PURE__*/ gql`
    mutation createOrUpdateRecGovSub($input: CreateOrUpdateRecGovSubInput!) {
  createOrUpdateRecGovSub(input: $input) {
    id
    campsiteId
    datesToWatch
    campsiteName
  }
}
    `;

/**
 * __useCreateOrUpdateRecGovSubMutation__
 *
 * To run a mutation, you first call `useCreateOrUpdateRecGovSubMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateOrUpdateRecGovSubMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createOrUpdateRecGovSubMutation, { data, loading, error }] = useCreateOrUpdateRecGovSubMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateOrUpdateRecGovSubMutation(baseOptions?: Apollo.MutationHookOptions<CreateOrUpdateRecGovSubMutation, CreateOrUpdateRecGovSubMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateOrUpdateRecGovSubMutation, CreateOrUpdateRecGovSubMutationVariables>(CreateOrUpdateRecGovSubDocument, options);
      }
export type CreateOrUpdateRecGovSubMutationHookResult = ReturnType<typeof useCreateOrUpdateRecGovSubMutation>;
export const ListRecreationGovSubsDocument = /*#__PURE__*/ gql`
    query listRecreationGovSubs {
  listRecreationGovSubs {
    id
    campsiteId
    campsiteName
    datesToWatch
  }
}
    `;

/**
 * __useListRecreationGovSubsQuery__
 *
 * To run a query within a React component, call `useListRecreationGovSubsQuery` and pass it any options that fit your needs.
 * When your component renders, `useListRecreationGovSubsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListRecreationGovSubsQuery({
 *   variables: {
 *   },
 * });
 */
export function useListRecreationGovSubsQuery(baseOptions?: Apollo.QueryHookOptions<ListRecreationGovSubsQuery, ListRecreationGovSubsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ListRecreationGovSubsQuery, ListRecreationGovSubsQueryVariables>(ListRecreationGovSubsDocument, options);
      }
export function useListRecreationGovSubsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListRecreationGovSubsQuery, ListRecreationGovSubsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ListRecreationGovSubsQuery, ListRecreationGovSubsQueryVariables>(ListRecreationGovSubsDocument, options);
        }
export type ListRecreationGovSubsQueryHookResult = ReturnType<typeof useListRecreationGovSubsQuery>;
export type ListRecreationGovSubsLazyQueryHookResult = ReturnType<typeof useListRecreationGovSubsLazyQuery>;