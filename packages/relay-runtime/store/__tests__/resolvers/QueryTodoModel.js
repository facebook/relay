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

/**
 * @RelayResolver
 * @onType Query
 * @fieldName todo_model(todoID: ID!)
 * @edgeTo TodoModel
 */
function todo_model(args: {todoID: string}): string {
  return args.todoID;
}

module.exports = {
  todo_model,
};
