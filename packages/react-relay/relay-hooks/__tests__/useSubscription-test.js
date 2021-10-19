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

// flowlint ambiguous-object-type:error

'use strict';

import type {RelayMockEnvironment} from 'relay-test-utils/RelayModernMockEnvironment';

const RelayEnvironmentProvider = require('../RelayEnvironmentProvider');
const React = require('react');
const ReactTestRenderer = require('react-test-renderer');
const {getRequest, graphql} = require('relay-runtime');
const {createMockEnvironment} = require('relay-test-utils');

const CommentCreateSubscription = getRequest(graphql`
  subscription useSubscriptionTestCommentCreateSubscription(
    $input: CommentCreateSubscriptionInput
  ) {
    commentCreateSubscribe(input: $input) {
      feedbackCommentEdge {
        node {
          id
          body {
            text
          }
        }
      }
    }
  }
`);
describe('useSubscription', () => {
  const mockEnv = createMockEnvironment();
  const config = {
    variables: {},
    subscription: CommentCreateSubscription,
  };
  const dispose = jest.fn();
  const requestSubscription = jest.fn((_passedEnv, _passedConfig) => ({
    dispose,
  }));
  const relayRuntime = require('relay-runtime');
  jest.mock('relay-runtime', () => {
    return {
      ...relayRuntime,
      requestSubscription,
    };
  });
  const useSubscription = require('../useSubscription');

  afterEach(() => {
    jest.clearAllMocks();
  });
  afterAll(() => {
    jest.resetAllMocks();
  });

  type Props = {|
    env: RelayMockEnvironment,
  |};
  function MyComponent({env}: Props) {
    function InnerComponent() {
      useSubscription(config);
      return 'Hello Relay!';
    }
    return (
      <RelayEnvironmentProvider environment={env}>
        <InnerComponent />
      </RelayEnvironmentProvider>
    );
  }

  let componentInstance;
  const renderComponent = () =>
    ReactTestRenderer.act(() => {
      componentInstance = ReactTestRenderer.create(
        <MyComponent env={mockEnv} />,
      );
    });

  it('should call requestSubscription when mounted', () => {
    renderComponent();
    expect(requestSubscription).toHaveBeenCalled();
  });

  it('should call requestSubscription(...).dispose when unmounted', () => {
    renderComponent();
    ReactTestRenderer.act(() => {
      componentInstance.unmount();
    });
    expect(dispose).toHaveBeenCalled();
  });

  it('should pass the current relay environment', () => {
    renderComponent();
    expect(requestSubscription.mock.calls[0][0]).toEqual(mockEnv);
  });

  it('should forward the config', () => {
    renderComponent();
    expect(requestSubscription.mock.calls[0][1]).toEqual(config);
  });

  it('should dispose and re-subscribe when the environment changes', () => {
    renderComponent();
    expect(requestSubscription).toHaveBeenCalledTimes(1);
    expect(dispose).not.toHaveBeenCalled();

    ReactTestRenderer.act(() => {
      componentInstance.update(<MyComponent env={createMockEnvironment()} />);
    });

    expect(dispose).toHaveBeenCalled();
    expect(requestSubscription).toHaveBeenCalledTimes(2);
  });
});
