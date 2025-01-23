/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

import type {
  InternalEntryPointRepresentation,
  ThinNestedEntryPointParams,
} from './EntryPointTypes.flow';

/**
 * This is an identity function to construct a type safe nested entrypoint.
 * By calling this function, we ensure that the type of entryPointParams matches
 * exactly the type of preloadProps of the entrypoint.
 *
 * We make the type of `ThinNestedEntryPointParams` opaque, so that the only way
 * to construct a `ThinNestedEntryPointParams` is by calling this function.
 */
declare function NestedRelayEntryPoint<TEntryPointParams>(
  $ReadOnly<{
    entryPoint: InternalEntryPointRepresentation<
      TEntryPointParams,
      $FlowFixMe,
      $FlowFixMe,
      $FlowFixMe,
      $FlowFixMe,
    >,
    entryPointParams: TEntryPointParams,
  }>,
): ThinNestedEntryPointParams;

// eslint-disable-next-line no-redeclare
function NestedRelayEntryPoint<P>(params: P): P {
  return params;
}

export {NestedRelayEntryPoint};
