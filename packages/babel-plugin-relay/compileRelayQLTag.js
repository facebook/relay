/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule compileRelayQLTag
 * @format
 */

'use strict';

const createTransformError = require('./createTransformError');
const getClassicTransformer = require('./getClassicTransformer');

/**
 * Given all the metadata about a found RelayQL tag, compile it and return
 * the resulting Babel AST.
 */
function compileRelayQLTag(
  t,
  schemaProvider,
  quasi,
  documentName,
  propName,
  tagName,
  enableValidation,
  state,
) {
  try {
    const transformer = getClassicTransformer(schemaProvider, state.opts || {});
    return transformer.transform(t, quasi, {
      documentName,
      propName,
      tagName,
      enableValidation,
    });
  } catch (error) {
    return createTransformError(t, error, quasi, state);
  }
}

module.exports = compileRelayQLTag;
