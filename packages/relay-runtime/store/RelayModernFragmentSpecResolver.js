/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule RelayModernFragmentSpecResolver
 * @flow
 * @format
 */

'use strict';

const invariant = require('invariant');
const isScalarAndEqual = require('isScalarAndEqual');

const {
  areEqualSelectors,
  getSelectorsFromObject,
} = require('RelayModernSelector');

import type {
  Environment,
  FragmentMap,
  RelayContext,
  Selector,
  Snapshot,
} from 'RelayStoreTypes';
import type {
  Disposable,
  FragmentSpecResolver,
  FragmentSpecResults,
  SelectorData,
} from 'react-relay/classic/environment/RelayCombinedEnvironmentTypes';
import type {Variables} from 'react-relay/classic/tools/RelayTypes';

type Props = {[key: string]: mixed};
type Resolvers = {[key: string]: ?(SelectorListResolver | SelectorResolver)};

/**
 * A utility for resolving and subscribing to the results of a fragment spec
 * (key -> fragment mapping) given some "props" that determine the root ID
 * and variables to use when reading each fragment. When props are changed via
 * `setProps()`, the resolver will update its results and subscriptions
 * accordingly. Internally, the resolver:
 * - Converts the fragment map & props map into a map of `Selector`s.
 * - Removes any resolvers for any props that became null.
 * - Creates resolvers for any props that became non-null.
 * - Updates resolvers with the latest props.
 *
 * This utility is implemented as an imperative, stateful API for performance
 * reasons: reusing previous resolvers, callback functions, and subscriptions
 * all helps to reduce object allocation and thereby decrease GC time.
 *
 * The `resolve()` function is also lazy and memoized: changes in the store mark
 * the resolver as stale and notify the caller, and the actual results are
 * recomputed the first time `resolve()` is called.
 */
class RelayModernFragmentSpecResolver implements FragmentSpecResolver {
  _callback: () => void;
  _context: RelayContext;
  _data: Object;
  _fragments: FragmentMap;
  _props: Props;
  _resolvers: Resolvers;
  _stale: boolean;

  constructor(
    context: RelayContext,
    fragments: FragmentMap,
    props: Props,
    callback: () => void,
  ) {
    this._callback = callback;
    this._context = context;
    this._data = {};
    this._fragments = fragments;
    this._props = props;
    this._resolvers = {};
    this._stale = false;

    this.setProps(props);
  }

  dispose(): void {
    for (const key in this._resolvers) {
      if (this._resolvers.hasOwnProperty(key)) {
        disposeCallback(this._resolvers[key]);
      }
    }
  }

  resolve(): FragmentSpecResults {
    if (this._stale) {
      // Avoid mapping the object multiple times, which could occur if data for
      // multiple keys changes in the same event loop.
      const prevData = this._data;
      let nextData;
      for (const key in this._resolvers) {
        if (this._resolvers.hasOwnProperty(key)) {
          const resolver = this._resolvers[key];
          const prevItem = prevData[key];
          if (resolver) {
            const nextItem = resolver.resolve();
            if (nextData || nextItem !== prevItem) {
              nextData = nextData || {...prevData};
              nextData[key] = nextItem;
            }
          } else {
            const prop = this._props[key];
            const nextItem = prop !== undefined ? prop : null;
            if (nextData || !isScalarAndEqual(nextItem, prevItem)) {
              nextData = nextData || {...prevData};
              nextData[key] = nextItem;
            }
          }
        }
      }
      this._data = nextData || prevData;
      this._stale = false;
    }
    return this._data;
  }

  setProps(props: Props): void {
    const selectors = getSelectorsFromObject(
      this._context.variables,
      this._fragments,
      props,
    );
    for (const key in selectors) {
      if (selectors.hasOwnProperty(key)) {
        const selector = selectors[key];
        let resolver = this._resolvers[key];
        if (selector == null) {
          if (resolver != null) {
            resolver.dispose();
          }
          resolver = null;
        } else if (Array.isArray(selector)) {
          if (resolver == null) {
            resolver = new SelectorListResolver(
              this._context.environment,
              selector,
              this._onChange,
            );
          } else {
            invariant(
              resolver instanceof SelectorListResolver,
              'RelayModernFragmentSpecResolver: Expected prop `%s` to always be an array.',
              key,
            );
            resolver.setSelectors(selector);
          }
        } else {
          if (resolver == null) {
            resolver = new SelectorResolver(
              this._context.environment,
              selector,
              this._onChange,
            );
          } else {
            invariant(
              resolver instanceof SelectorResolver,
              'RelayModernFragmentSpecResolver: Expected prop `%s` to always be an object.',
              key,
            );
            resolver.setSelector(selector);
          }
        }
        this._resolvers[key] = resolver;
      }
    }
    this._props = props;
    this._stale = true;
  }

