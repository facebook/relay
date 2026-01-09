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

const useFragmentNode = require('../legacy/useFragmentNode');
const RelayEnvironmentProvider = require('../RelayEnvironmentProvider');
const ReactTestingLibrary = require('@testing-library/react');
const React = require('react');
const {useEffect} = require('react');
const {createOperationDescriptor, graphql} = require('relay-runtime');
const {createMockEnvironment} = require('relay-test-utils');
const warning = require('warning');

let environment;
let query;
let gqlQuery;
let gqlFragment;
let variables;
let renderSpy;

describe.skip('useFragmentNode-react-double-effects-test', () => {
  beforeEach(() => {
    jest.mock('scheduler', () => require('../../__tests__/mockScheduler'));
    jest.mock('warning');
    jest.spyOn(console, 'warn').mockImplementationOnce(() => {});
    renderSpy = jest.fn<ReadonlyArray<unknown>, unknown>();

    // Set up environment and base data
    environment = createMockEnvironment();

    gqlQuery = graphql`
      query useFragmentNodeReactDoubleEffectsTestUserQuery($id: ID!) {
        node(id: $id) {
          ...useFragmentNodeReactDoubleEffectsTestUserFragment
            @dangerously_unaliased_fixme
        }
      }
    `;
    variables = {id: '1'};
    gqlFragment = graphql`
      fragment useFragmentNodeReactDoubleEffectsTestUserFragment on User {
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
  });

  it('unsubscribes and re-subscribes to fragment when effects are double invoked', async () => {
    // $FlowFixMe[prop-missing]
    warning.mockClear();

    let renderLogs = [];
    const FragmentComponent = ({user}: Readonly<{user: unknown}>) => {
      const {data} = useFragmentNode<any>(gqlFragment, user, 'TestComponent');
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
    await ReactTestingLibrary.act(() => {
      instance = ReactTestingLibrary.render(
        // Using StrictMode will trigger double invoke effect behavior
        <React.StrictMode>
          <RelayEnvironmentProvider environment={environment}>
            <FragmentComponent user={data?.node} />
          </RelayEnvironmentProvider>
        </React.StrictMode>,
      );
    });
    if (!instance) {
      throw new Error('Failed to render during test.');
    }

    // Assert it renders normally
    expect(instance.container.textContent).toEqual('Alice');

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
    await ReactTestingLibrary.act(() => {
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
    expect(instance.container.textContent).toEqual('Alice Updated');
  });
});
