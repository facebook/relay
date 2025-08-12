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

import type {LiveState} from '../../RelayStoreTypes';
import type {TodoDescription__some_client_type_with_interface$normalization} from './__generated__/TodoDescription__some_client_type_with_interface$normalization.graphql';
import type {TodoDescription__some_interface$normalization} from './__generated__/TodoDescription__some_interface$normalization.graphql';
import type {TodoDescription_text_style$key} from './__generated__/TodoDescription_text_style.graphql';

const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

/**
 * @RelayResolver TodoDescription
 * @weak
 */
export opaque type TodoDescription = {
  text: string,
  color: string,
};

/**
 * @RelayResolver TodoDescriptionStyle
 * @weak
 */
export opaque type TodoDescriptionStyle = {
  color: string,
  margin: ?string,
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
function text(instance: TodoDescription): string {
  return instance.text;
}

/**
 * @RelayResolver TodoDescription.text_with_prefix(prefix: String!): String
 */
function text_with_prefix(
  instance: TodoDescription,
  args: {prefix: string},
): string {
  return `${args.prefix} ${instance.text}`;
}

/**
 * @RelayResolver TodoDescription.color: RelayResolverValue
 */
function color(instance: TodoDescription): string {
  return instance.color;
}

const LiveColorSubscriptions = {
  activeSubscriptions: [],
} as {
  activeSubscriptions: Array<() => void>,
};

/**
 * @RelayResolver TodoDescription.live_color: RelayResolverValue
 * @live
 */
function live_color(instance: TodoDescription): LiveState<string> {
  // This is a live field to test the subscription leaks cases
  // When defining live fields on weak types
  return {
    read() {
      return instance.color;
    },
    subscribe(cb: () => void): () => void {
      LiveColorSubscriptions.activeSubscriptions.push(cb);
      return () => {
        LiveColorSubscriptions.activeSubscriptions =
          LiveColorSubscriptions.activeSubscriptions.filter(sub => sub !== cb);
      };
    },
  };
}

/**
 * @RelayResolver TodoDescription.some_interface: ClientInterface
 */
function some_interface(
  instance: TodoDescription,
): TodoDescription__some_interface$normalization {
  return {
    __typename: 'ClientTypeImplementingClientInterface',
    description: 'It was a magical place',
  };
}

/**
 * @RelayResolver TodoDescription.some_client_type_with_interface: ClientTypeWithNestedClientInterface
 */
function some_client_type_with_interface(
  instance: TodoDescription,
): TodoDescription__some_client_type_with_interface$normalization {
  return {
    client_interface: {
      __typename: 'ClientTypeImplementingClientInterface',
      description: 'It was a magical place',
    },
  };
}

/**
 * @RelayResolver TodoDescription.text_style(margin: String): TodoDescriptionStyle
 * @rootFragment TodoDescription_text_style
 */
function text_style(
  fragmentKey: TodoDescription_text_style$key,
  {margin}: {margin?: ?string},
): TodoDescriptionStyle {
  const {color} = readFragment(
    graphql`
      fragment TodoDescription_text_style on TodoDescription {
        color @required(action: THROW)
      }
    `,
    fragmentKey,
  );
  return {
    color,
    margin,
  };
}

/**
 * @RelayResolver Query.some_todo_description: TodoDescription
 */
function some_todo_description(): TodoDescription {
  return {color: 'red', text: 'some todo description'};
}

module.exports = {
  some_todo_description,
  text_style,
  text_with_prefix,
  createTodoDescription,
  text,
  color,
  live_color,
  LiveColorSubscriptions,
  some_interface,
  some_client_type_with_interface,
};
