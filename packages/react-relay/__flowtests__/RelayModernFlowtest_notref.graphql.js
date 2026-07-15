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

import type {RelayModernFlowtest_user$ref} from './RelayModernFlowtest_user.graphql';
import type {FragmentType} from 'relay-runtime';

declare export opaque type RelayModernFlowtest_notref$ref: FragmentType;
export type RelayModernFlowtest_notref = {
  readonly id: string,
  readonly $fragmentSpreads: RelayModernFlowtest_user$ref,
  readonly $fragmentType: RelayModernFlowtest_notref$ref,
};
