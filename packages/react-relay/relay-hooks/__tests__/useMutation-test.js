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

import type {PayloadData, PayloadError} from 'relay-runtime';

const RelayEnvironmentProvider = require('../RelayEnvironmentProvider');
const useMutation = require('../useMutation');
const React = require('react');
const ReactTestRenderer = require('react-test-renderer');
const {
  createOperationDescriptor,
  getRequest,
  graphql,
} = require('relay-runtime');
const {createMockEnvironment} = require('relay-test-utils');

const {useState, useMemo} = React;
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
    commentId: '<id>',
  },
};

beforeEach(() => {
  environment = createMockEnvironment();
  isInFlightFn = jest.fn();

  CommentCreateMutation = getRequest(graphql`
    mutation useMutationTest1Mutation($input: CommentCreateInput) {
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
    }
  `);

  function Renderer({initialMutation, commitInRender}) {
    const [mutation, setMutationFn] = useState(initialMutation);
    setMutation = setMutationFn;
    const [commitFn, isMutationInFlight] = useMutation(mutation);
    commit = config =>
      ReactTestRenderer.act(() => {
        disposable = commitFn(config);
      });
    if (commitInRender) {
      // `commitInRender` never changes in the test
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useMemo(() => {
        commit({variables});
      }, []);
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

  render = function (env, mutation, commitInRender = false) {
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
  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
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
  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
  const operation = environment.executeMutation.mock.calls[0][0].operation;
  ReactTestRenderer.act(() => environment.mock.resolve(operation, data));
  expect(isInFlightFn).toBeCalledTimes(1);
  expect(isInFlightFn).toHaveBeenCalledWith(false);
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

it('returns in-flight state that tracks all in-flight mutations', () => {
  render(environment, CommentCreateMutation);
  commit({variables});
  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
  expect(environment.executeMutation).toBeCalledTimes(1);
  expect(isInFlightFn).toBeCalledWith(true);

  commit({
    variables: {
      input: {
        commentId: '<new-id-1>',
      },
    },
  });
  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
  expect(environment.executeMutation).toBeCalledTimes(2);

  commit({
    variables: {
      input: {
        commentId: '<new-id-2>',
      },
    },
  });
  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
  expect(environment.executeMutation).toBeCalledTimes(3);

  isInFlightFn.mockClear();
  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
  const operation = environment.executeMutation.mock.calls[0][0].operation;
  ReactTestRenderer.act(() => environment.mock.resolve(operation, data));
  expect(isInFlightFn).toBeCalledTimes(0);

  isInFlightFn.mockClear();

  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
  const operation2 = environment.executeMutation.mock.calls[1][0].operation;
  ReactTestRenderer.act(() =>
    environment.mock.resolve(operation2, {
      data: {
        commentCreate: {
          feedbackCommentEdge: {
            __typename: 'CommentsEdge',
            cursor: '<cursor>',
            node: {
              id: '<new-id-1>',
              body: {
                text: '<text>',
              },
            },
          },
        },
      },
    }),
  );
  expect(isInFlightFn).toBeCalledTimes(0);

  isInFlightFn.mockClear();
  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
  const operation3 = environment.executeMutation.mock.calls[2][0].operation;
  ReactTestRenderer.act(() =>
    environment.mock.resolve(operation3, {
      data: {
        commentCreate: {
          feedbackCommentEdge: {
            __typename: 'CommentsEdge',
            cursor: '<cursor>',
            node: {
              id: '<new-id-2>',
              body: {
                text: '<text>',
              },
            },
          },
        },
      },
    }),
  );
  expect(isInFlightFn).toBeCalledTimes(1);
  expect(isInFlightFn).toBeCalledWith(false);
});

it('returns in-flight state that tracks all current mutations when disposed or errored', () => {
  render(environment, CommentCreateMutation);
  commit({variables});
  const disposable1 = disposable;
  commit({
    variables: {
      input: {
        commentId: '<new-id-1>',
      },
    },
  });
  const disposable2 = disposable;
  commit({
    variables: {
      input: {
        commentId: '<new-id-2>',
      },
    },
  });

  isInFlightFn.mockClear();
  ReactTestRenderer.act(() => disposable1.dispose());
  expect(isInFlightFn).toBeCalledTimes(0);
  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
  const operation3 = environment.executeMutation.mock.calls[2][0].operation;
  ReactTestRenderer.act(() =>
    environment.mock.reject(operation3, new Error('test')),
  );
  expect(isInFlightFn).toBeCalledTimes(0);
  ReactTestRenderer.act(() => disposable2.dispose());
  expect(isInFlightFn).toBeCalledTimes(1);
  expect(isInFlightFn).toBeCalledWith(false);
});

it('calls onCompleted when mutation responses contains server errors', () => {
  const onError = jest.fn();
  const onCompleted = jest.fn();
  render(environment, CommentCreateMutation);
  commit({variables, onError, onCompleted});
  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
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
  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
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
  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
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
    CommentCreateMutation2 = getRequest(graphql`
      mutation useMutationTest2Mutation($input: CommentCreateInput) {
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
      }
    `);
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
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    const operation = environment.executeMutation.mock.calls[0][0].operation;
    ReactTestRenderer.act(() => environment.mock.resolve(operation, data));
    expect(isInFlightFn).toBeCalledTimes(0);
  });

  it('can fetch from the new environment when the environment changes', () => {
    render(environment, CommentCreateMutation);
    isInFlightFn.mockClear();
    commit({variables});
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    expect(environment.executeMutation).toBeCalledTimes(1);

    ReactTestRenderer.act(() => setEnvironment(newEnv));
    commit({variables});
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
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
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
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
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    expect(environment.executeMutation).toBeCalledTimes(2);
    expect(
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      environment.executeMutation.mock.calls[1][0].operation.request,
    ).toEqual(secondOperation.request);

    isInFlightFn.mockClear();
    ReactTestRenderer.act(() => {
      environment.mock.resolve(
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
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
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
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
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
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
