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

import type {RelayMockEnvironment} from '../../../relay-test-utils/RelayModernMockEnvironment';
import type {
  useMutationTest1Mutation$data,
  useMutationTest1Mutation$variables,
} from './__generated__/useMutationTest1Mutation.graphql';
import type {PayloadData, PayloadError} from 'relay-runtime';
import type {Mutation} from 'relay-runtime/util/RelayRuntimeTypes';

const RelayEnvironmentProvider = require('../RelayEnvironmentProvider');
const useMutation = require('../useMutation');
const ReactTestingLibrary = require('@testing-library/react');
const React = require('react');
const {createOperationDescriptor, graphql} = require('relay-runtime');
const {
  MockPayloadGenerator,
  createMockEnvironment,
} = require('relay-test-utils');

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
          body: {
            text: '<text>',
          },
          id: '<id>',
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
  isInFlightFn = jest.fn<[boolean], unknown>();

  CommentCreateMutation = graphql`
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
  `;

  function Renderer({
    initialMutation,
    commitInRender,
  }: {
    commitInRender: boolean,
    initialMutation: Mutation<
      useMutationTest1Mutation$variables,
      useMutationTest1Mutation$data,
    >,
  }) {
    const [mutation, setMutationFn] = useState(initialMutation);
    setMutation = setMutationFn;
    const [commitFn, isMutationInFlight] = useMutation(mutation);
    commit = async (config: any) =>
      await ReactTestingLibrary.act(() => {
        disposable = commitFn(config);
      });
    if (commitInRender) {
      void (
        // `commitInRender` never changes in the test
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useMemo(async () => {
          await commit({variables});
        }, [])
      );
    }
    isInFlightFn(isMutationInFlight);
    return null;
  }

  function Container(props: {
    commitInRender: boolean,
    environment: RelayMockEnvironment,
    mutation: Mutation<
      useMutationTest1Mutation$variables,
      useMutationTest1Mutation$data,
    >,
  }) {
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

  render = async function (
    env: RelayMockEnvironment,
    mutation: Mutation<
      useMutationTest1Mutation$variables,
      useMutationTest1Mutation$data,
    >,
    commitInRender: boolean = false,
  ) {
    await ReactTestingLibrary.act(() => {
      instance = ReactTestingLibrary.render(
        <Container
          environment={env}
          mutation={mutation}
          commitInRender={commitInRender}
        />,
      );
    });
  };
});

it('returns correct in-flight state when the mutation is inflight and completes', async () => {
  await render(environment, CommentCreateMutation);
  expect(isInFlightFn).toBeCalledTimes(1);
  expect(isInFlightFn).toBeCalledWith(false);

  isInFlightFn.mockClear();
  await commit({variables});
  expect(isInFlightFn).toBeCalledTimes(1);
  expect(isInFlightFn).toBeCalledWith(true);

  isInFlightFn.mockClear();
  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
  const operation = environment.executeMutation.mock.calls[0][0].operation;
  await ReactTestingLibrary.act(() =>
    environment.mock.resolve(operation, data),
  );
  expect(isInFlightFn).toBeCalledTimes(1);
  expect(isInFlightFn).toBeCalledWith(false);
});

it('returns correct in-flight state when commit called inside render', async () => {
  await render(environment, CommentCreateMutation, true);
  expect(isInFlightFn).toBeCalledTimes(2);
  expect(isInFlightFn).toHaveBeenNthCalledWith(2, true);
  isInFlightFn.mockClear();
  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
  const operation = environment.executeMutation.mock.calls[0][0].operation;
  await ReactTestingLibrary.act(() =>
    environment.mock.resolve(operation, data),
  );
  expect(isInFlightFn).toBeCalledTimes(1);
  expect(isInFlightFn).toHaveBeenCalledWith(false);
});

it('returns correct in-flight state when mutation resolves immediately', async () => {
  await render(environment, CommentCreateMutation);
  expect(isInFlightFn).toBeCalledTimes(1);
  expect(isInFlightFn).toBeCalledWith(false);

  isInFlightFn.mockClear();
  // set up a resolver that will immediately resolve the mutation
  environment.mock.queueOperationResolver(operation =>
    MockPayloadGenerator.generate(operation),
  );
  await ReactTestingLibrary.act(async () => {
    await commit({variables});
  });
  expect(isInFlightFn).toBeCalledTimes(1);
  expect(isInFlightFn).toBeCalledWith(false);
});

