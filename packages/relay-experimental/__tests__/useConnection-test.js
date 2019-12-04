/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const React = require('react');
// $FlowFixMe
const ReactTestRenderer = require('react-test-renderer');
const RelayEnvironmentProvider = require('../RelayEnvironmentProvider');

const useConnection = require('../useConnection');
const useFragment = require('../useFragment');

const {
  RelayFeatureFlags,
  ConnectionResolver_UNSTABLE,
  createOperationDescriptor,
  Environment,
  Network,
  Store,
  RecordSource,
} = require('relay-runtime');
const {generateAndCompile} = require('relay-test-utils-internal');

import type {
  ConcreteRequest,
  ConnectionReference,
  ConnectionResolver,
  ConnectionState,
  FragmentReference,
  ReaderFragment,
} from 'relay-runtime';

const edgeID1 =
  'client:feedback:1:comments(orderby:"date"):__connection_page(first:2,orderby:"date"):edges:0';
const edgeID2 =
  'client:feedback:1:comments(orderby:"date"):__connection_page(first:2,orderby:"date"):edges:1';
const examplePayload = {
  node: {
    __typename: 'Feedback',
    id: 'feedback:1',
    comments: {
      count: 42,
      edges: [
        {
          cursor: 'cursor-1',
          node: {
            __typename: 'Comment',
            id: 'node-1',
            message: {text: 'Comment 1'},
          },
        },
        {
          cursor: 'cursor-2',
          node: {
            __typename: 'Comment',
            id: 'node-2',
            message: {text: 'Comment 2'},
          },
        },
      ],
      pageInfo: {
        endCursor: 'cursor-2',
        hasNextPage: true,
        hasPreviousPage: null,
        startCursor: 'cursor-1',
      },
    },
  },
};

let enableConnectionResolvers;
let environment;
let fetch;
let query: ConcreteRequest;
let fragment: ReaderFragment;
let operation;

type FeedbackFragment_feedback_edge = {|
  +__id: string,
  +cursor: ?string,
  +node: ?{|
    +__id: string,
    +message: ?{|
      +text: ?string,
    |},
  |},
|};
type FeedbackFragment_feedback = {|
  +id: ?string,
  +comments: ?{|
    +count: ?number,
    +__connection: ConnectionReference<FeedbackFragment_feedback_edge>,
  |},
  +$refType: FeedbackFragment_feedback$ref,
|};
type FeedbackFragment_feedback$ref = FragmentReference;
type FeedbackFragment_feedback$data = FeedbackFragment_feedback;
type FeedbackFragment_feedback$key = {
  +$data?: FeedbackFragment_feedback$data,
  +$fragmentRefs: FeedbackFragment_feedback$ref,
  ...
};
type Props = {|
  +feedback: FeedbackFragment_feedback$key,
|};
type NullableProps = {|
  +feedback: ?FeedbackFragment_feedback$key,
|};
type PropsWithResolver = {|
  +feedback: FeedbackFragment_feedback$key,
  +resolver: ConnectionResolver<
    FeedbackFragment_feedback_edge,
    ConnectionState<FeedbackFragment_feedback_edge>,
  >,
|};

beforeEach(() => {
  enableConnectionResolvers = RelayFeatureFlags.ENABLE_CONNECTION_RESOLVERS;
  RelayFeatureFlags.ENABLE_CONNECTION_RESOLVERS = true;

  fetch = jest.fn();
  environment = new Environment({
    store: new Store(new RecordSource()),
    network: Network.create(fetch),
  });
  ({FeedbackQuery: query, FeedbackFragment: fragment} = generateAndCompile(`
    query FeedbackQuery($id: ID!) {
      node(id: $id) {
        ...FeedbackFragment
      }
    }
    fragment FeedbackFragment on Feedback @argumentDefinitions(
      count: {type: "Int", defaultValue: 2},
      cursor: {type: "ID"}
      beforeCount: {type: "Int"},
      beforeCursor: {type: "ID"}
    ) {
      id
      comments(
        after: $cursor
        before: $beforeCursor
        first: $count
        last: $beforeCount
        orderby: "date"
      ) @connection_resolver(label: "FeedbackFragment$comments") {
        count
        edges {
          cursor
          node {
            id
            message { text }
            ...CommentFragment
          }
        }
        pageInfo {
          endCursor
          hasNextPage
          hasPreviousPage
          startCursor
        }
      }
    }

    fragment CommentFragment on Comment {
      id
    }
  `));
  operation = createOperationDescriptor(query, {id: 'feedback:1'});

  environment.commitPayload(operation, examplePayload);
});

