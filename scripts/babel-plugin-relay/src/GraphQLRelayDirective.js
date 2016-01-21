/**
 * Copyright 2013-2015, Facebook, Inc.
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

const types = require('./GraphQL').type;

module.exports = {
  name: 'relay',
  description: 'The @relay directive on fragments.',
  args: [
    {
      name: 'pattern',
      description:
        'Marks a fragment as intended for pattern matching (as ' +
        'opposed to fetching).',
      type: types.GraphQLBoolean,
      defaultValue: (null: ?boolean),
    },
    {
      name: 'plural',
      description: 'Marks a fragment as being backed by a GraphQLList',
      type: types.GraphQLBoolean,
      defaultValue: (null: ?boolean),
    },
  ],
  onOperation: false,
  onFragment: true,
  onField: false,
};
