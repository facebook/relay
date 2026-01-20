/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * @oncall relay
 * @jest-environment jsdom
 */

'use strict';

import type {useFragmentNullabilityTestFragmentWithFieldThatThrows$key} from './__generated__/useFragmentNullabilityTestFragmentWithFieldThatThrows.graphql';

const ReactRelayLoggingContext = require('../../ReactRelayLoggingContext');
const RelayEnvironmentProvider = require('../RelayEnvironmentProvider');
const useClientQuery = require('../useClientQuery');
const ReactTestingLibrary = require('@testing-library/react');
const React = require('react');
const {act} = require('react');
const {RelayFeatureFlags} = require('relay-runtime');
const {graphql} = require('relay-runtime');
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
    jest.spyOn(console, 'error').mockImplementation(() => {});
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
    const renderer = ReactTestingLibrary.render(
      <RelayEnvironmentProvider environment={environment}>
        <ErrorBoundary fallback={({error}) => `Error: ${error}`}>
          <TestComponent />
        </ErrorBoundary>
      </RelayEnvironmentProvider>,
    );
    await act(() => jest.runAllTimers());
    expect(
      String(renderer.container.textContent).includes(
        "Resolver error at path 'field_that_throws' in 'useFragmentNullabilityTest1Query'.",
      ),
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
    const renderer = ReactTestingLibrary.render(
      <RelayEnvironmentProvider environment={environment}>
        <ErrorBoundary fallback={({error}) => `Error: ${error}`}>
          <TestComponent />
        </ErrorBoundary>
        ,
      </RelayEnvironmentProvider>,
    );
    await act(() => jest.runAllTimers());
    expect(
      String(renderer.container.textContent).includes(
        "Resolver error at path 'field_that_throws' in 'useFragmentNullabilityTestFragmentWithFieldThatThrows'.",
      ),
    ).toEqual(true);
  });

  it('should not throw when a resolver in non-throwing-fragment has a throwing throwOnFieldError-fragment', async () => {
    const environment = createMockEnvironment();
    environment.relayFieldLogger = jest.fn();
    RelayFeatureFlags.ENABLE_UI_CONTEXT_ON_RELAY_LOGGER = true;

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
    const renderer = ReactTestingLibrary.render(
      <ReactRelayLoggingContext.Provider
        value={{
          randomKey: 'randomValue',
        }}>
        <RelayEnvironmentProvider environment={environment}>
          <ErrorBoundary fallback={({error}) => `Error: ${error}`}>
            <TestComponent />
          </ErrorBoundary>
        </RelayEnvironmentProvider>
      </ReactRelayLoggingContext.Provider>,
    );
    await act(() => jest.runAllTimers());
    expect(
      String(renderer.container.textContent).includes(
        'Unexpected response payload',
      ),
    ).toEqual(false);

    expect(environment.relayFieldLogger).toHaveBeenCalledWith({
      error: new Error('There was an error!'),
      fieldPath: 'field_that_throws',
      handled: true,
      kind: 'relay_resolver.error',
      owner: 'useFragmentNullabilityTestFragmentWithFieldThatThrows',
      shouldThrow: true,
      uiContext: {
        randomKey: 'randomValue',
      },
    });
  });
});

class ErrorBoundary extends React.Component<any, any> {
  state: any | {error: null} = {error: null};
  componentDidCatch(error: Error) {
    this.setState({error});
  }
  render(): React.Node {
    const {children, fallback: Fallback} = this.props;
    const {error} = this.state;
    if (error) {
      return <Fallback error={error} />;
    }
    return children;
  }
}
