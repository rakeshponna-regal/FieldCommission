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

import React from 'react';
import { StyleSheet, Text } from 'react-native';

const Error = ({ error }) => {
  if (!error) {
    return null;
  }

  return <Text testID="errorBox" style={styles.error}>Error: {error}</Text>;
};

const styles = StyleSheet.create({
  error: {
    color: 'red'
  }
});


export default Error;