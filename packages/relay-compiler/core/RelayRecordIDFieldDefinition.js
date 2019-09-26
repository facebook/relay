/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 */

'use strict';

const {GraphQLID, GraphQLNonNull} = require('graphql');

import type {GraphQLField} from 'graphql';

const RelayRecordIDFieldDefinition: GraphQLField<mixed, mixed> = {
  name: '__id',
  type: GraphQLNonNull(GraphQLID),
  description: 'The identity of a record in the Relay runtime store',
  args: [],
  resolve: undefined,
  deprecationReason: undefined,
  extensions: undefined,
  astNode: undefined,
};

module.exports = RelayRecordIDFieldDefinition;
