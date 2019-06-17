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
  +recordLabel: (label: string, directive: Directive) => void,
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
    sourceNode => {
      const labels = new Map();
      return {
        documentName: sourceNode.name,
        recordLabel: (label, directive) => {
          const prevDirective = labels.get(label);
          if (prevDirective) {
            const labelArg = directive.args.find(({name}) => name === 'label');
            const prevLabelArg = prevDirective.args.find(
              ({name}) => name === 'label',
            );
            const previousLocation = prevLabelArg?.loc ?? prevDirective.loc;
            if (labelArg) {
              throw createUserError(
                `Invalid use of @${directive.name}, the provided label is ` +
                  "not unique. Specify a unique 'label' as a literal string.",
                [labelArg?.loc, previousLocation],
              );
            } else {
              throw createUserError(
                `Invalid use of @${directive.name}, could not generate a ` +
                  "default label that is unique. Specify a unique 'label' " +
                  'as a literal string.',
                [directive.loc, previousLocation],
              );
            }
          }
          labels.set(label, directive);
        },
      };
    },
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
    return transformedField;
  }
  const initialCount = streamDirective.args.find(
    arg => arg.name === 'initial_count',
  );
  if (initialCount == null) {
    throw createUserError(
      "Invalid use of @stream, the 'initial_count' argument is required.",
      [streamDirective.loc],
    );
  }
  const label =
    getLiteralStringArgument(streamDirective, 'label') ??
    field.alias ??
    field.name;
  const transformedLabel = transformLabel(state.documentName, 'stream', label);
  state.recordLabel(transformedLabel, streamDirective);
  return {
    if: ifArg?.value ?? null,
    initialCount: initialCount.value,
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
    return transformedFragment;
  }
  const label =
    getLiteralStringArgument(deferDirective, 'label') ??
    fragment.typeCondition.name;
  const transformedLabel = transformLabel(state.documentName, 'defer', label);
  state.recordLabel(transformedLabel, deferDirective);
  return {
    if: ifArg?.value ?? null,
    kind: 'Defer',
    label: transformedLabel,
    loc: {kind: 'Derived', source: deferDirective.loc},
    metadata: {
      // We may lose this information during FlattenTransform
      // Keeping it on metadata will allow us to read it during IRPrinting step
      fragmentTypeCondition: transformedFragment.typeCondition,
    },
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
    return transformedSpread;
  }
  const label =
    getLiteralStringArgument(deferDirective, 'label') ?? spread.name;
  const transformedLabel = transformLabel(state.documentName, 'defer', label);
  state.recordLabel(transformedLabel, deferDirective);
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
): ?string {
  const arg = directive.args.find(({name}) => name === argName);
  if (arg == null) {
    return null;
  }
  const value = arg.value.kind === 'Literal' ? arg.value.value : null;
  if (value == null || typeof value !== 'string') {
    throw createUserError(
      `Expected the '${argName}' value to @${
        directive.name
      } to be a string literal if provided.`,
      [arg.value.loc],
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
