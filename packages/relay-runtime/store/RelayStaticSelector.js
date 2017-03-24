/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayStaticSelector
 * @flow
 */

'use strict';

const areEqual = require('areEqual');
const forEachObject = require('forEachObject');
const invariant = require('invariant');
const warning = require('warning');

const {getFragmentVariables} = require('RelayConcreteVariables');
const {FRAGMENTS_KEY, ID_KEY} = require('RelayStoreUtils');

import type {ConcreteFragment} from 'RelayConcreteNode';
import type {DataID} from 'RelayInternalTypes';
import type {Selector} from 'RelayStoreTypes';
import type {Variables} from 'RelayTypes';

/**
 * @public
 *
 * Given the result `item` from a parent that fetched `fragment`, creates a
 * selector that can be used to read the results of that fragment for that item.
 *
 * Example:
 *
 * Given two fragments as follows:
 *
 * ```
 * fragment Parent on User {
 *   id
 *   ...Child
 * }
 * fragment Child on User {
 *   name
 * }
 * ```
 *
 * And given some object `parent` that is the results of `Parent` for id "4",
 * the results of `Child` can be accessed by first getting a selector and then
 * using that selector to `lookup()` the results against the environment:
 *
 * ```
 * const childSelector = getSelector(queryVariables, Child, parent);
 * const childData = environment.lookup(childSelector).data;
 * ```
 */
function getSelector(
  operationVariables: Variables,
  fragment: ConcreteFragment,
  item: mixed,
): ?Selector {
  invariant(
    typeof item === 'object' && item !== null && !Array.isArray(item),
    'RelayStaticSelector: Expected value for fragment `%s` to be an object, got ' +
    '`%s`.',
    fragment.name,
    JSON.stringify(item),
  );
  const dataID = item[ID_KEY];
  const fragments = item[FRAGMENTS_KEY];
  if (
    typeof dataID === 'string' &&
    typeof fragments === 'object' &&
    fragments !== null &&
    typeof fragments[fragment.name] === 'object' &&
    fragments[fragment.name] !== null
  ) {
    const argumentVariables = fragments[fragment.name];
    const fragmentVariables = getFragmentVariables(
      fragment,
      operationVariables,
      argumentVariables,
    );
    return {
      dataID,
      node: fragment,
      variables: fragmentVariables,
    };
  }
  warning(
    false,
    'RelayStaticSelector: Expected object to contain data for fragment `%s`, got ' +
    '`%s`. Make sure that the parent operation/fragment included fragment ' +
    '`...%s`.',
    fragment.name,
    JSON.stringify(item),
    fragment.name,
  );
  return null;
}

/**
 * @public
 *
 * Given the result `items` from a parent that fetched `fragment`, creates a
 * selector that can be used to read the results of that fragment on those
 * items. This is similar to `getSelector` but for "plural" fragments that
 * expect an array of results and therefore return an array of selectors.
 */
function getSelectorList(
  operationVariables: Variables,
  fragment: ConcreteFragment,
  items: Array<mixed>,
): ?Array<Selector> {
  let selectors = null;
  items.forEach(item => {
    const selector = item != null ?
      getSelector(operationVariables, fragment, item) :
      null;
    if (selector != null) {
      selectors = selectors || [];
      selectors.push(selector);
    }
  });
  return selectors;
}

/**
 * @public
 *
 * Given a mapping of keys -> results and a mapping of keys -> fragments,
 * extracts the selectors for those fragments from the results.
 *
 * The canonical use-case for this function is ReactRelayFragmentContainer, which
 * uses this function to convert (props, fragments) into selectors so that it
 * can read the results to pass to the inner component.
 */
