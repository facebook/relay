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

const fs = require('fs');
const path = require('path');

const testSchemaPath = (path.join(__dirname, 'testschema.graphql'): string);

const {Source} = require('graphql');

const {
  Schema: {create},
} = require('relay-compiler');
import type {Schema} from 'relay-compiler';

module.exports = ({
  TestSchema: create(new Source(fs.readFileSync(testSchemaPath, 'utf8'))),
  testSchemaPath,
}: {|
  +TestSchema: Schema,
  +testSchemaPath: string,
|});
