/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const GraphQLIRTransformer = require('../core/GraphQLIRTransformer');

import type GraphQLCompilerContext from '../core/GraphQLCompilerContext';
import type {Directive} from '../core/GraphQLIR';

/**
 * A transform that removes any directives that were not present in the
 * server schema.
 */
function filterDirectivesTransform(
  context: GraphQLCompilerContext,
): GraphQLCompilerContext {
  const schemaDirectives = new Set(
    context.serverSchema
      .getDirectives()
      .map(schemaDirective => schemaDirective.name),
  );
  const visitDirective = (directive: Directive): ?Directive => {
    if (schemaDirectives.has(directive.name)) {
      return directive;
    }
    return null;
  };
  return GraphQLIRTransformer.transform(context, {
    Directive: visitDirective,
  });
}

module.exports = {
  transform: filterDirectivesTransform,
};
