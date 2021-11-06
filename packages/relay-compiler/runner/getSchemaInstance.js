/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

import type {Schema} from '../core/Schema';
import type {DocumentNode, Source} from 'graphql';

const {create} = require('../core/Schema');

const schemaCache: Map<Source, Schema> = new Map();

function getSchemaInstance(
  getSchemaSource: () => Source,
  getSchemaExtensions: () => $ReadOnlyArray<DocumentNode>,
  schemaExtensions: $ReadOnlyArray<string>,
): Schema {
  const source = getSchemaSource();
  let schema = schemaCache.get(source);
  if (schema == null) {
    schema = create(source, getSchemaExtensions(), schemaExtensions);
    schemaCache.set(source, schema);
  }
  return schema;
}

module.exports = getSchemaInstance;
