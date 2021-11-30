/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use intern::string_key::{Intern, StringKey};
use lazy_static::lazy_static;

lazy_static! {
    pub(crate) static ref ASSIGNABLE_DIRECTIVE_NAME: StringKey = "assignable".intern();
}
