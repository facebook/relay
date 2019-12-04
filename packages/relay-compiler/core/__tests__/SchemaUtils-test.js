/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 * @emails oncall+relay
 */

// flowlint ambiguous-object-type:error

'use strict';

const Schema = require('../Schema');
const SchemaUtils = require('../SchemaUtils');

const {Source} = require('graphql');

test('generateIDField', () => {
  const schema = Schema.create(
    new Source(`
      interface Node { id: ID }
    `),
  );
  const idType = schema.expectIdType();
  expect(SchemaUtils.generateIDField(idType)).toEqual({
    kind: 'ScalarField',
    alias: 'id',
    args: [],
    directives: [],
    handles: null,
    loc: {kind: 'Generated'},
    metadata: null,
    name: 'id',
    type: idType,
  });
});