  setVariables(variables: Variables): void {
    for (const key in this._resolvers) {
      if (this._resolvers.hasOwnProperty(key)) {
        const resolver = this._resolvers[key];
        if (resolver) {
          resolver.setVariables(variables);
        }
      }
    }
    this._stale = true;
  }

  _onChange = (): void => {
    this._stale = true;
    this._callback();
  };
}

/**
 * A resolver for a single Selector.
 */
class SelectorResolver {
  _callback: () => void;
  _data: ?SelectorData;
  _environment: Environment;
  _selector: Selector;
  _subscription: ?Disposable;

  constructor(
    environment: Environment,
    selector: Selector,
    callback: () => void,
  ) {
    const snapshot = environment.lookup(selector);
    this._callback = callback;
    this._data = snapshot.data;
    this._environment = environment;
    this._selector = selector;
    this._subscription = environment.subscribe(snapshot, this._onChange);
  }

  dispose(): void {
    if (this._subscription) {
      this._subscription.dispose();
      this._subscription = null;
    }
  }

  resolve(): ?Object {
    return this._data;
  }

  setSelector(selector: Selector): void {
    if (
      this._subscription != null &&
      areEqualSelectors(selector, this._selector)
    ) {
      return;
    }
    this.dispose();
    const snapshot = this._environment.lookup(selector);
    this._data = snapshot.data;
    this._selector = selector;
    this._subscription = this._environment.subscribe(snapshot, this._onChange);
  }

  setVariables(variables: Variables): void {
    const selector = {
      ...this._selector,
      variables,
    };
    this.setSelector(selector);
  }

  _onChange = (snapshot: Snapshot): void => {
    this._data = snapshot.data;
    this._callback();
  };
}

/**
 * A resolver for an array of Selectors.
 */
class SelectorListResolver {
  _callback: () => void;
  _data: Array<?SelectorData>;
  _environment: Environment;
  _resolvers: Array<SelectorResolver>;
  _stale: boolean;

  constructor(
    environment: Environment,
    selectors: Array<Selector>,
    callback: () => void,
  ) {
    this._callback = callback;
    this._data = [];
    this._environment = environment;
    this._resolvers = [];
    this._stale = true;

    this.setSelectors(selectors);
  }

  dispose(): void {
    this._resolvers.forEach(disposeCallback);
  }

  resolve(): Array<?Object> {
    if (this._stale) {
      // Avoid mapping the array multiple times, which could occur if data for
      // multiple indices changes in the same event loop.
      const prevData = this._data;
      let nextData;
      for (let ii = 0; ii < this._resolvers.length; ii++) {
        const prevItem = prevData[ii];
        const nextItem = this._resolvers[ii].resolve();
        if (nextData || nextItem !== prevItem) {
          nextData = nextData || prevData.slice(0, ii);
          nextData.push(nextItem);
        }
      }
      if (!nextData && this._resolvers.length !== prevData.length) {
        nextData = prevData.slice(0, this._resolvers.length);
      }
      this._data = nextData || prevData;
      this._stale = false;
    }
    return this._data;
  }

  setSelectors(selectors: Array<Selector>): void {
    while (this._resolvers.length > selectors.length) {
      const resolver = this._resolvers.pop();
      resolver.dispose();
    }
    for (let ii = 0; ii < selectors.length; ii++) {
      if (ii < this._resolvers.length) {
        this._resolvers[ii].setSelector(selectors[ii]);
      } else {
        this._resolvers[ii] = new SelectorResolver(
          this._environment,
          selectors[ii],
          this._onChange,
        );
      }
    }
    this._stale = true;
  }

  setVariables(variables: Variables): void {
    this._resolvers.forEach(resolver => resolver.setVariables(variables));
    this._stale = true;
  }

  _onChange = (data: ?Object): void => {
    this._stale = true;
    this._callback();
  };
}

function disposeCallback(disposable: ?Disposable): void {
  disposable && disposable.dispose();
}

module.exports = RelayModernFragmentSpecResolver;
