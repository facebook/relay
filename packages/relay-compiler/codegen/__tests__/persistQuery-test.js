/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

jest.mock('../../util/md5');
const md5 = require('../../util/md5');
const persistQuery = require('../persistQuery');

describe('persistQuery', () => {
  const animalQuery = 'query { animal }';
  const humanQuery = 'query { human }';

  md5.mockImplementation(query => {
    if (query === animalQuery) {
      return 'animalMd5';
    } else if (query === humanQuery) {
      return 'humanMd5';
    }
    return 'unknownMd5';
  });

  test('should hash and store query correctly', async () => {
    const documentId = await persistQuery(animalQuery);
    expect(documentId).toEqual('animalMd5');
  });

  test('should hash and store all queries correctly', async () => {
    const documentId1 = await persistQuery(animalQuery);
    const documentId2 = await persistQuery(humanQuery);

    expect(documentId1).toEqual('animalMd5');
    expect(documentId2).toEqual('humanMd5');
  });
});