/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

import type {RelayModernFlowtest_user$ref} from './RelayModernFlowtest_user.graphql';
import type {FragmentType} from 'relay-runtime';

declare export opaque type RelayModernFlowtest_badref$ref: FragmentType;
export type RelayModernFlowtest_badref = {|
  +id: string,
  +$fragmentSpreads: RelayModernFlowtest_user$ref,
  +$fragmentType: RelayModernFlowtest_badref$ref,
|};
