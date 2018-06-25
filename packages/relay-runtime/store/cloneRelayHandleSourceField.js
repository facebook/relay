/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const areEqual = require('areEqual');
const invariant = require('invariant');

const {LINKED_FIELD} = require('../util/RelayConcreteNode');
const {getHandleStorageKey} = require('./RelayStoreUtils');

import type {
  ConcreteLinkedField,
  ConcreteLinkedHandle,
  ConcreteSelection,
} from '../util/RelayConcreteNode';
import type {Variables} from '../util/RelayRuntimeTypes';

/**
 * @private
 *
 * Creates a clone of the supplied `handleField` by finding the original linked
 * field (on which the handle was declared) among the sibling `selections`, and
 * copying its selections into the clone.
 */
function cloneRelayHandleSourceField(
  handleField: ConcreteLinkedHandle,
  selections: Array<ConcreteSelection>,
  variables: Variables,
): ConcreteLinkedField {
  const sourceField = selections.find(
    source =>
      source.kind === LINKED_FIELD &&
      source.name === handleField.name &&
      source.alias === handleField.alias &&
      areEqual(source.args, handleField.args),
  );
  invariant(
    sourceField && sourceField.kind === LINKED_FIELD,
    'cloneRelayHandleSourceField: Expected a corresponding source field for ' +
      'handle `%s`.',
    handleField.handle,
  );
  const handleKey = getHandleStorageKey(handleField, variables);
  const clonedField = {
    ...sourceField,
    args: null,
    name: handleKey,
    storageKey: handleKey,
  };
  return clonedField;
}

module.exports = cloneRelayHandleSourceField;
