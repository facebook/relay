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

import type {
  CacheConfig,
  GraphQLTaggedNode,
  OperationDescriptor,
  Variables,
} from 'relay-runtime';

const useMemoVariables = require('./useMemoVariables');
const React = require('react');
const {createOperationDescriptor, getRequest} = require('relay-runtime');

const {useMemo} = React;

hook useMemoOperationDescriptor(
  gqlQuery: GraphQLTaggedNode,
  variables: Variables,
  cacheConfig?: ?CacheConfig,
): OperationDescriptor {
  const memoVariables = useMemoVariables(variables);
  const memoCacheConfig = useMemoVariables(cacheConfig || {});
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
