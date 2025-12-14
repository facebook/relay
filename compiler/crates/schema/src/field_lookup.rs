/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use directives::FIXME_FAT_INTERFACE;
use graphql_syntax::Directive;
use graphql_syntax::List;
use intern::string_key::StringKey;

use crate::definitions::FieldID;
use crate::definitions::Type;
use crate::graphql_schema::Schema;

/// Looks up a field by name on a parent type, with special handling for the
/// @fixme_fat_interface directive.
///
/// This function first attempts to find the field directly on the parent type.
/// If not found and the @fixme_fat_interface directive is present, it searches
/// through the possible implementing types (for interfaces and unions) to find
/// a field definition that matches both the name and arguments.
pub fn lookup_field<S: Schema>(
    schema: &S,
    parent_type: Type,
    field_name: StringKey,
    arguments: &Option<List<graphql_syntax::Argument>>,
    directives: &[Directive],
) -> Option<FieldID> {
    if let Some(field_id) = schema.named_field(parent_type, field_name) {
        return Some(field_id);
    }

    // Check if @fixme_fat_interface directive is present
    let has_fixme_fat_interface = directives
        .iter()
        .any(|d| d.name.value == FIXME_FAT_INTERFACE.0);

    if !has_fixme_fat_interface {
        return None;
    }

    // Handle @fixme_fat_interface: if present and the parent type is abstract, see
    // if one of the implementors has this field and if so use that definition.
    let possible_types = match parent_type {
        Type::Interface(id) => {
            let interface = schema.interface(id);
            Some(&interface.implementing_objects)
        }
        Type::Union(id) => {
            let union = schema.union(id);
            Some(&union.members)
        }
        Type::Object(_) => None,
        _ => unreachable!("Parent type of a field must be an interface, union, or object"),
    };
    if let Some(possible_types) = possible_types {
        for possible_type in possible_types {
            let field = schema.named_field(Type::Object(*possible_type), field_name);
            if let Some(field_id) = field {
                let field = schema.field(field_id);
                if let Some(arguments) = arguments {
                    if arguments
                        .items
                        .iter()
                        .all(|x| field.arguments.contains(x.name.value))
                    {
                        return Some(field_id);
                    }
                } else {
                    return Some(field_id);
                }
            }
        }
    }
    None
}
