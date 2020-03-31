// tslint:disable
// eslint-disable
// this is an auto generated file. This will be overwritten

export const onCreateAuction = /* GraphQL */ `
  subscription OnCreateAuction($owner: String!) {
    onCreateAuction(owner: $owner) {
      id
      name
      price
      owner
    }
  }
`;
export const onUpdateAuction = /* GraphQL */ `
  subscription OnUpdateAuction($owner: String!) {
    onUpdateAuction(owner: $owner) {
      id
      name
      price
      owner
    }
  }
`;
export const onDeleteAuction = /* GraphQL */ `
  subscription OnDeleteAuction($owner: String!) {
    onDeleteAuction(owner: $owner) {
      id
      name
      price
      owner
    }
  }
`;
