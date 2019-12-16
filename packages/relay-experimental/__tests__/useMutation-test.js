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

const {createOperationDescriptor} = require('relay-runtime');
const {
  createMockEnvironment,
  generateAndCompile,
} = require('relay-test-utils-internal');

import type {PayloadData, PayloadError} from 'relay-runtime';

const {useState} = React;
let environment;
let render;
let setEnvironment;
let setMutation;
let commit;
let isInFlightFn;
let CommentCreateMutation;
let disposable;
let instance;

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
    clientMutationId: '0',
    commentId: '<id>',
  },
};

beforeEach(() => {
  environment = createMockEnvironment();
  isInFlightFn = jest.fn();

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

  function Renderer({initialMutation, commitInRender}) {
    const [mutation, setMutationFn] = useState(initialMutation);
    setMutation = setMutationFn;
    const [commitFn, isMutationInFlight] = useMutation(mutation);
    commit = config =>
      ReactTestRenderer.act(() => {
        disposable = commitFn(config);
      });
    if (commitInRender) {
      commit({variables});
    }
    isInFlightFn(isMutationInFlight);
    return null;
  }

  function Container(props) {
    const [env, setEnv] = useState(props.environment);
    setEnvironment = setEnv;
    return (
      <RelayEnvironmentProvider environment={env}>
        <Renderer
          initialMutation={props.mutation}
          commitInRender={props.commitInRender}
        />
      </RelayEnvironmentProvider>
    );
  }

  render = function(env, mutation, commitInRender = false) {
    ReactTestRenderer.act(() => {
      instance = ReactTestRenderer.create(
        <Container
          environment={env}
          mutation={mutation}
          commitInRender={commitInRender}
        />,
      );
    });
  };
});

it('returns correct in-flight state when the mutation is inflight and completes', () => {
  render(environment, CommentCreateMutation);
  expect(isInFlightFn).toBeCalledTimes(1);
  expect(isInFlightFn).toBeCalledWith(false);

  isInFlightFn.mockClear();
  commit({variables});
  expect(isInFlightFn).toBeCalledTimes(1);
  expect(isInFlightFn).toBeCalledWith(true);

  isInFlightFn.mockClear();
  const operation = environment.executeMutation.mock.calls[0][0].operation;
  ReactTestRenderer.act(() => environment.mock.resolve(operation, data));
  expect(isInFlightFn).toBeCalledTimes(1);
  expect(isInFlightFn).toBeCalledWith(false);
});

it('returns correct in-flight state when commit called inside render', () => {
  render(environment, CommentCreateMutation, true);
  expect(isInFlightFn).toBeCalledTimes(2);
  expect(isInFlightFn).toHaveBeenNthCalledWith(2, true);

  isInFlightFn.mockClear();
  const operation = environment.executeMutation.mock.calls[0][0].operation;
  ReactTestRenderer.act(() => environment.mock.resolve(operation, data));
  expect(isInFlightFn).toBeCalledTimes(2);
  expect(isInFlightFn).toHaveBeenNthCalledWith(1, false);
  expect(isInFlightFn).toHaveBeenNthCalledWith(2, true);
});

it('returns correct in-flight state when the mutation is disposed', () => {
  render(environment, CommentCreateMutation);
  isInFlightFn.mockClear();
  commit({variables});
  expect(isInFlightFn).toBeCalledWith(true);

  isInFlightFn.mockClear();
  expect(disposable).not.toBe(null);
  ReactTestRenderer.act(() => disposable && disposable.dispose());
  expect(isInFlightFn).toBeCalledTimes(1);
  expect(isInFlightFn).toBeCalledWith(false);
});

it('only allows one commitMutation to be running for each useMutation', () => {
  render(environment, CommentCreateMutation);
  commit({variables});
  expect(environment.executeMutation).toBeCalledTimes(1);
  commit({variables});
  expect(environment.executeMutation).toBeCalledTimes(1);
  const operation = environment.executeMutation.mock.calls[0][0].operation;
  ReactTestRenderer.act(() => environment.mock.resolve(operation, data));
  commit({variables});
  expect(environment.executeMutation).toBeCalledTimes(2);
});

it('calls onCompleted when mutation responses contains server errors', () => {
  const onError = jest.fn();
  const onCompleted = jest.fn();
  render(environment, CommentCreateMutation);
  commit({variables, onError, onCompleted});
  const operation = environment.executeMutation.mock.calls[0][0].operation;

  isInFlightFn.mockClear();
  ReactTestRenderer.act(() =>
    environment.mock.resolve(operation, {
      data: (data.data: PayloadData),
      errors: ([
        {
          message: '<error0>',
        },
        {
          message: '<error1>',
        },
      ]: Array<PayloadError>),
    }),
  );
  expect(onError).toBeCalledTimes(0);
  expect(onCompleted).toBeCalledTimes(1);
  expect(onCompleted).toBeCalledWith(
    {
      commentCreate: {
        feedbackCommentEdge: {
          cursor: '<cursor>',
          node: {body: {text: '<text>'}, id: '<id>'},
        },
      },
    },
    [
      {
        message: '<error0>',
      },
      {
        message: '<error1>',
      },
    ],
  );
  expect(isInFlightFn).toBeCalledWith(false);
});
it('calls onError when mutation errors in commitMutation', () => {
  const onError = jest.fn();
  const onCompleted = jest.fn();
  const throwingUpdater = () => {
    throw new Error('<error0>');
  };
  render(environment, CommentCreateMutation);
  commit({variables, onError, onCompleted, updater: throwingUpdater});

  isInFlightFn.mockClear();
  const operation = environment.executeMutation.mock.calls[0][0].operation;
  ReactTestRenderer.act(() => environment.mock.resolve(operation, data));
  expect(onError).toBeCalledTimes(1);
  expect(onError).toBeCalledWith(new Error('<error0>'));
  expect(onCompleted).toBeCalledTimes(0);
  expect(isInFlightFn).toBeCalledWith(false);
});

