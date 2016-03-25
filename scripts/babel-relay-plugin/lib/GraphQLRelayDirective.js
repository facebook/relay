// @generated
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @fullSyntaxTransform
 */

'use strict';

var TypeKind = require('./GraphQL').type_introspection.TypeKind;

var BOOLEAN = {
  kind: TypeKind.SCALAR,
  name: 'Boolean'
};

module.exports = {
  name: 'relay',
  description: 'The @relay directive.',
  args: [{
    name: 'isConnectionWithoutNodeID',
    description: 'Marks a connection field as containing nodes without `id` fields. ' + 'This is used to silence the warning when diffing connections.',
    type: BOOLEAN,
    defaultValue: null
  }, {
    name: 'isStaticFragment',
    description: 'Marks a fragment as static. A static fragment will share the same ' + 'identity regardless of how many times the expression is evaluated.',
    type: BOOLEAN,
    defaultValue: null
  }, {
    name: 'pattern',
    description: 'Marks a fragment as intended for pattern matching (as opposed to ' + 'fetching).',
    type: BOOLEAN,
    defaultValue: null
  }, {
    name: 'plural',
    description: 'Marks a fragment as being backed by a GraphQLList',
    type: BOOLEAN,
    defaultValue: null
  }],
  onOperation: false,
  onFragment: true,
  onField: true
};