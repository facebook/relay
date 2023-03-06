/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod docblock_ir;
mod errors;
mod ir;
mod untyped_representation;

use common::DiagnosticsResult;
use common::FeatureFlag;
use docblock_ir::parse_docblock_ir;
use docblock_shared::DEPRECATED_FIELD;
use docblock_shared::EDGE_TO_FIELD;
use docblock_shared::EMPTY_STRING;
use docblock_shared::FIELD_NAME_FIELD;
use docblock_shared::LIVE_FIELD;
use docblock_shared::ON_INTERFACE_FIELD;
use docblock_shared::ON_TYPE_FIELD;
use docblock_shared::OUTPUT_TYPE_FIELD;
use docblock_shared::RELAY_RESOLVER_FIELD;
use docblock_shared::ROOT_FRAGMENT_FIELD;
use docblock_shared::WEAK_FIELD;
use docblock_syntax::DocblockAST;
use graphql_syntax::ExecutableDefinition;
use intern::string_key::StringKey;
use intern::Lookup;
pub use ir::DocblockIr;
pub use ir::On;
use ir::RelayResolverIr;
use untyped_representation::parse_untyped_docblock_representation;

pub struct ParseOptions {
    pub id_field_name: StringKey,
    pub enable_output_type: FeatureFlag,
}

pub fn parse_docblock_ast(
    ast: &DocblockAST,
    definitions: Option<&Vec<ExecutableDefinition>>,
    parse_options: ParseOptions,
) -> DiagnosticsResult<Option<DocblockIr>> {
    let untyped_representation = parse_untyped_docblock_representation(ast)?;
    parse_docblock_ir(
        untyped_representation,
        definitions,
        &parse_options,
        ast.location,
    )
}

/// Check if this docblock has Resolver Model (type) definition
pub fn resolver_maybe_defining_type(ast: &DocblockAST) -> bool {
    ast.find_field(*RELAY_RESOLVER_FIELD)
        .map_or(false, |field| {
            if let Some(value) = field.field_value {
                // If @RelayResolver value contains a `.`
                // it is mostly likely a terse version of resolver
                // field definition.
                // values without `.` will be considered type definitions
                !value.item.lookup().contains('.')
            } else {
                false
            }
        })
}
