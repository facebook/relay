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

const RelayMockPayloadGenerator = require('../RelayMockPayloadGenerator');

const {
  getRequest,
  graphql,
  createOperationDescriptor,
} = require('relay-runtime');
const {FIXTURE_TAG} = require('relay-test-utils-internal');

import type {MockResolvers} from '../RelayMockPayloadGenerator';
import type {GraphQLTaggedNode} from 'relay-runtime';

function testGeneratedData(
  query: GraphQLTaggedNode,
  mockResolvers: ?MockResolvers,
): void {
  const request = getRequest(query);
  const operation = createOperationDescriptor(request, {});
  const payload = RelayMockPayloadGenerator.generate(operation, mockResolvers);

  expect({
    [FIXTURE_TAG]: true,
    input: request.params?.text,
    output: JSON.stringify(payload, null, 2),
  }).toMatchSnapshot();
}

test('generate mock for simple fragment', () => {
  graphql`
    fragment RelayMockPayloadGeneratorTestFragment on User {
      id
      name
      profile_picture {
        uri
        width
        height
      }
    }
  `;
  testGeneratedData(graphql`
    query RelayMockPayloadGeneratorTest1Query {
      node(id: "my-id") {
        ...RelayMockPayloadGeneratorTestFragment
      }
    }
  `);
});

test('generate mock with abstract inline fragment', () => {
  graphql`
    fragment RelayMockPayloadGeneratorTest1Fragment on Actor {
      id
      # abstract inline fragment
      ... on Named {
        name
      }
      ... on User {
        firstName
        lastName
      }
      ... on Page {
        websites
      }
    }
  `;
  testGeneratedData(graphql`
    query RelayMockPayloadGeneratorTest2Query {
      viewer {
        actor {
          # abstract fragment spread
          ...RelayMockPayloadGeneratorTest1Fragment
        }
      }
    }
  `);
});

test('generate mock with inline fragment', () => {
  graphql`
    fragment RelayMockPayloadGeneratorTest2Fragment on User {
      id
      name
      author {
        id
        name
      }
      ... on User {
        author {
          authorID: id
          username
        }
      }
      ... on User @include(if: $condition) {
        author {
          myId: id
          myUsername: username
          emailAddresses
          birthdate {
            day
            month
            year
          }
        }
      }
    }
  `;
  testGeneratedData(graphql`
    query RelayMockPayloadGeneratorTest3Query($condition: Boolean!) {
      node(id: "my-id") {
        ...RelayMockPayloadGeneratorTest2Fragment
      }
    }
  `);
});

test('generate mock with condition (and other complications)', () => {
  graphql`
    fragment RelayMockPayloadGeneratorTest3Fragment on User {
      id
      name
      customId: id
      profile_picture @include(if: $showProfilePicture) {
        uri
      }
      birthdate @skip(if: $hideBirthday) {
        year
        month @include(if: $showBirthdayMonth)
      }
      author {
        name
      }
      ... on User @skip(if: $hideAuthorUsername) {
        author {
          authorID: id
          objectType: __typename
          username
        }
      }
      allPhones {
        phoneNumber {
          displayNumber
        }
      }
      emailAddresses @__clientField(handle: "customName")
      backgroundImage @__clientField(handle: "customBackground") {
        uri
      }
    }
  `;
  testGeneratedData(graphql`
    query RelayMockPayloadGeneratorTest4Query(
      $showProfilePicture: Boolean!
      $hideBirthday: Boolean!
      $showBirthdayMonth: Boolean!
      $hideAuthorUsername: Boolean!
    ) {
      node(id: "my-id") {
        ...RelayMockPayloadGeneratorTest3Fragment
      }
    }
  `);
});

test('generate mock with connection', () => {
  graphql`
    fragment RelayMockPayloadGeneratorTest4Fragment on User {
      name
      username
      emailAddresses
    }
  `;
  graphql`
    fragment RelayMockPayloadGeneratorTest5Fragment on Page {
      actor {
        ... on User {
          id
          myType: __typename
          myName: name
          name
          friends(first: $first) @connection(key: "FriendsConnection_friends") {
            edges {
              cursor
              node {
                id
                ...RelayMockPayloadGeneratorTest4Fragment
                  @skip(if: $skipUserInConnection)
              }
            }
          }
          ...RelayMockPayloadGeneratorTest4Fragment
        }
      }
    }
  `;
  testGeneratedData(graphql`
    query RelayMockPayloadGeneratorTest5Query(
      $first: Int
      $skipUserInConnection: Boolean!
    ) {
      node(id: "my-id") {
        ...RelayMockPayloadGeneratorTest5Fragment
      }
    }
  `);
});

