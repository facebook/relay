/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const QueryBuilder = require('./QueryBuilder');

import type {Call} from '../tools/RelayInternalTypes';
import type {ConcreteCall} from './ConcreteQuery';

/**
 * @internal
 *
 * Convert from plain object `{name, value}` calls to GraphQL call nodes.
 */
function callsToGraphQL(calls: $ReadOnlyArray<Call>): Array<ConcreteCall> {
  return calls.map(({name, type, value}) => {
    let concreteValue = null;
    if (Array.isArray(value)) {
      concreteValue = value.map(QueryBuilder.createCallValue);
    } else if (value != null) {
      concreteValue = QueryBuilder.createCallValue(value);
    }
    return QueryBuilder.createCall(name, concreteValue, type);
  });
}

module.exports = callsToGraphQL;
