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
// $FlowExpectedError[react-rule-hook]
useFragment(
  userFragment,
  Any as useFragmentFlowtest_user$key,
) as useFragmentFlowtest_user$data;
// $FlowExpectedError[react-rule-hook]
useFragment(
  userFragment,
  Any as ?useFragmentFlowtest_user$key,
) as ?useFragmentFlowtest_user$data;
// $FlowExpectedError[react-rule-hook]
useFragment(
  usersFragment,
  Any as useFragmentFlowtest_users$key,
) as useFragmentFlowtest_users$data;
// $FlowExpectedError[react-rule-hook]
useFragment(
  usersFragment,
  Any as ?useFragmentFlowtest_users$key,
) as ?useFragmentFlowtest_users$data;

// $FlowExpectedError[incompatible-type] : can't cast nullable to non-nullable
// $FlowExpectedError[react-rule-hook]
useFragment(
  userFragment,
  Any as ?useFragmentFlowtest_user$key,
) as useFragmentFlowtest_user$data;
// $FlowExpectedError[incompatible-type] : can't cast nullable plural to non-nullable plural
// $FlowExpectedError[react-rule-hook]
useFragment(
  usersFragment,
  Any as ?useFragmentFlowtest_users$key,
) as useFragmentFlowtest_users$data;

// $FlowExpectedError[incompatible-type] : Key should be one of the generated types
// $FlowExpectedError[react-rule-hook]
useFragment(userFragment, 'INVALID_KEY');

// $FlowExpectedError[incompatible-type] : Key should not be a user provided object
// $FlowExpectedError[react-rule-hook]
useFragment(userFragment, {a: 123});

// $FlowExpectedError[incompatible-type] : Key should not be an empty object
// $FlowExpectedError[react-rule-hook]
useFragment(userFragment, {});

// $FlowExpectedError[incompatible-type] : Key should be the `<name>$key` type from generated flow
// $FlowExpectedError[react-rule-hook]
useFragment(userFragment, Any as useFragmentFlowtest_user$data);

/* eslint-enable react-hooks/rules-of-hooks */
