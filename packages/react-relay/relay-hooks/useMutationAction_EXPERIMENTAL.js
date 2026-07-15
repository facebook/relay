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

import type {Mutation, Variables} from 'relay-runtime';

const useRelayEnvironment = require('./useRelayEnvironment');
const React = require('react');
const {commitMutation} = require('relay-runtime');

const {useCallback} = React;

/**
 * A variant of useMutation that returns an action function suitable for use
 * with React's action prop pattern. The returned action is an async function
 * that can be passed to `startTransition` or used as an action prop, enabling
 * optimistic UI updates via `useOptimistic`.
 * https://react.dev/reference/react/useTransition#starttransition
 *
 * Usage:
 *   const commitAction = useMutationAction_EXPERIMENTAL(mutation);
 *
 *   // In a startTransition or action prop:
 *   startTransition(async () => {
 *     setOptimisticValue(newValue);
 *     await commitAction({input: newValue});
 *   });
 */
hook useMutationAction_EXPERIMENTAL<
  TVariables extends Variables,
  TData,
  TRawResponse = {...},
>(
  mutation: Mutation<TVariables, TData, TRawResponse>,
): (variables: TVariables) => Promise<TData> {
  const environment = useRelayEnvironment();

  const commitAction = useCallback(
    (variables: TVariables): Promise<TData> => {
      return new Promise((resolve, reject) => {
        commitMutation(environment, {
          mutation,
          variables,
          onCompleted: (response: TData) => {
            resolve(response);
          },
          onError: (error: Error) => {
            reject(error);
          },
        });
      });
    },
    [environment, mutation],
  );

  return commitAction;
}

module.exports = useMutationAction_EXPERIMENTAL;
