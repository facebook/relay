/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::{util::CustomMetadataDirectives, ModuleMetadata};
use graphql_ir::node_identifier::LocationAgnosticBehavior;
use intern::string_key::StringKey;

#[derive(Clone)]
pub struct RelayLocationAgnosticBehavior;
impl LocationAgnosticBehavior for RelayLocationAgnosticBehavior {
    fn should_skip_in_node_identifier(name: StringKey) -> bool {
        CustomMetadataDirectives::should_skip_in_node_identifier(name)
    }
    fn hash_for_name_only(name: StringKey) -> bool {
        ModuleMetadata::directive_name() == name
    }
}
