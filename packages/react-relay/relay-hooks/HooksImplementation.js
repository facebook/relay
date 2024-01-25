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

import typeof useFragmentNode from './legacy/useFragmentNode';
import type {UseRefetchableFragmentType} from './legacy/useRefetchableFragment';
import typeof useFragment from './useFragment';
import type {UsePaginationFragmentType} from './usePaginationFragment';

const warning = require('warning');

type HooksImplementation = {
  useFragment: useFragment,
  usePaginationFragment: UsePaginationFragmentType,
  useRefetchableFragment: UseRefetchableFragmentType,
  useFragmentNode: useFragmentNode<mixed>,
};

let implementation: HooksImplementation | null = null;

function inject(impl: HooksImplementation): void {
  warning(
    implementation === null,
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
