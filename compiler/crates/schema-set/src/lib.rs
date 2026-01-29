/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod build_schema_document;
mod from_schema;
mod ir_collector;
mod macros;
mod merge_sdl_document;
mod partition_base_extensions;
pub mod print_schema_set;
mod schema_set;
mod schema_set_collection_options;
mod schema_set_collector;
mod set_exclude;
mod set_merges;
mod set_remove_defined_references;
mod set_type_reference;

use common::ArgumentName;
use common::DirectiveName;
use intern::string_key::Intern;
use lazy_static::lazy_static;

pub use crate::build_schema_document::ToSDLDefinition;
pub use crate::from_schema::SchemaDefault;
pub use crate::from_schema::SchemaInsertArgument;
pub use crate::from_schema::SchemaInsertDirectiveValue;
pub use crate::from_schema::SchemaInsertField;
pub use crate::from_schema::SchemaInsertInterface;
pub use crate::from_schema::SetEmptyClone;
pub use crate::from_schema::convert_schema_output_type_reference;
pub use crate::ir_collector::UsedSchemaIRCollector;
pub use crate::partition_base_extensions::partition_schema_set_base_and_extensions;
pub use crate::schema_set::CanHaveDirectives;
pub use crate::schema_set::FieldName;
pub use crate::schema_set::HasDescription;
pub use crate::schema_set::SchemaDefinitionItem;
pub use crate::schema_set::SchemaSet;
pub use crate::schema_set::SetArgument;
pub use crate::schema_set::SetDirective;
pub use crate::schema_set::SetEnum;
pub use crate::schema_set::SetField;
pub use crate::schema_set::SetInputObject;
pub use crate::schema_set::SetInterface;
pub use crate::schema_set::SetMemberType;
pub use crate::schema_set::SetObject;
pub use crate::schema_set::SetScalar;
pub use crate::schema_set::SetType;
pub use crate::schema_set::SetUnion;
pub use crate::schema_set::StringKeyNamed;
pub use crate::schema_set_collection_options::UsedSchemaCollectionOptions;
pub use crate::set_type_reference::OutputNonNull;
pub use crate::set_type_reference::OutputTypeReference;

lazy_static! {
    static ref SEMANTIC_NON_NULL: DirectiveName = DirectiveName("semanticNonNull".intern());
    static ref SEMANTIC_NON_NULL_LEVELS_ARG: ArgumentName = ArgumentName("levels".intern());
}
