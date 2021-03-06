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
  address?: InputMaybe<Scalars['String']>;
  category?: InputMaybe<DestinationCategory>;
  country?: InputMaybe<Scalars['String']>;
  destinationName?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['String']>;
  latitude?: InputMaybe<Scalars['Float']>;
  longitude?: InputMaybe<Scalars['Float']>;
  municipality?: InputMaybe<Scalars['String']>;
  postalCode?: InputMaybe<Scalars['String']>;
  priority?: InputMaybe<Priority>;
  regionName?: InputMaybe<Scalars['String']>;
  subRegion?: InputMaybe<Scalars['String']>;
  timeZoneName?: InputMaybe<Scalars['String']>;
  timeZoneOffset?: InputMaybe<Scalars['Int']>;
};

export type Destination = {
  __typename?: 'Destination';
  category?: Maybe<DestinationCategory>;
  destinationName?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  locationInformation?: Maybe<LocationInformation>;
  priority?: Maybe<Priority>;
};

export enum DestinationCategory {
  Cultural = 'CULTURAL',
  DogThings = 'DOG_THINGS',
  FoodAndDrink = 'FOOD_AND_DRINK',
  FriendsAndFamily = 'FRIENDS_AND_FAMILY',
  Hike = 'HIKE',
  NatureThings = 'NATURE_THINGS',
  Other = 'OTHER',
  PlaceToStay = 'PLACE_TO_STAY',
  Shopping = 'SHOPPING'
}

export type LocationInformation = {
  __typename?: 'LocationInformation';
  address?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  latitude?: Maybe<Scalars['Float']>;
  longitude?: Maybe<Scalars['Float']>;
  municipality?: Maybe<Scalars['String']>;
  postalCode?: Maybe<Scalars['String']>;
  regionName?: Maybe<Scalars['String']>;
  subRegion?: Maybe<Scalars['String']>;
  timeZone?: Maybe<TimeZone>;
};

export type LocationSuggestion = {
  __typename?: 'LocationSuggestion';
  address: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createOrUpdateDestination: Destination;
  deleteDestination: Scalars['ID'];
  updateDeviceLocation: UpdateDeviceLocationOutput;
};


export type MutationCreateOrUpdateDestinationArgs = {
  input: CreateOrUpdateDestinationInput;
};


export type MutationDeleteDestinationArgs = {
  id: Scalars['ID'];
};


export type MutationUpdateDeviceLocationArgs = {
  input: UpdateDeviceLocationInput;
};

export enum Priority {
  High = 'HIGH',
  Highest = 'HIGHEST',
  Low = 'LOW',
  Lowest = 'LOWEST',
  Medium = 'MEDIUM'
}

export type Query = {
  __typename?: 'Query';
  getDestinationById: Destination;
  getLocationDataForAddress: LocationInformation;
  listDestinations: Array<Destination>;
  searchLocation: Array<LocationSuggestion>;
};


export type QueryGetDestinationByIdArgs = {
  id: Scalars['ID'];
};


export type QueryGetLocationDataForAddressArgs = {
  query: Scalars['String'];
};


export type QuerySearchLocationArgs = {
  query: Scalars['String'];
};

export type TimeZone = {
  __typename?: 'TimeZone';
  name?: Maybe<Scalars['String']>;
  offset?: Maybe<Scalars['Int']>;
};

export type UpdateDeviceLocationInput = {
  accuracy?: InputMaybe<Scalars['Int']>;
  deviceName?: InputMaybe<Scalars['String']>;
  latitude: Scalars['Float'];
  longitude: Scalars['Float'];
};

export type UpdateDeviceLocationOutput = {
  __typename?: 'UpdateDeviceLocationOutput';
  success?: Maybe<Scalars['Boolean']>;
};

export type CreateOrUpdateDestinationMutationVariables = Exact<{
  input: CreateOrUpdateDestinationInput;
}>;


export type CreateOrUpdateDestinationMutation = { __typename?: 'Mutation', createOrUpdateDestination: { __typename?: 'Destination', id: string, destinationName?: string | null, locationInformation?: { __typename?: 'LocationInformation', latitude?: number | null, longitude?: number | null } | null } };

export type UpdateDeviceLocationMutationVariables = Exact<{
  input: UpdateDeviceLocationInput;
}>;


export type UpdateDeviceLocationMutation = { __typename?: 'Mutation', updateDeviceLocation: { __typename?: 'UpdateDeviceLocationOutput', success?: boolean | null } };

export type DeleteDestinationMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DeleteDestinationMutation = { __typename?: 'Mutation', deleteDestination: string };

export type ListDestinationsQueryVariables = Exact<{ [key: string]: never; }>;


export type ListDestinationsQuery = { __typename?: 'Query', listDestinations: Array<{ __typename?: 'Destination', id: string, category?: DestinationCategory | null, destinationName?: string | null, priority?: Priority | null, locationInformation?: { __typename?: 'LocationInformation', address?: string | null, latitude?: number | null, longitude?: number | null, municipality?: string | null, subRegion?: string | null, regionName?: string | null, country?: string | null, postalCode?: string | null, timeZone?: { __typename?: 'TimeZone', name?: string | null, offset?: number | null } | null } | null }> };

export type SearchLocationQueryVariables = Exact<{
  query: Scalars['String'];
}>;


