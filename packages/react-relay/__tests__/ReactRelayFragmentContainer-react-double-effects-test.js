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

const {createContainer} = require('../ReactRelayFragmentContainer');
const RelayEnvironmentProvider = require('../relay-hooks/RelayEnvironmentProvider');
const React = require('react');
const {useEffect} = require('react');
const ReactTestRenderer = require('react-test-renderer');
const {
  RelayFeatureFlags,
  createOperationDescriptor,
  graphql,
} = require('relay-runtime');
const {createMockEnvironment} = require('relay-test-utils');
const warning = require('warning');

let environment;
let query;
let gqlQuery;
let gqlFragment;
let variables;
let renderSpy;

describe.skip('ReactRelayFragmentContainer-react-double-effects-test', () => {
  beforeEach(() => {
    // Set up feature flags
    RelayFeatureFlags.ENABLE_CONTAINERS_SUBSCRIBE_ON_COMMIT = true;

    // Set up mocks
    jest.spyOn(console, 'warn').mockImplementationOnce(() => {});
    jest.mock('warning');
    renderSpy = jest.fn<ReadonlyArray<unknown>, unknown>();

    // Set up environment and base data
    environment = createMockEnvironment();
    gqlQuery = graphql`
      query ReactRelayFragmentContainerReactDoubleEffectsTestUserQuery(
        $id: ID!
      ) {
        node(id: $id) {
          ...ReactRelayFragmentContainerReactDoubleEffectsTestUserFragment
            @dangerously_unaliased_fixme
        }
      }
    `;
    variables = {id: '1'};
    gqlFragment = graphql`
      fragment ReactRelayFragmentContainerReactDoubleEffectsTestUserFragment on User {
        # eslint-disable-next-line relay/unused-fields
        id
        name
      }
    `;
    query = createOperationDescriptor(gqlQuery, variables);
    environment.commitPayload(query, {
      node: {
        __typename: 'User',
        id: '1',
        name: 'Alice',
      },
    });
  });

  afterEach(() => {
    environment.mockClear();
    renderSpy.mockClear();
    // $FlowFixMe[prop-missing]
    warning.mockClear();
    RelayFeatureFlags.ENABLE_CONTAINERS_SUBSCRIBE_ON_COMMIT = false;
  });

  it('unsubscribes and re-subscribes to fragment when effects are double invoked', () => {
    // $FlowFixMe[prop-missing]
    warning.mockClear();

    let renderLogs = [];
    const FragmentComponent = ({user}: any) => {
      useEffect(() => {
        renderLogs.push(`commit: ${user.name}`);
        return () => {
          renderLogs.push(`cleanup: ${user.name}`);
        };
      }, [user.name]);

      renderLogs.push(`render: ${user.name}`);
      return user.name;
    };

    const FragmentContainer = createContainer<any, typeof FragmentComponent>(
      FragmentComponent,
      {
        // eslint-disable-next-line relay/graphql-naming
        user: gqlFragment,
      },
    );

    let instance;
    const data = environment.lookup(query.fragment).data;
    ReactTestRenderer.act(() => {
      instance = ReactTestRenderer.create(
        <React.StrictMode>
          <RelayEnvironmentProvider environment={environment}>
            <FragmentContainer user={data?.node} />
          </RelayEnvironmentProvider>
        </React.StrictMode>,
        // $FlowFixMe[incompatible-type]
        {unstable_isConcurrent: true, unstable_strictMode: true},
      );
    });
    if (!instance) {
      throw new Error('Failed to render during test.');
    }

    // Assert it renders normally
    expect(instance.toJSON()).toEqual('Alice');

    // Assert render state of component after double invoked effects
    expect(renderLogs).toEqual([
      'render: Alice',
      'render: Alice',
      'commit: Alice',
      'cleanup: Alice',
      'commit: Alice',
    ]);

    // Update the data in the store, assert fragment comoponent updates,
    // meaning it re-subscribed successfully
    renderLogs = [];
    ReactTestRenderer.act(() => {
      environment.commitPayload(query, {
        node: {
          __typename: 'User',
          id: '1',
          name: 'Alice Updated',
        },
      });
    });

    // Assert render state of component after double invoked effects
    expect(renderLogs).toEqual([
      'render: Alice Updated',
      'render: Alice Updated',
      'cleanup: Alice',
      'commit: Alice Updated',
    ]);
    // Assert it updates and renders with updated data
    expect(instance.toJSON()).toEqual('Alice Updated');
  });
});
