/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */


//extract
function name(): string {
}

//extract
function name(user: User): User.Name {
}

//extract
function name(user: User): Genric<boolean, string> {
}