afterEach(() => {
  RelayFeatureFlags.ENABLE_CONNECTION_RESOLVERS = enableConnectionResolvers;
});

test('it returns the initial results of the connection', () => {
  let comments;
  function Component(props: Props) {
    const feedback = useFragment(fragment, props.feedback);
    comments = useConnection(ConnectionResolver_UNSTABLE, feedback.comments);
    return feedback?.comments?.count ?? null;
  }
  const queryData: $FlowFixMe = environment.lookup(operation.fragment);
  const renderer = ReactTestRenderer.create(
    <RelayEnvironmentProvider environment={environment}>
      <Component feedback={queryData.data.node} />
    </RelayEnvironmentProvider>,
  );
  expect(renderer.toJSON()).toEqual('42');
  expect(comments).toEqual({
    edges: [
      {
        __id: edgeID1,
        cursor: 'cursor-1',
        node: {
          id: 'node-1',
          message: {text: 'Comment 1'},
          __fragmentOwner: operation.request,
          __fragments: {CommentFragment: {}},
          __id: 'node-1',
        },
      },
      {
        __id: edgeID2,
        cursor: 'cursor-2',
        node: {
          id: 'node-2',
          message: {text: 'Comment 2'},
          __fragmentOwner: operation.request,
          __fragments: {CommentFragment: {}},
          __id: 'node-2',
        },
      },
    ],
    pageInfo: {
      endCursor: 'cursor-2',
      hasNextPage: true,
      hasPrevPage: null,
      startCursor: 'cursor-1',
    },
  });
});

test('it does not recompute if rerendered with the same inputs', () => {
  const lookupConnection_UNSTABLE = jest.spyOn(
    environment.getStore(),
    'lookupConnection_UNSTABLE',
  );
  const subscribeConnection_UNSTABLE = jest.spyOn(
    environment.getStore(),
    'subscribeConnection_UNSTABLE',
  );
  function Component(props: Props) {
    const feedback = useFragment(fragment, props.feedback);
    useConnection(ConnectionResolver_UNSTABLE, feedback.comments);
    return feedback?.comments?.count ?? null;
  }
  const queryData: $FlowFixMe = environment.lookup(operation.fragment);
  const renderer = ReactTestRenderer.create(
    <RelayEnvironmentProvider environment={environment}>
      <Component feedback={queryData.data.node} />
    </RelayEnvironmentProvider>,
  );
  expect(lookupConnection_UNSTABLE).toBeCalledTimes(1);
  ReactTestRenderer.act(() => jest.runAllImmediates());
  expect(lookupConnection_UNSTABLE).toBeCalledTimes(2);
  lookupConnection_UNSTABLE.mockClear();

  // update w identical props: shouldn't re-read the connection
  renderer.update(
    <RelayEnvironmentProvider environment={environment}>
      <Component feedback={queryData.data.node} />
    </RelayEnvironmentProvider>,
  );
  ReactTestRenderer.act(() => jest.runAllImmediates());
  expect(lookupConnection_UNSTABLE).toBeCalledTimes(0);
  expect(subscribeConnection_UNSTABLE).toBeCalledTimes(1);
});