test('generate basic mock data', () => {
  graphql`
    fragment RelayMockPayloadGeneratorTest6Fragment on User {
      id
      name
      author {
        id
        name
      }
    }
  `;
  testGeneratedData(
    graphql`
      query RelayMockPayloadGeneratorTest6Query {
        node(id: "my-id") {
          ...RelayMockPayloadGeneratorTest6Fragment
        }
      }
    `,
    null, // Mock Resolvers
  );
});

test('generate mock using custom mock functions', () => {
  graphql`
    fragment RelayMockPayloadGeneratorTest7Fragment on User {
      id
      name
      profile_picture {
        uri
      }
    }
  `;
  testGeneratedData(
    graphql`
      query RelayMockPayloadGeneratorTest7Query {
        node(id: "my-id") {
          ...RelayMockPayloadGeneratorTest7Fragment
        }
      }
    `,
    {
      ID(context, generateId) {
        return `my-id-${String(generateId() + 1000)}`;
      },
      String({name}) {
        if (name === 'uri') {
          return 'http://my-uri';
        }
      },
    },
  );
});

test('generate mock using custom mock functions for object type', () => {
  graphql`
    fragment RelayMockPayloadGeneratorTest8Fragment on Page {
      actor {
        id
        name
      }
      backgroundImage {
        width
        uri
      }
    }
  `;
  testGeneratedData(
    graphql`
      query RelayMockPayloadGeneratorTest8Query {
        node(id: "my-id") {
          ...RelayMockPayloadGeneratorTest8Fragment
        }
      }
    `,
    {
      Image: () => {
        return {
          width: 200,
          height: 100,
          uri: 'http://my-image',
        };
      },
    },
  );
});

test('generate mock for objects without concrete type', () => {
  graphql`
    fragment RelayMockPayloadGeneratorTest9Fragment on Page {
      actor {
        id
        name
      }
    }
  `;
  testGeneratedData(
    graphql`
      query RelayMockPayloadGeneratorTest9Query {
        node(id: "my-id") {
          ...RelayMockPayloadGeneratorTest9Fragment
        }
      }
    `,
    {
      Actor: () => {
        return {
          __typename: 'User',
          name: 'Mark',
        };
      },
    },
  );
});

test('generate mock using custom mock functions for object type (multiple object)', () => {
  graphql`
    fragment RelayMockPayloadGeneratorTest10Fragment on User {
      name
      actor {
        ... on User {
          id
          name
          profile_picture {
            uri
            height
          }
        }
      }
      profile_picture {
        uri
      }
    }
  `;
  testGeneratedData(
    graphql`
      query RelayMockPayloadGeneratorTest10Query {
        node(id: "my-id") {
          ...RelayMockPayloadGeneratorTest10Fragment
        }
      }
    `,
    {
      User: () => {
        return {
          name: 'My user name',
        };
      },
      Image: (...args) => {
        return {
          width: 200,
          height: 100,
          uri: 'http://my-image',
        };
      },
    },
  );
});

test('check context in the mock resolver', () => {
  let checkContext;
  graphql`
    fragment RelayMockPayloadGeneratorTest11Fragment on Viewer {
      actor {
        ... on User {
          id
          name
          profile_picture {
            uri
            height
          }
        }
      }
    }
  `;
  testGeneratedData(
    graphql`
      query RelayMockPayloadGeneratorTest11Query {
        viewer {
          ...RelayMockPayloadGeneratorTest11Fragment
        }
      }
    `,
    {
      Image: context => {
        checkContext = context;
        return {
          width: 200,
          height: 100,
          uri: 'http://my-image',
        };
      },
    },
  );
  expect(checkContext).toMatchInlineSnapshot(`
    Object {
      "alias": null,
      "args": Object {},
      "name": "profile_picture",
      "parentType": null,
      "path": Array [
        "viewer",
        "actor",
        "profile_picture",
      ],
    }
  `);
});

