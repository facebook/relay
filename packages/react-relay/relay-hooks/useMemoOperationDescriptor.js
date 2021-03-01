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

const React = require('react');

const useMemoVariables = require('./useMemoVariables');

const {createOperationDescriptor, getRequest} = require('relay-runtime');

import type {
  GraphQLTaggedNode,
  OperationDescriptor,
  Variables,
  CacheConfig,
} from 'relay-runtime';

const {useMemo} = React;

function useMemoOperationDescriptor(
  gqlQuery: GraphQLTaggedNode,
  variables: Variables,
  cacheConfig?: ?CacheConfig,
): OperationDescriptor {
  const [memoVariables] = useMemoVariables(variables);
  const [memoCacheConfig] = useMemoVariables(cacheConfig || {});
  return useMemo(
    () =>
      createOperationDescriptor(
        getRequest(gqlQuery),
        memoVariables,
        memoCacheConfig,
      ),
    [gqlQuery, memoVariables, memoCacheConfig],
  );
}

module.exports = useMemoOperationDescriptor;
