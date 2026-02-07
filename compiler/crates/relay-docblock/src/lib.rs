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
mod validate_resolver_schema;

use common::Diagnostic;
use common::DiagnosticsResult;
use common::FeatureFlag;
use common::Location;
pub use docblock_ir::assert_fragment_definition;
pub use docblock_ir::extract_fragment_arguments;
use docblock_ir::parse_docblock_ir;
pub use docblock_ir::validate_fragment_arguments;
use docblock_shared::DEPRECATED_FIELD;
use docblock_shared::EDGE_TO_FIELD;
use docblock_shared::EMPTY_STRING;
use docblock_shared::FIELD_NAME_FIELD;
use docblock_shared::LIVE_FIELD;
use docblock_shared::ON_INTERFACE_FIELD;
use docblock_shared::ON_TYPE_FIELD;
use docblock_shared::OUTPUT_TYPE_FIELD;
use docblock_shared::RELAY_RESOLVER_FIELD;
use docblock_shared::RETURN_FRAGMENT_FIELD;
use docblock_shared::ROOT_FRAGMENT_FIELD;
use docblock_shared::SEMANTIC_NON_NULL_FIELD;
use docblock_shared::WEAK_FIELD;
use docblock_syntax::DocblockAST;
use graphql_syntax::ExecutableDefinition;
use graphql_syntax::TypeSystemDefinition;
use intern::Lookup;
pub use ir::*;
use relay_config::ProjectName;
use schema::SDLSchema;
use untyped_representation::parse_untyped_docblock_representation;
pub use validate_resolver_schema::validate_resolver_schema;

pub struct ParseOptions<'a> {
    pub enable_interface_output_type: &'a FeatureFlag,
    pub allow_resolver_non_nullable_return_type: &'a FeatureFlag,
    pub enable_legacy_verbose_resolver_syntax: &'a FeatureFlag,
}

pub fn parse_docblock_ast(
    project_name: &ProjectName,
    ast: &DocblockAST,
    definitions: Option<&Vec<ExecutableDefinition>>,
    parse_options: &ParseOptions<'_>,
) -> DiagnosticsResult<Option<DocblockIr>> {
    let untyped_representation = parse_untyped_docblock_representation(ast)?;
    parse_docblock_ir(
        project_name,
        untyped_representation,
        definitions,
        parse_options,
        ast.location,
    )
}

/// Check if this docblock has Resolver Model (type) definition
pub fn resolver_maybe_defining_type(ast: &DocblockAST) -> bool {
    ast.find_field(*RELAY_RESOLVER_FIELD).is_some_and(|field| {
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

pub fn extend_schema_with_resolver_type_system_definition(
    definition: TypeSystemDefinition,
    schema: &mut SDLSchema,
    location: Location,
) -> Result<(), Vec<Diagnostic>> {
    Ok(match definition {
        TypeSystemDefinition::ObjectTypeDefinition(extension) => {
            schema.add_extension_object(extension, location.source_location())?
        }
        TypeSystemDefinition::ScalarTypeDefinition(extension) => {
            schema.add_extension_scalar(extension, location.source_location())?;
        }
        TypeSystemDefinition::ObjectTypeExtension(extension) => {
            schema.add_object_type_extension(extension, location.source_location())?;
        }
        TypeSystemDefinition::InterfaceTypeExtension(extension) => {
            schema.add_interface_type_extension(extension, location.source_location())?;
        }
        _ => panic!(
            "Expected docblocks to only expose object and scalar definitions, and object and interface extensions."
        ),
    })
}