test('generate mock with manual mock for objects', () => {
  graphql`
    fragment RelayMockPayloadGeneratorTest12Fragment on Page {
      id
      name
      body {
        text
      }
      myTown: hometown {
        id
        name
        url
        feedback {
          comments(first: 10) {
            edges {
              cursor
              comment: node {
                id
                message {
                  text
                }
                likeSentence {
                  text
                }
              }
            }
            pageInfo {
              startCursor
            }
          }
        }
      }
    }
  `;
  testGeneratedData(
    graphql`
      query RelayMockPayloadGeneratorTest12Query {
        node(id: "my-id") {
          ...RelayMockPayloadGeneratorTest12Fragment
        }
      }
    `,
    {
      Page: (context, generateId) => {
        return {
          id: `page-id-${generateId()}`,
          name: context.name === 'hometown' ? 'My Hometown' : 'My Page',
          body: {
            text: 'My Text',
          },
          url: `http://${
            Array.isArray(context.path) ? context.path.join('-') : ''
          }`,
        };
      },
      Comment: context => {
        return {
          message: {
            text: `Comment text: ${
              Array.isArray(context.path) ? context.path.join('>') : ''
            }`,
          },
        };
      },
    },
  );
});

test('generate mock with multiple spreads', () => {
  graphql`
    fragment RelayMockPayloadGeneratorTest13Fragment on Viewer {
      actor {
        ... on User {
          id
          name
          traits
          profile_picture {
            uri
            height
          }
        }
        ... on Page {
          id
          name
          websites
        }
      }
    }
  `;
  testGeneratedData(graphql`
    query RelayMockPayloadGeneratorTest13Query {
      viewer {
        ...RelayMockPayloadGeneratorTest13Fragment
      }
    }
  `);
});

test('generate mock and verify arguments in the context', () => {
  graphql`
    fragment RelayMockPayloadGeneratorTest14Fragment on User {
      ... on User {
        id
        name
        smallImage: profile_picture(scale: $smallScale) {
          uri
        }
        bigImage: profile_picture(scale: $bigScale) {
          uri
        }
      }
    }
  `;
  testGeneratedData(
    graphql`
      query RelayMockPayloadGeneratorTest14Query(
        $smallScale: Float = 1
        $bigScale: Float = 100
      ) {
        node(id: "my-id") {
          ...RelayMockPayloadGeneratorTest14Fragment
        }
      }
    `,
    {
      Image: context => {
        if (context?.args?.scale === 100) {
          return {
            uri: 'big image',
          };
        } else if (context?.args?.scale === 1) {
          return {
            uri: 'small image',
          };
        }
      },
    },
  );
});

test('generate mock for fragment with @argumentsDefinition', () => {
  graphql`
    fragment RelayMockPayloadGeneratorTest15Fragment on User
      @argumentDefinitions(withName: {type: "Boolean!"}) {
      id
      name @include(if: $withName)
      profile_picture(scale: $scale) {
        uri
        width
        height
      }
    }
  `;
  testGeneratedData(
    graphql`
      query RelayMockPayloadGeneratorTest15Query($scale: Float = 1.0) {
        node(id: "my-id") {
          ...RelayMockPayloadGeneratorTest15Fragment @arguments(withName: true)
        }
      }
    `,
    {
      Image() {
        return {
          width: 42,
          height: 42,
        };
      },
    },
  );
});

test('generate mock for plural fragment', () => {
  graphql`
    fragment RelayMockPayloadGeneratorTest16Fragment on Comment
      @relay(plural: true) {
      id
      body {
        text
      }
    }
  `;
  testGeneratedData(graphql`
    query RelayMockPayloadGeneratorTest16Query {
      nodes {
        ...RelayMockPayloadGeneratorTest16Fragment
      }
    }
  `);
});

