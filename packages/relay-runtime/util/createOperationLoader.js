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

import type {NormalizationRootNode} from '../util/NormalizationNode';
import type {OperationLoader} from '../store/RelayStoreTypes';

/**
 * Creates a default OperationLoader that resolves module references produced
 * by the Relay compiler's `componentModuleProvider` / `operationModuleProvider`
 * dynamic imports (e.g. `() => import('./Fragment$normalization.graphql')`).
 *
 * After the first async `load()`, the result is cached so that subsequent
 * synchronous `get()` calls (used by DataChecker and RelayReferenceMarker)
 * return the module immediately.
 */
function createOperationLoader(): OperationLoader {
  const cache: Map<unknown, NormalizationRootNode> = new Map();
  return {
    get(reference: unknown): ?NormalizationRootNode {
      return cache.get(reference) ?? null;
    },
    load(reference: unknown): Promise<?NormalizationRootNode> {
      if (typeof reference === 'function') {
        const loader: () => Promise<{default?: mixed}> = (reference: $FlowFixMe);
        return loader().then(mod => {
          const node: NormalizationRootNode =
            mod.default != null
              ? (mod.default: $FlowFixMe)
              : (mod: $FlowFixMe);
          cache.set(reference, node);
          return node;
        });
      }
      return Promise.resolve(null);
    },
  };
}

module.exports = createOperationLoader;
