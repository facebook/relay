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

'use strict';

const RelayMockPayloadGenerator = require('../RelayMockPayloadGenerator');

// $FlowFixMe
const {FIXTURE_TAG, generateAndCompile} = require('../RelayModernTestUtils');
const {parse, print} = require('graphql');
const {getRequest, createOperationDescriptor} = require('relay-runtime');

import type {MockResolvers} from '../RelayMockPayloadGenerator';

function compile(text) {
  return generateAndCompile(text);
}

function testGeneratedData(graphql: string, mockResolvers: ?MockResolvers) {
  const {TestQuery: query} = compile(graphql);
  const operation = createOperationDescriptor(getRequest(query), {});
  const payload = RelayMockPayloadGenerator.generate(operation, mockResolvers);
  expect({
    [FIXTURE_TAG]: true,
    input: print(parse(graphql)),
    output: JSON.stringify(payload, null, 2),
  }).toMatchSnapshot();
}

test('generate mock for simple fragment', () => {
  testGeneratedData(`
    query TestQuery {
      node(id: "my-id") {
        ...TestFragment
      }
    }

    fragment TestFragment on User {
      id
      name
      profile_picture {
        uri
        width
        height
      }
  }`);
});

test('generate mock with inline fragment', () => {
  testGeneratedData(`
    query TestQuery ($condition: Boolean) {
      node(id: "my-id") {
        ...TestFragment
      }
    }

    fragment TestFragment on User {
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
  `);
});

test('generate mock with condition (and other complications)', () => {
  testGeneratedData(`
    query TestQuery (
      $showProfilePicture: Boolean,
      $hideBirthday: Boolean,
      $showBirthdayMonth:  Boolean,
      $hideAuthorUsername: Boolean
    ) {
      node(id: "my-id") {
        ...TestFragment
      }
    }

    fragment TestFragment on User {
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
  `);
});

test('generate mock with connection', () => {
  testGeneratedData(`
    query TestQuery($first: Int, $skipUserInConnection: Boolean) {
      node(id: "my-id") {
        ...TestFragment
      }
    }

    fragment UserFragment on User {
      name
      username
      emailAddresses
    }

    fragment TestFragment on Page {
      actor {
        ... on User {
          id
          myType: __typename
          myName: name
          name
          friends(first: $first)
            @connection(key: "FriendsConnection_friends") {
            edges {
              cursor
              node {
                id
                ...UserFragment
                  @skip(if: $skipUserInConnection)
              }
            }
          }
          ...UserFragment
        }
      }
    }
  `);
});

test('generate basic mock data', () => {
  testGeneratedData(
    `
    query TestQuery {
      node(id: "my-id") {
        ...TestFragment
      }
    }

    fragment TestFragment on User {
      id
      name
      author {
        id
        name
      }
    }
  `,
    null, // Mock Resolvers
  );
});