export type SearchLocationQuery = { __typename?: 'Query', searchLocation: Array<{ __typename?: 'LocationSuggestion', address: string }> };

export type GetLocationDataForAddressQueryVariables = Exact<{
  query: Scalars['String'];
}>;


export type GetLocationDataForAddressQuery = { __typename?: 'Query', getLocationDataForAddress: { __typename?: 'LocationInformation', address?: string | null, latitude?: number | null, longitude?: number | null, municipality?: string | null, subRegion?: string | null, regionName?: string | null, country?: string | null, postalCode?: string | null, timeZone?: { __typename?: 'TimeZone', name?: string | null, offset?: number | null } | null } };


export const CreateOrUpdateDestinationDocument = /*#__PURE__*/ gql`
    mutation createOrUpdateDestination($input: CreateOrUpdateDestinationInput!) {
  createOrUpdateDestination(input: $input) {
    id
    destinationName
    locationInformation {
      latitude
      longitude
    }
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
export const UpdateDeviceLocationDocument = /*#__PURE__*/ gql`
    mutation updateDeviceLocation($input: UpdateDeviceLocationInput!) {
  updateDeviceLocation(input: $input) {
    success
  }
}
    `;

/**
 * __useUpdateDeviceLocationMutation__
 *
 * To run a mutation, you first call `useUpdateDeviceLocationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateDeviceLocationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateDeviceLocationMutation, { data, loading, error }] = useUpdateDeviceLocationMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateDeviceLocationMutation(baseOptions?: Apollo.MutationHookOptions<UpdateDeviceLocationMutation, UpdateDeviceLocationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateDeviceLocationMutation, UpdateDeviceLocationMutationVariables>(UpdateDeviceLocationDocument, options);
      }
export type UpdateDeviceLocationMutationHookResult = ReturnType<typeof useUpdateDeviceLocationMutation>;
export const DeleteDestinationDocument = /*#__PURE__*/ gql`
    mutation deleteDestination($id: ID!) {
  deleteDestination(id: $id)
}
    `;

/**
 * __useDeleteDestinationMutation__
 *
 * To run a mutation, you first call `useDeleteDestinationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteDestinationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteDestinationMutation, { data, loading, error }] = useDeleteDestinationMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteDestinationMutation(baseOptions?: Apollo.MutationHookOptions<DeleteDestinationMutation, DeleteDestinationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteDestinationMutation, DeleteDestinationMutationVariables>(DeleteDestinationDocument, options);
      }
export type DeleteDestinationMutationHookResult = ReturnType<typeof useDeleteDestinationMutation>;
export const ListDestinationsDocument = /*#__PURE__*/ gql`
    query listDestinations {
  listDestinations {
    id
    category
    destinationName
    priority
    locationInformation {
      address
      latitude
      longitude
      municipality
      subRegion
      regionName
      country
      postalCode
      timeZone {
        name
        offset
      }
    }
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
export const SearchLocationDocument = /*#__PURE__*/ gql`
    query searchLocation($query: String!) {
  searchLocation(query: $query) {
    address
  }
}
    `;

/**
 * __useSearchLocationQuery__
 *
 * To run a query within a React component, call `useSearchLocationQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchLocationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchLocationQuery({
 *   variables: {
 *      query: // value for 'query'
 *   },
 * });
 */
export function useSearchLocationQuery(baseOptions: Apollo.QueryHookOptions<SearchLocationQuery, SearchLocationQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SearchLocationQuery, SearchLocationQueryVariables>(SearchLocationDocument, options);
      }
export function useSearchLocationLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SearchLocationQuery, SearchLocationQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SearchLocationQuery, SearchLocationQueryVariables>(SearchLocationDocument, options);
        }
export type SearchLocationQueryHookResult = ReturnType<typeof useSearchLocationQuery>;
export type SearchLocationLazyQueryHookResult = ReturnType<typeof useSearchLocationLazyQuery>;
export const GetLocationDataForAddressDocument = /*#__PURE__*/ gql`
    query getLocationDataForAddress($query: String!) {
  getLocationDataForAddress(query: $query) {
    address
    latitude
    longitude
    municipality
    subRegion
    regionName
    country
    postalCode
    timeZone {
      name
      offset
    }
  }
}
    `;

/**
 * __useGetLocationDataForAddressQuery__
 *
 * To run a query within a React component, call `useGetLocationDataForAddressQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLocationDataForAddressQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLocationDataForAddressQuery({
 *   variables: {
 *      query: // value for 'query'
 *   },
 * });
 */
export function useGetLocationDataForAddressQuery(baseOptions: Apollo.QueryHookOptions<GetLocationDataForAddressQuery, GetLocationDataForAddressQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetLocationDataForAddressQuery, GetLocationDataForAddressQueryVariables>(GetLocationDataForAddressDocument, options);
      }
export function useGetLocationDataForAddressLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLocationDataForAddressQuery, GetLocationDataForAddressQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetLocationDataForAddressQuery, GetLocationDataForAddressQueryVariables>(GetLocationDataForAddressDocument, options);
        }
export type GetLocationDataForAddressQueryHookResult = ReturnType<typeof useGetLocationDataForAddressQuery>;
export type GetLocationDataForAddressLazyQueryHookResult = ReturnType<typeof useGetLocationDataForAddressLazyQuery>;