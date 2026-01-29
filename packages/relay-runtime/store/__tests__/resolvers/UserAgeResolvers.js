/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * @RelayResolver User.age: Int
 */
function age(_: unknown, context: {age: number}): number {
  return context.age;
}

module.exports = {
  age,
};
