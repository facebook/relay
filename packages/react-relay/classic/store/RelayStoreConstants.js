/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

/**
 * An id used for the root of the graph, corresponding to the "Query" type.
 * Conceptually, root fields in queries can be viewed as normal fields on a
 * synthesized root record.
 */
const ROOT_ID = 'client:root';

module.exports = {
  ROOT_ID,
};
