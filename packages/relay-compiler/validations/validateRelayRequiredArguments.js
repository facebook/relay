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
  Connection,
  Directive,
  Field,
  Fragment,
  Root,
  SplitOperation,
} from '../core/GraphQLIR';
import type {GraphQLOutputType, GraphQLArgument} from 'graphql';

type State = {|
  +rootNode: Fragment | Root | SplitOperation,
  +parentType: GraphQLOutputType,
|};

/*
 * Validate required arguments are provided after transforms filling in arguments
 */
function validateRelayRequiredArguments(context: GraphQLCompilerContext): void {
  GraphQLIRValidator.validate(
    context,
    {
      Directive: visitDirective,
      ConnectionField: visitField,
      InlineFragment: visitInlineFragment,
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
  if (directiveDef == null) {
    return;
  }
  validateRequiredArguments(node, directiveDef.args, rootNode);
}

function visitInlineFragment(fragment, {rootNode}: State): void {
  this.traverse(fragment, {
    rootNode,
    parentType: fragment.typeCondition,
  });
}

function visitField(node: Field, {parentType, rootNode}: State): void {
  const context = this.getContext();
  const definition = getFieldDefinitionStrict(
    context.serverSchema,
    parentType,
    node.name,
  );
  if (definition == null) {
    const isLegacyFatInterface = node.directives.some(
      directive => directive.name === 'fixme_fat_interface',
    );
    if (!isLegacyFatInterface) {
      throw createUserError(
        `Unknown field '${node.name}' on type '${String(parentType)}'.`,
        [node.loc],
      );
    }
  } else {
    validateRequiredArguments(node, definition.args, rootNode);
  }
  this.traverse(node, {
    rootNode,
    parentType: node.type,
  });
}

function validateRequiredArguments(
  node: Connection | Directive | Field,
  definitionArgs: $ReadOnlyArray<GraphQLArgument>,
  rootNode,
): void {
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

module.exports = validateRelayRequiredArguments;
