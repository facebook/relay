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

// eslint-disable-next-line no-unused-vars
const React = require('react');
const ReactTestRenderer = require('react-test-renderer');
const RelayEnvironmentProvider = require('../RelayEnvironmentProvider');

const useFragmentNode = require('../useFragmentNode');
const warning = require('warning');

const {useEffect} = require('react');
const {createOperationDescriptor} = require('relay-runtime');

let environment;
let query;
let gqlQuery;
let gqlFragment;
let variables;
let renderSpy;

// TODO(T83890478): enable once double invoked effects lands in xplat
describe.skip('useFragmentNode-react-double-effects-test', () => {
  beforeEach(() => {
    jest.mock('scheduler', () => require('scheduler/unstable_mock'));
    jest.mock('warning');
    jest.spyOn(console, 'warn').mockImplementationOnce(() => {});
    renderSpy = jest.fn();

    const {
      createMockEnvironment,
      generateAndCompile,
    } = require('relay-test-utils-internal');

    // Set up environment and base data
    environment = createMockEnvironment();
    const generated = generateAndCompile(`
    fragment UserFragment on User  {
      id
      name
    }

    query UserQuery($id: ID!) {
      node(id: $id) {
        ...UserFragment
      }
    }
  `);
    variables = {id: '1'};
    gqlQuery = generated.UserQuery;
    gqlFragment = generated.UserFragment;
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
  });

  it('unsubscribes and re-subscribes to fragment when effects are double invoked', () => {
    // $FlowFixMe[prop-missing]
    warning.mockClear();

    let renderLogs = [];
    const FragmentComponent = ({user}) => {
      const {data} = useFragmentNode(gqlFragment, user, 'TestComponent');
      useEffect(() => {
        renderLogs.push(`commit: ${data.name}`);
        return () => {
          renderLogs.push(`cleanup: ${data.name}`);
        };
      }, [data.name]);

      renderLogs.push(`render: ${data.name}`);
      return data.name;
    };

    let instance;
    const data = environment.lookup(query.fragment).data;
    ReactTestRenderer.act(() => {
      instance = ReactTestRenderer.create(
        <React.StrictMode>
          <RelayEnvironmentProvider environment={environment}>
            <FragmentComponent user={data?.node} />
          </RelayEnvironmentProvider>
        </React.StrictMode>,
        // $FlowFixMe
        {unstable_isConcurrent: true},
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
