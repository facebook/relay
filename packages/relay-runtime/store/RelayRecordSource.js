/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const RelayFeatureFlags = require('../util/RelayFeatureFlags');
const RelayRecordSourceMapImpl = require('./RelayRecordSourceMapImpl');
const RelayRecordSourceObjectImpl = require('./RelayRecordSourceObjectImpl');

import type {MutableRecordSource, RecordMap} from './RelayStoreTypes';

class RelayRecordSource {
  constructor(records?: RecordMap): MutableRecordSource {
    return RelayRecordSource.create(records);
  }

  static create(records?: RecordMap): MutableRecordSource {
    const RecordSourceImpl = RelayFeatureFlags.USE_RECORD_SOURCE_MAP_IMPL
      ? RelayRecordSourceMapImpl
      : RelayRecordSourceObjectImpl;
    return new RecordSourceImpl(records);
  }
}

module.exports = RelayRecordSource;
