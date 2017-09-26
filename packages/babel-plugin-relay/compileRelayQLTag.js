/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule compileRelayQLTag
 * @flow
 * @format
 */

'use strict';

const createTransformError = require('./createTransformError');
const getClassicTransformer = require('./getClassicTransformer');

import type {BabelState} from './BabelPluginRelay';
import type {GraphQLSchemaProvider} from './getClassicTransformer';
import typeof BabelTypes from 'babel-types';

/**
 * Given all the metadata about a found RelayQL tag, compile it and return
 * the resulting Babel AST.
 */
function compileRelayQLTag(
  t: BabelTypes,
  path: Object,
  schemaProvider: GraphQLSchemaProvider,
  quasi: Object,
  documentName: string,
  propName: ?string,
  tagName: string,
  enableValidation: boolean,
  state: BabelState,
): Object {
  try {
    const fileOpts = (state.file && state.file.opts) || {};
    const transformer = getClassicTransformer(
      schemaProvider,
      state.opts || {},
      fileOpts,
    );
    return transformer.transform(t, quasi, {
      documentName,
      propName,
      tagName,
      enableValidation,
    });
  } catch (error) {
    throw path.buildCodeFrameError(createTransformError(error), Error);
  }
}

module.exports = compileRelayQLTag;
