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

const transformerWithOptions = require('./transformerWithOptions');

const {generateTestsFromFixtures, testSchemaPath} = require('relay-test-utils');

generateTestsFromFixtures(
  `${__dirname}/fixtures-compat-haste`,
  transformerWithOptions({
    compat: true,
    haste: true,
    schema: testSchemaPath,
    substituteVariables: true,
  }),
);
