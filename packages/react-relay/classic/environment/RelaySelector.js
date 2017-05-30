/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelaySelector
 * @flow
 * @format
 */

'use strict';

const RelayFragmentPointer = require('RelayFragmentPointer');
const RelayRecord = require('RelayRecord');

const areEqual = require('areEqual');
const forEachObject = require('forEachObject');
const invariant = require('invariant');
const warning = require('warning');

import type {ConcreteFragmentDefinition} from 'ConcreteQuery';
import type {Props} from 'RelayCombinedEnvironmentTypes';
import type {FragmentMap, Selector} from 'RelayEnvironmentTypes';
import type {DataID} from 'RelayInternalTypes';
import type {Variables} from 'RelayTypes';

/**
 * @public
 */
function getSelector(
  operationVariables: Variables,
  fragment: ConcreteFragmentDefinition,
  item: mixed,
): ?Selector {
  invariant(
    typeof item === 'object' && item !== null && !Array.isArray(item),
    'RelaySelector: Expected value for fragment `%s` to be an object, got ' +
      '`%s`.',
    fragment.node.name,
    JSON.stringify(item),
  );
  const dataID = RelayRecord.getDataIDForObject(item);
  const fragmentVariables = RelayFragmentPointer.getVariablesForID(
    (item: any),
    fragment.node.id,
  );
  if (dataID != null && fragmentVariables != null) {
    return {
      dataID,
      node: fragment.node,
      variables: {
        ...operationVariables,
        ...fragmentVariables,
      },
    };
  }
  warning(
    false,
    'RelaySelector: Expected object to contain data for fragment `%s`, got ' +
      '`%s`. Make sure that the parent operation/fragment included fragment ' +
      '`...%s`.',
    fragment.node.name,
    JSON.stringify(item),
    fragment.node.name,
  );
  return null;
}

/**
 * @public
 */
function getSelectorList(
  operationVariables: Variables,
  fragment: ConcreteFragmentDefinition,
  items: Array<mixed>,
): ?Array<Selector> {
  let selectors = null;
  items.forEach(item => {
    const selector = item != null
      ? getSelector(operationVariables, fragment, item)
      : null;
    if (selector != null) {
      selectors = selectors || [];
      selectors.push(selector);
    }
  });
  return selectors;
}

/**
 * @public
 */
function getSelectorsFromObject(
  operationVariables: Variables,
  fragments: FragmentMap,
  object: Props,
): {[key: string]: ?(Selector | Array<Selector>)} {
  const selectors = {};
  forEachObject(fragments, (fragment, key) => {
    const item = object[key];
    if (item == null) {
      selectors[key] = item;
    } else if (
      fragment.node.metadata &&
      fragment.node.metadata.plural === true
    ) {
      invariant(
        Array.isArray(item),
        'RelaySelector: Expected value for key `%s` to be an array, got `%s`. ' +
          'Remove `@relay(plural: true)` from fragment `%s` to allow the prop to be an object.',
        key,
        JSON.stringify(item),
        fragment.node.name,
      );
      selectors[key] = getSelectorList(operationVariables, fragment, item);
    } else {
      invariant(
        !Array.isArray(item),
        'RelaySelector: Expected value for key `%s` to be an object, got `%s`. ' +
          'Add `@relay(plural: true)` to fragment `%s` to allow the prop to be an array of items.',
        key,
        JSON.stringify(item),
        fragment.node.name,
      );
      selectors[key] = getSelector(operationVariables, fragment, item);
    }
  });
  return selectors;
}

/**
 * @public
 *
 * Given a mapping of keys -> results and a mapping of keys -> fragments,
 * extracts a mapping of keys -> id(s) of the results.
 *
 * Similar to `getSelectorsFromObject()`, this function can be useful in
 * determining the "identity" of the props passed to a component.
 */
