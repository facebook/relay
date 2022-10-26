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

import type {FragmentType} from 'relay-runtime';

declare export opaque type RelayModernFlowtest_users$ref: FragmentType;
export type RelayModernFlowtest_users = $ReadOnlyArray<{
  +name: ?string,
  +$fragmentType: RelayModernFlowtest_users$ref,
}>;
