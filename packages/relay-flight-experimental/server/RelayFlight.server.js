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

import {initialize_INTERNAL_DO_NOT_USE} from 'RelayFlight.hybrid';
import RelayFlightServerImpl from 'RelayFlightServerImpl.server';
import useQuery from 'RelayFlightUseQuery.server';

export type {ClientQuery} from 'RelayFlight.hybrid';

// eslint-disable-next-line no-unused-vars
export opaque type GraphQLID<T: string>: string = string;
// eslint-disable-next-line no-unused-vars
export opaque type GraphQLEnum<T: string>: string = string;

export * from 'RelayFlight.hybrid';
export {useQuery};

// Server code may call Flight APIs in their module factories - notably
// `ClientJSResource`. Therefore we need to ensure that the implementation is
// injected prior to those module factories running, so the easiest option is
// inject the implementation directly here, since dependencies initalize first.
initialize_INTERNAL_DO_NOT_USE(RelayFlightServerImpl);
