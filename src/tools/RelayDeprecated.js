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
import type {RangeBehaviors} from 'RelayInternalTypes';
var RelayQL = require('RelayQL');

var forEachObject = require('forEachObject');
var invariant = require('invariant');
var mapObject = require('mapObject');
var warning = require('warning');

/**
 * @internal
 */
const RelayDeprecated = {

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
   * Upgrades a deprecated RelayContainer spec.
   */
  upgradeContainerSpec(maybeSpec: any): RelayContainerSpec {
    var deprecatedProperties = [
      'queries',
      'queryParams',
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
      }
    });
    return spec;
  },

  upgradeRangeBehaviors(rangeBehaviors: RangeBehaviors): RangeBehaviors {
    // Prior to 0.4.1 you would have to specify the args in your range
    // behaviors in the same order they appeared in your query. From 0.4.1
    // onward, args in a range behavior key must be in alphabetical order.
    // What follows is code to produce a deprecation warning in case we
    // encounter a range behavior key that's out of order. We will remove this
    // warning with the 0.5.0 breaking version.
    const rangeBehaviorsWithSortedKeys = {};
    forEachObject(rangeBehaviors, (value, key) => {
      let sortedKey;
      if (key === '') {
        sortedKey = '';
      } else {
        const keyParts = key
          // Remove the last parenthesis
          .slice(0, -1)
          // Slice on unescaped parentheses followed immediately by a `.`
          .split(/\)\./);
        sortedKey = keyParts
          .sort()
          .join(').') +
          (keyParts.length ? ')' : '');
        warning(
          sortedKey === key,
          'RelayMutation: To define a range behavior key without sorting ' +
          'the arguments alphabetically is deprecated as of Relay 0.4.1 and ' +
          'will be disallowed in 0.5.0. Please sort the argument names of ' +
          'the range behavior key `%s`',
          key
        );
      }
      rangeBehaviorsWithSortedKeys[sortedKey] = value;
    });
    return rangeBehaviorsWithSortedKeys;
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
