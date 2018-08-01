/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const React = require('React');
const RelayEnvironment = require('../store/RelayEnvironment');
const RelayPropTypes = require('../container/RelayPropTypes');

type RelayContextType = {
  // relay: RelayPropTypes.ClassicRelay,
  // route?: RelayPropTypes.QueryConfig.isRequired,
  // useFakeData?: boolean,
  relay: any,
  route?: any,
  useFakeData?: boolean,
};

const relayDefaultContext: RelayContextType = {
  relay: {
    environment: new RelayEnvironment(),
    variables: {},
  },
  route: {
    name: '$RelayMockRenderer',
    params: {},
    queries: {},
    useMockData: true,
  },
  useFakeData: true,
};

module.exports = React.createContext(relayDefaultContext);
