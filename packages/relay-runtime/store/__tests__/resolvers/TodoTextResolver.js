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

import type {TodoTextResolverFragment$key} from './__generated__/TodoTextResolverFragment.graphql';
import type {Todo__text$normalization as ReturnType} from './__generated__/Todo__text$normalization.graphql.js';

const {readFragment} = require('relay-runtime/store/ResolverFragments');
const {graphql} = require('relay-runtime');

/**
 * @RelayResolver
 * @onType Todo
 * @rootFragment TodoTextResolverFragment
 * @fieldName text
 * @outputType TodoText
 */
function text(rootKey: TodoTextResolverFragment$key): ?ReturnType {
  const data = readFragment(
    graphql`
      fragment TodoTextResolverFragment on Todo {
        self
      }
    `,
    rootKey,
  );
  const content = data.self?.description;
  if (content == null) {
    return null;
  }
  const isCompleted = data.self?.isCompleted ?? false;

  return {
    style: {
      font_style: isCompleted ? 'normal' : 'bold',
      color: {
        hex: isCompleted ? 'green' : 'red',
      },
    },
    content,
  };
}

module.exports = {
  text,
};
