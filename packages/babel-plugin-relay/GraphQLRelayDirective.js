/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @fullSyntaxTransform
 */

'use strict';

const {
  DirectiveLocation,
  GraphQLBoolean,
  GraphQLList,
  GraphQLString,
} = require('graphql');

module.exports = {
  name: 'relay',
  description: 'The @relay directive.',
  args: {
    isConnectionWithoutNodeID: {
      description:
        'Marks a connection field as containing nodes without `id` fields. ' +
        'This is used to silence the warning when diffing connections.',
      type: GraphQLBoolean,
    },
    pattern: {
      description:
        'Marks a fragment as intended for pattern matching (as opposed to ' +
        'fetching).',
      type: GraphQLBoolean,
    },
    plural: {
      description: 'Marks a fragment as being backed by a GraphQLList',
      type: GraphQLBoolean,
    },
    variables: {
      description: 'Selectively pass variables down into a fragment.',
      type: new GraphQLList(GraphQLString),
    },
  },
  locations: [
    DirectiveLocation.FIELD,
    DirectiveLocation.FRAGMENT_DEFINITION,
  ],
};
