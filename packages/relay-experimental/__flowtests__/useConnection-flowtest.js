/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const useConnection = require('../useConnection');

const {ConnectionResolver_UNSTABLE: Resolver} = require('relay-runtime');

import type {ConnectionReference, ConnectionState} from 'relay-runtime';

type EdgeData = {|
  +__id: string,
  +cursor: ?string,
  +node: ?{|
    +__id: string,
  |},
|};
type OtherEdgeData = {|
  +__id: string,
  +cursor: ?string,
  +node: ?{|
    +__id: string,
    +name: ?string, // extra field relative to EdgeData
  |},
|};

type ConnectionData = ConnectionState<EdgeData>;

declare var connectionReference: {|
  +__connection: ConnectionReference<EdgeData>,
|};
declare var nullableConnectionReference: ?{|
  +__connection: ConnectionReference<EdgeData>,
|};
declare var otherConnectionReference: {|
  +__connection: ConnectionReference<OtherEdgeData>,
|};
declare var otherNullableConnectionReference: ?{|
  +__connection: ConnectionReference<OtherEdgeData>,
|};

/* eslint-disable react-hooks/rules-of-hooks */

// Nullability of returned data type is correct
(useConnection(Resolver, connectionReference): ConnectionData);
(useConnection(Resolver, nullableConnectionReference): ?ConnectionData);

// $FlowExpectedError: can't cast nullable to non-nullable
(useConnection(Resolver, nullableConnectionReference): ConnectionData);

// $FlowExpectedError: actual type of returned data is correct
(useConnection(Resolver, otherConnectionReference): ConnectionData);
// $FlowExpectedError
(useConnection(Resolver, otherNullableConnectionReference): ?ConnectionData);

// $FlowExpectedError: Key should be one of the generated types
(useConnection(Resolver, 'INVALID_KEY'): ConnectionData);

/* eslint-enable react-hooks/rules-of-hooks */