test('it updates when the environment changes', () => {
  const nextEnvironment = new Environment({
    store: new Store(new RecordSource()),
    network: Network.create(fetch),
  });
  nextEnvironment.commitPayload(operation, {
    node: {
      __typename: 'Feedback',
      id: 'feedback:1',
      comments: {
        count: 43,
        edges: [
          {
            cursor: 'cursor-1',
            node: {
              __typename: 'Comment',
              id: 'node-1',
              message: {text: 'Comment 1 new environment'},
            },
          },
          {
            cursor: 'cursor-2',
            node: {
              __typename: 'Comment',
              id: 'node-2',
              message: {text: 'Comment 2 new environment'},
            },
          },
        ],
        pageInfo: {
          endCursor: 'cursor-2',
          hasNextPage: true,
          hasPreviousPage: null,
          startCursor: 'cursor-1',
        },
      },
    },
  });

  let comments;
  function Component(props: Props) {
    const feedback = useFragment(fragment, props.feedback);
    comments = useConnection(ConnectionResolver_UNSTABLE, feedback.comments);
    return feedback?.comments?.count ?? null;
  }
  const queryData: $FlowFixMe = environment.lookup(operation.fragment);
  const renderer = ReactTestRenderer.create(
    <RelayEnvironmentProvider environment={environment}>
      <Component feedback={queryData.data.node} />
    </RelayEnvironmentProvider>,
  );
  ReactTestRenderer.act(() => jest.runAllImmediates());

  // update w identical props except for a new environment: should read from new
  // environment
  renderer.update(
    <RelayEnvironmentProvider environment={nextEnvironment}>
      <Component feedback={queryData.data.node} />
    </RelayEnvironmentProvider>,
  );
  expect(renderer.toJSON()).toEqual('43');
  expect(comments).toEqual({
    edges: [
      {
        __id: edgeID1,
        cursor: 'cursor-1',
        node: {
          id: 'node-1',
          message: {text: 'Comment 1 new environment'},
          __fragmentOwner: operation.request,
          __fragments: {CommentFragment: {}},
          __id: 'node-1',
        },
      },
      {
        __id: edgeID2,
        cursor: 'cursor-2',
        node: {
          id: 'node-2',
          message: {text: 'Comment 2 new environment'},
          __fragmentOwner: operation.request,
          __fragments: {CommentFragment: {}},
          __id: 'node-2',
        },
      },
    ],
    pageInfo: {
      endCursor: 'cursor-2',
      hasNextPage: true,
      hasPrevPage: null,
      startCursor: 'cursor-1',
    },
  });
});

test('it updates when the referenced connection changes (ref -> ref)', () => {
  const subscribeConnection_UNSTABLE = jest.spyOn(
    environment.getStore(),
    'subscribeConnection_UNSTABLE',
  );
  const nextOperation = createOperationDescriptor(query, {id: 'feedback:2'});
  environment.commitPayload(nextOperation, {
    node: {
      __typename: 'Feedback',
      id: 'feedback:2',
      comments: {
        count: 43,
        edges: [
          {
            cursor: 'cursor-3',
            node: {
              __typename: 'Comment',
              id: 'node-3',
              message: {text: 'Comment 3'},
            },
          },
          {
            cursor: 'cursor-4',
            node: {
              __typename: 'Comment',
              id: 'node-4',
              message: {text: 'Comment 4'},
            },
          },
        ],
        pageInfo: {
          endCursor: 'cursor-4',
          hasNextPage: true,
          hasPreviousPage: null,
          startCursor: 'cursor-3',
        },
      },
    },
  });
  let comments;
  function Component(props: Props) {
    const feedback = useFragment(fragment, props.feedback);
    comments = useConnection(ConnectionResolver_UNSTABLE, feedback.comments);
    return feedback?.comments?.count ?? null;
  }
  const queryData: $FlowFixMe = environment.lookup(operation.fragment);
  const renderer = ReactTestRenderer.create(
    <RelayEnvironmentProvider environment={environment}>
      <Component feedback={queryData.data.node} />
    </RelayEnvironmentProvider>,
  );
  ReactTestRenderer.act(() => jest.runAllImmediates());

  // update w a different connection reference, should reread
  const nextQueryData: $FlowFixMe = environment.lookup(nextOperation.fragment);
  renderer.update(
    <RelayEnvironmentProvider environment={environment}>
      <Component feedback={nextQueryData.data.node} />
    </RelayEnvironmentProvider>,
  );
  expect(renderer.toJSON()).toEqual('43');
  expect(comments).toEqual({
    edges: [
      {
        __id: edgeID1.replace('feedback:1', 'feedback:2'),
        cursor: 'cursor-3',
        node: {
          id: 'node-3',
          message: {text: 'Comment 3'},
          __fragmentOwner: nextOperation.request,
          __fragments: {CommentFragment: {}},
          __id: 'node-3',
        },
      },
      {
        __id: edgeID2.replace('feedback:1', 'feedback:2'),
        cursor: 'cursor-4',
        node: {
          id: 'node-4',
          message: {text: 'Comment 4'},
          __fragmentOwner: nextOperation.request,
          __fragments: {CommentFragment: {}},
          __id: 'node-4',
        },
      },
    ],
    pageInfo: {
      endCursor: 'cursor-4',
      hasNextPage: true,
      hasPrevPage: null,
      startCursor: 'cursor-3',
    },
  });
  // Commit and fire effects
  ReactTestRenderer.act(() => jest.runAllImmediates());
  expect(subscribeConnection_UNSTABLE).toBeCalledTimes(2);
});

