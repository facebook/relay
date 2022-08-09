/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall reactflight
 */

'use strict';

import type {RelayFlightImpl} from 'RelayFlight.hybrid';

import loadFragmentForClient from 'RelayFlightLoadFragmentForClient.server';
import loadQueryForClient from 'RelayFlightLoadQueryForClient.server';
import readInlineData from 'RelayFlightReadInlineData.server';
import useFragment from 'RelayFlightUseFragment.server';
import useQuery from 'RelayFlightUseQuery.server';
import useReadQuery from 'RelayFlightUseReadQuery.server';

export default ({
  loadFragmentForClient,
  loadQueryForClient,
  // $FlowFixMe[incompatible-cast] discovered when improving types of useFragment
  useFragment,
  useQuery,
  useReadQuery,
  readInlineData,
}: RelayFlightImpl);
