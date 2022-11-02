/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::DirectiveName;
use intern::string_key::Intern;
use lazy_static::lazy_static;

lazy_static! {
    pub static ref ARGUMENT_DEFINITION: DirectiveName =
        DirectiveName("argumentDefinitions".intern());
}
