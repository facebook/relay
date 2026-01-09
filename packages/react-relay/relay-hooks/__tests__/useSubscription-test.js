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

import type {useSubscriptionTestCommentCreateSubscription$variables} from './__generated__/useSubscriptionTestCommentCreateSubscription.graphql';
import type {RelayMockEnvironment} from 'relay-test-utils/RelayModernMockEnvironment';

const RelayEnvironmentProvider = require('../RelayEnvironmentProvider');
const ReactTestingLibrary = require('@testing-library/react');
const React = require('react');
const {act} = require('react');
const {graphql} = require('relay-runtime');
const {createMockEnvironment} = require('relay-test-utils');

const CommentCreateSubscription = graphql`
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
`;
describe('useSubscription', () => {
  const mockEnv = createMockEnvironment();
  const config = {
    variables: {} as useSubscriptionTestCommentCreateSubscription$variables,
    subscription: CommentCreateSubscription,
  };
  const dispose = jest.fn<ReadonlyArray<unknown>, unknown>();
  const requestSubscription = jest.fn(
    (_passedEnv: any, _passedConfig: any) => ({
      dispose,
    }),
  );
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

  type Props = {
    env: RelayMockEnvironment,
  };
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
  const renderComponent = async () =>
    await act(() => {
      componentInstance = ReactTestingLibrary.render(
        <MyComponent env={mockEnv} />,
      );
    });

  it('should call requestSubscription when mounted', async () => {
    await renderComponent();
    expect(requestSubscription).toHaveBeenCalled();
  });

  it('should call requestSubscription(...).dispose when unmounted', async () => {
    await renderComponent();
    await act(() => {
      componentInstance.unmount();
    });
    expect(dispose).toHaveBeenCalled();
  });

  it('should pass the current relay environment', async () => {
    await renderComponent();
    expect(requestSubscription.mock.calls[0][0]).toEqual(mockEnv);
  });

  it('should forward the config', async () => {
    await renderComponent();
    expect(requestSubscription.mock.calls[0][1]).toEqual(config);
  });

  it('should dispose and re-subscribe when the environment changes', async () => {
    await renderComponent();
    expect(requestSubscription).toHaveBeenCalledTimes(1);
    const disposeCallsBefore = dispose.mock.calls.length;

    await act(() => {
      componentInstance.rerender(<MyComponent env={createMockEnvironment()} />);
    });

    expect(dispose.mock.calls.length).toBeGreaterThan(disposeCallsBefore);
    expect(requestSubscription).toHaveBeenCalledTimes(2);
  });
});
