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
import type {RequestDescriptor} from 'relay-runtime/store/RelayStoreTypes';
import type {ReaderFragment} from '../../../relay-runtime/util/ReaderNode';

const useFragmentNodeOriginal = require('../useFragmentNode');
// eslint-disable-next-line no-unused-vars
const React = require('react');
const ReactRelayContext = require('react-relay/ReactRelayContext');
const TestRenderer = require('react-test-renderer');
const {
  FRAGMENT_OWNER_KEY,
  FRAGMENTS_KEY,
  ID_KEY,
  RelayFeatureFlags,
  createOperationDescriptor,
  getFragment,
  getRequest,
  graphql,
} = require('relay-runtime');
const {createMockEnvironment} = require('relay-test-utils');
const warning = require('warning');

let environment;
let singularQuery;
let renderSingularFragment;
let renderSpy;

function useFragmentNode(
  fragmentNode: ReaderFragment,
  fragmentRef: $TEMPORARY$object<{
    __fragmentOwner: RequestDescriptor,
    __fragments: $TEMPORARY$object<{
      useFragmentNodeRequiredTestUserFragment: $TEMPORARY$object<{...}>,
    }>,
    __id: any,
    __isWithinUnmatchedTypeRefinement: boolean,
  }>,
) {
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

  RelayFeatureFlags.ENABLE_REQUIRED_DIRECTIVES = true;

  // Set up environment and base data
  environment = createMockEnvironment();

  const singularVariables = {id: '1'};
  const gqlSingularQuery = getRequest(graphql`
    query useFragmentNodeRequiredTestUserQuery($id: ID!) {
      node(id: $id) {
        ...useFragmentNodeRequiredTestUserFragment
      }
    }
  `);
  const gqlSingularFragment = getFragment(graphql`
    fragment useFragmentNodeRequiredTestUserFragment on User {
      id
      name @required(action: NONE)
    }
  `);
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

  const ContextProvider = ({
    children,
  }: any | $TEMPORARY$object<{children: React.Node}>) => {
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
        useFragmentNodeRequiredTestUserFragment: {},
      },
      [FRAGMENT_OWNER_KEY]: singularQuery.request,
      __isWithinUnmatchedTypeRefinement: false,
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
