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
import type {OperationDescriptor, OwnedReaderSelector} from './RelayStoreTypes';

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
 * const childSelector = getSingularSelector(queryVariables, Child, parent);
 * const childData = environment.lookup(childSelector).data;
 * ```
 */
function getSingularSelector(
  operationVariables: Variables,
  fragment: ReaderFragment,
  item: mixed,
  explicitOwner?: ?OperationDescriptor,
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
  if (
    typeof dataID === 'string' &&
    typeof fragments === 'object' &&
    fragments !== null &&
    typeof fragments[fragment.name] === 'object' &&
    fragments[fragment.name] !== null
  ) {
    const argumentVariables = fragments[fragment.name];

    // We only use the owner to compute the selector variables if an owner
    // was explicitly passed by the caller, for backwards compatibility.
    // See TODO(T39494051) for details
    if (explicitOwner != null && typeof explicitOwner === 'object') {
      const ownerOperationVariables = explicitOwner.variables;
      const fragmentVariables = getFragmentVariables(
        fragment,
        ownerOperationVariables,
        /* $FlowFixMe(>=0.98.0 site=www,mobile,react_native_fb,oss) This comment
         * suppresses an error found when Flow v0.98 was deployed. To see the
         * error delete this comment and run Flow. */
        argumentVariables,
      );
      return {
        owner: explicitOwner,
        selector: {
          dataID,
          node: fragment,
          variables: fragmentVariables,
        },
      };
    }

    // For convenience, we read and pass through the owner if one
    // is present in the fragment reference (`item`), but we only
    // use the owner to compute the selector variables if an owner was
    // explicitly passed by the caller, for backwards compatibility.
    // See TODO(T39494051) for details
    const owner = explicitOwner ?? item[FRAGMENT_OWNER_KEY] ?? null;
    const fragmentVariables = getFragmentVariables(
      fragment,
      operationVariables,
      /* $FlowFixMe(>=0.98.0 site=www,mobile,react_native_fb,oss) This comment
       * suppresses an error found when Flow v0.98 was deployed. To see the
       * error delete this comment and run Flow. */
      argumentVariables,
    );
    return {
      // $FlowFixMe - TODO T39154660
      owner: owner,
      selector: {
        dataID,
        node: fragment,
        variables: fragmentVariables,
      },
    };
  }

  if (__DEV__) {
    let stringifiedItem = JSON.stringify(item);
    if (stringifiedItem.length > 499) {
      stringifiedItem = stringifiedItem.substr(0, 498) + '\u2026';
    }

    warning(
      false,
      'RelayModernSelector: Expected object to contain data for fragment `%s`, got ' +
        '`%s`. Make sure that the parent operation/fragment included fragment ' +
        '`...%s` without `@relay(mask: false)`.',
      fragment.name,
      stringifiedItem,
      fragment.name,
    );
  }

  return null;
}

/**
 * @public
 *
 * Given the result `items` from a parent that fetched `fragment`, creates a
 * selector that can be used to read the results of that fragment on those
 * items. This is similar to `getSingularSelector` but for "plural" fragments that
 * expect an array of results and therefore return an array of selectors.
 */
function getPluralSelector(
  operationVariables: Variables,
  fragment: ReaderFragment,
  items: Array<mixed>,
  owners?: Array<?OperationDescriptor>,
): ?Array<OwnedReaderSelector> {
  let selectors = null;
  if (__DEV__) {
    if (owners != null) {
      warning(
        items.length === owners.length,
        'RelayModernSelector: Expected number of plural values for fragment ' +
          '`%s` to match number of owners. Received %s values and %s owners.',
        fragment.name,
        items.length,
        owners.length,
      );
    }
  }

  items.forEach((item, ii) => {
    const owner = owners != null ? owners[ii] : null;
    const selector =
      item != null
        ? getSingularSelector(operationVariables, fragment, item, owner)
        : null;
    if (selector != null) {
      selectors = selectors || [];
      selectors.push(selector);
    }
  });
  return selectors;
}

function getSelector(
  operationVariables: Variables,
  fragment: ReaderFragment,
  item: mixed | Array<mixed>,
  explicitOwner?: ?OperationDescriptor | Array<?OperationDescriptor>,
): ?OwnedReaderSelector | ?Array<OwnedReaderSelector> {
  let selectorOrSelectors;
  if (item == null) {
    selectorOrSelectors = item;
  } else if (fragment.metadata && fragment.metadata.plural === true) {
    invariant(
      Array.isArray(item),
      'RelayModernSelector: Expected value for fragment `%s` to be an array, got `%s`. ' +
        'Remove `@relay(plural: true)` from fragment `%s` to allow the prop to be an object.',
      fragment.name,
      JSON.stringify(item),
      fragment.name,
    );
    if (explicitOwner !== undefined) {
      invariant(
        Array.isArray(explicitOwner),
        'RelayModernSelector: Expected explcitly provided owner for ' +
          'fragment `%s` to be an array, got `%s`.',
        fragment.name,
        JSON.stringify(explicitOwner),
      );
      selectorOrSelectors = getPluralSelector(
        operationVariables,
        fragment,
        /* $FlowFixMe(>=0.98.0 site=www,mobile,react_native_fb,oss) This comment
         * suppresses an error found when Flow v0.98 was deployed. To see the
         * error delete this comment and run Flow. */
        item,
        explicitOwner,
      );
    } else {
      selectorOrSelectors = getPluralSelector(
        operationVariables,
        fragment,
        /* $FlowFixMe(>=0.98.0 site=www,mobile,react_native_fb,oss) This comment
         * suppresses an error found when Flow v0.98 was deployed. To see the
         * error delete this comment and run Flow. */
        item,
      );
    }
  } else {
    invariant(
      !Array.isArray(item),
      'RelayModernSelector: Expected value for fragment `%s` to be an object, got `%s`. ' +
        'Add `@relay(plural: true)` to fragment `%s` to allow the prop to be an array of items.',
      fragment.name,
      JSON.stringify(item),
      fragment.name,
    );
    if (explicitOwner != null) {
      invariant(
        !Array.isArray(explicitOwner),
        'RelayModernSelector: Expected explcitly provided owner for ' +
          'fragment `%s` not to be an array, got `%s`.',
        fragment.name,
        JSON.stringify(explicitOwner),
      );
      selectorOrSelectors = getSingularSelector(
        operationVariables,
        fragment,
        item,
        explicitOwner,
      );
    } else {
      selectorOrSelectors = getSingularSelector(
        operationVariables,
        fragment,
        item,
      );
    }
  }
  return selectorOrSelectors;
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
  owners?: {[key: string]: ?OperationDescriptor | Array<?OperationDescriptor>},
): {[key: string]: ?(OwnedReaderSelector | Array<OwnedReaderSelector>)} {
  const selectors = {};
  for (const key in fragments) {
    if (fragments.hasOwnProperty(key)) {
      const fragment = fragments[key];
      const item = object[key];
      if (owners != null) {
        invariant(
          owners.hasOwnProperty(key),
          'RelayModernSelector: Expected explcitly provided owner for ' +
            'fragment `%s` under key `%s` to exist.',
          fragment.name,
          key,
        );
        const explicitOwner = owners[key];
        selectors[key] = getSelector(
          operationVariables,
          fragment,
          item,
          explicitOwner,
        );
      } else {
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
      ids[key] = getDataIDsFromFragment(fragment, item);
    }
  }
  return ids;
}

function getDataIDsFromFragment(
  fragment: ReaderFragment,
  item: mixed | Array<mixed>,
): ?DataID | ?Array<DataID> {
  let idOrIDs;
  if (item == null) {
    idOrIDs = item;
  } else if (fragment.metadata && fragment.metadata.plural === true) {
    invariant(
      Array.isArray(item),
      'RelayModernSelector: Expected value for fragment `%s` to be an array, got `%s`. ' +
        'Remove `@relay(plural: true)` from fragment `%s` to allow the prop to be an object.',
      fragment.name,
      JSON.stringify(item),
      fragment.name,
    );
    /* $FlowFixMe(>=0.98.0 site=www,mobile,react_native_fb,oss) This comment
     * suppresses an error found when Flow v0.98 was deployed. To see the error
     * delete this comment and run Flow. */
    idOrIDs = getDataIDs(fragment, item);
  } else {
    invariant(
      !Array.isArray(item),
      'RelayModernFragmentSpecResolver: Expected value for fragment `%s` to be an object, got `%s`. ' +
        'Add `@relay(plural: true)` to fragment `%s` to allow the prop to be an array of items.',
      fragment.name,
      JSON.stringify(item),
      fragment.name,
    );
    idOrIDs = getDataID(fragment, item);
  }
  return idOrIDs;
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
  owners?: {[key: string]: ?OperationDescriptor | Array<?OperationDescriptor>},
): Variables {
  const variables = {};
  for (const key in fragments) {
    if (fragments.hasOwnProperty(key)) {
      const fragment = fragments[key];
      const item = object[key];
      if (owners != null) {
        invariant(
          owners.hasOwnProperty(key),
          'RelayModernSelector: Expected explcitly provided owner for ' +
            'fragment `%s` under key `%s` to exist.',
          fragment.name,
          key,
        );
        const explicitOwner = owners[key];
        const itemVariables = getVariablesFromFragment(
          operationVariables,
          fragment,
          item,
          explicitOwner,
        );
        Object.assign(variables, itemVariables);
      } else {
        const itemVariables = getVariablesFromFragment(
          operationVariables,
          fragment,
          item,
        );
        Object.assign(variables, itemVariables);
      }
    }
  }
  return variables;
}

function getVariablesFromFragment(
  operationVariables: Variables,
  fragment: ReaderFragment,
  item: mixed | Array<mixed>,
  explicitOwner?: ?OperationDescriptor | Array<?OperationDescriptor>,
): Variables {
  if (item == null) {
    return {};
  } else if (fragment.metadata?.plural === true) {
    invariant(
      Array.isArray(item),
      'RelayModernSelector: Expected value for fragment `%s` to be an array, got `%s`. ' +
        'Remove `@relay(plural: true)` from fragment `%s` to allow the prop to be an object.',
      fragment.name,
      JSON.stringify(item),
      fragment.name,
    );

    if (explicitOwner !== undefined) {
      invariant(
        Array.isArray(explicitOwner),
        'RelayModernSelector: Expected explcitly provided owner for ' +
          'fragment `%s` to be an array, got `%s`.',
        fragment.name,
        JSON.stringify(explicitOwner),
      );
      return getVariablesFromPluralFragment(
        operationVariables,
        fragment,
        /* $FlowFixMe(>=0.98.0 site=www,mobile,react_native_fb,oss) This comment
         * suppresses an error found when Flow v0.98 was deployed. To see the
         * error delete this comment and run Flow. */
        item,
        explicitOwner,
      );
    } else {
      /* $FlowFixMe(>=0.98.0 site=www,mobile,react_native_fb,oss) This comment
       * suppresses an error found when Flow v0.98 was deployed. To see the
       * error delete this comment and run Flow. */
      return getVariablesFromPluralFragment(operationVariables, fragment, item);
    }
  } else {
    invariant(
      !Array.isArray(item),
      'RelayModernFragmentSpecResolver: Expected value for fragment `%s` to be an object, got `%s`. ' +
        'Add `@relay(plural: true)` to fragment `%s` to allow the prop to be an array of items.',
      fragment.name,
      JSON.stringify(item),
      fragment.name,
    );
    if (explicitOwner !== undefined) {
      invariant(
        !Array.isArray(explicitOwner),
        'RelayModernSelector: Expected explcitly provided owner for ' +
          'fragment `%s` not to be an array, got `%s`.',
        fragment.name,
        JSON.stringify(explicitOwner),
      );

      return (
        getVariablesFromSingularFragment(
          operationVariables,
          fragment,
          item,
          explicitOwner,
        ) || {}
      );
    } else {
      return (
        getVariablesFromSingularFragment(operationVariables, fragment, item) ||
        {}
      );
    }
  }
}

function getVariablesFromSingularFragment(
  operationVariables: Variables,
  fragment: ReaderFragment,
  item: mixed,
  owner?: ?OperationDescriptor,
): ?Variables {
  const ownedSelector = getSingularSelector(
    operationVariables,
    fragment,
    item,
    owner,
  );
  if (!ownedSelector) {
    return null;
  }
  return ownedSelector.selector.variables;
}

function getVariablesFromPluralFragment(
  operationVariables: Variables,
  fragment: ReaderFragment,
  items: Array<mixed>,
  owners?: Array<?OperationDescriptor>,
): Variables {
  const variables = {};
  items.forEach((value, ii) => {
    if (value != null) {
      const owner = owners != null ? owners[ii] : null;
      const itemVariables = getVariablesFromSingularFragment(
        operationVariables,
        fragment,
        value,
        owner,
      );
      if (itemVariables) {
        Object.assign(variables, itemVariables);
      }
    }
  });
  return variables;
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
  const areVariablesEqual = areEqual(
    thisSelector.selector.variables,
    thatSelector.selector.variables,
  );
  const areReaderSelectorsEqual =
    thisSelector.selector.dataID === thatSelector.selector.dataID &&
    thisSelector.selector.node === thatSelector.selector.node &&
    areVariablesEqual;

  // NOTE: With fragment ownership we need to also compare if
  // the owners attached to the selectors are the same, otherwise we might
  // skip setting a new selector that has a new owner.
  return areReaderSelectorsEqual && thisSelector.owner === thatSelector.owner;
}

module.exports = {
  areEqualSelectors,
  getDataIDsFromFragment,
  getDataIDsFromObject,
  getSingularSelector,
  getPluralSelector,
  getSelector,
  getSelectorsFromObject,
  getVariablesFromSingularFragment,
  getVariablesFromPluralFragment,
  getVariablesFromFragment,
  getVariablesFromObject,
};
