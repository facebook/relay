/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @fullSyntaxTransform
 * @providesModule getBabelRelayPlugin
 * @format
 */

'use strict';

const compileRelayQLTag = require('./compileRelayQLTag');
const getDocumentName = require('./getDocumentName');
const getValidRelayQLTag = require('./getValidRelayQLTag');

import type {Validator} from './RelayQLTransformer';

type GraphQLSchemaProvider = Object | (() => Object);

/**
 * Returns a new Babel Transformer that uses the supplied schema to transform
 * template strings tagged with `Relay.QL` into an internal representation of
 * GraphQL queries.
 */
function getBabelRelayPlugin(
  schemaProvider: GraphQLSchemaProvider,
  pluginOptions?: ?{
    debug?: ?boolean,
    inputArgumentName?: ?string,
    snakeCase?: ?boolean,
    suppressWarnings?: ?boolean,
    substituteVariables?: ?boolean,
    validator?: ?Validator<any>,
  },
): Function {
  const options = pluginOptions || {};

  return function(babel) {
    const t = babel.types;
    return {
      visitor: {
        /**
         * Transform Relay.QL`...`.
         */
        TaggedTemplateExpression(path, state) {
          const [quasi, tagName, propName] = getValidRelayQLTag(path);
          if (quasi) {
            const documentName = getDocumentName(path, state);
            path.replaceWith(
              compileRelayQLTag(
                t,
                schemaProvider,
                quasi,
                documentName,
                propName,
                tagName,
                state,
                options,
              ),
            );
          }
        },
      },
    };
  };
}

module.exports = getBabelRelayPlugin;
