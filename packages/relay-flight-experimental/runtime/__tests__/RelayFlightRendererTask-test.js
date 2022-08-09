/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall reactflight
 */

'use strict';

import type {RelayFlightRendererTaskTestActorName1Query} from 'RelayFlightRendererTaskTestActorName1Query.graphql';
import type {RelayFlightRendererTaskTestActorNameQuery} from 'RelayFlightRendererTaskTestActorNameQuery.graphql';
import type {RelayFlightRendererTaskTestActorProfilePictureQuery} from 'RelayFlightRendererTaskTestActorProfilePictureQuery.graphql';
import type {RelayFlightRendererTaskTestFragment$fragmentType} from 'RelayFlightRendererTaskTestFragment.graphql';
import type {RelayFlightRendererTaskTestQuery} from 'RelayFlightRendererTaskTestQuery.graphql';

import {
  initialize_INTERNAL_DO_NOT_USE,
  loadQueryForClient,
  useFragment,
  useQuery,
} from 'RelayFlight.server';
import * as RelayFlightOperationMap from 'RelayFlightOperationMap.server';
import RelayFlightRendererTask from 'RelayFlightRendererTask.server';
import RelayFlightServerImpl from 'RelayFlightServerImpl.server';

import * as React from 'react';
import {getFragment, getRequest, graphql} from 'relay-runtime';

initialize_INTERNAL_DO_NOT_USE(RelayFlightServerImpl);

beforeEach(() => {
  RelayFlightOperationMap.clear();
});

test('execute a simple transform function', () => {
  const TransformFunction = (): React$MixedElement => <div>Hello world!</div>;
  const task = new RelayFlightRendererTask(String(0), TransformFunction);
  task.render();
  const output = task.poll();
  expect(output).toMatchInlineSnapshot(`
    Object {
      "kind": "complete",
      "value": Object {
        "gkLogs": Array [],
        "ixPaths": Array [],
        "modules": Array [],
        "queries": Array [],
        "tree": Array [
          Array [
            "J",
            0,
            Array [
              "$",
              "div",
              null,
              Object {
                "children": "Hello world!",
              },
            ],
          ],
        ],
      },
    }
  `);
});

test('render a server component that renders a client component', () => {
  jest.mock('ClientJSResource');
  const ClientJSResource = require('ClientJSResource');
  const getModule = jest.fn();
  const ServerComponent = (): React$MixedElement => {
    const ClientComponent = ClientJSResource(
      'm#RelayFlightTestClientComponent.test',
    );
    return (
      <ClientComponent
        query={loadQueryForClient(
          require('RelayFlightTestClientComponentQuery$Parameters'),
          {id: '4'},
        )}
      />
    );
  };
  const task = new RelayFlightRendererTask(String(0), ServerComponent);
  task.render();
  const output = task.poll();
  expect(getModule).toBeCalledTimes(0);
  expect(output).toMatchInlineSnapshot(`
    Object {
      "kind": "complete",
      "value": Object {
        "gkLogs": Array [],
        "ixPaths": Array [],
        "modules": Array [
          "RelayFlightTestClientComponentQuery.graphql",
          "RelayFlightTestClientComponent.test",
        ],
        "queries": Array [
          Object {
            "id": "3927818313899382",
            "module": Object {
              "__dr": "RelayFlightTestClientComponentQuery.graphql",
            },
            "variables": Object {
              "id": "4",
            },
          },
        ],
        "tree": Array [
          Array [
            "M",
            1,
            Object {
              "__dr": "RelayFlightTestClientComponent.test",
            },
          ],
          Array [
            "J",
            0,
            Array [
              "$",
              "@1",
              null,
              Object {
                "query": Object {
                  "id": "3927818313899382",
                  "variables": Object {
                    "id": "4",
                  },
                },
              },
            ],
          ],
        ],
      },
    }
  `);
});

test('render a server component that renders another server component', () => {
  const Query = getRequest(graphql`
    query RelayFlightRendererTaskTestQuery($id: ID!) {
      node(id: $id) {
        ...RelayFlightRendererTaskTestFragment
      }
    }
  `);

  const Fragment = getFragment(graphql`
    fragment RelayFlightRendererTaskTestFragment on User {
      name
    }
  `);
  function Root() {
    const data = useQuery<RelayFlightRendererTaskTestQuery>(Query, {id: '4'});
    return <Child user={data.node} />;
  }
  function Child(props: {
    user: ?$ReadOnly<{
      $fragmentSpreads: RelayFlightRendererTaskTestFragment$fragmentType,
    }>,
  }) {
    // $FlowFixMe[incompatible-call] discovered when improving types of useFragment
    const data = useFragment(Fragment, props.user);
    return <div>Hello {data?.name}</div>;
  }
  const task = new RelayFlightRendererTask(String(0), Root);
  task.render();
  const transformOutput = task.poll();
  expect(transformOutput.kind).toBe('pending');
  const operationKey = (transformOutput: $FlowFixMe).value[0].operationKey;
  expect(operationKey).toEqual(`${Query.params.id ?? 'null'}{"id":"4"}`);
  RelayFlightOperationMap.setOperationResult(operationKey, {
    node: {__typename: 'User', id: '4', name: 'Alice'},
  });
  const nextOutput = task.poll();
  expect(nextOutput).toMatchInlineSnapshot(`
    Object {
      "kind": "complete",
      "value": Object {
        "gkLogs": Array [],
        "ixPaths": Array [],
        "modules": Array [],
        "queries": Array [],
        "tree": Array [
          Array [
            "J",
            0,
            Array [
              "$",
              "div",
              null,
              Object {
                "children": Array [
                  "Hello ",
                  "Alice",
                ],
              },
            ],
          ],
        ],
      },
    }
  `);
});

