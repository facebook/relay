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

const IRTransformer = require('../core/IRTransformer');

const murmurHash = require('../util/murmurHash');

const {createUserError} = require('../core/CompilerError');
const {ConnectionInterface} = require('relay-runtime');

import type CompilerContext from '../core/CompilerContext';
import type {
  Argument,
  Connection,
  Defer,
  Directive,
  FragmentSpread,
  InlineFragment,
  LinkedField,
  ScalarField,
  Stream,
} from '../core/IR';

type State = {|
  +documentName: string,
  +recordLabel: (label: string, directive: Directive) => void,
|};

/**
 * This transform finds usages of @defer and @stream, validates them, and
 * converts the using node to specialized IR nodes (Defer/Stream).
 */
function deferStreamTransform(context: CompilerContext): CompilerContext {
  return IRTransformer.transform(
    context,
    {
      Connection: visitConnection,
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

function visitConnection(connection: Connection, state: State): Connection {
  const transformed: Connection = this.traverse(connection, state);
  const stream = transformed.stream;
  if (stream == null) {
    return transformed;
  }
  const {EDGES, PAGE_INFO} = ConnectionInterface.get();
  const edges = transformed.selections.find(
    selection => selection.kind === 'LinkedField' && selection.name === EDGES,
  );
  const pageInfo = transformed.selections.find(
    selection =>
      selection.kind === 'LinkedField' && selection.name === PAGE_INFO,
  );
  if (edges == null || pageInfo == null) {
    throw createUserError(
      `Invalid connection, expected the '${EDGES}' and '${PAGE_INFO}' fields ` +
        'to exist.',
      [transformed.loc],
    );
  }
  const derivedLocation = {kind: 'Derived', source: transformed.loc};
  const streamLabel = transformLabel(
    state.documentName,
    'stream',
    transformed.label,
  );
  const deferLabel = transformLabel(
    state.documentName,
    'defer',
    transformed.label,
  );
  return {
    ...connection,
    selections: [
      {
        kind: 'Stream',
        loc: derivedLocation,
        metadata: null,
        selections: [edges],
        label: streamLabel,
        if: stream.if,
        initialCount: stream.initialCount,
      },
      {
        kind: 'Defer',
        loc: derivedLocation,
        metadata: null,
        selections: [pageInfo],
        label: deferLabel,
        if: stream.if,
      },
    ],
    stream: {
      ...stream,
      streamLabel,
      deferLabel,
    },
  };
}

function visitLinkedField(
  field: LinkedField,
  state: State,
): LinkedField | Stream {
  const context: CompilerContext = this.getContext();
  const schema = context.getSchema();

  let transformedField: LinkedField = this.traverse(field, state);
  const streamDirective = transformedField.directives.find(
    directive => directive.name === 'stream',
  );
  if (streamDirective == null) {
    return transformedField;
  }
  const type = schema.getNullableType(field.type);
  if (!schema.isList(type)) {
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
    getLiteralStringArgument(streamDirective, 'label') ?? field.alias;
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
  const deferDirective = fragment.directives.find(
    directive => directive.name === 'defer',
  );
  if (deferDirective != null) {
    throw createUserError(
      'Invalid use of @defer on an inline fragment, @defer is only supported on fragment spreads.',
      [fragment.loc],
    );
  }
  return this.traverse(fragment, state);
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
    getLiteralStringArgument(deferDirective, 'label') ??
    getFragmentSpreadName(spread);
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

function getFragmentSpreadName(fragmentSpread: FragmentSpread): string {
  if (fragmentSpread.args.length === 0) {
    return fragmentSpread.name;
  }
  const sortedArgs = [...fragmentSpread.args].sort((a, b) => {
    return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
  });
  const hash = murmurHash(JSON.stringify(sortedArgs));
  return `${fragmentSpread.name}_${hash}`;
}

module.exports = {
  transform: deferStreamTransform,
};
