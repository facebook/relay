/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use interner::StringKey;
use std::fmt::Write;

pub fn get_normalization_operation_name<W: Write>(writer: &mut W, name: StringKey) {
    write!(writer, "{}$normalization", name).unwrap();
}
