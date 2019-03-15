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
const RelayTestSchema = require('../RelayTestSchema');

// $FlowFixMe
const {FIXTURE_TAG, generateAndCompile} = require('../RelayModernTestUtils');
const {parse, print} = require('graphql');

import type {MockResolvers} from '../RelayMockPayloadGenerator';

function compile(text) {
  return generateAndCompile(text);
}

function printMockResolvers(mockResolvers: ?MockResolvers): string {
  if (mockResolvers == null) {
    return '';
  }
  const output = ['\nResolvers:'];
  for (const key in mockResolvers) {
    if (mockResolvers.hasOwnProperty(key)) {
      output.push(`\tType: ${key}`);
      const resolverOutput = mockResolvers[key](
        {
          parentType: key,
          name: null,
          alias: null,
          path: [],
          args: null,
        },
        () => 1,
      );
      // $FlowFixMe(>=0.95.0) JSON.stringify can return undefined
      output.push(`Output: ${JSON.stringify(resolverOutput, null, 2)}`);
    }
  }
  return output.join('\n');
}

function testGeneratedData(
  graphql: string,
  mockResolvers: ?MockResolvers,
  customVariables = null,
  schema = RelayTestSchema,
) {
  const {TestFragment: fragment} = compile(graphql);
  const variables = {
    ...RelayMockPayloadGenerator.generateVariables(fragment, mockResolvers),
    ...customVariables,
  };

  const payload = RelayMockPayloadGenerator.generateData(
    fragment,
    mockResolvers,
    variables,
    schema,
  );

  expect({
    [FIXTURE_TAG]: true,
    input: print(parse(graphql)) + printMockResolvers(mockResolvers),
    output: JSON.stringify(
      {
        variables,
        payload,
      },
      null,
      2,
    ),
  }).toMatchSnapshot();
}

test('generate mock for simple fragment', () => {
  testGeneratedData(`
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

test('generate mock for simple fragment without schema', () => {
  testGeneratedData(
    `
    fragment TestFragment on User {
      id
      name
      ...MyOtherFragment
  }`,
    null, // Mock Resolvers
    null, // Variables
    null, // Schema
  );
});

test('generate mock with inline fragment', () => {
  testGeneratedData(`
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

test('generate mock without schema', () => {
  testGeneratedData(
    `
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
    null, // Variables
    null, // Schema
  );
});

test('generate mock using custom mock functions', () => {
  testGeneratedData(
    `
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
    fragment TestFragment on Page {
      actor {
        id
        name
      }
    }
  `,
    {
      [RelayMockPayloadGenerator.DEFAULT_MOCK_TYPENAME]: () => {
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
  "args": null,
  "name": null,
  "parentType": "Image",
  "path": Array [],
}
`);
});

test('generate mock with manual mock for objects', () => {
  testGeneratedData(
    `
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
    {
      smallScale: 1,
      bigScale: 100,
    },
    null,
  );
});

test('generate mock for fragment with @argumentsDefinition', () => {
  testGeneratedData(`
    fragment TestFragment on User @argumentDefinitions(withName: {type: "Boolean!"}) {
      id
      name @include(if: $withName)
      profile_picture(scale: $scale) {
        uri
        width
        height
      }
  }`);
});

test('generate mock for plural fragment', () => {
  testGeneratedData(
    `
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
    fragment TestFragment on User {
      body {
        text
      }
      actor {
        name
        ...PageInfo
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
            ...CustomUserFragment_data
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
        ... on Comment @defer {
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
    fragment TestFragment on User {
      body {
        text
      }
      actor {
        name
        ...PageInfo
        id
      }
      myActor: actor {
        ...ActorUser
      }
      ...UserData
      ...ProfilePicture
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
