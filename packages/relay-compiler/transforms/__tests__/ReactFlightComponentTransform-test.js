/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @emails oncall+relay
 */

// flowlint ambiguous-object-type:error

'use strict';

const CompilerContext = require('../../core/CompilerContext');
const IRPrinter = require('../../core/IRPrinter');
const ReactFlightComponentTransform = require('../ReactFlightComponentTransform');
const RelayParser = require('../../core/RelayParser');

const {RelayFeatureFlags} = require('relay-runtime');
const {
  TestSchema,
  generateTestsFromFixtures,
} = require('relay-test-utils-internal');

describe('ReactFlightComponentTransform', () => {
  beforeAll(() => {
    RelayFeatureFlags.ENABLE_REACT_FLIGHT_COMPONENT_FIELD = true;
  });
  afterAll(() => {
    RelayFeatureFlags.ENABLE_REACT_FLIGHT_COMPONENT_FIELD = true;
  });
  generateTestsFromFixtures(
    `${__dirname}/fixtures/react-flight-component-transform`,
    text => {
      const ast = RelayParser.parse(TestSchema, text);
      return new CompilerContext(TestSchema)
        .addAll(ast)
        .applyTransforms([ReactFlightComponentTransform.transform])
        .documents()
        .map(doc => IRPrinter.print(TestSchema, doc))
        .join('\n');
    },
  );
});
