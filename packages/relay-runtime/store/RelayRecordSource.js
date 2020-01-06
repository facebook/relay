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

const RelayRecordSourceMapImpl = require('./RelayRecordSourceMapImpl');

import type {MutableRecordSource, RecordMap} from './RelayStoreTypes';

class RelayRecordSource {
  constructor(records?: RecordMap): MutableRecordSource {
    return RelayRecordSource.create(records);
  }

  static create(records?: RecordMap): MutableRecordSource {
    return new RelayRecordSourceMapImpl(records);
  }
}

module.exports = RelayRecordSource;
