/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
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
function transform(
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

module.exports = {transform};
