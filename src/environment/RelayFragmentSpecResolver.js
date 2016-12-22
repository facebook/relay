/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayFragmentSpecResolver
 * @flow
 */

'use strict';

const forEachObject = require('forEachObject');
const invariant = require('invariant');
const isScalarAndEqual = require('isScalarAndEqual');

const {areEqualSelectors, getSelectorsFromObject} = require('RelaySelector');

import type {
  Disposable,
  Environment,
  FragmentMap,
  FragmentSpecResults,
  Props,
  RelayContext,
  Selector,
  SelectorData,
  Snapshot,
} from 'RelayEnvironmentTypes';
import type {Variables} from 'RelayTypes';

type Resolvers = {[key: string]: ?(SelectorListResolver | SelectorResolver)};

/**
 * An implementation of the `FragmentSpecResolver` interface defined in
 * `RelayEnvironmentTypes`.
 *
 * This utility is implemented as an imperative, stateful API for performance
 * reasons: reusing previous resolvers, callback functions, and subscriptions
 * all helps to reduce object allocation and thereby decrease GC time.
 *
 * The `resolve()` function is also lazy and memoized: changes in the store mark
 * the resolver as stale and notify the caller, and the actual results are
 * recomputed the first time `resolve()` is called.
 */
class RelayFragmentSpecResolver {
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
    forEachObject(this._resolvers, disposeCallback);
  }

  resolve(): FragmentSpecResults {
    if (this._stale) {
      // Avoid mapping the object multiple times, which could occur if data for
      // multiple keys changes in the same event loop.
      const prevData = this._data;
      let nextData;
      forEachObject(this._resolvers, (resolver, key) => {
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
      });
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
    forEachObject(selectors, (selector, key) => {
      let resolver = this._resolvers[key];
      if (selector == null) {
        if (resolver != null) {
          resolver.dispose();
        }
        resolver = null;
      } else if (Array.isArray(selector)) {
        if (resolver == null) {
          resolver = new SelectorListResolver(this._context.environment, selector, this._onChange);
        } else {
          invariant(
            resolver instanceof SelectorListResolver,
            'RelayFragmentSpecResolver: Expected prop `%s` to always be an array.',
            key,
          );
          resolver.setSelectors(selector);
        }
      } else {
        if (resolver == null) {
          resolver = new SelectorResolver(this._context.environment, selector, this._onChange);
        } else {
          invariant(
            resolver instanceof SelectorResolver,
            'RelayFragmentSpecResolver: Expected prop `%s` to always be an object.',
            key,
          );
          resolver.setSelector(selector);
        }
      }
      this._resolvers[key] = resolver;
    });
    this._props = props;
    this._stale = true;
  }

  setVariables(variables: Variables): void {
    forEachObject(this._resolvers, resolver => {
      if (resolver) {
        resolver.setVariables(variables);
      }
    });
    this._stale = true;
  }

  _onChange = (): void => {
    this._stale = true;
    this._callback();
  }
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
    if (this._subscription != null && areEqualSelectors(selector, this._selector)) {
      return;
    }
    this.dispose();
    const snapshot = this._environment.lookup(selector);
    this._data = snapshot.data;
    this._selector = selector;
    this._subscription = this._environment.subscribe(snapshot, this._onChange);
  }

  setVariables(variables: Variables): void {
    // Note: in the legacy implementation variables have to be merged because
    // they also contain root variables.
    const selector = {
      ...this._selector,
      variables: {
        ...this._selector.variables,
        ...variables,
      },
    };
    this.setSelector(selector);
  }

  _onChange = (snapshot: Snapshot): void => {
    this._data = snapshot.data;
    this._callback();
  }
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
  }
}

function disposeCallback(disposable: ?Disposable): void {
  disposable && disposable.dispose();
}

module.exports = RelayFragmentSpecResolver;
