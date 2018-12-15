/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const RelayCompilerScope = require('../core/RelayCompilerScope');

const murmurHash = require('../util/murmurHash');

const {GraphQLError} = require('graphql');
const IRTransformer=require('../core/GraphQLIRTransformer')
const getIdentifierForArgumentValue=require('../core/getIdentifierForArgumentValue')

import type {Scope} from '../core/RelayCompilerScope';
import type {
  Argument,
  ArgumentValue,
  Condition,
  CompilerContext,
  Directive,
  Field,
  Fragment,
  FragmentSpread,
  Node,
  Selection,
} from 'graphql-compiler';

const {getFragmentScope, getRootScope} = RelayCompilerScope;

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
function relayApplyFragmentArgumentTransform(
  context: CompilerContext,
): CompilerContext {
  const fragments: Map<string, ?Fragment> = new Map();
  const nextContext = IRTransformer.transform(context, {
    Root: node => {
      const scope = getRootScope(node.argumentDefinitions);
      return transformNode(context, fragments, scope, node, [
        `Query '${node.name}'`,
      ]);
    },
    // Fragments are included below where referenced.
    // Unreferenced fragments are not included.
    Fragment: () => null,
  });

  return (Array.from(fragments.values()): Array<?Fragment>).reduce(
    (ctx: CompilerContext, fragment) => (fragment ? ctx.add(fragment) : ctx),
    nextContext,
  );
}

