/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @emails oncall+relay
 */

// flowlint ambiguous-object-type:error

'use strict';

const validateMutation = require('../validateMutation');
const {RelayFeatureFlags, getRequest, graphql} = require('relay-runtime');

jest.mock('warning', () => {
  return (dontWarn, message, ...args) => {
    if (dontWarn) {
      return;
    }
    throw new Error(`${message} ${args.join(' ')}`);
  };
});

graphql`
  fragment validateMutationTestGroovyFragment_groovygroovy on Feedback {
    doesViewerLike
  }
`;

describe('validateOptimisticResponse', () => {
  [
    {
      name: 'Does not log a warning in the positive case',
      mutation: getRequest(graphql`
        mutation validateMutationTest1ChangeNameMutation(
          $input: ActorNameChangeInput!
        ) {
          actorNameChange(input: $input) {
            actor {
              name
            }
          }
        }
      `),
      optimisticResponse: {
        actorNameChange: {
          actor: {
            __typename: 'User',
            id: 0,
            name: 'B-dizzle',
          },
        },
      },
      variables: null,
      shouldWarn: false,
    },
    {
      name: 'Logs a warning when a field is is not specified',
      mutation: getRequest(graphql`
        mutation validateMutationTest2ChangeNameMutation(
          $input: ActorNameChangeInput!
        ) {
          actorNameChange(input: $input) {
            actor {
              name
            }
          }
        }
      `),
      optimisticResponse: {
        actorNameChange: {
          actor: {},
        },
      },
      variables: null,
      shouldWarn: true,
    },
    {
      name: 'Logs a warning when an id is is not specified',
      mutation: getRequest(graphql`
        mutation validateMutationTest3ChangeNameMutation(
          $input: ActorNameChangeInput!
        ) {
          actorNameChange(input: $input) {
            actor {
              name
            }
          }
        }
      `),
      optimisticResponse: {
        actorNameChange: {
          actor: {
            __typename: 'User',
            name: 'Zuck',
          },
        },
      },
      variables: null,
      shouldWarn: true,
    },
    {
      name: 'Logs a warning when a object is is not specified',
      mutation: getRequest(graphql`
        mutation validateMutationTest4ChangeNameMutation(
          $input: ActorNameChangeInput!
        ) {
          actorNameChange(input: $input) {
            actor {
              name
            }
          }
        }
      `),
      optimisticResponse: {
        actorNameChange: {},
      },
      variables: null,
      shouldWarn: true,
    },
    {
      name: 'Uses type names to filter inline fragment warnings',
      mutation: getRequest(graphql`
        mutation validateMutationTest5ChangeNameBirthdayMutation(
          $input: ActorNameChangeInput!
        ) {
          actorNameChange(input: $input) {
            actor {
              ... on User {
                birthdate {
                  day
                  month
                  year
                }
              }
              ... on Page {
                username
              }
            }
          }
        }
      `),
      optimisticResponse: {
        actorNameChange: {
          actor: {
            __typename: 'Page',
            id: '3',
            username: 'Zuck',
          },
        },
      },
      variables: null,
      shouldWarn: false,
    },
    {
      name: 'Logs a warning for errors contained in inline fragments',
      mutation: getRequest(graphql`
        mutation validateMutationTest6ChangeNameBirthdayMutation(
          $input: ActorNameChangeInput!
        ) {
          actorNameChange(input: $input) {
            actor {
              ... on User {
                birthdate {
                  day
                  month
                  year
                }
              }
              ... on Page {
                username
              }
            }
          }
        }
      `),
      optimisticResponse: {
        actorNameChange: {
          actor: {
            __typename: 'User',
            id: '3',
            username: 'Zuck',
          },
        },
      },
      variables: null,
      shouldWarn: true,
    },
    {
      name: 'Logs a warning when there are unused fields in an `optimisticResponse`',
      mutation: getRequest(graphql`
        mutation validateMutationTest7ChangeNameBirthdayMutation(
          $input: ActorNameChangeInput!
        ) {
          actorNameChange(input: $input) {
            actor {
              ... on User {
                birthdate {
                  day
                  month
                  year
                }
              }
              ... on Page {
                username
              }
            }
          }
        }
      `),
      optimisticResponse: {
        actorNameChange: {
          actor: {
            __typename: 'Page',
            id: '3',
            username: 'Zuck',
            unusedField: true,
          },
        },
      },
      variables: null,
      shouldWarn: true,
    },
    {
      name: 'Passes when fields are null',
      mutation: getRequest(graphql`
        mutation validateMutationTest8ChangeNameBirthdayWithNameMutation(
          $input: ActorNameChangeInput!
        ) {
          actorNameChange(input: $input) {
            actor {
              name
              ... on User {
                birthdate {
                  day
                  month
                  year
                }
              }
              ... on Page {
                username
              }
            }
          }
        }
      `),

      optimisticResponse: {
        actorNameChange: {
          actor: {
            id: 3,
            __typename: 'User',
            name: null,
            birthdate: null,
          },
        },
      },
      variables: null,
      shouldWarn: false,
    },
    {
      name: 'Warns when conditional branches are not specified',
      mutation: getRequest(graphql`
        mutation validateMutationTest9ChangeNameIncludeMutation(
          $input: ActorNameChangeInput!
          $myVar: Boolean!
        ) {
          actorNameChange(input: $input) {
            actor {
              ... @include(if: $myVar) {
                ... on Page {
                  username
                }
              }
              ... @skip(if: $myVar) {
                ... on Page {
                  canViewerLike
                }
              }
            }
          }
        }
      `),
      optimisticResponse: {
        actorNameChange: {
          actor: {
            id: 3,
            __typename: 'Page',
            username: null,
          },
        },
      },
      variables: {
        myVar: true,
      },
      shouldWarn: true,
    },
    {
      name: 'Does not warn when conditional branches are specified',
      mutation: getRequest(graphql`
        mutation validateMutationTest10ChangeNameIncludeBoolMutation(
          $input: ActorNameChangeInput!
          $myVar: Boolean!
        ) {
          actorNameChange(input: $input) {
            actor {
              ... @include(if: $myVar) {
                ... on Page {
                  username
                }
              }
              ... @skip(if: $myVar) {
                ... on Page {
                  canViewerLike
                }
              }
            }
          }
        }
      `),
      optimisticResponse: {
        actorNameChange: {
          actor: {
            id: 3,
            __typename: 'Page',
            username: null,
            canViewerLike: false,
          },
        },
      },
      variables: {
        myVar: false,
      },
      shouldWarn: false,
    },
    {
      name: 'Handles Lists',
      mutation: getRequest(graphql`
        mutation validateMutationTest11ChangeNamePhonesMutation(
          $input: ActorNameChangeInput!
        ) {
          actorNameChange(input: $input) {
            actor {
              allPhones {
                isVerified
              }
            }
          }
        }
      `),
      optimisticResponse: {
        actorNameChange: {
          actor: {
            id: 3,
            __typename: 'Page',
            allPhones: [
              {
                isVerified: true,
              },
            ],
          },
        },
      },
      variables: {
        myVar: false,
      },
      shouldWarn: false,
    },
    {
      name: 'Handles Lists with null values',
      mutation: getRequest(graphql`
        mutation validateMutationTest12ChangeNamePhonesMutation(
          $input: ActorNameChangeInput!
        ) {
          actorNameChange(input: $input) {
            actor {
              allPhones {
                isVerified
              }
            }
          }
        }
      `),
      optimisticResponse: {
        actorNameChange: {
          actor: {
            id: 3,
            __typename: 'Page',
            allPhones: [null],
          },
        },
      },
      variables: {
        myVar: false,
      },
      shouldWarn: false,
    },
    {
      name: 'Handles object with null values',
      mutation: getRequest(graphql`
        mutation validateMutationTest13ChangeNamePhonesMutation(
          $input: ActorNameChangeInput!
        ) {
          actorNameChange(input: $input) {
            actor {
              allPhones {
                isVerified
              }
            }
          }
        }
      `),
      optimisticResponse: {
        actorNameChange: {
          actor: {
            id: 3,
            __typename: 'Page',
            allPhones: null,
          },
        },
      },
      variables: {
        myVar: false,
      },
      shouldWarn: false,
    },
    {
      name: 'Warn when invalid value in the list',
      mutation: getRequest(graphql`
        mutation validateMutationTest14ChangeNamePhonesMutation(
          $input: ActorNameChangeInput!
        ) {
          actorNameChange(input: $input) {
            actor {
              allPhones {
                isVerified
              }
            }
          }
        }
      `),
      optimisticResponse: {
        actorNameChange: {
          actor: {
            id: 3,
            __typename: 'Page',
            allPhones: [
              {
                isVerified: true,
              },
              // string is invalid because an object is expected here
              'phone_number',
            ],
          },
        },
      },
      variables: {
        myVar: false,
      },
      shouldWarn: true,
    },
    {
      name: 'Handles Lists with scalar fields',
      mutation: getRequest(graphql`
        mutation validateMutationTest15ChangeNameWebsitesMutation(
          $input: ActorNameChangeInput!
        ) {
          actorNameChange(input: $input) {
            actor {
              websites
            }
          }
        }
      `),
      optimisticResponse: {
        actorNameChange: {
          actor: {
            id: 3,
            __typename: 'Page',
            websites: ['my website'],
          },
        },
      },
      variables: {
        myVar: false,
      },
      shouldWarn: false,
    },
    {
      name: 'Warn for invalid values in the list',
      mutation: getRequest(graphql`
        mutation validateMutationTest16ChangeNameWebsitesMutation(
          $input: ActorNameChangeInput!
        ) {
          actorNameChange(input: $input) {
            actor {
              websites
            }
          }
        }
      `),
      optimisticResponse: {
        actorNameChange: {
          actor: {
            id: 3,
            __typename: 'Page',
            websites: ['my website', {url: 'http://my-website'}],
          },
        },
      },
      variables: {
        myVar: false,
      },
      shouldWarn: true,
    },
    {
      name: 'Does not warn when a field is specified as undefined',
      mutation: getRequest(graphql`
        mutation validateMutationTest17ChangeNameMutation(
          $input: ActorNameChangeInput!
        ) {
          actorNameChange(input: $input) {
            actor {
              name
            }
          }
        }
      `),
      optimisticResponse: {
        actorNameChange: {
          actor: {__typename: null, id: null, name: undefined},
        },
      },
      variables: null,
      shouldWarn: false,
    },
    {
      name: 'Does not warn when an object is specified as undefined',
      mutation: getRequest(graphql`
        mutation validateMutationTest18ChangeNameMutation(
          $input: ActorNameChangeInput!
        ) {
          actorNameChange(input: $input) {
            actor {
              name
            }
          }
        }
      `),
      optimisticResponse: {
        actorNameChange: {
          actor: undefined,
        },
      },
      variables: null,
      shouldWarn: false,
    },
    {
      name: 'Does not log a warning for client-side schema extensions',
      mutation: getRequest(graphql`
        mutation validateMutationTest19FeedbackLikeMutation(
          $input: FeedbackLikeInput
        ) {
          feedbackLike(input: $input) {
            feedback {
              doesViewerLike
              isSavingLike
            }
          }
        }
      `),
      optimisticResponse: {
        feedbackLike: {
          feedback: {
            id: 1,
            doesViewerLike: true,
            isSavingLike: true,
          },
        },
      },
      variables: null,
      shouldWarn: false,
    },
    {
      name: 'Logs a warning for invalid client-side schema extension fields',
      mutation: getRequest(graphql`
        mutation validateMutationTest20FeedbackLikeMutation(
          $input: FeedbackLikeInput
        ) {
          feedbackLike(input: $input) {
            feedback {
              doesViewerLike
              isSavingLike
            }
          }
        }
      `),
      optimisticResponse: {
        feedbackLike: {
          feedback: {
            id: 1,
            doesViewerLike: true,
            someInvalidField: true,
          },
        },
      },
      variables: null,
      shouldWarn: true,
    },
    {
      name: 'Does not log a warning for ModuleImport sub selections',
      mutation: getRequest(graphql`
        mutation validateMutationTest21FeedbackLikeGroovyMutation(
          $input: FeedbackLikeInput
        ) {
          feedbackLike(input: $input) {
            feedback {
              ...validateMutationTestGroovyFragment_groovygroovy
                @module(name: "GroovyModule.react")
            }
          }
        }
      `),
      optimisticResponse: {
        feedbackLike: {
          feedback: {
            id: 1,
          },
        },
      },
      variables: null,
      shouldWarn: false,
    },
  ].forEach(({name, mutation, optimisticResponse, shouldWarn, variables}) => {
    it(name, () => {
      jest.clearAllMocks();
      if (shouldWarn) {
        expect(() =>
          validateMutation(optimisticResponse, mutation, variables),
        ).toThrow();
      } else {
        expect(() =>
          validateMutation(optimisticResponse, mutation, variables),
        ).not.toThrow();
      }
    });
  });

  describe('feature ENABLE_REACT_FLIGHT_COMPONENT_FIELD', () => {
    let FlightMutation;
    beforeEach(() => {
      jest.clearAllMocks();
      RelayFeatureFlags.ENABLE_REACT_FLIGHT_COMPONENT_FIELD = true;
      FlightMutation = getRequest(graphql`
        mutation validateMutationTestFlightMutation(
          $input: StoryUpdateInput!
          $count: Int!
        ) {
          storyUpdate(input: $input) {
            story {
              id
              body {
                text
              }
              flightComponentValidateMutation(condition: true, count: $count)
            }
          }
        }
      `);
    });

    afterEach(() => {
      RelayFeatureFlags.ENABLE_REACT_FLIGHT_COMPONENT_FIELD = false;
    });

    it('Throws an error when optimistic responses contain Flight fields', () => {
      const optimisticResponse = {
        storyUpdate: {
          story: {
            id: 1,
            body: {
              text: 'Hello world',
            },
            flightComponentValidateMutation: {
              tree: [
                {
                  type: 'div',
                  key: null,
                  ref: null,
                  props: {foo: 1},
                },
              ],
              queries: [],
              errors: [],
              fragments: [],
            },
          },
        },
      };
      const variables = null;

      expect(() => {
        validateMutation(optimisticResponse, FlightMutation, variables);
      }).toThrowError(/validateMutation: Flight fields are not compatible/);
    });

    it('Does not error when optimistic responses contain null or undefined Flight fields', () => {
      const optimisticResponseWithUndefinedFlightField = {
        storyUpdate: {
          story: {
            id: 1,
            body: {
              text: 'Hello world',
            },
            flightComponentValidateMutation: undefined,
          },
        },
      };
      const optimisticResponseWithNullFlightField = {
        storyUpdate: {
          story: {
            id: 1,
            body: {
              text: 'Hello world',
            },
            flightComponentValidateMutation: null,
          },
        },
      };
      const variables = null;

      expect(() => {
        validateMutation(
          optimisticResponseWithUndefinedFlightField,
          FlightMutation,
          variables,
        );
      }).not.toThrow();
      expect(() => {
        validateMutation(
          optimisticResponseWithNullFlightField,
          FlightMutation,
          variables,
        );
      }).not.toThrow();
    });
  });
});
