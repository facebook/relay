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

module.exports = {
  createTodoDescription,
  text,
  color,
};
