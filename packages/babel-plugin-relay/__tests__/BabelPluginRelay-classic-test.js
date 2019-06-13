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

const path = require('path');
const transformerWithOptions = require('./transformerWithOptions');

const {generateTestsFromFixtures} = require('relay-test-utils-internal');

const OLD_SCHEMA_PATH = path.resolve(__dirname, './testschema.rfc.graphql');

generateTestsFromFixtures(
  `${__dirname}/fixtures-classic`,
  transformerWithOptions({
    schema: OLD_SCHEMA_PATH,
    substituteVariables: true,
  }),
);