test('generate mock for multiple fragment spreads', () => {
  graphql`
    fragment RelayMockPayloadGeneratorTest17Fragment on Page {
      id
      pageName: name
    }
  `;
  graphql`
    fragment RelayMockPayloadGeneratorTest18Fragment on User {
      id
      name
      username
    }
  `;
  graphql`
    fragment RelayMockPayloadGeneratorTest19Fragment on User {
      ...RelayMockPayloadGeneratorTest18Fragment
      profile_picture {
        uri
      }
    }
  `;
  graphql`
    fragment RelayMockPayloadGeneratorTest20Fragment on User {
      body {
        text
      }
      actor {
        name
        id
      }
      myActor: actor {
        ...RelayMockPayloadGeneratorTest17Fragment
      }
      ...RelayMockPayloadGeneratorTest18Fragment
      ...RelayMockPayloadGeneratorTest19Fragment
    }
  `;
  testGeneratedData(graphql`
    query RelayMockPayloadGeneratorTest17Query {
      node(id: "my-id") {
        ...RelayMockPayloadGeneratorTest20Fragment
      }
    }
  `);
});

test('generate mock for with directives and handlers', () => {
  graphql`
    fragment RelayMockPayloadGeneratorTest21Fragment on User {
      birthdate {
        month
      }
    }
  `;
  graphql`
    fragment RelayMockPayloadGeneratorTest22Fragment on User
      @argumentDefinitions(condition: {type: "Boolean!"}) {
      id
      name
      myActor: actor {
        id
        name
      }
      customName: name
      friends(first: $first) @connection(key: "User_friends") {
        edges {
          node {
            id
            name
          }
        }
        myPageInfo: pageInfo {
          endCursor
          hasNextPage
        }
      }
      profile_picture {
        uri
      }
      profilePicture(preset: $picturePreset) @include(if: $condition) {
        uri
      }
      ...RelayMockPayloadGeneratorTest21Fragment
      actor {
        ... on User {
          id
          userName: name
          name: username
          profilePicture(size: 1) {
            uri
            width
            height
          }
          feedback {
            comments {
              edges {
                node {
                  ...RelayMockPayloadGeneratorTest23Fragment
                    @defer(if: $RELAY_INCREMENTAL_DELIVERY, label: "DeferLabel")
                }
              }
            }
          }
        }
        ... on Page {
          id
          pageName: name
        }
        username @__clientField(handle: "MyUserName")
      }
    }
  `;
  graphql`
    fragment RelayMockPayloadGeneratorTest23Fragment on Comment {
      body {
        text
      }
    }
  `;
  testGeneratedData(graphql`
    query RelayMockPayloadGeneratorTest18Query(
      $first: Int = 10
      $picturePreset: PhotoSize
      $RELAY_INCREMENTAL_DELIVERY: Boolean = false
    ) {
      node(id: "my-id") {
        ...RelayMockPayloadGeneratorTest22Fragment @arguments(condition: true)
      }
    }
  `);
});

test('should return `null` for selection if that is specified in default values', () => {
  graphql`
    fragment RelayMockPayloadGeneratorTest24Fragment on User {
      id
      name
    }
  `;
  graphql`
    fragment RelayMockPayloadGeneratorTest25Fragment on User {
      id
      name
      profile_picture {
        ...RelayMockPayloadGeneratorTest26Fragment
      }
    }
  `;
  graphql`
    fragment RelayMockPayloadGeneratorTest26Fragment on Image {
      uri
      width
      height
    }
  `;
  graphql`
    fragment RelayMockPayloadGeneratorTest27Fragment on User {
      body {
        text
      }
      actor {
        name
        id
      }
      myActor: actor {
        ...RelayMockPayloadGeneratorTest24Fragment
      }
      ...RelayMockPayloadGeneratorTest25Fragment
    }
  `;
  testGeneratedData(
    graphql`
      query RelayMockPayloadGeneratorTest19Query {
        node(id: "my-id") {
          ...RelayMockPayloadGeneratorTest27Fragment
        }
      }
    `,
    {
      User() {
        return {
          actor: null,
        };
      },
    },
  );
});

