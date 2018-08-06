/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const GraphQLCompilerContext = require('../core/GraphQLCompilerContext');
const GraphQLIRTransformer = require('../core/GraphQLIRTransformer');

import type {Directive} from '../core/GraphQLIR';

/**
 * A transform that removes any directives that were not present in the
 * server schema.
 */
function filterDirectivesTransform(
  context: GraphQLCompilerContext,
): GraphQLCompilerContext {
  return GraphQLIRTransformer.transform(context, {
    Directive: visitDirective,
  });
}

/**
 * @internal
 *
 * Skip directives not defined in the original schema.
 */
function visitDirective(directive: Directive): ?Directive {
  if (
    this.getContext()
      .serverSchema.getDirectives()
      .some(schemaDirective => schemaDirective.name === directive.name)
  ) {
    return directive;
  }
  return null;
}

module.exports = {
  transform: filterDirectivesTransform,
};
