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

const GraphQLIRValidator = require('../core/GraphQLIRValidator');

const {createUserError} = require('../core/RelayCompilerError');
const {getFieldDefinitionStrict} = require('../core/getFieldDefinition');
const {isRequiredArgument} = require('graphql');

import type GraphQLCompilerContext from '../core/GraphQLCompilerContext';
import type {
  Directive,
  Fragment,
  LinkedField,
  Root,
  ScalarField,
  SplitOperation,
} from '../core/GraphQLIR';
import type {GraphQLOutputType, GraphQLArgument} from 'graphql';

type State = {|
  +rootNode: Fragment | Root | SplitOperation,
  +parentType: GraphQLOutputType,
|};

/*
 * Validate requierd arguments are provided after transforms filling in arguments
 */
function validateRelayRequiredArugments(context: GraphQLCompilerContext): void {
  GraphQLIRValidator.validate(
    context,
    {
      Directive: visitDirective,
      LinkedField: visitField,
      ScalarField: visitField,
      // FragmentSpread validation is done in RelayApplyFragmentArgumentTransform
    },
    node => ({rootNode: node, parentType: node.type}),
  );
}

function visitDirective(node: Directive, {parentType, rootNode}: State): void {
  const context = this.getContext();
  const directiveDef = context.serverSchema.getDirective(node.name);
  validateRequiredArguments(node, directiveDef?.args, rootNode);
}

function visitField(
  node: LinkedField | ScalarField,
  {parentType, rootNode}: State,
): void {
  const context = this.getContext();
  const definition = getFieldDefinitionStrict(
    context.serverSchema,
    parentType,
    node.name,
  );
  validateRequiredArguments(node, definition?.args, rootNode);
  this.traverse(node, {
    rootNode,
    parentType: node.type,
  });
}

function validateRequiredArguments(
  node: Directive | LinkedField | ScalarField,
  definitionArgs: ?Array<GraphQLArgument>,
  rootNode,
): void {
  if (!definitionArgs) {
    return;
  }
  for (const arg of definitionArgs) {
    if (
      isRequiredArgument(arg) &&
      !node.args.some(actualArg => actualArg.name === arg.name)
    ) {
      throw createUserError(
        `Required argument '${arg.name}: ${String(arg.type)}' is missing ` +
          `on '${node.name}' in '${rootNode.name}'.`,
        [node.loc, rootNode.loc],
      );
    }
  }
}

module.exports = validateRelayRequiredArugments;