test('it updates when the referenced connection changes (ref -> null)', () => {
  const subscribeConnection_UNSTABLE = jest.spyOn(
    environment.getStore(),
    'subscribeConnection_UNSTABLE',
  );
  let comments;
  function Component(props: NullableProps) {
    const feedback = useFragment(fragment, props.feedback);
    comments = useConnection(
      ConnectionResolver_UNSTABLE,
      feedback?.comments ?? null,
    );
    return feedback?.comments?.count ?? null;
  }
  const queryData: $FlowFixMe = environment.lookup(operation.fragment);
  const renderer = ReactTestRenderer.create(
    <RelayEnvironmentProvider environment={environment}>
      <Component feedback={queryData.data.node} />
    </RelayEnvironmentProvider>,
  );
  ReactTestRenderer.act(() => jest.runAllImmediates());
  expect(subscribeConnection_UNSTABLE).toBeCalledTimes(1);

  // update w a different connection reference, should reread
  renderer.update(
    <RelayEnvironmentProvider environment={environment}>
      <Component feedback={null} />
    </RelayEnvironmentProvider>,
  );
  expect(renderer.toJSON()).toEqual(null);
  expect(comments).toBe(null);
  // Commit and fire effects
  ReactTestRenderer.act(() => jest.runAllImmediates());
  expect(subscribeConnection_UNSTABLE).toBeCalledTimes(1);
});

test('it updates when the referenced connection changes (null -> ref)', () => {
  const subscribeConnection_UNSTABLE = jest.spyOn(
    environment.getStore(),
    'subscribeConnection_UNSTABLE',
  );
  let comments;
  function Component(props: NullableProps) {
    const feedback = useFragment(fragment, props.feedback);
    comments = useConnection(
      ConnectionResolver_UNSTABLE,
      feedback?.comments ?? null,
    );
    return feedback?.comments?.count ?? null;
  }
  const renderer = ReactTestRenderer.create(
    <RelayEnvironmentProvider environment={environment}>
      <Component feedback={null} />
    </RelayEnvironmentProvider>,
  );
  ReactTestRenderer.act(() => jest.runAllImmediates());
  expect(comments).toBe(null);
  expect(subscribeConnection_UNSTABLE).toBeCalledTimes(0);

  // update w a different connection reference, should reread
  const queryData: $FlowFixMe = environment.lookup(operation.fragment);
  renderer.update(
    <RelayEnvironmentProvider environment={environment}>
      <Component feedback={queryData.data.node} />
    </RelayEnvironmentProvider>,
  );
  expect(renderer.toJSON()).toEqual('42');
  expect(comments).toEqual({
    edges: [
      {
        __id: edgeID1,
        cursor: 'cursor-1',
        node: {
          id: 'node-1',
          message: {text: 'Comment 1'},
          __fragmentOwner: operation.request,
          __fragments: {CommentFragment: {}},
          __id: 'node-1',
        },
      },
      {
        __id: edgeID2,
        cursor: 'cursor-2',
        node: {
          id: 'node-2',
          message: {text: 'Comment 2'},
          __fragmentOwner: operation.request,
          __fragments: {CommentFragment: {}},
          __id: 'node-2',
        },
      },
    ],
    pageInfo: {
      endCursor: 'cursor-2',
      hasNextPage: true,
      hasPrevPage: null,
      startCursor: 'cursor-1',
    },
  });
  // Commit and fire effects
  ReactTestRenderer.act(() => jest.runAllImmediates());
  expect(subscribeConnection_UNSTABLE).toBeCalledTimes(1);
});

