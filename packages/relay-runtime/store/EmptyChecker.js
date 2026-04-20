/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

import type {NormalizationSelection} from '../util/NormalizationNode';
import type {Variables} from '../util/RelayRuntimeTypes';
import type {NormalizationSelector} from './RelayStoreTypes';

const {getLocalVariables} = require('./RelayConcreteVariables');
const invariant = require('invariant');

/**
 * Check if a query is empty - i.e., has no server-fetchable fields given the
 * provided variables. Returns true if the query is empty (all fields are
 * conditionally excluded or there are only client fields), or false if there
 * are any server-fetchable fields.
 *
 * This is used to determine if a query should be skipped - empty queries don't
 * need to be sent to the server.
 */
function isEmpty(selector: NormalizationSelector): boolean {
  const {node, variables} = selector;
  const checker = new EmptyChecker(variables);
  return !checker._traverseSelections(node.selections);
}

/**
 * @private
 */
class EmptyChecker {
  _variables: Variables;

  constructor(variables: Variables) {
    this._variables = variables;
  }

  _getVariableValue(name: string): unknown {
    invariant(
      this._variables.hasOwnProperty(name),
      'EmptyChecker: Undefined variable `%s`.',
      name,
    );
    return this._variables[name];
  }

  _traverseSelections(
    selections: $ReadOnlyArray<NormalizationSelection>,
  ): boolean {
    for (let i = 0; i < selections.length; i++) {
      if (this._traverseSelection(selections[i])) {
        return true;
      }
    }
    return false;
  }

  _traverseSelection(selection: NormalizationSelection): boolean {
    switch (selection.kind) {
      case 'ScalarField':
      case 'LinkedField':
      case 'LinkedHandle':
      case 'ScalarHandle':
      case 'ModuleImport':
      case 'TypeDiscriminator':
        return true;
      case 'ClientExtension':
        return false;
      case 'ActorChange':
        return this._traverseSelection(selection.linkedField);
      case 'Condition':
        const conditionValue = Boolean(
          this._getVariableValue(selection.condition),
        );
        return (
          conditionValue === selection.passingValue &&
          this._traverseSelections(selection.selections)
        );
      case 'InlineFragment':
        // Inline fragments with type conditions require fetching __typename
        if (selection.type != null) {
          return true;
        }
        // For inline fragments without type conditions, check if there are any fields inside
        return this._traverseSelections(selection.selections);
      case 'Defer':
      case 'Stream':
        return this._traverseSelections(selection.selections);
      case 'ClientComponent':
        return this._traverseSelections(selection.fragment.selections);
      case 'FragmentSpread':
        const prevVariables = this._variables;
        this._variables = getLocalVariables(
          this._variables,
          selection.fragment.argumentDefinitions,
          selection.args,
        );
        const hasFieldsInFragment = this._traverseSelections(
          selection.fragment.selections,
        );
        this._variables = prevVariables;
        return hasFieldsInFragment;
      case 'RelayResolver':
      case 'RelayLiveResolver':
        // Resolvers with root fragments may read server fields
        return (
          selection.fragment != null &&
          this._traverseSelection(selection.fragment)
        );
      case 'ClientEdgeToClientObject':
        return (
          selection.backingField.fragment != null &&
          this._traverseSelection(selection.backingField.fragment)
        );
      default:
        selection as empty;
        invariant(
          false,
          'EmptyChecker: Unexpected ast kind `%s`.',
          selection.kind,
        );
    }
  }
}

module.exports = {
  isEmpty,
};
