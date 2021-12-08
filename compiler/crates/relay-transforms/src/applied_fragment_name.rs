/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::hash_arguments;

use graphql_ir::Argument;
use intern::string_key::{Intern, StringKey};

pub fn get_applied_fragment_name(spread_name: StringKey, args: &[Argument]) -> StringKey {
    let arguments_hash = hash_arguments(args);
    match arguments_hash {
        Some(hash) => format!("{}_{}", spread_name, hash).intern(),
        None => spread_name,
    }
}
