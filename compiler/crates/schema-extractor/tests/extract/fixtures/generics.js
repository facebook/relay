/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//extract
function live_user(user: User): LiveState<User> {}

//extract
function live_generic_user(user: User): LiveState<Generic<User>> {}

//extract
function live_array_generic_optinal_user(user: User): LiveState<Array<Generic<?User>>> {}
