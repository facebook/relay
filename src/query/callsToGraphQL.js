/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule callsToGraphQL
 * @flow
 */

'use strict';

import type {ConcreteCall} from 'ConcreteQuery';
import type {Call} from 'RelayInternalTypes';
const QueryBuilder = require('QueryBuilder');

/**
 * @internal
 *
 * Convert from plain object `{name, value}` calls to GraphQL call nodes.
 */
function callsToGraphQL(calls: Array<Call>): Array<ConcreteCall> {
  return calls.map(({name, value}) => {
    let concreteValue = null;
    if (Array.isArray(value)) {
      concreteValue = value.map(QueryBuilder.createCallValue);
    } else if (value != null)  {
      concreteValue = QueryBuilder.createCallValue(value);
    }
    return QueryBuilder.createCall(name, concreteValue);
  });
}

module.exports = callsToGraphQL;
