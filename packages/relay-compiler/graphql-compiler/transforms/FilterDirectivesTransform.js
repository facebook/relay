/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule FilterDirectivesTransform
 * @flow
 * @format
 */

'use strict';

const GraphQLCompilerContext = require('../core/GraphQLCompilerContext');
const GraphQLIRTransformer = require('../core/GraphQLIRTransformer');

import type {Directive} from '../core/GraphQLIR';
import type {GraphQLSchema} from 'graphql';

type State = GraphQLSchema;

/**
 * A transform that removes any directives that were not present in the
 * original schema.
 */
function filterDirectivesTransform(
  context: GraphQLCompilerContext,
  schema: GraphQLSchema,
): GraphQLCompilerContext {
  return GraphQLIRTransformer.transform(
    context,
    {Directive: visitDirective},
    () => schema,
  );
}

/**
 * @internal
 *
 * Skip directives not defined in the original schema.
 */
function visitDirective(directive: Directive, state: State): ?Directive {
  if (
    state
      .getDirectives()
      .some(schemaDirective => schemaDirective.name === directive.name)
  ) {
    return directive;
  }
  return null;
}

module.exports = {
  transform: filterDirectivesTransform,
};