function transformNode<T: Node>(
  context: CompilerContext,
  fragments: Map<string, ?Fragment>,
  scope: Scope,
  node: T,
  errorContext: $ReadOnlyArray<string>,
): ?T {
  const selections = transformSelections(
    context,
    fragments,
    scope,
    node.selections,
    errorContext,
  );
  if (!selections) {
    return null;
  }
  if (node.hasOwnProperty('directives')) {
    const directives = transformDirectives(
      scope,
      (node: $FlowIssue).directives,
      errorContext,
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
  context: CompilerContext,
  fragments: Map<string, ?Fragment>,
  scope: Scope,
  spread: FragmentSpread,
  errorContext: $ReadOnlyArray<string>,
): ?FragmentSpread {
  const directives = transformDirectives(
    scope,
    spread.directives,
    errorContext,
  );
  const fragment = context.getFragment(spread.name);
  const appliedFragment = transformFragment(
    context,
    fragments,
    scope,
    fragment,
    spread.args,
    [...errorContext, `Fragment '${fragment.name}'`],
  );
  if (!appliedFragment) {
    return null;
  }
  const transformed: FragmentSpread = {
    ...spread,
    kind: 'FragmentSpread',
    args: [],
    directives,
    name: appliedFragment.name,
  };
  return transformed;
}

function transformField<T: Field>(
  context: CompilerContext,
  fragments: Map<string, ?Fragment>,
  scope: Scope,
  field: T,
  errorContext: $ReadOnlyArray<string>,
): ?T {
  const args = transformArguments(scope, field.args, errorContext);
  const directives = transformDirectives(scope, field.directives, errorContext);
  if (field.kind === 'LinkedField' || field.kind === 'MatchField') {
    const selections = transformSelections(
      context,
      fragments,
      scope,
      field.selections,
      errorContext,
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
  context: CompilerContext,
  fragments: Map<string, ?Fragment>,
  scope: Scope,
  node: Condition,
  errorContext: $ReadOnlyArray<string>,
): ?$ReadOnlyArray<Selection> {
  const condition = transformValue(scope, node.condition, errorContext);
  if (!(condition.kind === 'Literal' || condition.kind === 'Variable')) {
    throw new GraphQLError(
      'RelayApplyFragmentArgumentTransform: A non-scalar value was applied to ' +
        'an @include or @skip directive, the `if` argument value must be a ' +
        `variable or a Boolean, got '${condition.kind}'. ${printErrorContext(
          errorContext,
        )}`,
    );
  }
  if (condition.kind === 'Literal' && condition.value !== node.passingValue) {
    // Dead code, no need to traverse further.
    return null;
  }
  const selections = transformSelections(
    context,
    fragments,
    scope,
    node.selections,
    errorContext,
  );
  if (!selections) {
    return null;
  }
  if (condition.kind === 'Literal' && condition.value === node.passingValue) {
    // Always passes, return inlined selections
    return selections;
  }
  return [
    {
      ...node,
      condition,
      selections,
    },
  ];
}

function transformSelections(
  context: CompilerContext,
  fragments: Map<string, ?Fragment>,
  scope: Scope,
  selections: $ReadOnlyArray<Selection>,
  errorContext: $ReadOnlyArray<string>,
): ?$ReadOnlyArray<Selection> {
  let nextSelections = null;
  selections.forEach(selection => {
    let nextSelection;
    if (
      selection.kind === 'InlineFragment' ||
      selection.kind === 'MatchBranch'
    ) {
      nextSelection = transformNode(
        context,
        fragments,
        scope,
        selection,
        errorContext,
      );
    } else if (selection.kind === 'FragmentSpread') {
      nextSelection = transformFragmentSpread(
        context,
        fragments,
        scope,
        selection,
        errorContext,
      );
    } else if (selection.kind === 'Condition') {
      const conditionSelections = transformCondition(
        context,
        fragments,
        scope,
        selection,
        errorContext,
      );
      if (conditionSelections) {
        nextSelections = nextSelections || [];
        nextSelections.push(...conditionSelections);
      }
    } else {
      nextSelection = transformField(context, fragments, scope, selection, [
        ...errorContext,
        `Field '${selection.name}'`,
      ]);
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
  directives: $ReadOnlyArray<Directive>,
  errorContext: $ReadOnlyArray<string>,
): $ReadOnlyArray<Directive> {
  return directives.map(directive => {
    const args = transformArguments(scope, directive.args, [
      ...errorContext,
      `Directive "${directive.name}"`,
    ]);
    return {
      ...directive,
      args,
    };
  });
}

function transformArguments(
  scope: Scope,
  args: $ReadOnlyArray<Argument>,
  errorContext: $ReadOnlyArray<string>,
): $ReadOnlyArray<Argument> {
  return args.map(arg => {
    const value = transformValue(scope, arg.value, errorContext);
    return value === arg.value ? arg : {...arg, value};
  });
}

function transformValue(
  scope: Scope,
  value: ArgumentValue,
  errorContext: $ReadOnlyArray<string>,
): ArgumentValue {
  if (value.kind === 'Variable') {
    const scopeValue = scope[value.variableName];
    if (scopeValue == null) {
      throw new GraphQLError(
        `RelayApplyFragmentArgumentTransform: variable '\$${
          value.variableName
        }' is not in scope. ${printErrorContext(errorContext)}`,
      );
    }
    return scopeValue;
  } else if (value.kind === 'ListValue') {
    return {
      ...value,
      items: value.items.map(item => transformValue(scope, item, errorContext)),
    };
  } else if (value.kind === 'ObjectValue') {
    return {
      ...value,
      fields: value.fields.map(field => ({
        ...field,
        value: transformValue(scope, field.value, errorContext),
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
  context: CompilerContext,
  fragments: Map<string, ?Fragment>,
  parentScope: Scope,
  fragment: Fragment,
  args: $ReadOnlyArray<Argument>,
  errorContext: $ReadOnlyArray<string>,
): ?Fragment {
  const argumentsHash = hashArguments(args, parentScope, errorContext);
  const fragmentName = argumentsHash
    ? `${fragment.name}_${argumentsHash}`
    : fragment.name;
  const appliedFragment = fragments.get(fragmentName);
  if (appliedFragment) {
    return appliedFragment;
  }
  const fragmentScope = getFragmentScope(
    fragment.argumentDefinitions,
    args,
    parentScope,
    fragment.name,
  );
  if (fragments.get(fragmentName) === null) {
    throw new GraphQLError(
      'RelayApplyFragmentArgumentTransform: Found a circular reference from ' +
        `fragment '${fragment.name}'. ${printErrorContext(errorContext)}`,
    );
  }
  fragments.set(fragmentName, null); // to detect circular references
  let transformedFragment = null;
  const selections = transformSelections(
    context,
    fragments,
    fragmentScope,
    fragment.selections,
    errorContext,
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
  args: $ReadOnlyArray<Argument>,
  scope: Scope,
  errorContext: $ReadOnlyArray<string>,
): ?string {
  if (!args.length) {
    return null;
  }
  const sortedArgs = [...args].sort((a, b) => {
    return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
  });
  const printedArgs = JSON.stringify(
    sortedArgs.map(arg => {
      let value;
      if (arg.value.kind === 'Variable') {
        value = scope[arg.value.variableName];
        if (value == null) {
          throw new GraphQLError(
            `RelayApplyFragmentArgumentTransform: variable '\$${
              arg.value.variableName
            }' is not in scope. ${printErrorContext(errorContext)}`,
          );
        }
      } else {
        value = arg.value;
      }
      return {
        name: arg.name,
        value: getIdentifierForArgumentValue(value),
      };
    }),
  );
  return murmurHash(printedArgs);
}

function printErrorContext(errorContext: $ReadOnlyArray<string>) {
  return 'Path:\n' + errorContext.map(item => `- ${item}`).join('\n');
}

module.exports = {
  transform: relayApplyFragmentArgumentTransform,
};
