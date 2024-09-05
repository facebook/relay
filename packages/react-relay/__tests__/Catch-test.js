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

const React = require('react');
const {RelayEnvironmentProvider, useLazyLoadQuery} = require('react-relay');
const TestRenderer = require('react-test-renderer');
const {RelayFeatureFlags, graphql} = require('relay-runtime');
const {createMockEnvironment} = require('relay-test-utils');
const {
  disallowConsoleErrors,
  disallowWarnings,
} = require('relay-test-utils-internal');

disallowWarnings();
disallowConsoleErrors();

beforeEach(() => {
  RelayFeatureFlags.ENABLE_FIELD_ERROR_HANDLING_CATCH_DIRECTIVE = true;
});

afterEach(() => {
  RelayFeatureFlags.ENABLE_FIELD_ERROR_HANDLING_CATCH_DIRECTIVE = false;
});

it('should catch a server field error', () => {
  const environment = createMockEnvironment();
  function TestComponent() {
    return (
      <RelayEnvironmentProvider environment={environment}>
        <React.Suspense fallback="Loading">
          <InnerComponent />
        </React.Suspense>
      </RelayEnvironmentProvider>
    );
  }

  function InnerComponent() {
    const data = useLazyLoadQuery(
      graphql`
        query CatchTest1Query {
          me @required(action: THROW) {
            name @catch
          }
        }
      `,
      {},
    );
    return data.me.name.ok ? data.me.name.value : 'Error';
  }

  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(<TestComponent />);
  });

  TestRenderer.act(() => {
    environment.mock.resolveMostRecentOperation(() => {
      return {
        data: {me: {id: '1', name: null}},
        errors: [
          {
            message:
              'Oops! An error occurred when fetching the name on the server!',
            path: ['me', 'name'],
          },
        ],
      };
    });
    jest.runAllImmediates();
  });
  expect(renderer?.toJSON()).toBe('Error');
});

it('should catch a @required(action: THROW) error', () => {
  const environment = createMockEnvironment();
  function TestComponent() {
    return (
      <RelayEnvironmentProvider environment={environment}>
        <React.Suspense fallback="Loading">
          <InnerComponent />
        </React.Suspense>
      </RelayEnvironmentProvider>
    );
  }

  function InnerComponent() {
    const data = useLazyLoadQuery(
      graphql`
        query CatchTestRequiredThrowQuery {
          me @catch {
            name @required(action: THROW)
          }
        }
      `,
      {},
    );
    return data.me.ok ? data.me.value?.name : 'Error';
  }

  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(<TestComponent />);
  });

  TestRenderer.act(() => {
    environment.mock.resolveMostRecentOperation(() => {
      return {data: {me: {id: '1', name: null}}};
    });
    jest.runAllImmediates();
  });
  expect(renderer?.toJSON()).toBe('Error');
});
