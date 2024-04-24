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

import type {Query__weak_animal$normalization} from 'relay-runtime/store/__tests__/resolvers/__generated__/Query__weak_animal$normalization.graphql';

/**
 * Returns a single `IWeakAnimal` of a given type.
 *
 * @RelayResolver Query.weak_animal(request: WeakAnimalRequest!): IWeakAnimal
 */
function weak_animal(args: {
  request: {ofType: string},
}): Query__weak_animal$normalization {
  switch (args.request.ofType) {
    case 'Octopus':
      return {
        __relay_model_instance: {},
        __typename: 'Octopus',
      };
    case 'PurpleOctopus':
      return {
        __relay_model_instance: {},
        __typename: 'PurpleOctopus',
      };
    default:
      throw new Error('Invalid type');
  }
}

/**
 * Returns a list of `IWeakAnimal` of a given type.
 *
 * @RelayResolver Query.weak_animals(requests: [WeakAnimalRequest!]!): [IWeakAnimal]
 */
function weak_animals(args: {
  requests: $ReadOnlyArray<{ofType: string}>,
}): Array<Query__weak_animal$normalization> {
  return args.requests.map(request => {
    return weak_animal({request});
  });
}

module.exports = {
  weak_animal,
  weak_animals,
};
