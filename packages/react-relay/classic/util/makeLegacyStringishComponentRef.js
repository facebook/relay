/**
 * Copyright (c) 2018-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const warning = require('warning');

/**
 * Instead of ref="component", use this module to mimic a string ref.
 * This horrible hack lets us avoid string ref warnings in React strict mode
 * until we have time to clean up the various uses of .refs.component.
 *
 * Track usage at https://fburl.com/relay_containers_string_refs_dashboard
 *
 * @TODO (T28161354) Remove this hack once string refs have been removed.
 */
function makeLegacyStringishComponentRef(
  parentComponent: Object,
  componentName: string,
): ((c: Object) => void) | string {
  let hasWarned = false;
  if (__DEV__) {
    return function ref(childComponent: Object): void {
      if (!Object.isExtensible(parentComponent.refs)) {
        // Probably emptyObject. >.>
        parentComponent.refs = {};
      }

      // RelayFBContainerProxy uses this getter to avoid triggering the warning.
      // This proxy component logs a separate warning to track its usage.
      parentComponent.refs.__INTERNAL__component = childComponent;

      // $FlowFixMe https://github.com/facebook/flow/issues/285
      Object.defineProperty(parentComponent.refs, 'component', {
        configurable: true,
        get() {
          if (!hasWarned) {
            hasWarned = true;
            warning(
              false,
              'RelayContainer: Do not use `container.refs.component` for ' +
                'RelayCompat or RelayModern containers. Instead pass ' +
                '`componentRef={ref}` to `%s`.',
              componentName,
            );
          }
          return childComponent;
        },
      });
    };
  } else {
    return 'component';
  }
}

module.exports = makeLegacyStringishComponentRef;