describe('with @relay_test_operation', () => {
  test('generate mock for simple query', () => {
    testGeneratedData(graphql`
      query RelayMockPayloadGeneratorTest20Query @relay_test_operation {
        me {
          id
          name
          emailAddresses
          profile_picture(scale: 1) {
            uri
            width
            height
          }
        }
      }
    `);
  });

  test('generate mock for simple fragment', () => {
    graphql`
      fragment RelayMockPayloadGeneratorTest28Fragment on User {
        id
        name
        profile_picture {
          uri
          width
          height
        }
      }
    `;
    testGeneratedData(graphql`
      query RelayMockPayloadGeneratorTest21Query @relay_test_operation {
        node(id: "my-id") {
          ...RelayMockPayloadGeneratorTest28Fragment
        }
      }
    `);
  });

  test('generate mock with Enums', () => {
    testGeneratedData(graphql`
      query RelayMockPayloadGeneratorTest22Query @relay_test_operation {
        node(id: "my-id") {
          ... on User {
            id
            name
            environment
          }
        }
      }
    `);
  });

  test('generate mock with Mock Resolvers for Concrete Type', () => {
    testGeneratedData(
      graphql`
        query RelayMockPayloadGeneratorTest23Query @relay_test_operation {
          node(id: "my-id") {
            ... on User {
              id
              name
            }
          }
        }
      `,
      {
        User() {
          return {
            id: 'my-id',
            name: 'my-name',
          };
        },
      },
    );
  });

  test('generate mock with Mock Resolvers for Interface Type', () => {
    testGeneratedData(
      graphql`
        query RelayMockPayloadGeneratorTest24Query @relay_test_operation {
          node(id: "my-id") {
            ... on User {
              id
              name
            }
          }
        }
      `,
      {
        Node() {
          return {
            id: 'my-id',
            name: 'my-name',
          };
        },
      },
    );
  });

  test('generate mock with Mock Resolvers for Interface Type with multiple fragment spreads', () => {
    testGeneratedData(
      graphql`
        query RelayMockPayloadGeneratorTest25Query @relay_test_operation {
          node(id: "my-id") {
            ... on User {
              id
              name
            }
            ... on Page {
              id
              pageName: name
            }
          }
        }
      `,
      {
        Node() {
          return {
            __typename: 'Page',
            id: 'my-page-id',
            name: 'my-page-name',
          };
        },
      },
    );
  });

  test('generate mock with Mock Resolvers for Interface Type with multiple fragments', () => {
    graphql`
      fragment RelayMockPayloadGeneratorTest29Fragment on Page {
        id
        pageName: name
      }
    `;

    graphql`
      fragment RelayMockPayloadGeneratorTest30Fragment on User {
        id
        userName: name
      }
    `;
    testGeneratedData(
      graphql`
        query RelayMockPayloadGeneratorTest26Query @relay_test_operation {
          node(id: "my-id") {
            ...RelayMockPayloadGeneratorTest29Fragment
            ...RelayMockPayloadGeneratorTest30Fragment
          }
        }
      `,
      {
        Node() {
          return {
            __typename: 'Page',
            id: 'my-page-id',
            name: 'my-page-name',
          };
        },
      },
    );
  });

  test('generate mock with Mock Resolvers for Interface Type with Concrete Type mock resolver', () => {
    testGeneratedData(
      graphql`
        query RelayMockPayloadGeneratorTest27Query @relay_test_operation {
          node(id: "my-id") {
            ... on User {
              id
              name
            }
          }
        }
      `,
      {
        User() {
          return {
            id: 'my-user-id',
            name: 'my-user-name',
          };
        },
      },
    );
  });

  test('generate mock with Mock Resolvers for Scalar field as null', () => {
    testGeneratedData(
      graphql`
        query RelayMockPayloadGeneratorTest28Query @relay_test_operation {
          node(id: "my-id") {
            ... on User {
              id
              name
            }
          }
        }
      `,
      {
        User() {
          return {
            id: 'my-user-id',
            name: null,
          };
        },
      },
    );
  });

  test('generate mock with multiple items in arrays for scalar field', () => {
    testGeneratedData(
      graphql`
        query RelayMockPayloadGeneratorTest29Query @relay_test_operation {
          node(id: "my-id") {
            ... on User {
              id
              emailAddresses
            }
          }
        }
      `,
      {
        User(_, generateId) {
          return {
            emailAddresses: Array(5)
              .fill(null)
              .map((__, idx) => `mock_email-${idx}-${generateId()}@fb.com`),
          };
        },
      },
    );
  });

  test('generate mock with empty array for scalar field ', () => {
    testGeneratedData(
      graphql`
        query RelayMockPayloadGeneratorTest30Query @relay_test_operation {
          node(id: "my-id") {
            ... on User {
              id
              emailAddresses
            }
          }
        }
      `,
      {
        User(_, generateId) {
          return {
            emailAddresses: [],
          };
        },
      },
    );
  });

  test('generate mock with multiple items in arrays for linked field with default data', () => {
    testGeneratedData(
      graphql`
        query RelayMockPayloadGeneratorTest31Query @relay_test_operation {
          node(id: "my-id") {
            ... on User {
              id
              friends {
                edges {
                  node {
                    id
                    name
                    profile_picture {
                      uri
                      width
                      height
                    }
                  }
                }
              }
            }
          }
        }
      `,
      {
        FriendsConnection(_, generateId) {
          return {
            edges: Array(5).fill(),
          };
        },
      },
    );
  });

  test('generate mock with multiple items in arrays including null', () => {
    testGeneratedData(
      graphql`
        query RelayMockPayloadGeneratorTest32Query @relay_test_operation {
          node(id: "my-id") {
            ... on User {
              id
              friends {
                edges {
                  node {
                    id
                    name
                    profile_picture {
                      uri
                      width
                      height
                    }
                  }
                }
              }
            }
          }
        }
      `,
      {
        FriendsConnection(_, generateId) {
          return {
            edges: [null, undefined],
          };
        },
      },
    );
  });

  test('generate mock with multiple items in arrays for linked field with custom data', () => {
    testGeneratedData(
      graphql`
        query RelayMockPayloadGeneratorTest33Query @relay_test_operation {
          node(id: "my-id") {
            ... on User {
              id
              friends {
                edges {
                  node {
                    id
                    name
                    profile_picture {
                      uri
                      width
                      height
                    }
                  }
                }
              }
            }
          }
        }
      `,
      {
        FriendsConnection(_, generateId) {
          return {
            edges: [
              {
                node: {
                  id: `friend-id-${generateId()}`,
                  name: 'Alice',
                },
              },
              {
                node: {
                  id: `friend-id-${generateId()}`,
                  name: 'Bob',
                },
              },
            ],
          };
        },
      },
    );
  });

  test('generate mock with multiple items in arrays for linked field with custom data and additional mock resolver', () => {
    testGeneratedData(
      graphql`
        query RelayMockPayloadGeneratorTest34Query @relay_test_operation {
          node(id: "my-id") {
            ... on User {
              id
              friends {
                edges {
                  node {
                    id
                    name
                    profile_picture {
                      uri
                      width
                      height
                    }
                  }
                }
              }
            }
          }
        }
      `,
      {
        Image(_, generateId) {
          return {
            uri: `/image-url-${generateId()}.jpg`,
          };
        },
        FriendsConnection() {
          return {
            edges: [
              undefined,
              {
                node: {
                  name: 'Bob with Image',
                },
              },
            ],
          };
        },
      },
    );
  });

  test('generate mock data with mock resolver for ID that may return `undefined`', () => {
    testGeneratedData(
      graphql`
        query RelayMockPayloadGeneratorTest35Query @relay_test_operation {
          node(id: "my-id") {
            ... on User {
              id
              friends {
                edges {
                  node {
                    id
                    name
                  }
                }
              }
            }
          }
        }
      `,
      {
        ID(context) {
          if (context.path?.join('.') === 'node.id') {
            return 'this-is-my-id';
          }
        },
        FriendsConnection() {
          return {
            // IDs for those edges should be generated by default mock
            // resolver for ID type
            edges: Array(2).fill(),
          };
        },
      },
    );
  });

  test('generate mock with default value for object in plural field', () => {
    testGeneratedData(
      graphql`
        query RelayMockPayloadGeneratorTest36Query @relay_test_operation {
          node(id: "my-id") {
            ... on User {
              id
              friends {
                edges {
                  node {
                    id
                    name
                  }
                }
              }
            }
          }
        }
      `,
      {
        FriendsEdge() {
          return {
            node: {
              name: 'Alice',
            },
          };
        },
      },
    );
  });

  test('generate mock with default value for plural field and its object', () => {
    testGeneratedData(
      graphql`
        query RelayMockPayloadGeneratorTest37Query @relay_test_operation {
          node(id: "my-id") {
            ... on User {
              id
              friends {
                edges {
                  node {
                    id
                    name
                  }
                }
              }
            }
          }
        }
      `,
      {
        FriendsConnection() {
          return {
            edges: Array(5).fill(),
          };
        },
        FriendsEdge() {
          return {
            node: {
              name: 'Alice',
            },
          };
        },
      },
    );
  });

  test('generate mock with default value for scalar plural field', () => {
    testGeneratedData(
      graphql`
        query RelayMockPayloadGeneratorTest38Query @relay_test_operation {
          node(id: "my-id") {
            ... on User {
              id
              emailAddresses
            }
          }
        }
      `,
      {
        User(context) {
          return {
            emailAddresses: 'my@email.com',
          };
        },
      },
    );
  });

  test('generate mock for enum with different case should be OK', () => {
    testGeneratedData(
      graphql`
        query RelayMockPayloadGeneratorTest39Query @relay_test_operation {
          node(id: "my-id") {
            ... on User {
              id
              environment
            }
          }
        }
      `,
      {
        User(context) {
          return {
            environment: 'Web',
          };
        },
      },
    );
  });

  test('generate mock for enum in arrays', () => {
    testGeneratedData(
      graphql`
        query RelayMockPayloadGeneratorTest40Query @relay_test_operation {
          node(id: "my-id") {
            ... on User {
              id
              traits
            }
          }
        }
      `,
      {
        User(context) {
          return {
            traits: ['CHEERFUL', 'DERISIVE'],
          };
        },
      },
    );
  });

  test('generate mock with invalid value for enum', () => {
    expect(() => {
      testGeneratedData(
        graphql`
          query RelayMockPayloadGeneratorTest41Query @relay_test_operation {
            node(id: "my-id") {
              ... on User {
                id
                environment
              }
            }
          }
        `,
        {
          User(context) {
            return {
              environment: 'INVALID_VALUE',
            };
          },
        },
      );
    }).toThrow(
      'RelayMockPayloadGenerator: Invalid value "INVALID_VALUE" provided for enum field',
    );
  });

  test('generate mock with null for enum', () => {
    testGeneratedData(
      graphql`
        query RelayMockPayloadGeneratorTest42Query @relay_test_operation {
          node(id: "my-id") {
            ... on User {
              id
              environment
            }
          }
        }
      `,
      {
        User(context) {
          return {
            environment: null,
          };
        },
      },
    );
  });

  test('generate mock for client extensions', () => {
    testGeneratedData(
      graphql`
        query RelayMockPayloadGeneratorTest43Query @relay_test_operation {
          node(id: "my-id") {
            ... on User {
              id
              client_name
              client_code
            }
          }
        }
      `,
    );
  });

  test('should generate data for @module', () => {
    graphql`
      fragment RelayMockPayloadGeneratorTestNameRendererFragment on User {
        id
        nameRenderer {
          ...RelayMockPayloadGeneratorTestMarkdownUserNameRenderer_name
            @module(name: "MarkdownUserNameRenderer.react")
        }
      }
    `;
    graphql`
      fragment RelayMockPayloadGeneratorTestMarkdownUserNameRenderer_name on MarkdownUserNameRenderer {
        markdown
        data {
          markup
        }
      }
    `;
    testGeneratedData(
      graphql`
        query RelayMockPayloadGeneratorTest44Query @relay_test_operation {
          node(id: "my-id") {
            ...RelayMockPayloadGeneratorTestNameRendererFragment
          }
        }
      `,
      {
        UserNameRenderer() {
          return {
            __typename: 'MarkdownUserNameRenderer',
            __module_operation: require('./__generated__/RelayMockPayloadGeneratorTestMarkdownUserNameRenderer_name$normalization.graphql'),
          };
        },
      },
    );
  });

  test('should generate data for @match with MarkdownUserNameRenderer_name', () => {
    graphql`
      fragment RelayMockPayloadGeneratorTest31Fragment on User {
        id
        nameRenderer @match {
          ...RelayMockPayloadGeneratorTest1PlainUserNameRenderer_name
            @module(name: "PlainUserNameRenderer.react")
          ...RelayMockPayloadGeneratorTest1MarkdownUserNameRenderer_name
            @module(name: "MarkdownUserNameRenderer.react")
        }
      }
    `;
    graphql`
      fragment RelayMockPayloadGeneratorTest1PlainUserNameRenderer_name on PlainUserNameRenderer {
        plaintext
        data {
          text
        }
      }
    `;
    graphql`
      fragment RelayMockPayloadGeneratorTest1MarkdownUserNameRenderer_name on MarkdownUserNameRenderer {
        markdown
        data {
          markup
        }
      }
    `;
    testGeneratedData(
      graphql`
        query RelayMockPayloadGeneratorTest45Query @relay_test_operation {
          node(id: "my-id") {
            ...RelayMockPayloadGeneratorTest31Fragment
          }
        }
      `,
      {
        UserNameRenderer() {
          return {
            __typename: 'MarkdownUserNameRenderer',
            __module_operation: require('./__generated__/RelayMockPayloadGeneratorTest1MarkdownUserNameRenderer_name$normalization.graphql'),
          };
        },
      },
    );
  });

  test('should generate data for @match with PlainUserNameRenderer_name', () => {
    graphql`
      fragment RelayMockPayloadGeneratorTest32Fragment on User {
        id
        nameRenderer @match {
          ...RelayMockPayloadGeneratorTest3PlainUserNameRenderer_name
            @module(name: "PlainUserNameRenderer.react")
          ...RelayMockPayloadGeneratorTest3MarkdownUserNameRenderer_name
            @module(name: "MarkdownUserNameRenderer.react")
        }
      }
    `;
    graphql`
      fragment RelayMockPayloadGeneratorTest3PlainUserNameRenderer_name on PlainUserNameRenderer {
        plaintext
        data {
          text
        }
      }
    `;
    graphql`
      fragment RelayMockPayloadGeneratorTest3MarkdownUserNameRenderer_name on MarkdownUserNameRenderer {
        markdown
        data {
          markup
        }
      }
    `;
    testGeneratedData(
      graphql`
        query RelayMockPayloadGeneratorTest46Query @relay_test_operation {
          node(id: "my-id") {
            ...RelayMockPayloadGeneratorTest32Fragment
          }
        }
      `,
      {
        UserNameRenderer() {
          return {
            __typename: 'PlainUserNameRenderer',
            __module_operation: require('./__generated__/RelayMockPayloadGeneratorTest3PlainUserNameRenderer_name$normalization.graphql'),
          };
        },
      },
    );
  });

  test('should throw if invalid default value provide for __module_operation.', () => {
    graphql`
      fragment RelayMockPayloadGeneratorTest33Fragment on User {
        id
        nameRenderer {
          ...RelayMockPayloadGeneratorTest4MarkdownUserNameRenderer_name
            @module(name: "MarkdownUserNameRenderer.react")
        }
      }
    `;
    graphql`
      fragment RelayMockPayloadGeneratorTest4MarkdownUserNameRenderer_name on MarkdownUserNameRenderer {
        markdown
        data {
          markup
        }
      }
    `;
    expect(() => {
      testGeneratedData(
        graphql`
          query RelayMockPayloadGeneratorTest47Query @relay_test_operation {
            node(id: "my-id") {
              ...RelayMockPayloadGeneratorTest33Fragment
            }
          }
        `,
        {
          UserNameRenderer() {
            return {
              __typename: 'MarkdownUserNameRenderer',
              __module_operation: {
                kind: 'InvalidObject',
              },
            };
          },
        },
      );
    }).toThrowErrorMatchingSnapshot();
  });

  test('should generate data for @module with `null` in mock resolvers', () => {
    graphql`
      fragment RelayMockPayloadGeneratorTest34Fragment on User {
        id
        nameRenderer {
          ...RelayMockPayloadGeneratorTest5MarkdownUserNameRenderer_name
            @module(name: "MarkdownUserNameRenderer.react")
        }
      }
    `;
    graphql`
      fragment RelayMockPayloadGeneratorTest5MarkdownUserNameRenderer_name on MarkdownUserNameRenderer {
        markdown
        data {
          markup
        }
      }
    `;
    testGeneratedData(
      graphql`
        query RelayMockPayloadGeneratorTest48Query @relay_test_operation {
          node(id: "my-id") {
            ...RelayMockPayloadGeneratorTest34Fragment
          }
        }
      `,
      {
        UserNameRenderer() {
          return null;
        },
      },
    );
  });
});
