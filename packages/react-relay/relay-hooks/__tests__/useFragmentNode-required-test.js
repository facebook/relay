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
const ReactRelayContext = require('react-relay/ReactRelayContext');
const TestRenderer = require('react-test-renderer');

const useFragmentNodeOriginal = require('../useFragmentNode');
const warning = require('warning');

const {
  FRAGMENT_OWNER_KEY,
  FRAGMENTS_KEY,
  ID_KEY,
  createOperationDescriptor,
  RelayFeatureFlags,
} = require('relay-runtime');

let environment;
let singularQuery;
let renderSingularFragment;
let renderSpy;

function useFragmentNode(fragmentNode, fragmentRef) {
  const result = useFragmentNodeOriginal(
    fragmentNode,
    fragmentRef,
    'TestDisplayName',
  );
  renderSpy(result);
  return result;
}

beforeEach(() => {
  // Set up mocks
  jest.resetModules();
  jest.spyOn(console, 'warn').mockImplementationOnce(() => {});
  jest.mock('warning');
  renderSpy = jest.fn();

  const {
    createMockEnvironment,
    generateAndCompile,
  } = require('relay-test-utils-internal');
  RelayFeatureFlags.ENABLE_REQUIRED_DIRECTIVES = true;

  // Set up environment and base data
  environment = createMockEnvironment();
  const generated = generateAndCompile(`
    fragment UserFragment on User  {
      id
      name @required(action: NONE)
    }

    query UserQuery($id: ID!) {
      node(id: $id) {
        ...UserFragment
      }
    }
  `);
  const singularVariables = {id: '1'};
  const gqlSingularQuery = generated.UserQuery;
  const gqlSingularFragment = generated.UserFragment;
  singularQuery = createOperationDescriptor(
    gqlSingularQuery,
    singularVariables,
  );
  environment.commitPayload(singularQuery, {
    node: {
      __typename: 'User',
      id: '1',
      name: 'Alice',
    },
  });

  const ContextProvider = ({children}) => {
    return (
      <ReactRelayContext.Provider value={{environment}}>
        {children}
      </ReactRelayContext.Provider>
    );
  };

  const SingularContainer = () => {
    // We need a render a component to run a Hook
    const userRef = {
      [ID_KEY]: singularQuery.request.variables.id,
      [FRAGMENTS_KEY]: {
        UserFragment: {},
      },
      [FRAGMENT_OWNER_KEY]: singularQuery.request,
    };

    useFragmentNode(gqlSingularFragment, userRef);
    return null;
  };

  renderSingularFragment = () => {
    return TestRenderer.create(
      <ContextProvider>
        <SingularContainer />
      </ContextProvider>,
    );
  };
});

afterEach(() => {
  RelayFeatureFlags.ENABLE_REQUIRED_DIRECTIVES = false;
  environment.mockClear();
  renderSpy.mockClear();
  // $FlowFixMe[prop-missing]
  warning.mockClear();
});

it('should render singular fragment without error when data is available', () => {
  // $FlowFixMe[prop-missing]
  warning.mockClear();
  renderSingularFragment();
  expect(renderSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      data: {
        id: '1',
        name: 'Alice',
      },
    }),
  );
  expect(warning).not.toHaveBeenCalled();
});

it('should not warn on missing record when null bubbles to fragment root', () => {
  environment.commitPayload(singularQuery, {
    node: {
      __typename: 'User',
      id: '1',
      name: null,
    },
  });

  // commitPayload triggers some warnings, ignore those for the purposes of this test.
  // $FlowFixMe[prop-missing]
  warning.mockClear();

  renderSingularFragment();
  expect(renderSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      data: null,
    }),
  );
  expect(warning).not.toHaveBeenCalled();
});
