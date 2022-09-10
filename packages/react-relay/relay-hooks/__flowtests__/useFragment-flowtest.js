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

import type {
  useFragmentFlowtest_user$data,
  useFragmentFlowtest_user$key,
} from './__generated__/useFragmentFlowtest_user.graphql';
import typeof useFragmentFlowtest_user$fragment from './__generated__/useFragmentFlowtest_user.graphql';
import type {
  useFragmentFlowtest_users$data,
  useFragmentFlowtest_users$key,
} from './__generated__/useFragmentFlowtest_users.graphql';
import typeof useFragmentFlowtest_users$fragment from './__generated__/useFragmentFlowtest_users.graphql';

import useFragment from '../useFragment';
import {graphql} from 'relay-runtime';

declare var Any: $FlowFixMe;

const userFragment: useFragmentFlowtest_user$fragment = graphql`
  fragment useFragmentFlowtest_user on User {
    id
  }
`;

const usersFragment: useFragmentFlowtest_users$fragment = graphql`
  fragment useFragmentFlowtest_users on User @relay(plural: true) {
    id
  }
`;

/* eslint-disable react-hooks/rules-of-hooks */

// Nullability of returned data type is correct
(useFragment(
  userFragment,
  (Any: useFragmentFlowtest_user$key),
): useFragmentFlowtest_user$data);
(useFragment(
  userFragment,
  (Any: ?useFragmentFlowtest_user$key),
): ?useFragmentFlowtest_user$data);
(useFragment(
  usersFragment,
  (Any: useFragmentFlowtest_users$key),
): useFragmentFlowtest_users$data);
(useFragment(
  usersFragment,
  (Any: ?useFragmentFlowtest_users$key),
): ?useFragmentFlowtest_users$data);

// $FlowExpectedError: can't cast nullable to non-nullable
(useFragment(
  userFragment,
  (Any: ?useFragmentFlowtest_user$key),
): useFragmentFlowtest_user$data);
// $FlowExpectedError: can't cast nullable plural to non-nullable plural
(useFragment(
  usersFragment,
  (Any: ?useFragmentFlowtest_users$key),
): useFragmentFlowtest_users$data);

// $FlowExpectedError: Key should be one of the generated types
useFragment(userFragment, 'INVALID_KEY');

// $FlowExpectedError: Key should not be a user provided object
useFragment(userFragment, {a: 123});

// $FlowExpectedError: Key should not be an empty object
useFragment(userFragment, {});

// $FlowExpectedError: Key should be the `<name>$key` type from generated flow
useFragment(userFragment, (Any: useFragmentFlowtest_user$data));

/* eslint-enable react-hooks/rules-of-hooks */
