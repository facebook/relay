/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

import type {FragmentReference} from 'relay-runtime';
declare export opaque type RelayModernFlowtest_user$ref: FragmentReference;
export type RelayModernFlowtest_user = {|
  +name: ?string,
  +$refType: RelayModernFlowtest_user$ref,
|};