test('generate mock using custom mock functions', () => {
  testGeneratedData(
    `
    query TestQuery {
      node(id: "my-id") {
        ...TestFragment
      }
    }

    fragment TestFragment on User {
      id
      name
      profile_picture {
        uri
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
  testGeneratedData(
    `
    query TestQuery {
      node(id: "my-id") {
        ...TestFragment
      }
    }

    fragment TestFragment on Page {
      actor {
        id
        name
      }
      backgroundImage {
        width
        uri
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
  testGeneratedData(
    `
    query TestQuery {
      node(id: "my-id") {
        ...TestFragment
      }
    }

    fragment TestFragment on Page {
      actor {
        id
        name
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
  testGeneratedData(
    `
    query TestQuery {
      node(id: "my-id") {
        ...TestFragment
      }
    }

    fragment TestFragment on User {
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
  testGeneratedData(
    `
    query TestQuery {
      viewer {
        ...TestFragment
      }
    }

    fragment TestFragment on Viewer {
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
  testGeneratedData(
    `
    query TestQuery {
      node(id: "my-id") {
        ...TestFragment
      }
    }

    fragment TestFragment on Page {
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
  testGeneratedData(
    `
    query TestQuery {
      viewer {
        ...TestFragment
      }
    }

    fragment TestFragment on Viewer {
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
  `,
  );
});

test('generate mock and verify arguments in the context', () => {
  testGeneratedData(
    `
    query TestQuery($smallScale: Int = 1, $bigScale: Int = 100) {
      node(id: "my-id") {
        ...TestFragment
      }
    }

    fragment TestFragment on User {
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
  testGeneratedData(
    `
    query TestQuery($scale: Int = 1) {
      node(id: "my-id") {
        ...TestFragment @arguments(withName: true)
      }
    }

    fragment TestFragment on User @argumentDefinitions(withName: {type: "Boolean!"}) {
      id
      name @include(if: $withName)
      profile_picture(scale: $scale) {
        uri
        width
        height
      }
  }`,
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
  testGeneratedData(
    `
    query TestQuery {
      nodes {
        ...TestFragment
      }
    }

    fragment TestFragment on Comment @relay(plural: true) {
      id
      body {
        text
      }
  }`,
  );
});

test('generate mock for multiple fragment spreads', () => {
  testGeneratedData(
    `
    query TestQuery {
      node(id: "my-id") {
        ...TestFragment
      }
    }

    fragment ActorUser on Page {
      id
      pageName: name
    }

    fragment UserData on User {
      id
      name
      username
    }

    fragment ProfilePicture on User {
      ...UserData,
      profile_picture {
        uri
      }
    }

    fragment TestFragment on User {
      body {
        text
      }
      actor {
        name
        id
      }
      myActor: actor {
        ...ActorUser
      }
      ...UserData
      ...ProfilePicture
  }`,
  );
});

test('generate mock for with directives and handlers', () => {
  testGeneratedData(
    `
    query TestQuery(
      $first: Int = 10,
      $picturePreset: PhotoSize,
      $RELAY_INCREMENTAL_DELIVERY: Boolean = false
    ) {
      node(id: "my-id") {
        ...TestFragment @arguments(condition: true)
      }
    }

    fragment OneMoreFragmentSpread on User {
      birthdate {
        month
      }
    }

    fragment TestFragment on User @argumentDefinitions(condition: {type: "Boolean!"}) {
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
      ...OneMoreFragmentSpread
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
        }
        ... on Page {
          id
          pageName: name
        }
        ... on Comment @defer(if: $RELAY_INCREMENTAL_DELIVERY, label: "DeferLabel") {
          body {
            text
          }
        }
        username @__clientField(handle: "MyUserName")
      }
    }`,
  );
});

test('should return `null` for selection if that is specified in default values', () => {
  testGeneratedData(
    `
    query TestQuery {
      node(id: "my-id") {
        ...TestFragment
      }
    }

    fragment ActorUser on User {
      id
      name
    }

    fragment UserData on User {
      id
      name
      profile_picture {
        ...ProfilePicture
      }
    }

    fragment ProfilePicture on Image {
      uri
      width
      height
    }

    fragment TestFragment on User {
      body {
        text
      }
      actor {
        name
        id
      }
      myActor: actor {
        ...ActorUser
      }
      ...UserData
  }`,
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
    testGeneratedData(`
      query TestQuery @relay_test_operation {
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
    testGeneratedData(`
      query TestQuery @relay_test_operation {
        node(id: "my-id") {
          ...TestFragment
        }
      }

      fragment TestFragment on User {
        id
        name
        profile_picture {
          uri
          width
          height
        }
    }`);
  });

  test('generate mock with Enums', () => {
    testGeneratedData(`
      query TestQuery @relay_test_operation {
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
      `
      query TestQuery @relay_test_operation {
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
      `
      query TestQuery @relay_test_operation {
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
      `
      query TestQuery @relay_test_operation {
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
    testGeneratedData(
      `
      fragment PageDetails on Page {
        id
        pageName: name
      }

      fragment UserDetails on User {
        id
        userName: name
      }

      query TestQuery @relay_test_operation {
        node(id: "my-id") {
          ...PageDetails
          ...UserDetails
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
      `
      query TestQuery @relay_test_operation {
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
      `
      query TestQuery @relay_test_operation {
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
      `
      query TestQuery @relay_test_operation {
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
      `
      query TestQuery @relay_test_operation {
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
      `
        query TestQuery @relay_test_operation {
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
      `
        query TestQuery @relay_test_operation {
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
      `
      query TestQuery @relay_test_operation {
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
      `
      query TestQuery @relay_test_operation {
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
});
