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

import type GraphQLCompilerContext from '../core/GraphQLCompilerContext';
import type {
  Connection,
  Directive,
  Field,
  Fragment,
  Root,
  SplitOperation,
} from '../core/GraphQLIR';
import type {Schema, TypeID, FieldArgument} from '../core/Schema';

type State = {|
  +rootNode: Fragment | Root | SplitOperation,
  +parentType: TypeID,
|};

/*
 * Validate required arguments are provided after transforms filling in arguments
 */
function validateRequiredArguments(
  context: GraphQLCompilerContext,
): GraphQLCompilerContext {
  GraphQLIRValidator.validate(
    context,
    {
      Directive: visitDirective,
      ConnectionField: visitField,
      InlineFragment: visitInlineFragment,
      LinkedField: visitField,
      ScalarField: visitField,
      // FragmentSpread validation is done in ApplyFragmentArgumentTransform
    },
    node => ({rootNode: node, parentType: node.type}),
  );
  return context;
}

function visitDirective(node: Directive, {rootNode}: State): void {
  const context: GraphQLCompilerContext = this.getContext();
  const directiveDef = context.getSchema().getDirective(node.name);
  if (directiveDef == null) {
    return;
  }
  validateRequiredArgumentsOnNode(
    context.getSchema(),
    node,
    directiveDef.args,
    rootNode,
  );
}

function visitInlineFragment(fragment, {rootNode}: State): void {
  this.traverse(fragment, {
    rootNode,
    parentType: fragment.typeCondition,
  });
}

function visitField(node: Field, {parentType, rootNode}: State): void {
  const context: GraphQLCompilerContext = this.getContext();
  const schema = context.getSchema();
  const definition = getFieldDefinitionStrict(schema, parentType, node.name);
  if (definition == null) {
    const isLegacyFatInterface = node.directives.some(
      directive => directive.name === 'fixme_fat_interface',
    );
    if (!isLegacyFatInterface) {
      throw createUserError(
        `Unknown field '${node.name}' on type ` +
          `'${schema.getTypeString(parentType)}'.`,
        [node.loc],
      );
    }
  } else {
    validateRequiredArgumentsOnNode(
      schema,
      node,
      schema.getFieldConfig(definition).args,
      rootNode,
    );
  }
  this.traverse(node, {
    rootNode,
    parentType: node.type,
  });
}

function validateRequiredArgumentsOnNode(
  schema: Schema,
  node: Connection | Directive | Field,
  definitionArgs: $ReadOnlyArray<FieldArgument>,
  rootNode: Fragment | Root | SplitOperation,
): void {
  const nodeArgsSet = new Set(node.args.map(arg => arg.name));
  for (const arg of definitionArgs) {
    if (schema.isNonNull(arg.type) && !nodeArgsSet.has(arg.name)) {
      throw createUserError(
        `Required argument '${arg.name}: ${schema.getTypeString(arg.type)}' ` +
          `is missing on '${node.name}' in '${rootNode.name}'.`,
        [node.loc, rootNode.loc],
      );
    }
  }
}

module.exports = {
  transform: validateRequiredArguments,
};
