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
import type {FragmentReference} from 'relay-runtime';
declare export opaque type RelayModernFlowtest_badref$ref: FragmentReference;
export type RelayModernFlowtest_badref = {|
  +id: string,
  +$fragmentRefs: RelayModernFlowtest_user$ref,
  +$refType: RelayModernFlowtest_badref$ref,
|};
