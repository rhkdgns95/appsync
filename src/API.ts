/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateAuctionInput = {
  id?: string | null,
  name: string,
  price: number,
};

export type ModelAuctionConditionInput = {
  name?: ModelStringInput | null,
  price?: ModelFloatInput | null,
  and?: Array< ModelAuctionConditionInput | null > | null,
  or?: Array< ModelAuctionConditionInput | null > | null,
  not?: ModelAuctionConditionInput | null,
};

export type ModelStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null",
}


export type ModelSizeInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type ModelFloatInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export type UpdateAuctionInput = {
  id: string,
  name?: string | null,
  price?: number | null,
};

export type DeleteAuctionInput = {
  id?: string | null,
};

export type ModelAuctionFilterInput = {
  id?: ModelIDInput | null,
  name?: ModelStringInput | null,
  price?: ModelFloatInput | null,
  and?: Array< ModelAuctionFilterInput | null > | null,
  or?: Array< ModelAuctionFilterInput | null > | null,
  not?: ModelAuctionFilterInput | null,
};

export type ModelIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export type CreateAuctionMutationVariables = {
  input: CreateAuctionInput,
  condition?: ModelAuctionConditionInput | null,
};

export type CreateAuctionMutation = {
  createAuction:  {
    __typename: "Auction",
    id: string,
    name: string,
    price: number,
    owner: string | null,
  } | null,
};

export type UpdateAuctionMutationVariables = {
  input: UpdateAuctionInput,
  condition?: ModelAuctionConditionInput | null,
};

export type UpdateAuctionMutation = {
  updateAuction:  {
    __typename: "Auction",
    id: string,
    name: string,
    price: number,
    owner: string | null,
  } | null,
};

export type DeleteAuctionMutationVariables = {
  input: DeleteAuctionInput,
  condition?: ModelAuctionConditionInput | null,
};

export type DeleteAuctionMutation = {
  deleteAuction:  {
    __typename: "Auction",
    id: string,
    name: string,
    price: number,
    owner: string | null,
  } | null,
};

export type GetAuctionQueryVariables = {
  id: string,
};

export type GetAuctionQuery = {
  getAuction:  {
    __typename: "Auction",
    id: string,
    name: string,
    price: number,
    owner: string | null,
  } | null,
};

export type ListAuctionsQueryVariables = {
  filter?: ModelAuctionFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListAuctionsQuery = {
  listAuctions:  {
    __typename: "ModelAuctionConnection",
    items:  Array< {
      __typename: "Auction",
      id: string,
      name: string,
      price: number,
      owner: string | null,
    } | null > | null,
    nextToken: string | null,
  } | null,
};

export type OnCreateAuctionSubscriptionVariables = {
  owner: string,
};

export type OnCreateAuctionSubscription = {
  onCreateAuction:  {
    __typename: "Auction",
    id: string,
    name: string,
    price: number,
    owner: string | null,
  } | null,
};

export type OnUpdateAuctionSubscriptionVariables = {
  owner: string,
};

export type OnUpdateAuctionSubscription = {
  onUpdateAuction:  {
    __typename: "Auction",
    id: string,
    name: string,
    price: number,
    owner: string | null,
  } | null,
};

export type OnDeleteAuctionSubscriptionVariables = {
  owner: string,
};

export type OnDeleteAuctionSubscription = {
  onDeleteAuction:  {
    __typename: "Auction",
    id: string,
    name: string,
    price: number,
    owner: string | null,
  } | null,
};
