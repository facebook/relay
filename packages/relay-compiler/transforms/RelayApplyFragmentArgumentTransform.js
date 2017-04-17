/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayApplyFragmentArgumentTransform
 * @flow
 */

'use strict';

const Map = require('Map');
const RelayCompilerContext = require('RelayCompilerContext');
const RelayCompilerScope = require('RelayCompilerScope');

const getIdentifierForRelayArgumentValue = require('getIdentifierForRelayArgumentValue');
const invariant = require('invariant');
const murmurHash = require('murmurHash');

import type {Scope} from 'RelayCompilerScope';
import type {
  Argument,
  ArgumentValue,
  Condition,
  Directive,
  Field,
  Fragment,
  FragmentSpread,
  Node,
  Selection,
} from 'RelayIR';

const {
  getFragmentScope,
  getRootScope,
} = RelayCompilerScope;

/**
 * A tranform that converts a set of documents containing fragments/fragment
 * spreads *with* arguments to one where all arguments have been inlined. This
 * is effectively static currying of functions. Nodes are changed as follows:
 * - Fragment spreads with arguments are replaced with references to an inlined
 *   version of the referenced fragment.
 * - Fragments with argument definitions are cloned once per unique set of
 *   arguments, with the name changed to original name + hash and all nested
 *   variable references changed to the value of that variable given its
 *   arguments.
 * - Field & directive argument variables are replaced with the value of those
 *   variables in context.
 * - All nodes are cloned with updated children.
 *
 * The transform also handles statically passing/failing Condition nodes:
 * - Literal Conditions with a passing value are elided and their selections
 *   inlined in their parent.
 * - Literal Conditions with a failing value are removed.
 * - Nodes that would become empty as a result of the above are removed.
 *
 * Note that unreferenced fragments are not added to the output.
 */
function transform(context: RelayCompilerContext): RelayCompilerContext {
  const documents = context.documents();
  const fragments = new Map();
  let nextContext = new RelayCompilerContext(context.schema);
  nextContext = documents.reduce((ctx, node) => {
    if (node.kind === 'Root') {
      const scope = getRootScope(node.argumentDefinitions);
      const transformedNode = transformNode(
        context,
        fragments,
        scope,
        node
      );
      /* $FlowFixMe(>=0.44.0 site=react_native_fb) Flow error found while
       * deploying v0.44.0. Remove this comment to see the error */
      return transformedNode ? ctx.add(transformedNode) : ctx;
    } else {
      // fragments are transformed when referenced; unreferenced fragments are
      // not added to the output.
      return ctx;
    }
  }, nextContext);
  /* $FlowFixMe(>=0.44.0 site=react_native_fb) Flow error found while deploying
   * v0.44.0. Remove this comment to see the error */
  return Array.from(fragments.values()).reduce(
    /* $FlowFixMe(>=0.44.0 site=react_native_fb) Flow error found while
     * deploying v0.44.0. Remove this comment to see the error */
    (ctx, fragment) => fragment ? ctx.add(fragment) : ctx,
    nextContext
  );
}

function transformNode<T: Node>(
  context: RelayCompilerContext,
  fragments: Map<string, ?Fragment>,
  scope: Scope,
  node: T
): ?T {
  const selections = transformSelections(
    context,
    fragments,
    scope,
    node.selections
  );
  if (!selections) {
    return null;
  }
  if (node.hasOwnProperty('directives')) {
    const directives = transformDirectives(
      scope,
      (node: $FlowIssue).directives
    );
    // $FlowIssue: this is a valid `Node`:
    return ({
      ...node,
      directives,
      selections,
    }: any);
  }
  return ({
    ...node,
    selections,
  }: $FlowIssue);
}

function transformFragmentSpread(
  context: RelayCompilerContext,
  fragments: Map<string, ?Fragment>,
  scope: Scope,
  spread: FragmentSpread
): ?FragmentSpread {
  const directives = transformDirectives(
    scope,
    spread.directives
  );
  const fragment = context.get(spread.name);
  invariant(
    fragment && fragment.kind === 'Fragment',
    'RelayApplyFragmentArgumentTransform: expected `%s` to be a fragment, ' +
    'got `%s`.',
    spread.name,
    fragment && fragment.kind
  );
  const appliedFragment = transformFragment(
    context,
    fragments,
    scope,
    fragment,
    spread.args
  );
  if (!appliedFragment) {
    return null;
  }
  return {
    ...spread,
    args: [],
    directives,
    name: appliedFragment.name,
  };
}

function transformField<T: Field>(
  context: RelayCompilerContext,
  fragments: Map<string, ?Fragment>,
  scope: Scope,
  field: T
): ?T {
  const args = transformArguments(
    scope,
    field.args
  );
  const directives = transformDirectives(
    scope,
    field.directives
  );
  if (field.kind === 'LinkedField') {
    const selections = transformSelections(
      context,
      fragments,
      scope,
      field.selections
    );
    if (!selections) {
      return null;
    }
    // $FlowFixMe(>=0.28.0)
    return {
      ...field,
      args,
      directives,
      selections,
    };
  } else {
    return {
      ...field,
      args,
      directives,
    };
  }
}

