/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayTestSchema
 * @flow
 */

'use strict';

const fs = require('fs');
const path = require('path');

const {buildASTSchema, parse} = require('graphql');

const schemaPath = path.join(__dirname, 'testschema.graphql');
module.exports = buildASTSchema(parse(fs.readFileSync(schemaPath, 'utf8')));
