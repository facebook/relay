/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule StripUnusedVariablesTransform
 * @flow
 * @format
 */

'use strict';

const GraphQLCompilerContext = require('../core/GraphQLCompilerContext');
const GraphQLIRTransformer = require('../core/GraphQLIRTransformer');
const GraphQLIRVisitor = require('../core/GraphQLIRVisitor');

const nullthrows = require('../util/nullthrowsOSS');

import type {Root} from '../core/GraphQLIR';

/**
 * A transform that removes variables from root queries that aren't referenced
 * by the query itself.
 */
function stripUnusedVariablesTransform(
  context: GraphQLCompilerContext,
): GraphQLCompilerContext {
  const fragmentToVariables: Map<string, Set<string>> = new Map();
  const fragmentToFragmentSpreads: Map<string, Set<string>> = new Map();
  const rootToVariables: Map<string, Set<string>> = new Map();
  const rootToFragmentSpreads: Map<string, Set<string>> = new Map();
  context.forEachDocument(document => {
    let fragmentVariables;
    let fragmentFragmentSpreads;
    let rootVariables;
    let rootFragmentSpreads;
    let insideDeferrableFragmentSpread = false;
    GraphQLIRVisitor.visit(document, {
      Root: {
        enter(root) {
          rootVariables = new Set();
          rootToVariables.set(root.name, rootVariables);
          rootFragmentSpreads = new Set();
          rootToFragmentSpreads.set(root.name, rootFragmentSpreads);
        },
        leave(root) {
          rootVariables = null;
          rootFragmentSpreads = null;
        },
      },
      Fragment: {
        enter(fragment) {
          fragmentVariables = new Set();
          fragmentToVariables.set(fragment.name, fragmentVariables);
          fragmentFragmentSpreads = new Set();
          fragmentToFragmentSpreads.set(fragment.name, fragmentFragmentSpreads);
        },
        leave(fragment) {
          fragmentVariables = null;
          fragmentFragmentSpreads = null;
        },
      },
      Variable(variable) {
        if (!insideDeferrableFragmentSpread) {
          fragmentVariables && fragmentVariables.add(variable.variableName);
          rootVariables && rootVariables.add(variable.variableName);
        }
      },
      FragmentSpread(spread) {
        if (!insideDeferrableFragmentSpread) {
          fragmentFragmentSpreads && fragmentFragmentSpreads.add(spread.name);
          rootFragmentSpreads && rootFragmentSpreads.add(spread.name);
        }
      },
      DeferrableFragmentSpread: {
        enter() {
          insideDeferrableFragmentSpread = true;
        },
        leave() {
          insideDeferrableFragmentSpread = false;
        },
      },
    });
  });
  const variablesMemo = new Map();
  rootToVariables.forEach((variables, root) => {
    Array.from(
      nullthrows(
        rootToFragmentSpreads.get(root),
        `root ${root} wasn't found in StripUnusedVariablesTransform`,
      ),
    ).forEach(spread =>
      into(
        variables,
        allVariablesReferencedInFragment(
          variablesMemo,
          spread,
          fragmentToVariables,
          fragmentToFragmentSpreads,
        ),
      ),
    );
  });
  return GraphQLIRTransformer.transform(context, {
    Root: root =>
      transformRoot(
        context,
        root,
        nullthrows(
          rootToVariables.get(root.name),
          `root ${root.name} wasn't found in StripUnusedVariablesTransform`,
        ),
      ),
    // Include fragments, but do not traverse into them.
    Fragment: id => id,
  });
}

function allVariablesReferencedInFragment(
  variablesMemo,
  fragment,
  fragmentToVariables,
  fragmentToFragmentSpreads,
) {
  let variables = variablesMemo.get(fragment);
  if (!variables) {
    const directVariables = nullthrows(
      fragmentToVariables.get(fragment),
      `fragment ${fragment} wasn't found in StripUnusedVariablesTransform`,
    );
    variables = Array.from(
      nullthrows(
        fragmentToFragmentSpreads.get(fragment),
        `fragment ${fragment} wasn't found in StripUnusedVariablesTransform`,
      ),
    ).reduce(
      (allVariables, fragmentSpread) =>
        into(
          allVariables,
          allVariablesReferencedInFragment(
            variablesMemo,
            fragmentSpread,
            fragmentToVariables,
            fragmentToFragmentSpreads,
          ),
        ),
      directVariables,
    );
    variablesMemo.set(fragment, variables);
  }
  return variables;
}

function transformRoot(
  context: GraphQLCompilerContext,
  root: Root,
  variables: Set<string>,
): Root {
  return {
    ...root,
    argumentDefinitions: root.argumentDefinitions.filter(arg => {
      return variables.has(arg.name);
    }),
  };
}

// Returns the union of setA and setB. Modifies setA!
function into<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  setB.forEach(item => setA.add(item));
  return setA;
}

module.exports = {
  transform: stripUnusedVariablesTransform,
};
