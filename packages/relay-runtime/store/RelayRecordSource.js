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

import type {MutableRecordSource, RecordObjectMap} from './RelayStoreTypes';

class RelayRecordSource {
  constructor(records?: RecordObjectMap): MutableRecordSource {
    return RelayRecordSource.create(records);
  }

  static create(records?: RecordObjectMap): MutableRecordSource {
    return new RelayRecordSourceMapImpl(records);
  }
}

module.exports = RelayRecordSource;
