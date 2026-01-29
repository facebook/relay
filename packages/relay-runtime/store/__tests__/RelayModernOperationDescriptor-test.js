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

const RelayFeatureFlags = require('../../util/RelayFeatureFlags');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {graphql} = require('react-relay');
const {disallowWarnings} = require('relay-test-utils-internal');

disallowWarnings();

const QUERY = graphql`
  query RelayModernOperationDescriptorTestCycleQuery($id: ID!) {
    node(id: $id) {
      __typename
    }
  }
`;

graphql`
  fragment RelayModernOperationDescriptorTestCycleQuery_fragment on User
  @argumentDefinitions(
    includeName: {
      type: "Boolean!"
      provider: "./RelayProvider_returnsCyclic.relayprovider"
    }
  ) {
    name @include(if: $includeName)
  }
`;

const QUERY_WITH_CYCLIC_PROVIDED_VARIABLES = graphql`
  query RelayModernOperationDescriptorTestCycleWithPVQuery {
    me {
      ...RelayModernOperationDescriptorTestCycleQuery_fragment
    }
  }
`;

describe('createOperationDescriptor cycle detection when enabled', () => {
  beforeEach(() => {
    RelayFeatureFlags.ENABLE_CYLE_DETECTION_IN_VARIABLES = true;
  });
  afterEach(() => {
    RelayFeatureFlags.ENABLE_CYLE_DETECTION_IN_VARIABLES = false;
  });
  test('does not error on non-cyclic structure', () => {
    createOperationDescriptor(QUERY, {});
  });
  test("does not error on cyclic structures that are not part of the query's used variables", () => {
    const extra: $FlowFixMe = {};
    extra.self = extra;
    createOperationDescriptor(QUERY, {extra});
  });
  test('errors on cyclic structures that are part of used variables', () => {
    const extra: $FlowFixMe = {};
    extra.self = extra;
    expect(() => {
      createOperationDescriptor(QUERY, {id: extra});
    }).toThrow(
      'Cycle detected in variables passed to operation `RelayModernOperationDescriptorTestCycleQuery`.',
    );
  });
  test('errors on cyclic structures from provided variables', () => {
    expect(() => {
      createOperationDescriptor(QUERY_WITH_CYCLIC_PROVIDED_VARIABLES, {});
    }).toThrow(
      'Cycle detected in variables passed to operation `RelayModernOperationDescriptorTestCycleWithPVQuery`.',
    );
  });
});
