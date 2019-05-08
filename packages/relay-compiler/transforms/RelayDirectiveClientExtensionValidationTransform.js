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

const {createUserError} = require('../core/RelayCompilerError');

import type {
  ClientExtension,
  Definition,
  FragmentSpread,
  LinkedField,
  Fragment,
} from '../core/GraphQLIR';

const SERVER_ONLY_DIRECTIVES: $ReadOnlySet<string> = new Set([
  'module',
  'match',
  'defer',
  'stream',
  'stream_connection',
]);

type State = {
  rootClientExtension: ?ClientExtension,
  currentRoot: Definition,
  /*
   * The root fragment can be on any index in the documents,
   * we need to pass the information of server directives up the tree,
   * so once the root fragment is visited, we don't need to travserse to nodes
   * that has already been visited.
   */
  fragmentStatus: Map<
    string,
    {
      parent: ?string,
      nodeWithServerDirectives: ?(FragmentSpread | LinkedField),
    },
  >,
};

/**
 * This transform doesn't transform anything, but check if server only
 * directives are used on client extensions.
 */
function relayDirectiveClientExtensionValidationTransform(
  context: CompilerContext,
): CompilerContext {
  const fragmentStatus = new Map();
  return IRTransformer.transform(
    context,
    {
      ClientExtension: visitClientExtension,
      Fragment: visitRoot,
      FragmentSpread: visitFragmentSpread,
      LinkedField: visitLinkedField,
      Root: visitRoot,
      SplitOperation: visitRoot,
    },
    node => ({
      currentRoot: node,
      fragmentStatus,
      rootClientExtension: null,
    }),
  );
}

function visitRoot<T: Definition>(node: T, state: State): ?T {
  const {rootClientExtension, fragmentStatus, currentRoot} = state;
  const status = fragmentStatus.get(node.name);
  if (status) {
    const {nodeWithServerDirectives} = status;
    if (rootClientExtension && nodeWithServerDirectives) {
      checkAndThrow(nodeWithServerDirectives, rootClientExtension);
    }
    return node;
  }
  fragmentStatus.set(node.name, {
    parent: currentRoot === node ? null : currentRoot.name,
    nodeWithServerDirectives: null,
  });
  state.currentRoot = node;
  return this.traverse(node, state);
}

function visitClientExtension(
  node: ClientExtension,
  state: State,
): ?ClientExtension {
  const prevRoot = state.rootClientExtension;
  if (!state.rootClientExtension) {
    state.rootClientExtension = node;
  }
  const result = this.traverse(node, state);
  state.rootClientExtension = prevRoot;
  return result;
}

function visitLinkedField(node: LinkedField, state: State): ?LinkedField {
  const {rootClientExtension} = state;
  if (rootClientExtension) {
    checkAndThrow(node, rootClientExtension);
  }
  passNodeWithServerOnlyDirectivesToAncestorIfExist(node, state);
  return this.traverse(node, state);
}

function visitFragmentSpread(
  node: FragmentSpread,
  state: State,
): ?FragmentSpread {
  const {rootClientExtension} = state;
  if (rootClientExtension) {
    checkAndThrow(node, rootClientExtension);
  }
  const fragment: ?Fragment = this.getContext().get(node.name);
  if (!fragment) {
    return node;
  }
  const status = state.fragmentStatus.get(fragment.name);
  if (status && status.nodeWithServerDirectives) {
    // The next fragment has already been visited, and it contains a node with
    // server-only directives, pass the information up
    passNodeWithServerOnlyDirectivesToAncestor(
      status.nodeWithServerDirectives,
      state.fragmentStatus,
      state.currentRoot.name,
    );
  } else {
    passNodeWithServerOnlyDirectivesToAncestorIfExist(node, state);
  }
  this.visit(fragment, state);
  return node;
}

function passNodeWithServerOnlyDirectivesToAncestorIfExist(
  node: FragmentSpread | LinkedField,
  state: State,
): void {
  if (
    node.directives.some(directive =>
      SERVER_ONLY_DIRECTIVES.has(directive.name),
    )
  ) {
    const {fragmentStatus, currentRoot} = state;
    passNodeWithServerOnlyDirectivesToAncestor(
      node,
      fragmentStatus,
      currentRoot.name,
    );
  }
}

function passNodeWithServerOnlyDirectivesToAncestor(
  node: FragmentSpread | LinkedField,
  fragmentStatus,
  rootName: ?string,
): void {
  if (rootName == null) {
    return;
  }
  const status = fragmentStatus.get(rootName);
  if (status && !status.nodeWithServerDirectives) {
    status.nodeWithServerDirectives = node;
    passNodeWithServerOnlyDirectivesToAncestor(
      node,
      fragmentStatus,
      status.parent,
    );
  }
}

function checkAndThrow(
  node: FragmentSpread | LinkedField,
  clientExtension: ClientExtension,
): void {
  const invalidDirectives = node.directives.filter(directive =>
    SERVER_ONLY_DIRECTIVES.has(directive.name),
  );
  if (invalidDirectives.length) {
    const clientExtensionChild = clientExtension.selections[0];
    const invalidDirectivesStr = invalidDirectives
      .map(d => '@' + d.name)
      .join(', ');
    throw createUserError(
      `Unexpected directives ${invalidDirectivesStr} on '${
        node.name
      }'. These directives can only be used on fields/fragments that are fetched from the server schema, but these directives are used inside a client-only selection`,
      [...new Set([clientExtensionChild.loc, node.loc])],
    );
  }
}

module.exports = {
  transform: relayDirectiveClientExtensionValidationTransform,
};
