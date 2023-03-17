/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const isLiveStateValue = require('./isLiveStateValue');
const invariant = require('invariant');

/**
 * Wrap the return `value` of the @live resolver that return @weak
 * object into {`key`: `value`} object.
 */
function weakObjectWrapperLive<TKey, TArgs>(
  resolverFn: (key: TKey, args?: TArgs) => mixed,
  key: string,
  isPlural: boolean,
): (key: TKey, args?: TArgs) => mixed {
  return (...args) => {
    const liveState = resolverFn.apply(null, args);
    invariant(
      isLiveStateValue(liveState),
      'Resolver is expected to return a LiveState value.',
    );
    return {
      ...liveState,
      read: weakObjectWrapper<TKey, TArgs>(
        () => {
          return (liveState: $FlowFixMe).read();
        },
        key,
        isPlural,
      ),
    };
  };
}

/**
 * Wrap the return `value` of the resolver that return @weak
 * object into {`key`: `value`} object.
 */
function weakObjectWrapper<TKey, TArgs>(
  resolverFn: (key: TKey, args?: TArgs) => mixed,
  key: string,
  isPlural: boolean,
): (key: TKey, args?: TArgs) => mixed {
  return (...args) => {
    const data = resolverFn.apply(null, args);
    if (isPlural) {
      invariant(
        Array.isArray(data),
        'Resolver is expected to return a plural value.',
      );

      return data.map(item => ({
        [key]: item,
      }));
    } else {
      return {
        [key]: data,
      };
    }
  };
}

module.exports = {
  weakObjectWrapperLive,
  weakObjectWrapper,
};
