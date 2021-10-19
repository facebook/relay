/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow
 * @format
 */

'use strict';

const {createContainer} = require('../ReactRelayFragmentContainer');
const RelayEnvironmentProvider = require('../relay-hooks/RelayEnvironmentProvider');
// eslint-disable-next-line no-unused-vars
const React = require('react');
const {useEffect} = require('react');
const ReactTestRenderer = require('react-test-renderer');
const {
  RelayFeatureFlags,
  createOperationDescriptor,
  getFragment,
  getRequest,
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

// TODO(T83890478): enable once double invoked effects lands in xplat
describe.skip('ReactRelayFragmentContainer-react-double-effects-test', () => {
  beforeEach(() => {
    // Set up feature flags
    RelayFeatureFlags.ENABLE_CONTAINERS_SUBSCRIBE_ON_COMMIT = true;

    // Set up mocks
    jest.spyOn(console, 'warn').mockImplementationOnce(() => {});
    jest.mock('warning');
    renderSpy = jest.fn();

    // Set up environment and base data
    environment = createMockEnvironment();
    gqlQuery = getRequest(graphql`
      query ReactRelayFragmentContainerReactDoubleEffectsTestUserQuery(
        $id: ID!
      ) {
        node(id: $id) {
          ...ReactRelayFragmentContainerReactDoubleEffectsTestUserFragment
        }
      }
    `);
    variables = {id: '1'};
    gqlFragment = getFragment(graphql`
      fragment ReactRelayFragmentContainerReactDoubleEffectsTestUserFragment on User {
        # eslint-disable-next-line relay/unused-fields
        id
        name
      }
    `);
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
    const FragmentComponent = ({user}) => {
      useEffect(() => {
        renderLogs.push(`commit: ${user.name}`);
        return () => {
          renderLogs.push(`cleanup: ${user.name}`);
        };
      }, [user.name]);

      renderLogs.push(`render: ${user.name}`);
      return user.name;
    };

    const FragmentContainer = createContainer(FragmentComponent, {
      // eslint-disable-next-line relay/graphql-naming
      user: gqlFragment,
    });

    let instance;
    const data = environment.lookup(query.fragment).data;
    ReactTestRenderer.act(() => {
      instance = ReactTestRenderer.create(
        <React.StrictMode>
          <RelayEnvironmentProvider environment={environment}>
            <FragmentContainer user={data?.node} />
          </RelayEnvironmentProvider>
        </React.StrictMode>,
        // $FlowFixMe
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
      'cleanup: Alice',
      'commit: Alice Updated',
    ]);
    // Assert it updates and renders with updated data
    expect(instance.toJSON()).toEqual('Alice Updated');
  });
});
