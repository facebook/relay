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

const fs = require('fs');
const path = require('path');

const {buildASTSchema, parse} = require('graphql');

const schemaPath = path.join(__dirname, 'testschema.graphql');
module.exports = buildASTSchema(parse(fs.readFileSync(schemaPath, 'utf8')));
