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

const React = require('react');
const ReactTestRenderer = require('react-test-renderer');
const RelayEnvironmentProvider = require('../RelayEnvironmentProvider');

const useMutation = require('../useMutation');

describe('useLazyLoadQueryNode', () => {
  let environment;
  let isInFlightFn;
  let createMockEnvironment;
  let generateAndCompile;
  let CommentCreateMutation;

  const data = {
    data: {
      commentCreate: {
        feedbackCommentEdge: {
          __typename: 'CommentsEdge',
          cursor: '<cursor>',
          node: {
            id: '<id>',
            body: {
              text: '<text>',
            },
          },
        },
      },
    },
  };

  const variables = {
    input: {
      commentId: '<id>',
    },
  };
  beforeEach(() => {
    jest.resetModules();
    jest.spyOn(console, 'warn').mockImplementationOnce(() => {});

    ({
      createMockEnvironment,
      generateAndCompile,
    } = require('relay-test-utils-internal'));

    environment = createMockEnvironment();

    ({CommentCreateMutation} = generateAndCompile(`
      mutation CommentCreateMutation(
        $input: CommentCreateInput
      ) {
        commentCreate(input: $input) {
          feedbackCommentEdge {
            cursor
            node {
              id
              body {
                text
              }
            }
          }
        }
    }`));
    isInFlightFn = jest.fn(val => val);
  });

  afterEach(() => {
    environment.mockClear();
    jest.clearAllTimers();
  });

  it('force a refetch in fast refresh', () => {
    /* $FlowFixMe(site=www) We don't have the module on WWW, but also don't run
     * the test there.
     */
    const ReactRefreshRuntime = require('react-refresh/runtime');
    ReactRefreshRuntime.injectIntoGlobalHook(global);
    let commit;
    const V1 = function(props) {
      const [commitFn, isMutationInFlight] = useMutation(CommentCreateMutation);
      commit = commitFn;
      return isInFlightFn(isMutationInFlight);
    };
    ReactRefreshRuntime.register(V1, 'Renderer');

    ReactTestRenderer.create(
      <RelayEnvironmentProvider environment={environment}>
        <React.Suspense fallback="Fallback">
          <V1 />
        </React.Suspense>
      </RelayEnvironmentProvider>,
    );
    expect(isInFlightFn).toBeCalledTimes(1);
    expect(isInFlightFn).toBeCalledWith(false);

    isInFlightFn.mockClear();
    ReactTestRenderer.act(() => {
      commit({variables});
    });
    expect(isInFlightFn).toBeCalledTimes(1);
    expect(isInFlightFn).toBeCalledWith(true);

    isInFlightFn.mockClear();
    const operation = environment.executeMutation.mock.calls[0][0].operation;
    ReactTestRenderer.act(() => environment.mock.resolve(operation, data));
    expect(isInFlightFn).toBeCalledTimes(1);
    expect(isInFlightFn).toBeCalledWith(false);

    isInFlightFn.mockClear();

    // Trigger a fast fresh
    function V2(props) {
      const [commitFn, isMutationInFlight] = useMutation(CommentCreateMutation);
      commit = commitFn;
      return isInFlightFn(isMutationInFlight);
    }
    ReactRefreshRuntime.register(V2, 'Renderer');
    ReactTestRenderer.act(() => {
      ReactRefreshRuntime.performReactRefresh();
    });

    expect(isInFlightFn).toBeCalledTimes(1);
    expect(isInFlightFn).toBeCalledWith(false);

    isInFlightFn.mockClear();
    ReactTestRenderer.act(() => {
      commit({variables});
    });
    expect(isInFlightFn).toBeCalledTimes(1);
    expect(isInFlightFn).toBeCalledWith(true);
  });
});