function getSelectorsFromObject(
  operationVariables: Variables,
  fragments: {[key: string]: ConcreteFragment},
  object: {[key: string]: mixed},
): {[key: string]: ?(Selector | Array<Selector>)} {
  const selectors = {};
  forEachObject(fragments, (fragment, key) => {
    const item = object[key];
    if (item == null) {
      selectors[key] = item;
    } else if (fragment.metadata && fragment.metadata.plural === true) {
      invariant(
        Array.isArray(item),
        'RelayStaticSelector: Expected value for key `%s` to be an array, got `%s`. ' +
        'Remove `@relay(plural: true)` from fragment `%s` to allow the prop to be an object.',
        key,
        JSON.stringify(item),
        fragment.name,
      );
      selectors[key] = getSelectorList(
        operationVariables,
        fragment,
        item,
      );
    } else {
      invariant(
        !Array.isArray(item),
        'RelayStaticFragmentSpecResolver: Expected value for key `%s` to be an object, got `%s`. ' +
        'Add `@relay(plural: true)` to fragment `%s` to allow the prop to be an array of items.',
        key,
        JSON.stringify(item),
        fragment.name,
      );
      selectors[key] = getSelector(
        operationVariables,
        fragment,
        item,
      );
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
  fragments: {[key: string]: ConcreteFragment},
  object: {[key: string]: mixed},
): {[key: string]: ?(DataID | Array<DataID>)} {
  const ids = {};
  forEachObject(fragments, (fragment, key) => {
    const item = object[key];
    if (item == null) {
      ids[key] = item;
    } else if (fragment.metadata && fragment.metadata.plural === true) {
      invariant(
        Array.isArray(item),
        'RelayStaticSelector: Expected value for key `%s` to be an array, got `%s`. ' +
        'Remove `@relay(plural: true)` from fragment `%s` to allow the prop to be an object.',
        key,
        JSON.stringify(item),
        fragment.name,
      );
      ids[key] = getDataIDs(fragment, item);
    } else {
      invariant(
        !Array.isArray(item),
        'RelayStaticFragmentSpecResolver: Expected value for key `%s` to be an object, got `%s`. ' +
        'Add `@relay(plural: true)` to fragment `%s` to allow the prop to be an array of items.',
        key,
        JSON.stringify(item),
        fragment.name,
      );
      ids[key] = getDataID(fragment, item);
    }
  });
  return ids;
}

/**
 * @internal
 */
function getDataIDs(fragment: ConcreteFragment, items: Array<mixed>): ?Array<DataID> {
  let ids;
  items.forEach(item => {
    const id = item != null ?
      getDataID(fragment, item) :
      null;
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
function getDataID(fragment: ConcreteFragment, item: mixed): ?DataID {
  invariant(
    typeof item === 'object' && item !== null && !Array.isArray(item),
    'RelayStaticSelector: Expected value for fragment `%s` to be an object, got ' +
    '`%s`.',
    fragment.name,
    JSON.stringify(item),
  );
  const dataID = item[ID_KEY];
  if (typeof dataID === 'string') {
    return dataID;
  }
  warning(
    false,
    'RelayStaticSelector: Expected object to contain data for fragment `%s`, got ' +
    '`%s`. Make sure that the parent operation/fragment included fragment ' +
    '`...%s`.',
    fragment.name,
    JSON.stringify(item),
    fragment.name,
  );
  return null;
}

/**
 * @public
 *
 * Given a mapping of keys -> results and a mapping of keys -> fragments,
 * extracts the merged variables that would be in scope for those
 * fragments/results.
 *
 * This can be useful in determing what varaibles were used to fetch the data
 * for a Relay container, for example.
 */
function getVariablesFromObject(
  operationVariables: Variables,
  fragments: {[key: string]: ConcreteFragment},
  object: {[key: string]: mixed},
): Variables {
  const variables = {};
  forEachObject(fragments, (fragment, key) => {
    const item = object[key];
    if (item == null) {
      return;
    } else if (fragment.metadata && fragment.metadata.plural === true) {
      invariant(
        Array.isArray(item),
        'RelayStaticSelector: Expected value for key `%s` to be an array, got `%s`. ' +
        'Remove `@relay(plural: true)` from fragment `%s` to allow the prop to be an object.',
        key,
        JSON.stringify(item),
        fragment.name,
      );
      item.forEach(value => {
        if (value != null) {
          const itemVariables = getVariables(operationVariables, fragment, value);
          if (itemVariables) {
            Object.assign(variables, itemVariables);
          }
        }
      });
    } else {
      invariant(
        !Array.isArray(item),
        'RelayStaticFragmentSpecResolver: Expected value for key `%s` to be an object, got `%s`. ' +
        'Add `@relay(plural: true)` to fragment `%s` to allow the prop to be an array of items.',
        key,
        JSON.stringify(item),
        fragment.name,
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
  fragment: ConcreteFragment,
  item: mixed,
): ?Variables {
  const selector = getSelector(operationVariables, fragment, item);
  return selector ? selector.variables : null;
}

/**
 * @public
 *
 * Determine if two selectors are equal (represent the same selection). Note
 * that this function returns `false` when the two queries/fragments are
 * different objects, even if they select the same fields.
 */
function areEqualSelectors(
  thisSelector: Selector,
  thatSelector: Selector
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
