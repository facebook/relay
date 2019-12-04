/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

const invariant = require('invariant');

import type React from 'React';
import type {
  $RelayProps,
  RelayProp,
  RelayPaginationProp,
  RelayRefetchProp,
} from 'react-relay';

/**
 * Returns original component class wrapped by e.g. createFragmentContainer
 */
function unwrapContainer<Props>(
  ComponentClass: React.ComponentType<
    $RelayProps<Props, RelayProp | RelayPaginationProp | RelayRefetchProp>,
  >,
): React.ComponentType<Props> {
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
