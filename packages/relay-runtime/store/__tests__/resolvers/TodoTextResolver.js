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

import type {Todo__text$normalization as ReturnType} from './__generated__/Todo__text$normalization.graphql.js';
import type {TodoTextResolverFragment$key} from './__generated__/TodoTextResolverFragment.graphql';

const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

/**
 * @RelayResolver Todo.text: TodoText
 * @rootFragment TodoTextResolverFragment
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
