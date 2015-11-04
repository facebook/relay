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
import type {RangeBehaviors} from 'RelayInternalTypes';

var forEachObject = require('forEachObject');
var invariant = require('invariant');
var warning = require('warning');

/**
 * @internal
 */
const RelayDeprecated = {

  /**
   * Detects deprecated API usage.
   *
   * TODO(jkassens, #8978552): delete this
   */
  upgradeContainerSpec(spec: RelayContainerSpec): RelayContainerSpec {
    ['queries', 'queryParams'].forEach(property => {
      invariant(
        !spec.hasOwnProperty(property),
        'Relay.createContainer(...): Found no longer supported property: %s',
        property
      );
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

};

module.exports = RelayDeprecated;
