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

const areEqual = require('areEqual');
const invariant = require('invariant');
const warning = require('warning');

const {getFragmentVariables} = require('./RelayConcreteVariables');
const {
  FRAGMENT_OWNER_KEY,
  FRAGMENTS_KEY,
  ID_KEY,
} = require('./RelayStoreUtils');

import type {ReaderFragment} from '../util/ReaderNode';
import type {DataID, Variables} from '../util/RelayRuntimeTypes';
import type {FragmentOwner, OwnedReaderSelector} from './RelayStoreTypes';

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
  fragment: ReaderFragment,
  item: mixed,
): ?OwnedReaderSelector {
  invariant(
    typeof item === 'object' && item !== null && !Array.isArray(item),
    'RelayModernSelector: Expected value for fragment `%s` to be an object, got ' +
      '`%s`.',
    fragment.name,
    JSON.stringify(item),
  );
  const dataID = item[ID_KEY];
  const fragments = item[FRAGMENTS_KEY];
  const owner = item[FRAGMENT_OWNER_KEY];
  if (
    typeof dataID === 'string' &&
    typeof fragments === 'object' &&
    fragments !== null &&
    typeof fragments[fragment.name] === 'object' &&
    fragments[fragment.name] !== null
  ) {
    const argumentVariables = fragments[fragment.name];

    if (owner != null && typeof owner === 'object') {
      // $FlowFixMe - TODO T39154660
      const typedOwner: FragmentOwner = owner;
      const ownerOperationVariables = typedOwner.variables;
      const fragmentVariables = getFragmentVariables(
        fragment,
        ownerOperationVariables,
        argumentVariables,
      );
      return {
        owner: typedOwner,
        selector: {
          dataID,
          node: fragment,
          variables: fragmentVariables,
        },
      };
    }

    const fragmentVariables = getFragmentVariables(
      fragment,
      operationVariables,
      argumentVariables,
    );
    return {
      owner: null,
      selector: {
        dataID,
        node: fragment,
        variables: fragmentVariables,
      },
    };
  }
  warning(
    false,
    'RelayModernSelector: Expected object to contain data for fragment `%s`, got ' +
      '`%s`. Make sure that the parent operation/fragment included fragment ' +
      '`...%s` without `@relay(mask: false)`.',
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
  fragment: ReaderFragment,
  items: Array<mixed>,
): ?Array<OwnedReaderSelector> {
  let selectors = null;
  items.forEach(item => {
    const selector =
      item != null ? getSelector(operationVariables, fragment, item) : null;
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
  fragments: {[key: string]: ReaderFragment},
  object: {[key: string]: mixed},
): {[key: string]: ?(OwnedReaderSelector | Array<OwnedReaderSelector>)} {
  const selectors = {};
  for (const key in fragments) {
    if (fragments.hasOwnProperty(key)) {
      const fragment = fragments[key];
      const item = object[key];
      if (item == null) {
        selectors[key] = item;
      } else if (fragment.metadata && fragment.metadata.plural === true) {
        invariant(
          Array.isArray(item),
          'RelayModernSelector: Expected value for key `%s` to be an array, got `%s`. ' +
            'Remove `@relay(plural: true)` from fragment `%s` to allow the prop to be an object.',
          key,
          JSON.stringify(item),
          fragment.name,
        );
        selectors[key] = getSelectorList(operationVariables, fragment, item);
      } else {
        invariant(
          !Array.isArray(item),
          'RelayModernFragmentSpecResolver: Expected value for key `%s` to be an object, got `%s`. ' +
            'Add `@relay(plural: true)` to fragment `%s` to allow the prop to be an array of items.',
          key,
          JSON.stringify(item),
          fragment.name,
        );
        selectors[key] = getSelector(operationVariables, fragment, item);
      }
    }
  }
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
  fragments: {[key: string]: ReaderFragment},
  object: {[key: string]: mixed},
): {[key: string]: ?(DataID | Array<DataID>)} {
  const ids = {};
  for (const key in fragments) {
    if (fragments.hasOwnProperty(key)) {
      const fragment = fragments[key];
      const item = object[key];
      if (item == null) {
        ids[key] = item;
      } else if (fragment.metadata && fragment.metadata.plural === true) {
        invariant(
          Array.isArray(item),
          'RelayModernSelector: Expected value for key `%s` to be an array, got `%s`. ' +
            'Remove `@relay(plural: true)` from fragment `%s` to allow the prop to be an object.',
          key,
          JSON.stringify(item),
          fragment.name,
        );
        ids[key] = getDataIDs(fragment, item);
      } else {
        invariant(
          !Array.isArray(item),
          'RelayModernFragmentSpecResolver: Expected value for key `%s` to be an object, got `%s`. ' +
            'Add `@relay(plural: true)` to fragment `%s` to allow the prop to be an array of items.',
          key,
          JSON.stringify(item),
          fragment.name,
        );
        ids[key] = getDataID(fragment, item);
      }
    }
  }
  return ids;
}

/**
 * @internal
 */
function getDataIDs(
  fragment: ReaderFragment,
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
function getDataID(fragment: ReaderFragment, item: mixed): ?DataID {
  invariant(
    typeof item === 'object' && item !== null && !Array.isArray(item),
    'RelayModernSelector: Expected value for fragment `%s` to be an object, got ' +
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
    'RelayModernSelector: Expected object to contain data for fragment `%s`, got ' +
      '`%s`. Make sure that the parent operation/fragment included fragment ' +
      '`...%s` without `@relay(mask: false)`.',
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
  fragments: {[key: string]: ReaderFragment},
  object: {[key: string]: mixed},
): Variables {
  const variables = {};
  for (const key in fragments) {
    if (fragments.hasOwnProperty(key)) {
      const fragment = fragments[key];
      const item = object[key];
      if (item == null) {
        continue;
      } else if (fragment.metadata && fragment.metadata.plural === true) {
        invariant(
          Array.isArray(item),
          'RelayModernSelector: Expected value for key `%s` to be an array, got `%s`. ' +
            'Remove `@relay(plural: true)` from fragment `%s` to allow the prop to be an object.',
          key,
          JSON.stringify(item),
          fragment.name,
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
          'RelayModernFragmentSpecResolver: Expected value for key `%s` to be an object, got `%s`. ' +
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
    }
  }
  return variables;
}

/**
 * @internal
 */
function getVariables(
  operationVariables: Variables,
  fragment: ReaderFragment,
  item: mixed,
): ?Variables {
  const ownedSelector = getSelector(operationVariables, fragment, item);
  if (!ownedSelector) {
    return null;
  }
  return ownedSelector.selector.variables;
}

/**
 * @public
 *
 * Determine if two selectors are equal (represent the same selection). Note
 * that this function returns `false` when the two queries/fragments are
 * different objects, even if they select the same fields.
 */
function areEqualSelectors(
  thisSelector: OwnedReaderSelector,
  thatSelector: OwnedReaderSelector,
): boolean {
  return (
    thisSelector.selector.dataID === thatSelector.selector.dataID &&
    thisSelector.selector.node === thatSelector.selector.node &&
    areEqual(thisSelector.selector.variables, thatSelector.selector.variables)
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
