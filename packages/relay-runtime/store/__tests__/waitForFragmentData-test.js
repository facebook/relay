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

const {graphql} = require('../../query/GraphQLTag');
const LiveResolverStore = require('../live-resolvers/LiveResolverStore');
const {waitForFragmentData} = require('../observeFragmentExperimental');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const RelayRecordSource = require('../RelayRecordSource');
const {GLOBAL_STORE} = require('./resolvers/ExampleExternalStateStore');
const {createMockEnvironment} = require('relay-test-utils-internal');

afterEach(() => {
  GLOBAL_STORE.reset();
});

test('data ok', async () => {
  const query = graphql`
    query waitForFragmentDataTestOkQuery {
      me {
        ...waitForFragmentDataTestOkFragment
      }
    }
  `;

  const fragment = graphql`
    fragment waitForFragmentDataTestOkFragment on User {
      name
    }
  `;

  const environment = createMockEnvironment({
    store: new LiveResolverStore(new RelayRecordSource()),
  });
  const variables = {};
  const operation = createOperationDescriptor(query, variables);
  environment.commitPayload(operation, {
    me: {id: '7', __typename: 'User', name: 'Elizabeth'},
  });
  const {data} = environment.lookup(operation.fragment);
  // $FlowFixMe[incompatible-type]
  // $FlowFixMe[incompatible-use] - data is untyped
  const result = await waitForFragmentData(environment, fragment, data.me);
  expect(result).toEqual({name: 'Elizabeth'});
});

test('data ok with plural fragment', async () => {
  const query = graphql`
    query waitForFragmentDataTestOkPluralQuery {
      nodes(ids: ["1", "2"]) {
        ...waitForFragmentDataTestOkPluralFragment
      }
    }
  `;

  const fragment = graphql`
    fragment waitForFragmentDataTestOkPluralFragment on User
    @relay(plural: true) {
      name
    }
  `;

  const environment = createMockEnvironment({
    store: new LiveResolverStore(new RelayRecordSource()),
  });
  const variables = {};
  const operation = createOperationDescriptor(query, variables);
  environment.commitPayload(operation, {
    nodes: [
      {id: '1', __typename: 'User', name: 'Alice'},
      {id: '2', __typename: 'User', name: 'Bob'},
    ],
  });
  const {data} = environment.lookup(operation.fragment);
  // $FlowFixMe[incompatible-type]
  // $FlowFixMe[incompatible-use] - data is untyped
  const result = await waitForFragmentData(environment, fragment, data.nodes);
  expect(result).toEqual([{name: 'Alice'}, {name: 'Bob'}]);
});

test('Promise rejects with @throwOnFieldError', async () => {
  const query = graphql`
    query waitForFragmentDataTestThrowOnFieldErrorQuery {
      me {
        ...waitForFragmentDataTestResolverErrorWithThrowOnFieldErrorFragment
      }
    }
  `;

  const fragment = graphql`
    fragment waitForFragmentDataTestResolverErrorWithThrowOnFieldErrorFragment on User
    @throwOnFieldError {
      always_throws
    }
  `;

  const environment = createMockEnvironment({
    store: new LiveResolverStore(new RelayRecordSource()),
  });
  const variables = {};
  const operation = createOperationDescriptor(query, variables);
  environment.commitPayload(operation, {me: {id: '7', __typename: 'User'}});
  const {data} = environment.lookup(operation.fragment);
  let result;
  try {
    // $FlowFixMe[incompatible-type]
    // $FlowFixMe[incompatible-use] - data is untyped
    await waitForFragmentData(environment, fragment, data.me);
  } catch (e) {
    result = e;
  }
  expect(result?.message).toEqual(
    "Relay: Resolver error at path 'always_throws' in 'waitForFragmentDataTestResolverErrorWithThrowOnFieldErrorFragment'. Message: I always throw. What did you expect?",
  );
});

test('data goes missing due to unrelated query response', async () => {
  const query = graphql`
    query waitForFragmentDataTestMissingDataQuery {
      ...waitForFragmentDataTestMissingDataFragment
    }
  `;

  const unrelatedQuery = graphql`
    query waitForFragmentDataTestMissingDataUnrelatedQuery {
      me {
        # Does not fetch name
        __typename
      }
    }
  `;

  const fragment = graphql`
    fragment waitForFragmentDataTestMissingDataFragment on Query {
      me {
        name
      }
    }
  `;

  const environment = createMockEnvironment();
  const variables = {};
  const operation = createOperationDescriptor(query, variables);
  environment.commitPayload(operation, {
    me: {id: '7', __typename: 'User', name: 'Elizabeth'},
  });
  const {data} = environment.lookup(operation.fragment);

  // Now an unrelated query comes in and changes the Query.me relationship to a
  // new user, but does not fetch `name` for that user. Now we are missing data
  // for the initial fragment, but there is no request in flight to fetch it.
  const unrelatedOperation = createOperationDescriptor(unrelatedQuery, {});
  environment.commitPayload(unrelatedOperation, {
    // Note: This is a _different_ user than last time
    me: {id: '99', __typename: 'User'},
  });

  // $FlowFixMe[incompatible-type] - data is untyped
  const result = await waitForFragmentData(environment, fragment, data);
  expect(result).toEqual({me: {name: undefined}});
});

test('data goes missing due to unrelated query response (@throwOnFieldErrro)', async () => {
  const query = graphql`
    query waitForFragmentDataTestMissingDataThrowOnFieldErrorQuery {
      ...waitForFragmentDataTestMissingDataThrowOnFieldErrorFragment
    }
  `;

  const unrelatedQuery = graphql`
    query waitForFragmentDataTestMissingDataUnrelatedThrowOnFieldErrorQuery {
      me {
        # Does not fetch name
        __typename
      }
    }
  `;

  const fragment = graphql`
    fragment waitForFragmentDataTestMissingDataThrowOnFieldErrorFragment on Query
    @throwOnFieldError {
      me {
        name
      }
    }
  `;

  const environment = createMockEnvironment();
  const variables = {};
  const operation = createOperationDescriptor(query, variables);
  environment.commitPayload(operation, {
    me: {id: '7', __typename: 'User', name: 'Elizabeth'},
  });
  const {data} = environment.lookup(operation.fragment);

  // Now an unrelated query comes in and changes the Query.me relationship to a
  // new user, but does not fetch `name` for that user. Now we are missing data
  // for the initial fragment, but there is no request in flight to fetch it.
  const unrelatedOperation = createOperationDescriptor(unrelatedQuery, {});
  environment.commitPayload(unrelatedOperation, {
    // Note: This is a _different_ user than last time
    me: {id: '99', __typename: 'User'},
  });
  let result;
  try {
    // $FlowFixMe[incompatible-type] - data is untyped
    await waitForFragmentData(environment, fragment, data);
  } catch (e) {
    result = e;
  }
  expect(result?.message).toEqual(
    "Relay: Missing expected data at path 'me.name' in 'waitForFragmentDataTestMissingDataThrowOnFieldErrorFragment'.",
  );
});
