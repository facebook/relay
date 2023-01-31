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

/**
 * @RelayResolver TodoDescription
 * @weak
 */
export opaque type TodoDescription = {
  text: string,
  color: string,
};

import type {TodoDescription__some_client_type_with_interface$normalization} from './__generated__/TodoDescription__some_client_type_with_interface$normalization.graphql';
import type {TodoDescription__some_interface$normalization} from './__generated__/TodoDescription__some_interface$normalization.graphql';

// Public constructor for opaque `TodoDescription`.
// Other resolvers have to call this function to
// create an instance of `TodoDescription`.
function createTodoDescription(
  text: string,
  isCompleted: boolean,
): TodoDescription {
  return {
    color: isCompleted ? 'green' : 'red',
    text,
  };
}

/**
 * @RelayResolver TodoDescription.text: String
 */
function text(instance: ?TodoDescription): ?string {
  return instance?.text;
}

/**
 * @RelayResolver TodoDescription.color: RelayResolverValue
 */
function color(instance: ?TodoDescription): ?string {
  return instance?.color;
}

/**
 * @RelayResolver TodoDescription.some_interface: ClientInterface!
 */
function some_interface(
  instance: ?TodoDescription,
): ?TodoDescription__some_interface$normalization {
  return {
    __typename: 'ClientTypeImplementingClientInterface',
    description: 'It was a magical place',
  };
}

/**
 * @RelayResolver TodoDescription.some_client_type_with_interface: ClientTypeWithNestedClientInterface!
 */
function some_client_type_with_interface(
  instance: ?TodoDescription,
): ?TodoDescription__some_client_type_with_interface$normalization {
  return {
    client_interface: {
      __typename: 'ClientTypeImplementingClientInterface',
      description: 'It was a magical place',
    },
  };
}

module.exports = {
  createTodoDescription,
  text,
  color,
  some_interface,
  some_client_type_with_interface,
};
