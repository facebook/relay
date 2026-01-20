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

import type {PurpleOctopus} from './PurpleOctopusResolvers';
import type {RedOctopus} from './RedOctopusResolvers';
import type {Query__weak_animal$normalization} from 'relay-runtime/store/__tests__/resolvers/__generated__/Query__weak_animal$normalization.graphql';

type IWeakAnimal = RedOctopus | PurpleOctopus;

/**
 * Defines greeting of a `IWeakAnimal`.
 *
 * @RelayResolver IWeakAnimal.greeting: String
 */
function greeting(instance: IWeakAnimal): string {
  return `Hello, ${instance.name}!`;
}

/**
 * Returns a single `IWeakAnimal` of a given type.
 *
 * @RelayResolver Query.weak_animal(request: WeakAnimalRequest!): IWeakAnimal
 */
function weak_animal(args: {
  request: {ofType: string},
}): Query__weak_animal$normalization {
  switch (args.request.ofType) {
    case 'RedOctopus':
      return {
        __relay_model_instance: {
          name: 'Shiny',
        },
        __typename: 'RedOctopus',
      };
    case 'PurpleOctopus':
      return {
        __relay_model_instance: {
          name: 'Glowing',
        },
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
  requests: ReadonlyArray<{ofType: string}>,
}): Array<Query__weak_animal$normalization> {
  return args.requests.map(request => {
    return weak_animal({request});
  });
}

module.exports = {
  weak_animal,
  weak_animals,
  greeting,
};
