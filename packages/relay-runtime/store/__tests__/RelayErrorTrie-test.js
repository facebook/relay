/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

const RelayFeatureFlags = require('../../util/RelayFeatureFlags');
const {
  SELF,
  buildErrorTrie,
  getErrorsByKey,
  getNestedErrorTrieByKey,
} = require('../RelayErrorTrie');
const nullthrows = require('nullthrows');

describe('when field error handling is disabled', () => {
  const wasFieldErrorHandlingEnabled =
    RelayFeatureFlags.ENABLE_FIELD_ERROR_HANDLING;

  beforeAll(() => {
    RelayFeatureFlags.ENABLE_FIELD_ERROR_HANDLING = false;
  });

  describe('buildErrorTrie', () => {
    it('always returns an empty result', () => {
      expect(
        buildErrorTrie([
          {
            message: 'An error on the name field!',
            path: ['people', 0, 'name'],
          },
          {
            message: 'An error on the age field!',
            path: ['people', 0, 'age'],
          },
        ]),
      ).toBeNull();
    });

    afterAll(() => {
      RelayFeatureFlags.ENABLE_FIELD_ERROR_HANDLING =
        wasFieldErrorHandlingEnabled;
    });
  });

  describe('when field error handling is enabled', () => {
    const wasFieldErrorHandlingEnabled =
      RelayFeatureFlags.ENABLE_FIELD_ERROR_HANDLING;

    beforeAll(() => {
      RelayFeatureFlags.ENABLE_FIELD_ERROR_HANDLING = true;
    });

    describe('buildErrorTrie', () => {
      it('can handle when two errors have common ancestor', () => {
        expect(
          buildErrorTrie([
            {
              message: 'An error on the name field!',
              path: ['people', 0, 'name'],
            },
            {
              message: 'An error on the age field!',
              path: ['people', 0, 'age'],
            },
          ]),
        ).toEqual(
          new Map([
            [
              'people',
              new Map([
                [
                  0,
                  new Map([
                    [
                      'name',
                      [
                        {
                          message: 'An error on the name field!',
                        },
                      ],
                    ],
                    [
                      'age',
                      [
                        {
                          message: 'An error on the age field!',
                        },
                      ],
                    ],
                  ]),
                ],
              ]),
            ],
          ]),
        );
      });

      it('can handle when there is more than one error with the same path', () => {
        expect(
          buildErrorTrie([
            {
              message: 'An error on the name field!',
              path: ['people', 0, 'name'],
            },
            {
              message: 'Another error on the name field!',
              path: ['people', 0, 'name'],
            },
            {
              message: 'A third error on the name field!',
              path: ['people', 0, 'name'],
            },
          ]),
        ).toEqual(
          new Map([
            [
              'people',
              new Map([
                [
                  0,
                  new Map([
                    [
                      'name',
                      [
                        {
                          message: 'An error on the name field!',
                        },
                        {
                          message: 'Another error on the name field!',
                        },
                        {
                          message: 'A third error on the name field!',
                        },
                      ],
                    ],
                  ]),
                ],
              ]),
            ],
          ]),
        );
      });

      it("can handle errors when a subsequent error's path points to an ancestor", () => {
        expect(
          buildErrorTrie([
            {
              message: 'An error on the name field!',
              path: ['people', 0, 'name'],
            },
            {
              message: 'An error on the age field!',
              path: ['people', 0, 'age'],
            },
            {
              message: 'An error on the person!',
              path: ['people', 0],
            },
          ]),
        ).toEqual(
          new Map([
            [
              'people',
              new Map([
                [
                  0,
                  new Map([
                    [
                      'name',
                      [
                        {
                          message: 'An error on the name field!',
                        },
                      ],
                    ],
                    [
                      'age',
                      [
                        {
                          message: 'An error on the age field!',
                        },
                      ],
                    ],
                    [
                      SELF,
                      [
                        {
                          message: 'An error on the person!',
                        },
                      ],
                    ],
                  ]),
                ],
              ]),
            ],
          ]),
        );
      });

      it("can handle errors errors when a preceding error's path points to an ancestor", () => {
        expect(
          buildErrorTrie([
            {
              message: 'An error on the person!',
              path: ['people', 0],
            },
            {
              message: 'An error on the name field!',
              path: ['people', 0, 'name'],
            },
            {
              message: 'An error on the age field!',
              path: ['people', 0, 'age'],
            },
          ]),
        ).toEqual(
          new Map([
            [
              'people',
              new Map([
                [
                  0,
                  new Map([
                    [
                      SELF,
                      [
                        {
                          message: 'An error on the person!',
                        },
                      ],
                    ],
                    [
                      'name',
                      [
                        {
                          message: 'An error on the name field!',
                        },
                      ],
                    ],
                    [
                      'age',
                      [
                        {
                          message: 'An error on the age field!',
                        },
                      ],
                    ],
                  ]),
                ],
              ]),
            ],
          ]),
        );
      });
    });

    describe('getErrorsByKey', () => {
      it('returns the errors with the given key', () => {
        expect(
          getErrorsByKey(
            nullthrows(
              buildErrorTrie([
                {
                  message: 'An error on the name field!',
                  path: ['name'],
                },
                {
                  message: 'Another error on the name field!',
                  path: ['name'],
                },
                {
                  message: 'An error on the age field!',
                  path: ['age'],
                },
              ]),
            ),
            'name',
          ),
        ).toEqual([
          {
            message: 'An error on the name field!',
          },
          {
            message: 'Another error on the name field!',
          },
        ]);
      });
      it('returns null when there are no errors with the given key', () => {
        expect(
          getErrorsByKey(
            nullthrows(
              buildErrorTrie([
                {
                  message: 'An error on the age field!',
                  path: ['age'],
                },
                {
                  message: 'An error on the first name field!',
                  path: ['name', 'first'],
                },
                {
                  message: 'An error on the last name field!',
                  path: ['name', 'last'],
                },
              ]),
            ),
            'favorite_color',
          ),
        ).toBe(null);
      });
      it('returns nested errors with the given key', () => {
        expect(
          getErrorsByKey(
            nullthrows(
              buildErrorTrie([
                {
                  message: 'An error on the age field!',
                  path: ['age'],
                },
                {
                  message: 'An error on the first name field!',
                  path: ['name', 'first'],
                },
                {
                  message: 'An error on the last name field!',
                  path: ['name', 'last'],
                },
              ]),
            ),
            'name',
          ),
        ).toEqual([
          {
            message: 'An error on the first name field!',
            path: ['first'],
          },
          {
            message: 'An error on the last name field!',
            path: ['last'],
          },
        ]);
      });
      it('returns deeply nested errors ', () => {
        expect(
          getErrorsByKey(
            nullthrows(
              buildErrorTrie([
                {
                  message: 'An error on the age field!',
                  path: ['age'],
                },
                {
                  message: 'An error on the name field!',
                  path: ['friends', 0, 'name'],
                },
                {
                  message: 'An error on the first name field!',
                  path: ['friends', 0, 'name', 'first'],
                },
                {
                  message: 'An error on the last name field!',
                  path: ['friends', 0, 'name', 'last'],
                },
              ]),
            ),
            'friends',
          ),
        ).toEqual([
          {
            message: 'An error on the name field!',
            path: [0, 'name'],
          },
          {
            message: 'An error on the first name field!',
            path: [0, 'name', 'first'],
          },
          {
            message: 'An error on the last name field!',
            path: [0, 'name', 'last'],
          },
        ]);
      });
    });

    describe('getNestedErrorTrieByKey', () => {
      it('returns the nested errors that are prefixed by the given key', () => {
        expect(
          getNestedErrorTrieByKey(
            nullthrows(
              buildErrorTrie([
                {
                  message: 'An error on the first person!',
                  path: ['people', 0],
                },
                {
                  message: 'An error on the second person!',
                  path: ['people', 1],
                },
                {
                  message: 'An error on the pets field!',
                  path: ['pets'],
                },
              ]),
            ),
            'people',
          ),
        ).toEqual(
          new Map([
            [
              0,
              [
                {
                  message: 'An error on the first person!',
                },
              ],
            ],
            [
              1,
              [
                {
                  message: 'An error on the second person!',
                },
              ],
            ],
          ]),
        );
      });
      it('returns an empty trie when there are no nested errors prefixed by the given key', () => {
        expect(
          getNestedErrorTrieByKey(
            nullthrows(
              buildErrorTrie([
                {
                  message: 'An error on the first person!',
                  path: ['people', 0],
                },
                {
                  message: 'An error on the second person!',
                  path: ['people', 1],
                },
                {
                  message: 'An error on the pets field!',
                  path: ['pets'],
                },
              ]),
            ),
            'pets',
          ),
        ).toBeNull();
      });
    });

    afterAll(() => {
      RelayFeatureFlags.ENABLE_FIELD_ERROR_HANDLING =
        wasFieldErrorHandlingEnabled;
    });
  });
});
