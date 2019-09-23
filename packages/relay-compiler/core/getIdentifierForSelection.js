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

const invariant = require('invariant');

const {printArguments, printDirectives} = require('./GraphQLIRPrinter');

import type {Selection} from './GraphQLIR';

/**
 * Generates an identifier that is unique to a given selection: the alias for
 * fields, the type for inline fragments, and a summary of the condition
 * variable and passing value for conditions.
 */
function getIdentifierForSelection(node: Selection): string {
  if (
    node.kind === 'LinkedField' ||
    node.kind === 'ScalarField' ||
    node.kind === 'ConnectionField'
  ) {
    return 'Field: ' + node.directives.length === 0
      ? node.alias
      : node.alias + printDirectives(node.directives);
  } else if (node.kind === 'Connection') {
    return 'Connection:' + node.label;
  } else if (node.kind === 'FragmentSpread') {
    return 'FragmentSpread:' + node.args.length === 0
      ? node.name
      : node.name + printArguments(node.args);
  } else if (node.kind === 'ModuleImport') {
    return 'ModuleImport:';
  } else if (node.kind === 'Defer') {
    return 'Defer:' + node.label;
  } else if (node.kind === 'Stream') {
    return 'Stream:' + node.label;
  } else if (node.kind === 'InlineFragment') {
    return 'InlineFragment:' + node.typeCondition.name;
  } else if (node.kind === 'ClientExtension') {
    return 'ClientExtension:';
  } else if (node.kind === 'InlineDataFragmentSpread') {
    return 'InlineDataFragment:' + node.name;
  } else if (node.kind === 'Condition') {
    return (
      'Condition:' +
      (node.condition.kind === 'Variable'
        ? '$' + node.condition.variableName
        : String(node.condition.value)) +
      String(node.passingValue)
    );
  } else {
    invariant(
      false,
      'getIdentifierForSelection: Unexpected kind `%s`.',
      (node.kind: empty),
    );
  }
}

module.exports = getIdentifierForSelection;
