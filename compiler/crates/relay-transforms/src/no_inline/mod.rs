/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use interner::{Intern, StringKey};
use lazy_static::lazy_static;

lazy_static! {
    pub static ref NO_INLINE_DIRECTIVE_NAME: StringKey = "no_inline".intern();
}
