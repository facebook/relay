/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use graphql_ir::Argument;
use graphql_ir::FragmentDefinitionName;
use intern::string_key::Intern;

use super::hash_arguments;

pub fn get_applied_fragment_name(
    spread_name: FragmentDefinitionName,
    args: &[Argument],
) -> FragmentDefinitionName {
    let arguments_hash = hash_arguments(args);
    match arguments_hash {
        Some(hash) => FragmentDefinitionName(format!("{spread_name}_{hash}").intern()),
        None => spread_name,
    }
}
