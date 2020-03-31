import React from 'react';
import { withAuthenticator } from 'aws-amplify-react';
import { CreateAuctionForm } from './CreateAuctionForm';
import Auctions from './Auctions';

const App = () => (
  <>
    <CreateAuctionForm />
    <Auctions />
  </>
);

export default withAuthenticator(App);