/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall reactflight
 */

'use strict';

const React = (require('react'): $FlowFixMe);

import err from 'err';
import warning from 'warning';

const ReactCurrentDispatcher =
  React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
    ?.ReactCurrentDispatcher;

if (ReactCurrentDispatcher == null) {
  throw err('Could not access ReactCurrentDispatcher');
}

// TODO T74250305: True context support in Flight renderer
// Using a singleton prevents rendering different Flight roots in the same JS
// session and can cause bugs in which context values are available to any
// components rendereds that happen to be rendered after the context is set,
// even if they are (should be) outside of the provider's scope.
// in other words: this is a really gross temporary hack, see task above.
const contextValues = new Map();

type Context<T> = {
  Provider: React$AbstractComponent<{value: T, children: React$Node}, mixed>,
  Consumer: React$AbstractComponent<{}, mixed>,
  _defaultValue: T,
};

export function patchReactCreateContext() {
  React.createContext = function <T>(defaultValue: T): Context<T> {
    function Consumer(_props: {}) {
      throw err('Context.Consumer is not supported, use `useContext()`');
    }
    // $FlowFixMe[escaped-generic]
    function Provider(props: {value: T, children: React$Node}) {
      // $FlowFixMe[escaped-generic]
      if (contextValues.has(context)) {
        throw err(
          'A value was already set for this context by a parent: nested ' +
            'instances of a single context provider are not supported.',
        );
      }
      const value = props.hasOwnProperty('value') ? props.value : undefined;
      // Flow cannot express that this is a Map<Context<T>, T> where the type of
      // each key's value is dependent on the key's context type.
      // $FlowFixMe[incompatible-call]
      // $FlowFixMe[escaped-generic]
      contextValues.set(context, value);
      return <>{props.children}</>;
    }
    const context = {Consumer, Provider, _defaultValue: defaultValue};
    return context;
  };
}

function useContext<T>(context: Context<T>): T | void {
  // $FlowFixMe[escaped-generic]
  if (!contextValues.has(context)) {
    warning(
      false,
      'No value was set for this context, using the default value.',
    );
    return context._defaultValue;
  }
  // $FlowFixMe[escaped-generic]
  return contextValues.get(context);
}

const PolyfillDispatcher = {
  useContext,
};
ReactCurrentDispatcher.current = PolyfillDispatcher;

export function patchReactCurrentDispatcher() {
  const currentDispatcher = ReactCurrentDispatcher.current;
  if (currentDispatcher == null) {
    throw err('ReactCurrentDispatcher: no dispatcher set');
  }
  currentDispatcher.useContext = useContext;
}
