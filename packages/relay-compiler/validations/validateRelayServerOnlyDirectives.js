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

import type GraphQLCompilerContext from '../core/GraphQLCompilerContext';
import type {
  Selection,
  ClientExtension,
  Defer,
  Stream,
  ModuleImport,
} from '../core/GraphQLIR';

type State = {
  rootClientSelection: ?Selection,
};

const NODEKIND_DIRECTIVE_MAP = {
  ModuleImport: 'module',
  Defer: 'defer',
  Stream: 'stream',
};

/*
 * Validate that server-only directives are not used inside client fields
 */
function validateRelayServerOnlyDirectives(
  context: GraphQLCompilerContext,
): void {
  GraphQLIRValidator.validate(
    context,
    {
      ClientExtension: visitClientExtension,
      Defer: visitTransformedDirective,
      Stream: visitTransformedDirective,
      ModuleImport: visitTransformedDirective,
    },
    () => ({
      rootClientSelection: null,
    }),
  );
}

function visitClientExtension(node: ClientExtension, state: State): void {
  for (const selection of node.selections) {
    this.visit(selection, {
      rootClientSelection: selection,
    });
  }
}

function visitTransformedDirective(
  node: Defer | Stream | ModuleImport,
  state: State,
): void {
  if (state.rootClientSelection) {
    throwError(
      `@${NODEKIND_DIRECTIVE_MAP[node.kind]}`,
      node.loc,
      state.rootClientSelection.loc,
    );
  }
  // directive used only on client fields
  if (node.selections.every(sel => sel.kind === 'ClientExtension')) {
    const clientExtension = node.selections[0];
    throwError(
      `@${NODEKIND_DIRECTIVE_MAP[node.kind]}`,
      node.loc,
      clientExtension && clientExtension.kind === 'ClientExtension'
        ? clientExtension.selections[0]?.loc
        : null,
    );
  }
  this.traverse(node, state);
}

function throwError(directiveName, directiveLoc, clientExtensionLoc) {
  throw createUserError(
    `Unexpected directive: ${directiveName}. ` +
      'This directive can only be used on fields/fragments that are ' +
      'fetched from the server schema, but it is used ' +
      'inside a client-only selection.',
    clientExtensionLoc == null || directiveLoc === clientExtensionLoc
      ? [directiveLoc]
      : [directiveLoc, clientExtensionLoc],
  );
}

module.exports = validateRelayServerOnlyDirectives;