it('calls onComplete when mutation successfully resolved', () => {
  const onError = jest.fn();
  const onCompleted = jest.fn();
  render(environment, CommentCreateMutation);
  commit({variables, onError, onCompleted});

  isInFlightFn.mockClear();
  const operation = environment.executeMutation.mock.calls[0][0].operation;
  ReactTestRenderer.act(() => environment.mock.resolve(operation, data));
  expect(onError).toBeCalledTimes(0);
  expect(onCompleted).toBeCalledTimes(1);
  expect(onCompleted).toBeCalledWith(
    {
      commentCreate: {
        feedbackCommentEdge: {
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
    null,
  );
  expect(isInFlightFn).toBeCalledWith(false);
});

describe('change useMutation input', () => {
  let newEnv;
  let CommentCreateMutation2;

  beforeEach(() => {
    newEnv = createMockEnvironment();
    ({CommentCreateMutation2} = generateAndCompile(`
      mutation CommentCreateMutation2(
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
  });

  it('resets in-flight state when the environment changes', () => {
    render(environment, CommentCreateMutation);
    isInFlightFn.mockClear();
    commit({variables});
    expect(isInFlightFn).toBeCalledTimes(1);
    expect(isInFlightFn).toBeCalledWith(true);

    isInFlightFn.mockClear();
    ReactTestRenderer.act(() => setEnvironment(newEnv));
    expect(isInFlightFn).toBeCalledTimes(2);
    expect(isInFlightFn).toHaveBeenNthCalledWith(2, false);

    isInFlightFn.mockClear();
    const operation = environment.executeMutation.mock.calls[0][0].operation;
    ReactTestRenderer.act(() => environment.mock.resolve(operation, data));
    expect(isInFlightFn).toBeCalledTimes(0);
  });

  it('can fetch from the new environment when the environment changes', () => {
    render(environment, CommentCreateMutation);
    isInFlightFn.mockClear();
    commit({variables});
    expect(environment.executeMutation).toBeCalledTimes(1);

    ReactTestRenderer.act(() => setEnvironment(newEnv));
    commit({variables});
    expect(newEnv.executeMutation).toBeCalledTimes(1);
  });

  it('resets in-flight state when mutation operation changes', () => {
    render(environment, CommentCreateMutation);
    commit({variables});

    isInFlightFn.mockClear();
    ReactTestRenderer.act(() => setMutation(CommentCreateMutation2));
    expect(isInFlightFn).toBeCalledTimes(2);
    expect(isInFlightFn).toHaveBeenNthCalledWith(2, false);

    isInFlightFn.mockClear();
    const operation = environment.executeMutation.mock.calls[0][0].operation;
    ReactTestRenderer.act(() => environment.mock.resolve(operation, data));
    expect(isInFlightFn).toBeCalledTimes(0);
  });

  it('can fetch use the new query when the query changes', () => {
    render(environment, CommentCreateMutation);
    commit({variables});

    ReactTestRenderer.act(() => setMutation(CommentCreateMutation2));
    commit({variables});
    const secondOperation = createOperationDescriptor(
      CommentCreateMutation2,
      variables,
    );
    expect(environment.executeMutation).toBeCalledTimes(2);
    expect(
      environment.executeMutation.mock.calls[1][0].operation.request,
    ).toEqual(secondOperation.request);

    isInFlightFn.mockClear();
    ReactTestRenderer.act(() => {
      environment.mock.resolve(
        environment.executeMutation.mock.calls[0][0].operation,
        data,
      );
      environment.mock.resolve(secondOperation, data);
    });
    expect(isInFlightFn).toBeCalledTimes(1);
    expect(isInFlightFn).toBeCalledWith(false);
  });
});

describe('unmount', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementationOnce(() => {});
  });

  it('does not setState on commit after unmount', () => {
    render(environment, CommentCreateMutation);
    ReactTestRenderer.act(() => instance.unmount());

    isInFlightFn.mockClear();
    commit({variables});
    expect(isInFlightFn).toBeCalledTimes(0);
    expect(console.error).toBeCalledTimes(0);
  });

  it('does not setState on complete after unmount', () => {
    render(environment, CommentCreateMutation);
    commit({variables});
    ReactTestRenderer.act(() => instance.unmount());

    isInFlightFn.mockClear();
    const operation = environment.executeMutation.mock.calls[0][0].operation;
    ReactTestRenderer.act(() => environment.mock.resolve(operation, data));
    expect(isInFlightFn).toBeCalledTimes(0);
    expect(console.error).toBeCalledTimes(0);
  });

  it('does not dispose previous in-flight mutaiton ', () => {
    const onCompleted = jest.fn();
    render(environment, CommentCreateMutation);
    commit({variables, onCompleted});
    ReactTestRenderer.act(() => instance.unmount());
    const operation = environment.executeMutation.mock.calls[0][0].operation;
    ReactTestRenderer.act(() => environment.mock.resolve(operation, data));
    expect(onCompleted).toBeCalledTimes(1);
    expect(onCompleted).toBeCalledWith(
      {
        commentCreate: {
          feedbackCommentEdge: {
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
      null,
    );
  });
});
