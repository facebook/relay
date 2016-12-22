/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayStoreConstants
 * @flow
 */

'use strict';

/**
 * An id used for the root of the graph, corresponding to the "Query" type.
 * Conceptually, root fields in queries can be viewed as normal fields on a
 * synthesized root record.
 */
const ROOT_ID = 'client:root';

/**
 * The type of the root record.
 */
const ROOT_TYPE = 'Query';

module.exports = {
  ROOT_ID,
  ROOT_TYPE,
};
