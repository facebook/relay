/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

import type {Schema} from '../core/Schema';

const {create} = require('../core/Schema');
const fs = require('fs');
const {Source} = require('graphql');
const path = require('path');

const testSchemaPath = (path.join(__dirname, 'testschema.graphql'): string);

module.exports = ({
  TestSchema: create(new Source(fs.readFileSync(testSchemaPath, 'utf8'))),
  testSchemaPath,
}: {|
  +TestSchema: Schema,
  +testSchemaPath: string,
|});