test('it updates when the resolver changes', () => {
  const subscribeConnection_UNSTABLE = jest.spyOn(
    environment.getStore(),
    'subscribeConnection_UNSTABLE',
  );
  let comments;
  function Component(props: PropsWithResolver) {
    const feedback = useFragment(fragment, props.feedback);
    const resolver = props.resolver;
    comments = useConnection(resolver, feedback.comments);
    return feedback?.comments?.count ?? null;
  }
  const queryData: $FlowFixMe = environment.lookup(operation.fragment);
  const renderer = ReactTestRenderer.create(
    <RelayEnvironmentProvider environment={environment}>
      <Component
        feedback={queryData.data.node}
        resolver={ConnectionResolver_UNSTABLE}
      />
    </RelayEnvironmentProvider>,
  );
  ReactTestRenderer.act(() => jest.runAllImmediates());
  const initialComments = comments;

  // update w a different resolver, should re-read
  const countResolver = {
    initialize() {
      return ConnectionResolver_UNSTABLE.initialize();
    },
    reduce(state, event) {
      const nextState = ConnectionResolver_UNSTABLE.reduce(state, event);
      return {
        edges: [nextState.edges[0]],
        pageInfo: nextState.pageInfo,
      };
    },
  };
  renderer.update(
    <RelayEnvironmentProvider environment={environment}>
      <Component feedback={queryData.data.node} resolver={countResolver} />
    </RelayEnvironmentProvider>,
  );
  expect(renderer.toJSON()).toEqual('42');
  expect(comments).toEqual({
    ...initialComments,
    edges: [initialComments?.edges?.[0]],
  });
  // Commit and fire effects
  ReactTestRenderer.act(() => jest.runAllImmediates());
  expect(subscribeConnection_UNSTABLE).toBeCalledTimes(2);
});

test('it updates if the connection changes between render and commit', () => {
  const subscribeConnection_UNSTABLE = jest.spyOn(
    environment.getStore(),
    'subscribeConnection_UNSTABLE',
  );
  let comments;
  function Component(props: Props) {
    const feedback = useFragment(fragment, props.feedback);
    comments = useConnection(ConnectionResolver_UNSTABLE, feedback.comments);
    return comments?.edges?.length ?? null;
  }
  const queryData: $FlowFixMe = environment.lookup(operation.fragment);
  const renderer = ReactTestRenderer.create(
    <RelayEnvironmentProvider environment={environment}>
      <Component feedback={queryData.data.node} />
    </RelayEnvironmentProvider>,
  );
  expect(renderer.toJSON()).toEqual('2');
  expect(comments).toEqual({
    edges: [
      {
        __id: edgeID1,
        cursor: 'cursor-1',
        node: {
          id: 'node-1',
          message: {text: 'Comment 1'},
          __fragmentOwner: operation.request,
          __fragments: {CommentFragment: {}},
          __id: 'node-1',
        },
      },
      {
        __id: edgeID2,
        cursor: 'cursor-2',
        node: {
          id: 'node-2',
          message: {text: 'Comment 2'},
          __fragmentOwner: operation.request,
          __fragments: {CommentFragment: {}},
          __id: 'node-2',
        },
      },
    ],
    pageInfo: {
      endCursor: 'cursor-2',
      hasNextPage: true,
      hasPrevPage: null,
      startCursor: 'cursor-1',
    },
  });
  const initialComments = comments;
  // commit a change *before* the component commits
  environment.commitUpdate(storeProxy => {
    storeProxy.delete(edgeID2);
  });
  ReactTestRenderer.act(() => jest.runAllImmediates());
  expect(renderer.toJSON()).toEqual('1');
  expect(comments).toEqual({
    edges: [initialComments?.edges?.[0]],
    pageInfo: initialComments?.pageInfo,
  });
  // Commit and fire effects
  ReactTestRenderer.act(() => jest.runAllImmediates());
  expect(subscribeConnection_UNSTABLE).toBeCalledTimes(1);
});

