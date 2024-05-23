/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * @oncall relay
 */

'use strict';

import type {useFragmentNullabilityTestFragmentWithFieldThatThrows$key} from './__generated__/useFragmentNullabilityTestFragmentWithFieldThatThrows.graphql';

const RelayEnvironmentProvider = require('../RelayEnvironmentProvider');
const useClientQuery = require('../useClientQuery');
const React = require('react');
const TestRenderer = require('react-test-renderer');
const {graphql} = require('relay-runtime');
const {RelayFeatureFlags} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');
const {createMockEnvironment} = require('relay-test-utils');

/*
 * @RelayResolver Query.field_that_throws: Int @semanticNonNull
 */
export function field_that_throws(): number {
  throw new Error('There was an error!');
}

/*
 * @RelayResolver Query.field_with_fragment_that_throws: Int @semanticNonNull
 * @rootFragment useFragmentNullabilityTestFragmentWithFieldThatThrows
 */
export function field_with_fragment_that_throws(
  rootKey: useFragmentNullabilityTestFragmentWithFieldThatThrows$key,
): number {
  const {field_that_throws} = readFragment(
    graphql`
      fragment useFragmentNullabilityTestFragmentWithFieldThatThrows on Query
      @throwOnFieldError {
        field_that_throws
      }
    `,
    rootKey,
  );
  return field_that_throws;
}

describe('useFragment_nullability-test.js', () => {
  beforeEach(() => {
    RelayFeatureFlags.ENABLE_RELAY_RESOLVERS = true;
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    RelayFeatureFlags.ENABLE_RELAY_RESOLVERS = false;
  });

  it('should throw when a resolver in throwOnFieldError-fragment throws', async () => {
    const environment = createMockEnvironment();

    const TestComponent = () => {
      const data = useClientQuery(
        graphql`
          query useFragmentNullabilityTest1Query @throwOnFieldError {
            field_that_throws
          }
        `,
        {},
      );
      return <div>{data.field_that_throws}</div>;
    };
    const renderer = TestRenderer.create(
      <RelayEnvironmentProvider environment={environment}>
        <ErrorBoundary fallback={({error}) => `Error: ${error}`}>
          <TestComponent />
        </ErrorBoundary>
        ,
      </RelayEnvironmentProvider>,
    );
    await TestRenderer.act(() => jest.runAllTimers());
    expect(
      String(renderer.toJSON()).includes('Unexpected resolver exception'),
    ).toEqual(true);
  });

  it('should throw when a resolver in throwOnFieldError-fragment has a throwing throwOnFieldError-fragment', async () => {
    const environment = createMockEnvironment();

    const TestComponent = () => {
      const data = useClientQuery(
        graphql`
          query useFragmentNullabilityTest2Query @throwOnFieldError {
            field_with_fragment_that_throws
          }
        `,
        {},
      );
      return <div>{data.field_with_fragment_that_throws}</div>;
    };
    const renderer = TestRenderer.create(
      <RelayEnvironmentProvider environment={environment}>
        <ErrorBoundary fallback={({error}) => `Error: ${error}`}>
          <TestComponent />
        </ErrorBoundary>
        ,
      </RelayEnvironmentProvider>,
    );
    await TestRenderer.act(() => jest.runAllTimers());
    expect(
      String(renderer.toJSON()).includes('Unexpected resolver exception'),
    ).toEqual(true);
  });

  it('should not throw when a resolver in non-throwing-fragment has a throwing throwOnFieldError-fragment', async () => {
    const environment = createMockEnvironment();

    const TestComponent = () => {
      const data = useClientQuery(
        graphql`
          query useFragmentNullabilityTest3Query {
            field_with_fragment_that_throws
          }
        `,
        {},
      );
      return <div>{data.field_with_fragment_that_throws}</div>;
    };
    const renderer = TestRenderer.create(
      <RelayEnvironmentProvider environment={environment}>
        <ErrorBoundary fallback={({error}) => `Error: ${error}`}>
          <TestComponent />
        </ErrorBoundary>
        ,
      </RelayEnvironmentProvider>,
    );
    await TestRenderer.act(() => jest.runAllTimers());
    expect(
      String(renderer.toJSON()).includes('Unexpected resolver exception'),
    ).toEqual(false);
  });
});

class ErrorBoundary extends React.Component<any, any> {
  state: any | {error: null} = {error: null};
  componentDidCatch(error: Error) {
    this.setState({error});
  }
  render(): React.Node {
    const {children, fallback} = this.props;
    const {error} = this.state;
    if (error) {
      return React.createElement(fallback, {error});
    }
    return children;
  }
}
