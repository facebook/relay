/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */

'use strict';

import typeof useFragment from './useFragment';
import type {UseLazyLoadQueryHookType} from './useLazyLoadQuery';
import type {UsePaginationFragmentType} from './usePaginationFragment';
import type {UsePreloadedQueryHookType} from './usePreloadedQuery';
import type {UseRefetchableFragmentType} from './useRefetchableFragment';

const warning = require('warning');

type HooksImplementation = {
  useFragment: useFragment,
  useLazyLoadQuery: UseLazyLoadQueryHookType,
  usePreloadedQuery: UsePreloadedQueryHookType,
  usePaginationFragment: UsePaginationFragmentType,
  useRefetchableFragment: UseRefetchableFragmentType,
};

let implementation: HooksImplementation | null = null;

function inject(impl: HooksImplementation): void {
  warning(
    implementation !== null,
    'Relay HooksImplementation was injected twice.',
  );
  implementation = impl;
}

function get(): HooksImplementation | null {
  return implementation;
}

module.exports = {
  inject,
  get,
};