function transformCondition(
  context: RelayCompilerContext,
  fragments: Map<string, ?Fragment>,
  scope: Scope,
  node: Condition
): ?Array<Selection> {
  const condition = transformValue(scope, node.condition);
  invariant(
    condition.kind === 'Literal' || condition.kind === 'Variable',
    'RelayApplyFragmentArgumentTransform: A non-scalar value was applied to ' +
    'an @include or @skip directive, the `if` argument value must be a ' +
    'variable or a Boolean, got `%s`.',
    condition
  );
  if (
    condition.kind === 'Literal' &&
    condition.value !== node.passingValue
  ) {
    // Dead code, no need to traverse further.
    return null;
  }
  const selections = transformSelections(
    context,
    fragments,
    scope,
    node.selections
  );
  if (!selections) {
    return null;
  }
  if (
    condition.kind === 'Literal' &&
    condition.value === node.passingValue
  ) {
    // Always passes, return inlined selections
    return selections;
  }
  return [{
    ...node,
    condition,
    selections,
  }];
}

function transformSelections(
  context: RelayCompilerContext,
  fragments: Map<string, ?Fragment>,
  scope: Scope,
  selections: Array<Selection>
): ?Array<Selection> {
  let nextSelections = null;
  selections.forEach(selection => {
    let nextSelection;
    if (selection.kind === 'InlineFragment') {
      nextSelection =  transformNode(context, fragments, scope, selection);
    } else if (selection.kind === 'FragmentSpread') {
      nextSelection =
        transformFragmentSpread(context, fragments, scope, selection);
    } else if (selection.kind === 'Condition') {
      const conditionSelections =
        transformCondition(context, fragments, scope, selection);
      if (conditionSelections) {
        nextSelections = nextSelections || [];
        nextSelections.push(...conditionSelections);
      }
    } else {
      nextSelection =  transformField(context, fragments, scope, selection);
    }
    if (nextSelection) {
      nextSelections = nextSelections || [];
      nextSelections.push(nextSelection);
    }
  });
  return nextSelections;
}

function transformDirectives(
  scope: Scope,
  directives: Array<Directive>
): Array<Directive> {
  return directives.map(directive => {
    const args = transformArguments(scope, directive.args);
    return {
      ...directive,
      args,
    };
  });
}

function transformArguments(
  scope: Scope,
  args: Array<Argument>
): Array<Argument> {
  return args.map(arg => {
    const value = transformValue(scope, arg.value);
    return value === arg.value ?
      arg :
      {...arg, value};
  });
}

function transformValue(
  scope: Scope,
  value: ArgumentValue
): ArgumentValue {
  if (value.kind === 'Variable') {
    const scopeValue = scope[value.variableName];
    invariant(
      scopeValue != null,
      'RelayApplyFragmentArgumentTransform: variable `%s` is not in scope.',
      value.variableName,
    );
    return scopeValue;
  } else if (value.kind === 'ListValue') {
    return {
      ...value,
      items: value.items.map(item => transformValue(scope, item)),
    };
  } else if (value.kind === 'ObjectValue') {
    return {
      ...value,
      fields: value.fields.map(field => ({
        ...field,
        value: transformValue(scope, field.value),
      })),
    };
  }
  return value;
}

/**
 * Apply arguments to a fragment, creating a new fragment (with the given name)
 * with all values recursively applied.
 */
function transformFragment(
  context: RelayCompilerContext,
  fragments: Map<string, ?Fragment>,
  parentScope: Scope,
  fragment: Fragment,
  args: Array<Argument>
): ?Fragment {
  const argumentsHash = hashArguments(args, parentScope);
  const fragmentName = argumentsHash ?
    `${fragment.name}_${argumentsHash}` :
    fragment.name;
  const appliedFragment = fragments.get(fragmentName);
  if (appliedFragment) {
    return appliedFragment;
  }
  const fragmentScope = getFragmentScope(
    fragment.argumentDefinitions,
    args,
    parentScope
  );
  invariant(
    !fragments.has(fragmentName) || fragments.get(fragmentName) !== undefined,
    'RelayApplyFragmentArgumentTransform: Found a circular reference from ' +
    'fragment `%s`.',
    fragment.name
  );
  fragments.set(fragmentName, undefined); // to detect circular references
  let transformedFragment = null;
  const selections = transformSelections(
    context,
    fragments,
    fragmentScope,
    fragment.selections
  );
  if (selections) {
    transformedFragment = {
      ...fragment,
      selections,
      name: fragmentName,
      argumentDefinitions: [],
    };
  }
  fragments.set(fragmentName, transformedFragment);
  return transformedFragment;
}

function hashArguments(
  args: Array<Argument>,
  scope: Scope
): ?string {
  if (!args.length) {
    return null;
  }
  const sortedArgs = [...args].sort((a, b) => {
    return a.name < b.name ? -1 :
      a.name > b.name ? 1 :
      0;
  });
  const printedArgs = JSON.stringify(sortedArgs.map(arg => {
    let value;
    if (arg.value.kind === 'Variable') {
      value = scope[arg.value.variableName];
      invariant(
        value != null,
        'RelayApplyFragmentArgumentTransform: variable `%s` is not in scope.',
        arg.value.variableName,
      );
    } else {
      value = arg.value;
    }
    return {
      name: arg.name,
      value: getIdentifierForRelayArgumentValue(value),
    };
  }));
  return murmurHash(printedArgs);
}

module.exports = {transform};
