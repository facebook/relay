/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayQueryConfig
 * @flow
 * @typechecks
 */

'use strict';

import type {RootQueries} from 'RelayContainer';

import type {QueryBuilder} from 'buildRQL';
var invariant = require('invariant');

export type ConfigQueries = {[queryName: string]: QueryBuilder};

/**
 * Configures the root queries and initial variables that define the context in
 * which the top-level component's fragments are requested. This is meant to be
 * subclassed, of which instances are supplied to `RelayRootContainer`.
 */
class RelayQueryConfig<Tv: Object> {
  name: string;
  queries: RootQueries;
  params: Object;

  // TODO: Deprecate `routeName`, #8478719.
  static routeName: string;
  static queries: ?ConfigQueries;

  constructor(initialVariables?: ?Tv) {
    invariant(
      this.constructor !== RelayQueryConfig,
      'RelayQueryConfig: Abstract class cannot be instantiated.'
    );

    Object.defineProperty(this, 'name', {
      enumerable: true,
      value: this.constructor.routeName,
      writable: false,
    });
    Object.defineProperty(this, 'params', {
      enumerable: true,
      value: this.prepareVariables({...initialVariables}) || {},
      writable: false,
    });
    Object.defineProperty(this, 'queries', {
      enumerable: true,
      value: {...this.constructor.queries},
      writable: false,
    });

    if (__DEV__) {
      Object.freeze(this.params);
      Object.freeze(this.queries);
    }
  }

  /**
   * Provides an opportunity to perform additional logic on the variables.
   * Child class should override this function to perform custom logic.
   */
  prepareVariables(prevVariables: ?Tv): ?Tv {
    return prevVariables;
  }
}

module.exports = RelayQueryConfig;
