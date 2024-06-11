/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * @oncall relay
 */

'use strict';

import type {
  $RelayProps,
  RelayPaginationProp,
  RelayProp,
  RelayRefetchProp,
} from 'react-relay';

const invariant = require('invariant');

/**
 * Returns original component class wrapped by e.g. createFragmentContainer
 */
function unwrapContainer<Props>(
  ComponentClass: React$ComponentType<
    $RelayProps<Props, RelayProp | RelayPaginationProp | RelayRefetchProp>,
  >,
): React$ComponentType<Props> {
  // $FlowExpectedError
  const unwrapped = ComponentClass.__ComponentClass;
  invariant(
    unwrapped != null,
    'Could not find component for %s, is it a Relay container?',
    ComponentClass.displayName || ComponentClass.name,
  );
  return (unwrapped: any);
}

module.exports = unwrapContainer;
