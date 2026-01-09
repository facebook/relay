/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 * @oncall relay
 */

import type {DataID} from 'relay-runtime/util/RelayRuntimeTypes';

type IAnimalTypeNames = 'Cat' | 'Fish' | 'Chicken';

const INVALID_ID = 'invalid_id';

type IAnimalType = {
  __id: DataID,
};

/**
 * @RelayResolver IAnimal.greeting: String
 */
function greeting(model: ?IAnimalType): ?string {
  if (model == null) {
    return null;
  }
  return `Hello, ${model.__id}!`;
}

/**
 * Returns a single `IAnimal` of a given type and optionally returns an invalid ID.
 *
 * @RelayResolver Query.animal(request: AnimalRequest!): IAnimal
 */
function animal(args: {request: {ofType: string, returnValidID: boolean}}): {
  __typename: IAnimalTypeNames,
  id: DataID,
} {
  switch (args.request.ofType) {
    case 'Cat': {
      const id = args.request.returnValidID ? '1234567890' : INVALID_ID;
      return {__typename: 'Cat', id};
    }
    case 'Fish': {
      const id = args.request.returnValidID ? '12redblue' : INVALID_ID;
      return {__typename: 'Fish', id};
    }
    default:
      throw new Error('Unexpected value for "ofType" argument');
  }
}

/**
 * Returns a list of `IAnimal` of a given type and optionally returns an invalid ID.
 *
 * @RelayResolver Query.animals(requests: [AnimalRequest!]!): [IAnimal]
 */
function animals(args: {
  requests: ReadonlyArray<{ofType: string, returnValidID: boolean}>,
}): Array<{
  __typename: IAnimalTypeNames,
  id: DataID,
}> {
  return args.requests.map(request => {
    return animal({request});
  });
}

module.exports = {
  INVALID_ID,
  animal,
  animals,
  greeting,
};
