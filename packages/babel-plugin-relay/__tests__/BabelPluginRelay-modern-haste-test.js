/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall relay
 */

'use strict';

const transformerWithOptions = require('./transformerWithOptions');
const {generateTestsFromFixtures} = require('relay-test-utils-internal');

generateTestsFromFixtures(
  `${__dirname}/fixtures`,
  transformerWithOptions({
    jsModuleFormat: 'haste',
  }),
);