test('it updates if the connection changes after commit', () => {
  const subscribeConnection_UNSTABLE = jest.spyOn(
    environment.getStore(),
    'subscribeConnection_UNSTABLE',
  );
  let comments;
  function Component(props: Props) {
    const feedback = useFragment(fragment, props.feedback);
    comments = useConnection(ConnectionResolver_UNSTABLE, feedback.comments);
    return comments?.edges?.length ?? null;
  }
  const queryData: $FlowFixMe = environment.lookup(operation.fragment);
  const renderer = ReactTestRenderer.create(
    <RelayEnvironmentProvider environment={environment}>
      <Component feedback={queryData.data.node} />
    </RelayEnvironmentProvider>,
  );
  expect(renderer.toJSON()).toEqual('2');
  expect(comments).toEqual({
    edges: [
      {
        __id: edgeID1,
        cursor: 'cursor-1',
        node: {
          id: 'node-1',
          message: {text: 'Comment 1'},
          __fragmentOwner: operation.request,
          __fragments: {CommentFragment: {}},
          __id: 'node-1',
        },
      },
      {
        __id: edgeID2,
        cursor: 'cursor-2',
        node: {
          id: 'node-2',
          message: {text: 'Comment 2'},
          __fragmentOwner: operation.request,
          __fragments: {CommentFragment: {}},
          __id: 'node-2',
        },
      },
    ],
    pageInfo: {
      endCursor: 'cursor-2',
      hasNextPage: true,
      hasPrevPage: null,
      startCursor: 'cursor-1',
    },
  });
  const initialComments = comments;
  // Commit and fire effects
  ReactTestRenderer.act(() => jest.runAllImmediates());
  // commit a change *after* the component commits
  ReactTestRenderer.act(() => {
    environment.commitUpdate(storeProxy => {
      storeProxy.delete(edgeID2);
    });
  });
  expect(renderer.toJSON()).toEqual('1');
  expect(comments).toEqual({
    edges: [initialComments?.edges?.[0]],
    pageInfo: initialComments?.pageInfo,
  });
  // Commit and fire effects
  ReactTestRenderer.act(() => jest.runAllImmediates());
  expect(subscribeConnection_UNSTABLE).toBeCalledTimes(1);
});

test('it ignores updates if the connection identity has changed', () => {
  const nextOperation = createOperationDescriptor(query, {id: 'feedback:2'});
  environment.commitPayload(nextOperation, {
    node: {
      __typename: 'Feedback',
      id: 'feedback:2',
      comments: {
        count: 43,
        edges: [
          {
            cursor: 'cursor-3',
            node: {
              __typename: 'Comment',
              id: 'node-3',
              message: {text: 'Comment 3'},
            },
          },
          {
            cursor: 'cursor-4',
            node: {
              __typename: 'Comment',
              id: 'node-4',
              message: {text: 'Comment 4'},
            },
          },
        ],
        pageInfo: {
          endCursor: 'cursor-4',
          hasNextPage: true,
          hasPreviousPage: null,
          startCursor: 'cursor-3',
        },
      },
    },
  });
  const subscribeConnection_UNSTABLE = jest.spyOn(
    environment.getStore(),
    'subscribeConnection_UNSTABLE',
  );
  let comments;
  function Component(props: Props) {
    const feedback = useFragment(fragment, props.feedback);
    comments = useConnection(ConnectionResolver_UNSTABLE, feedback.comments);
    return comments?.edges?.length ?? null;
  }
  const queryData: $FlowFixMe = environment.lookup(operation.fragment);
  const renderer = ReactTestRenderer.create(
    <RelayEnvironmentProvider environment={environment}>
      <Component feedback={queryData.data.node} />
    </RelayEnvironmentProvider>,
  );
  // Commit and fire effects
  ReactTestRenderer.act(() => jest.runAllImmediates());
  const initialComments = comments;

  // Rerender with a different connection
  const nextQueryData: $FlowFixMe = environment.lookup(nextOperation.fragment);
  renderer.update(
    <RelayEnvironmentProvider environment={environment}>
      <Component feedback={nextQueryData.data.node} />
    </RelayEnvironmentProvider>,
  );
  const updatedComments = comments;

  expect(updatedComments).not.toEqual(initialComments);

  // commit a change to the original connection *before* running effects
  // for the re-render; the component should still be subscribed for updates
  // on the original connection but ignore them
  ReactTestRenderer.act(() => {
    environment.commitUpdate(storeProxy => {
      storeProxy.delete(edgeID2);
    });
  });
  expect(comments).toBe(updatedComments);
  expect(subscribeConnection_UNSTABLE).toBeCalledTimes(2);
});
