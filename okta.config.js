/*
 * Copyright (c) 2019-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { CLIENT_ID, REDIRECT_URI, LOGOUT_REDIRECT_URI, ISSUER } from '@env';

/* 
  clientId, redirectUri, endSessionRedirectUri - these values can be found on the "General" tab of the application that you created earlier in Admin Console.
  discoveryUri - this is the URL of the authorization server that will perform authentication.

  For more details, https://developer.okta.com/docs/guides/sign-into-mobile-app/create-okta-application/
*/

export default {
  oidc: {
    clientId: '0oaafopxe4BoWXYN25d7', // e.g.: `a0abcEf0gH123ssJS4o5`
    redirectUri: 'com.okta.dev-33134057:/callback', // e.g.: `com.okta.example:/callback`
    endSessionRedirectUri: 'com.okta.dev-33134057:/logout', // e.g.: com.okta.example:/logout
    discoveryUri: 'https://dev-33134057.okta.com', // e.g.: https://dev-1234.okta.com/oauth2/default
    scopes: ['openid', 'profile', 'email', 'offline_access'],
    requireHardwareBackedKeyStore: false,
    serviceConfiguration: {
      authorizationEndpoint: 'https://dev-33134057.okta.com/oauth2/v1/authorize',
      tokenEndpoint: 'https://dev-33134057.okta.com/oauth2/v1/token',
      registrationEndpoint: 'https://dev-33134057.okta.com/oauth2/v1/clients'
    },
    additionalParameters: {
      prompt: 'login'  // none , consent , login
    },
  },
};