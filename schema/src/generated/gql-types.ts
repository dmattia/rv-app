export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
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
