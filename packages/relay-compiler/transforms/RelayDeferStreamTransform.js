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

const CompilerContext = require('../core/GraphQLCompilerContext');
const IRTransformer = require('../core/GraphQLIRTransformer');

const {getNullableType} = require('../core/GraphQLSchemaUtils');
const {createUserError} = require('../core/RelayCompilerError');
const {GraphQLList} = require('graphql');

import type {
  Argument,
  Defer,
  Directive,
  FragmentSpread,
  InlineFragment,
  LinkedField,
  ScalarField,
  Stream,
} from '../core/GraphQLIR';

type State = {|
  +documentName: string,
|};

/**
 * This transform finds usages of @defer and @stream, validates them, and
 * converts the using node to specialized IR nodes (Defer/Stream).
 */
function relayDeferStreamTransform(context: CompilerContext): CompilerContext {
  return IRTransformer.transform(
    context,
    {
      // TODO: type IRTransformer to allow changing result type
      FragmentSpread: (visitFragmentSpread: $FlowFixMe),
      // TODO: type IRTransformer to allow changing result type
      InlineFragment: (visitInlineFragment: $FlowFixMe),
      // TODO: type IRTransformer to allow changing result type
      LinkedField: (visitLinkedField: $FlowFixMe),
      ScalarField: visitScalarField,
    },
    sourceNode => ({
      documentName: sourceNode.name,
    }),
  );
}

function visitLinkedField(
  field: LinkedField,
  state: State,
): LinkedField | Stream {
  let transformedField: LinkedField = this.traverse(field, state);
  const streamDirective = transformedField.directives.find(
    directive => directive.name === 'stream',
  );
  if (streamDirective == null) {
    return transformedField;
  }
  const type = getNullableType(field.type);
  if (!(type instanceof GraphQLList)) {
    throw createUserError(
      `Invalid use of @stream on non-plural field '${field.name}'`,
      [streamDirective.loc],
    );
  }
  transformedField = {
    ...transformedField,
    directives: transformedField.directives.filter(
      directive => directive.name !== 'stream',
    ),
  };
  const ifArg = streamDirective.args.find(arg => arg.name === 'if');
  if (isLiteralFalse(ifArg)) {
    // If a stream is statically known to be disabled, treat as if the node
    // was not streamed.
    return transformedField;
  }
  const initialCount = streamDirective.args.find(
    arg => arg.name === 'initial_count',
  );
  const label = getLiteralStringArgument(streamDirective, 'label');
  const transformedLabel = transformLabel(state.documentName, 'stream', label);
  return {
    if: ifArg?.value ?? null,
    initialCount: initialCount?.value ?? null,
    kind: 'Stream',
    label: transformedLabel,
    loc: {kind: 'Derived', source: streamDirective.loc},
    metadata: null,
    selections: [transformedField],
  };
}

function visitScalarField(field: ScalarField, state: State): ScalarField {
  const streamDirective = field.directives.find(
    directive => directive.name === 'stream',
  );
  if (streamDirective != null) {
    throw createUserError(
      `Invalid use of @stream on scalar field '${field.name}'`,
      [streamDirective.loc],
    );
  }
  return this.traverse(field, state);
}

function visitInlineFragment(
  fragment: InlineFragment,
  state: State,
): InlineFragment | Defer {
  let transformedFragment = this.traverse(fragment, state);
  const deferDirective = transformedFragment.directives.find(
    directive => directive.name === 'defer',
  );
  if (deferDirective == null) {
    return transformedFragment;
  }
  transformedFragment = {
    ...transformedFragment,
    directives: transformedFragment.directives.filter(
      directive => directive.name !== 'defer',
    ),
  };
  const ifArg = deferDirective.args.find(arg => arg.name === 'if');
  if (isLiteralFalse(ifArg)) {
    // If a defer is statically known to be disabled, treat as if the node
    // was not deferred.
    return transformedFragment;
  }
  const label = getLiteralStringArgument(deferDirective, 'label');
  const transformedLabel = transformLabel(state.documentName, 'defer', label);
  return {
    if: ifArg?.value ?? null,
    kind: 'Defer',
    label: transformedLabel,
    loc: {kind: 'Derived', source: deferDirective.loc},
    metadata: null,
    selections: [transformedFragment],
  };
}

function visitFragmentSpread(
  spread: FragmentSpread,
  state: State,
): FragmentSpread | Defer {
  let transformedSpread: FragmentSpread = this.traverse(spread, state);
  const deferDirective = transformedSpread.directives.find(
    directive => directive.name === 'defer',
  );
  if (deferDirective == null) {
    return transformedSpread;
  }
  transformedSpread = {
    ...transformedSpread,
    directives: transformedSpread.directives.filter(
      directive => directive.name !== 'defer',
    ),
  };
  const ifArg = deferDirective.args.find(arg => arg.name === 'if');
  if (isLiteralFalse(ifArg)) {
    // If a defer is statically known to be disabled, treat as if the node
    // was not deferred.
    return transformedSpread;
  }
  const label = getLiteralStringArgument(deferDirective, 'label');
  const transformedLabel = transformLabel(state.documentName, 'defer', label);
  return {
    if: ifArg?.value ?? null,
    kind: 'Defer',
    label: transformedLabel,
    loc: {kind: 'Derived', source: deferDirective.loc},
    metadata: null,
    selections: [transformedSpread],
  };
}

function getLiteralStringArgument(
  directive: Directive,
  argName: string,
): string {
  // NOTE: can't use getLiteralArgumentValues here because other args
  // are allowed to be non-literals
  const arg = directive.args.find(({name}) => name === argName);
  const value =
    arg != null && arg.value.kind === 'Literal' ? arg.value.value : null;
  if (typeof value !== 'string') {
    throw createUserError(
      `Expected the '${argName}' value to @${
        directive.name
      } to be a string literal.`,
      [arg?.value.loc ?? directive.loc],
    );
  }
  return value;
}

function transformLabel(
  parentName: string,
  directive: string,
  label: string,
): string {
  return `${parentName}$${directive}$${label}`;
}

function isLiteralFalse(arg: ?Argument): boolean {
  return (
    arg != null && arg.value.kind === 'Literal' && arg.value.value === false
  );
}

module.exports = {
  transform: relayDeferStreamTransform,
};
