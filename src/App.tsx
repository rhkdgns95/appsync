import React from 'react';
import { withAuthenticator } from 'aws-amplify-react';
import { CreateAuctionForm } from './CreateAuctionForm';
import Auctions from './Auctions';


const signUpConfig = {
  header: 'My Customized Sign Up',
  hideAllDefaults: true,
  defaultCountryCode: '1',
  signUpFields: [
    {
      label: 'My user name',
      key: 'username',
      required: true,
      displayOrder: 1,
      type: 'string'
    },
    {
      label: 'Password',
      key: 'password',
      required: true,
      displayOrder: 2,
      type: 'password'
    },
    {
      label: 'PhoneNumber',
      key: 'phone_number',
      required: true,
      displayOrder: 3,
      type: 'string'
    },
    {
      label: 'Email^^',
      key: 'email',
      required: true,
      displayOrder: 4,
      type: 'string'
    },
    {
      label: 'Custom Content',
      key: 'content',
      required: true,
      displayOrder: 4,
      type: 'string'
    }
  ]
};

const usernameAttributes = 'My user name';


const App = () => (
  <>
    <CreateAuctionForm />
    <Auctions />
  </>
);

export default withAuthenticator(App, {
  signUpConfig,
  usernameAttributes
} as any);