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

const {generateAndCompile} = require('relay-test-utils-internal');

jest.mock('warning', () => {
  return (dontWarn, message, ...args) => {
    if (dontWarn) {
      return;
    }
    throw new Error(`${message} ${args.join(' ')}`);
  };
});
describe('validateOptimisticResponse', () => {
  [
    {
      name: 'Does not log a warning in the positive case',
      mutation: generateAndCompile(`
          mutation ChangeNameMutation(
            $input: ActorNameChangeInput!
          ) {
            actorNameChange(input: $input) {
              actor {
                name
              }
            }
          }
      `).ChangeNameMutation,
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
      mutation: generateAndCompile(`
          mutation ChangeNameMutation(
            $input: ActorNameChangeInput!
          ) {
            actorNameChange(input: $input) {
              actor {
                name
              }
            }
          }
      `).ChangeNameMutation,
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
      mutation: generateAndCompile(`
          mutation ChangeNameMutation(
            $input: ActorNameChangeInput!
          ) {
            actorNameChange(input: $input) {
              actor {
                name
              }
            }
          }
      `).ChangeNameMutation,
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
      mutation: generateAndCompile(`
          mutation ChangeNameMutation(
            $input: ActorNameChangeInput!
          ) {
            actorNameChange(input: $input) {
              actor {
                name
              }
            }
          }
      `).ChangeNameMutation,
      optimisticResponse: {
        actorNameChange: {},
      },
      variables: null,
      shouldWarn: true,
    },
    {
      name: 'Uses type names to filter inline fragment warnings',
      mutation: generateAndCompile(`
          mutation ChangeNameMutation(
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
      `).ChangeNameMutation,
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
      mutation: generateAndCompile(`
          mutation ChangeNameMutation(
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
      `).ChangeNameMutation,
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
      name:
        'Logs a warning when there are unused fields in an `optimisticResponse`',
      mutation: generateAndCompile(`
          mutation ChangeNameMutation(
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
      `).ChangeNameMutation,
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
      mutation: generateAndCompile(`
          mutation ChangeNameMutation(
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
      `).ChangeNameMutation,
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
      mutation: generateAndCompile(`
          mutation ChangeNameMutation(
            $input: ActorNameChangeInput!,
            $myVar: Boolean!,
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
      `).ChangeNameMutation,
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
      name: 'Does not warns when conditional branches are specified',
      mutation: generateAndCompile(`
          mutation ChangeNameMutation(
            $input: ActorNameChangeInput!,
            $myVar: Boolean!,
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
      `).ChangeNameMutation,
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
      mutation: generateAndCompile(`
          mutation ChangeNameMutation(
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
      `).ChangeNameMutation,
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
      mutation: generateAndCompile(`
          mutation ChangeNameMutation(
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
      `).ChangeNameMutation,
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
      mutation: generateAndCompile(`
          mutation ChangeNameMutation(
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
      `).ChangeNameMutation,
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
      mutation: generateAndCompile(`
          mutation ChangeNameMutation(
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
      `).ChangeNameMutation,
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
      mutation: generateAndCompile(`
          mutation ChangeNameMutation(
            $input: ActorNameChangeInput!
          ) {
            actorNameChange(input: $input) {
              actor {
                websites
              }
            }
          }
      `).ChangeNameMutation,
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
      mutation: generateAndCompile(`
          mutation ChangeNameMutation(
            $input: ActorNameChangeInput!
          ) {
            actorNameChange(input: $input) {
              actor {
                websites
              }
            }
          }
      `).ChangeNameMutation,
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
      mutation: generateAndCompile(`
          mutation ChangeNameMutation(
            $input: ActorNameChangeInput!
          ) {
            actorNameChange(input: $input) {
              actor {
                name
              }
            }
          }
      `).ChangeNameMutation,
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
      mutation: generateAndCompile(`
          mutation ChangeNameMutation(
            $input: ActorNameChangeInput!
          ) {
            actorNameChange(input: $input) {
              actor {
                name
              }
            }
          }
      `).ChangeNameMutation,
      optimisticResponse: {
        actorNameChange: {
          actor: undefined,
        },
      },
      variables: null,
      shouldWarn: true,
    },
    {
      name: 'Does not log a warning for client-side schema extensions',
      mutation: generateAndCompile(
        `
          extend type Feedback {
            isSavingLike: Boolean
          }
          mutation FeedbackLikeMutation(
            $input: FeedbackLikeInput
          ) {
            feedbackLike(input: $input) {
              feedback {
                doesViewerLike
                isSavingLike
              }
            }
          }
      `,
      ).FeedbackLikeMutation,
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
      mutation: generateAndCompile(
        `
          extend type Feedback {
            isSavingLike: Boolean
          }
          mutation FeedbackLikeMutation(
            $input: FeedbackLikeInput
          ) {
            feedbackLike(input: $input) {
              feedback {
                doesViewerLike
                isSavingLike
              }
            }
          }
      `,
      ).FeedbackLikeMutation,
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
});