it('returns correct in-flight state when the mutation is disposed', async () => {
  await render(environment, CommentCreateMutation);
  isInFlightFn.mockClear();
  await commit({variables});
  expect(isInFlightFn).toBeCalledWith(true);

  isInFlightFn.mockClear();
  expect(disposable).not.toBe(null);
  await ReactTestingLibrary.act(() => disposable && disposable.dispose());
  expect(isInFlightFn).toBeCalledTimes(1);
  expect(isInFlightFn).toBeCalledWith(false);
});

it('returns in-flight state that tracks all in-flight mutations', async () => {
  await render(environment, CommentCreateMutation);
  await commit({variables});
  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
  expect(environment.executeMutation).toBeCalledTimes(1);
  expect(isInFlightFn).toBeCalledWith(true);

  await commit({
    variables: {
      input: {
        commentId: '<new-id-1>',
      },
    },
  });
  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
  expect(environment.executeMutation).toBeCalledTimes(2);

  await commit({
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
  await ReactTestingLibrary.act(() =>
    environment.mock.resolve(operation, data),
  );
  expect(isInFlightFn).toBeCalledTimes(0);

  isInFlightFn.mockClear();

  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
  const operation2 = environment.executeMutation.mock.calls[1][0].operation;
  await ReactTestingLibrary.act(() =>
    environment.mock.resolve(operation2, {
      data: {
        commentCreate: {
          feedbackCommentEdge: {
            __typename: 'CommentsEdge',
            cursor: '<cursor>',
            node: {
              body: {
                text: '<text>',
              },
              id: '<new-id-1>',
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
  await ReactTestingLibrary.act(() =>
    environment.mock.resolve(operation3, {
      data: {
        commentCreate: {
          feedbackCommentEdge: {
            __typename: 'CommentsEdge',
            cursor: '<cursor>',
            node: {
              body: {
                text: '<text>',
              },
              id: '<new-id-2>',
            },
          },
        },
      },
    }),
  );
  expect(isInFlightFn).toBeCalledTimes(1);
  expect(isInFlightFn).toBeCalledWith(false);
});

it('returns in-flight state that tracks all current mutations when disposed or errored', async () => {
  await render(environment, CommentCreateMutation);
  await commit({variables});
  const disposable1 = disposable;
  await commit({
    variables: {
      input: {
        commentId: '<new-id-1>',
      },
    },
  });
  const disposable2 = disposable;
  await commit({
    variables: {
      input: {
        commentId: '<new-id-2>',
      },
    },
  });

  isInFlightFn.mockClear();
  await ReactTestingLibrary.act(() => disposable1.dispose());
  expect(isInFlightFn).toBeCalledTimes(0);
  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
  const operation3 = environment.executeMutation.mock.calls[2][0].operation;
  await ReactTestingLibrary.act(() =>
    environment.mock.reject(operation3, new Error('test')),
  );
  expect(isInFlightFn).toBeCalledTimes(0);
  await ReactTestingLibrary.act(() => disposable2.dispose());
  expect(isInFlightFn).toBeCalledTimes(1);
  expect(isInFlightFn).toBeCalledWith(false);
});

it('calls onCompleted when mutation responses contains server errors', async () => {
  const onError = jest.fn<ReadonlyArray<unknown>, unknown>();
  const onCompleted = jest.fn<ReadonlyArray<unknown>, unknown>();
  await render(environment, CommentCreateMutation);
  await commit({onCompleted, onError, variables});
  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
  const operation = environment.executeMutation.mock.calls[0][0].operation;

  isInFlightFn.mockClear();
  await ReactTestingLibrary.act(() =>
    environment.mock.resolve(operation, {
      data: data.data as PayloadData,
      errors: [
        {
          message: '<error0>',
        },
        {
          message: '<error1>',
        },
      ] as Array<PayloadError>,
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
it('calls onError when mutation errors in commitMutation', async () => {
  const onError = jest.fn<ReadonlyArray<unknown>, unknown>();
  const onCompleted = jest.fn<ReadonlyArray<unknown>, unknown>();
  const throwingUpdater = () => {
    throw new Error('<error0>');
  };
  await render(environment, CommentCreateMutation);
  await commit({onCompleted, onError, updater: throwingUpdater, variables});

  isInFlightFn.mockClear();
  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
  const operation = environment.executeMutation.mock.calls[0][0].operation;
  await ReactTestingLibrary.act(() =>
    environment.mock.resolve(operation, data),
  );
  expect(onError).toBeCalledTimes(1);
  expect(onError).toBeCalledWith(new Error('<error0>'));
  expect(onCompleted).toBeCalledTimes(0);
  expect(isInFlightFn).toBeCalledWith(false);
});

it('calls onComplete when mutation successfully resolved', async () => {
  const onError = jest.fn<ReadonlyArray<unknown>, unknown>();
  const onCompleted = jest.fn<ReadonlyArray<unknown>, unknown>();
  await render(environment, CommentCreateMutation);
  await commit({onCompleted, onError, variables});

  isInFlightFn.mockClear();
  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
  const operation = environment.executeMutation.mock.calls[0][0].operation;
  await ReactTestingLibrary.act(() =>
    environment.mock.resolve(operation, data),
  );
  expect(onError).toBeCalledTimes(0);
  expect(onCompleted).toBeCalledTimes(1);
  expect(onCompleted).toBeCalledWith(
    {
      commentCreate: {
        feedbackCommentEdge: {
          cursor: '<cursor>',
          node: {
            body: {
              text: '<text>',
            },
            id: '<id>',
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
    CommentCreateMutation2 = graphql`
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
    `;
  });

  it('resets in-flight state when the environment changes', async () => {
    await render(environment, CommentCreateMutation);
    isInFlightFn.mockClear();
    await commit({variables});
    expect(isInFlightFn).toBeCalledTimes(1);
    expect(isInFlightFn).toBeCalledWith(true);

    isInFlightFn.mockClear();
    await ReactTestingLibrary.act(() => setEnvironment(newEnv));
    expect(isInFlightFn).toBeCalledTimes(2);
    expect(isInFlightFn).toHaveBeenNthCalledWith(2, false);

    isInFlightFn.mockClear();
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    const operation = environment.executeMutation.mock.calls[0][0].operation;
    await ReactTestingLibrary.act(() =>
      environment.mock.resolve(operation, data),
    );
    expect(isInFlightFn).toBeCalledTimes(0);
  });

  it('can fetch from the new environment when the environment changes', async () => {
    await render(environment, CommentCreateMutation);
    isInFlightFn.mockClear();
    await commit({variables});
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    expect(environment.executeMutation).toBeCalledTimes(1);

    await ReactTestingLibrary.act(() => setEnvironment(newEnv));
    await commit({variables});
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    expect(newEnv.executeMutation).toBeCalledTimes(1);
  });

  it('resets in-flight state when mutation operation changes', async () => {
    await render(environment, CommentCreateMutation);
    await commit({variables});

    isInFlightFn.mockClear();
    await ReactTestingLibrary.act(() => setMutation(CommentCreateMutation2));
    expect(isInFlightFn).toBeCalledTimes(2);
    expect(isInFlightFn).toHaveBeenNthCalledWith(2, false);

    isInFlightFn.mockClear();
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    const operation = environment.executeMutation.mock.calls[0][0].operation;
    await ReactTestingLibrary.act(() =>
      environment.mock.resolve(operation, data),
    );
    expect(isInFlightFn).toBeCalledTimes(0);
  });

  it('can fetch use the new query when the query changes', async () => {
    await render(environment, CommentCreateMutation);
    await commit({variables});

    await ReactTestingLibrary.act(() => setMutation(CommentCreateMutation2));
    await commit({variables});
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
    await ReactTestingLibrary.act(() => {
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

  it('does not setState on commit after unmount', async () => {
    await render(environment, CommentCreateMutation);
    await ReactTestingLibrary.act(() => {
      instance.unmount();
    });

    isInFlightFn.mockClear();
    await commit({variables});
    expect(isInFlightFn).toBeCalledTimes(0);
    expect(console.error).toBeCalledTimes(0);
  });

  it('does not setState on complete after unmount', async () => {
    await render(environment, CommentCreateMutation);
    await commit({variables});
    await ReactTestingLibrary.act(() => {
      instance.unmount();
    });

    isInFlightFn.mockClear();
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    const operation = environment.executeMutation.mock.calls[0][0].operation;
    await ReactTestingLibrary.act(() =>
      environment.mock.resolve(operation, data),
    );
    expect(isInFlightFn).toBeCalledTimes(0);
    expect(console.error).toBeCalledTimes(0);
  });

  it('does not dispose previous in-flight mutaiton ', async () => {
    const onCompleted = jest.fn<ReadonlyArray<unknown>, unknown>();
    await render(environment, CommentCreateMutation);
    await commit({onCompleted, variables});
    await ReactTestingLibrary.act(() => {
      instance.unmount();
    });
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    const operation = environment.executeMutation.mock.calls[0][0].operation;
    await ReactTestingLibrary.act(() =>
      environment.mock.resolve(operation, data),
    );
    expect(onCompleted).toBeCalledTimes(1);
    expect(onCompleted).toBeCalledWith(
      {
        commentCreate: {
          feedbackCommentEdge: {
            cursor: '<cursor>',
            node: {
              body: {
                text: '<text>',
              },
              id: '<id>',
            },
          },
        },
      },
      null,
    );
  });
});
