/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

require('configureForRelayOSS');

const RelayParser = require('RelayParser');
const RelayTestSchema = require('RelayTestSchema');
const {generateTestsFromFixtures} = require('RelayModernTestUtils');
const RelayMatchTransform = require('../../transforms/RelayMatchTransform');
const {ASTConvert} = require('graphql-compiler');

describe('RelayParser', () => {
  const schema = ASTConvert.transformASTSchema(RelayTestSchema, [
    RelayMatchTransform.SCHEMA_EXTENSION,
  ]);

  generateTestsFromFixtures(`${__dirname}/fixtures/parser`, text => {
    try {
      const ir = RelayParser.parse(schema, text);
      return JSON.stringify(ir, null, 2);
    } catch (e) {
      return 'ERROR:\n' + e;
    }
  });
});
