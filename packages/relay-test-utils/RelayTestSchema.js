/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule RelayTestSchema
 * @flow
 * @format
 */

'use strict';

const RelayTestSchemaPath = require('./RelayTestSchemaPath');

const fs = require('fs');

const {buildASTSchema, parse} = require('graphql');

module.exports = buildASTSchema(
  parse(fs.readFileSync(RelayTestSchemaPath, 'utf8'), {assumeValid: true}),
);