function getDataIDsFromObject(
  fragments: FragmentMap,
  object: Props,
): {[key: string]: ?(DataID | Array<DataID>)} {
  const ids = {};
  forEachObject(fragments, (fragment, key) => {
    const item = object[key];
    if (item == null) {
      ids[key] = item;
    } else if (
      fragment.node.metadata &&
      fragment.node.metadata.plural === true
    ) {
      invariant(
        Array.isArray(item),
        'RelaySelector: Expected value for key `%s` to be an array, got `%s`. ' +
          'Remove `@relay(plural: true)` from fragment `%s` to allow the prop to be an object.',
        key,
        JSON.stringify(item),
        fragment.node.name,
      );
      ids[key] = getDataIDs(fragment, item);
    } else {
      invariant(
        !Array.isArray(item),
        'RelaySelector: Expected value for key `%s` to be an object, got `%s`. ' +
          'Add `@relay(plural: true)` to fragment `%s` to allow the prop to be an array of items.',
        key,
        JSON.stringify(item),
        fragment.node.name,
      );
      ids[key] = getDataID(fragment, item);
    }
  });
  return ids;
}

/**
 * @internal
 */
function getDataIDs(
  fragment: ConcreteFragmentDefinition,
  items: Array<mixed>,
): ?Array<DataID> {
  let ids;
  items.forEach(item => {
    const id = item != null ? getDataID(fragment, item) : null;
    if (id != null) {
      ids = ids || [];
      ids.push(id);
    }
  });
  return ids || null;
}

/**
 * @internal
 */
function getDataID(fragment: ConcreteFragmentDefinition, item: mixed): ?DataID {
  invariant(
    typeof item === 'object' && item !== null && !Array.isArray(item),
    'RelaySelector: Expected value for fragment `%s` to be an object, got ' +
      '`%s`.',
    fragment.node.name,
    JSON.stringify(item),
  );
  const dataID = RelayRecord.getDataIDForObject(item);
  if (dataID != null) {
    return dataID;
  }
  warning(
    false,
    'RelaySelector: Expected object to contain data for fragment `%s`, got ' +
      '`%s`. Make sure that the parent operation/fragment included fragment ' +
      '`...%s`.',
    fragment.node.name,
    JSON.stringify(item),
    fragment.node.name,
  );
  return null;
}

/**
 * @public
 */
function getVariablesFromObject(
  operationVariables: Variables,
  fragments: FragmentMap,
  object: Props,
): Variables {
  const variables = {};
  forEachObject(fragments, (fragment, key) => {
    const item = object[key];
    if (item == null) {
      return;
    } else if (
      fragment.node.metadata &&
      fragment.node.metadata.plural === true
    ) {
      invariant(
        Array.isArray(item),
        'RelaySelector: Expected value for key `%s` to be an array, got `%s`. ' +
          'Remove `@relay(plural: true)` from fragment `%s` to allow the prop to be an object.',
        key,
        JSON.stringify(item),
        fragment.node.name,
      );
      item.forEach(value => {
        if (value != null) {
          const itemVariables = getVariables(
            operationVariables,
            fragment,
            value,
          );
          if (itemVariables) {
            Object.assign(variables, itemVariables);
          }
        }
      });
    } else {
      invariant(
        !Array.isArray(item),
        'RelaySelector: Expected value for key `%s` to be an object, got `%s`. ' +
          'Add `@relay(plural: true)` to fragment `%s` to allow the prop to be an array of items.',
        key,
        JSON.stringify(item),
        fragment.node.name,
      );
      const itemVariables = getVariables(operationVariables, fragment, item);
      if (itemVariables) {
        Object.assign(variables, itemVariables);
      }
    }
  });
  return variables;
}

/**
 * @internal
 */
function getVariables(
  operationVariables: Variables,
  fragment: ConcreteFragmentDefinition,
  item: mixed,
): ?Variables {
  const selector = getSelector(operationVariables, fragment, item);
  return selector ? selector.variables : null;
}

/**
 * @public
 */
function areEqualSelectors(
  thisSelector: Selector,
  thatSelector: Selector,
): boolean {
  return (
    thisSelector.dataID === thatSelector.dataID &&
    thisSelector.node === thatSelector.node &&
    areEqual(thisSelector.variables, thatSelector.variables)
  );
}

module.exports = {
  areEqualSelectors,
  getDataIDsFromObject,
  getSelector,
  getSelectorList,
  getSelectorsFromObject,
  getVariablesFromObject,
};
