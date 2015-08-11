/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayDeprecated
 * @typechecks
 * @flow
 */

'use strict';

import type {RelayContainerSpec} from 'RelayContainer';
import type {RelayMutationFragments} from 'RelayMutation';
import type {Variables} from 'RelayTypes';
var RelayQL = require('RelayQL');

var forEachObject = require('forEachObject');
var invariant = require('invariant');
var mapObject = require('mapObject');
var warning = require('warning');

/**
 * @internal
 */
var RelayDeprecated = {

  /**
   * Prints a deprecation warning.
   */
  warn({was, now}: {
    was: string,
    now: string
  }): void {
    warning(false, 'Relay: `%s` is deprecated; use `%s`.', was, now);
  },

  /**
   * Wraps a deprecated method to warn when invoked.
   */
  createWarning({was, now, adapter}: {
    was: string,
    now: string,
    adapter: Function
  }): Function {
    return function() {
      RelayDeprecated.warn({was, now});
      return adapter.apply(this, arguments);
    };
  },

  /**
   * Upgrades a deprecated RelayContainer spec.
   */
  upgradeContainerSpec(maybeSpec: any): RelayContainerSpec {
    var deprecatedProperties = [
      'queries',
      'queryParams',
      'processQueryParams',
    ].filter(property => maybeSpec.hasOwnProperty(property));

    var modernProperties = [
      'fragments',
      'initialVariables',
      'prepareVariables',
    ].filter(property => maybeSpec.hasOwnProperty(property));

    if (modernProperties.length) {
      invariant(
        deprecatedProperties.length === 0,
        'Relay.createContainer(...): Spec contains a mixture of valid and ' +
        'deprecated properties: %s',
        deprecatedProperties.join(', ')
      );
      return (maybeSpec: RelayContainerSpec);
    }

    var spec = {};
    forEachObject(maybeSpec, (property, name) => {
      switch (name) {
        case 'queries':
          spec.fragments = mapObject(property, (queryBuilder, propName) => {
            return variables => queryBuilder(undefined, RelayQL, variables);
          });
          break;
        case 'queryParams':
          spec.initialVariables = property;
          break;
        case 'processQueryParams':
          spec.prepareVariables =
            (prevVariables, route) => property(route, prevVariables);
          break;
      }
    });
    return spec;
  },

  getMutationInitialVariables(Mutation: $FlowFixMe): Variables {
    var queryParams = Mutation.queryParams;
    if (queryParams && !Mutation.initialVariables) {
      RelayDeprecated.warn({
        was: Mutation.name + '.queryParams',
        now: Mutation.name + '.initialVariables',
      });
      Mutation.initialVariables = queryParams;
    }
    return Mutation.initialVariables;
  },

  getMutationFragments<Tk>(Mutation: $FlowFixMe): RelayMutationFragments<Tk> {
    var queries = Mutation.queries;
    if (queries && !Mutation.fragments) {
      RelayDeprecated.warn({
        was: Mutation.name + '.queries',
        now: Mutation.name + '.fragments',
      });
      Mutation.fragments = queries;
    }
    return Mutation.fragments;
  },

};

module.exports = RelayDeprecated;
