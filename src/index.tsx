import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import AWSAppSyncClient, { AUTH_TYPE } from 'aws-appsync'
import AppSyncConfig from './aws-exports'
import { ApolloProvider } from 'react-apollo'
import Amplify, { Auth } from 'aws-amplify';
// import Rehydrated from './Rehydrated';

/**
 *  Rehydrated: AWS Appsync Client에 연결이 될때까지 앱의 렌더링을 기다림.
 *  Bug가 발견된것 참고 https://github.com/awslabs/aws-mobile-appsync-sdk-js/issues/448
 */

Amplify.configure(AppSyncConfig);


const client = new AWSAppSyncClient({
  url: AppSyncConfig.aws_appsync_graphqlEndpoint,
  region: AppSyncConfig.aws_appsync_region, 
  auth: {
    type: AUTH_TYPE.AMAZON_COGNITO_USER_POOLS,
    jwtToken: async () => (await Auth.currentSession()).getIdToken().getJwtToken(),
    // type: AppSyncConfig.aws_appsync_authenticationType as AUTH_TYPE | any,
    // apiKey: AppSyncConfig.aws_appsync_apiKey,
    // jwtToken: async () => token, // Required when you use Cognito UserPools OR OpenID Connect. token object is obtained previously
  }
});

ReactDOM.render(
  <ApolloProvider client={client}>
      <App />
  </ApolloProvider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