test('execute a transform that sends a query and returns transformed results', () => {
  const ActorName = getRequest(graphql`
    query RelayFlightRendererTaskTestActorNameQuery {
      viewer {
        actor {
          name
        }
      }
    }
  `);

  const TransformFunction = () => {
    const data = useQuery<RelayFlightRendererTaskTestActorNameQuery>(
      ActorName,
      {},
    );
    return 'Hello, ' + (data.viewer?.actor?.name ?? '');
  };
  const task = new RelayFlightRendererTask(String(0), TransformFunction);
  task.render();
  const transformOutput = task.poll();
  expect(transformOutput.kind).toBe('pending');
  const operationKey = (transformOutput: $FlowFixMe).value[0].operationKey;
  expect(operationKey).toEqual(`${ActorName.params.id ?? 'null'}{}`);

  // This will re-execute transform with query results
  RelayFlightOperationMap.setOperationResult(operationKey, {
    viewer: {actor: {__typename: 'User', name: 'Alice'}},
  });
  const nextOutput = task.poll();
  expect(nextOutput).toMatchInlineSnapshot(`
    Object {
      "kind": "complete",
      "value": Object {
        "gkLogs": Array [],
        "ixPaths": Array [],
        "modules": Array [],
        "queries": Array [],
        "tree": Array [
          Array [
            "J",
            0,
            "Hello, Alice",
          ],
        ],
      },
    }
  `);
});

test('transform should return an error object for any exceptions', () => {
  const mockedConsole = jest
    .spyOn(console, 'error')
    .mockImplementation(() => {});

  const TransformFunction = () => {
    throw new Error('Uh-oh!');
  };
  const task = new RelayFlightRendererTask(String(0), TransformFunction);
  task.render();
  const output = task.poll();
  expect(JSON.stringify(output)).toContain('complete');

  expect(mockedConsole).toBeCalledWith(expect.any(Error));
});

test('should be able to send and resolve multiple queries', () => {
  const ActorName = getRequest(graphql`
    query RelayFlightRendererTaskTestActorName1Query {
      viewer {
        actor {
          name
        }
      }
    }
  `);
  const ActorProfilePicture = getRequest(graphql`
    query RelayFlightRendererTaskTestActorProfilePictureQuery {
      viewer {
        actor {
          ... on User {
            # eslint-disable-next-line relay/unused-fields
            profile_picture {
              uri
            }
          }
        }
      }
    }
  `);

  const TransformFunction = () => {
    const actorName = useQuery<RelayFlightRendererTaskTestActorName1Query>(
      ActorName,
      {},
    );
    const actorProfilePicture =
      useQuery<RelayFlightRendererTaskTestActorProfilePictureQuery>(
        ActorProfilePicture,
        {},
      );
    return (
      <div>
        {actorName.viewer?.actor?.name}
        {actorProfilePicture.viewer?.actor?.profile_picture?.uri}
      </div>
    );
  };

  const task = new RelayFlightRendererTask(String(0), TransformFunction);
  task.render();
  let nextOutput = task.poll();
  expect(nextOutput.kind).toBe('pending');
  let nextCacheKey = (nextOutput: $FlowFixMe).value[0].operationKey;
  expect(nextCacheKey).toEqual(`${ActorName.params.id ?? 'null'}{}`);
  RelayFlightOperationMap.setOperationResult(nextCacheKey, {
    viewer: {actor: {__typename: 'User', name: 'Alice'}},
  });
  nextOutput = task.poll();

  expect(nextOutput.kind).toBe('pending');
  nextCacheKey = (nextOutput: $FlowFixMe).value[0].operationKey;

  expect(nextCacheKey).toEqual(`${ActorProfilePicture.params.id ?? 'null'}{}`);

  RelayFlightOperationMap.setOperationResult(nextCacheKey, {
    viewer: {
      actor: {
        __typename: 'User',
        profile_picture: {__typename: 'Image', uri: 'http://fburl.com'},
      },
    },
  });
  nextOutput = task.poll();

  expect(nextOutput).toMatchInlineSnapshot(`
    Object {
      "kind": "complete",
      "value": Object {
        "gkLogs": Array [],
        "ixPaths": Array [],
        "modules": Array [],
        "queries": Array [],
        "tree": Array [
          Array [
            "J",
            0,
            Array [
              "$",
              "div",
              null,
              Object {
                "children": Array [
                  "Alice",
                  "http://fburl.com",
                ],
              },
            ],
          ],
        ],
      },
    }
  `);
});
