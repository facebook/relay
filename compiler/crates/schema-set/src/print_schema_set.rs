/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use indoc::formatdoc;
use intern::Lookup;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use intern::string_key::StringKeyIndexMap;
use intern::string_key::StringKeyMap;
use schema::ArgumentValue;
use schema::DirectiveValue;
use schema::TypeReference;

use crate::OutputTypeReference;
use crate::build_schema_document::output_type_ref_to_semantic_sdl_type;
use crate::partition_base_extensions::PartitionsBaseExtension;
use crate::partition_schema_set_base_and_extensions;
use crate::schema_set::CanBeClientDefinition;
use crate::schema_set::CanHaveDirectives;
use crate::schema_set::HasDescription;
use crate::schema_set::HasFields;
use crate::schema_set::HasInterfaces;
use crate::schema_set::SchemaSet;
use crate::schema_set::SetArgument;
use crate::schema_set::SetDirective;
use crate::schema_set::SetEnum;
use crate::schema_set::SetField;
use crate::schema_set::SetInputObject;
use crate::schema_set::SetInterface;
use crate::schema_set::SetMemberType;
use crate::schema_set::SetObject;
use crate::schema_set::SetRootSchema;
use crate::schema_set::SetScalar;
use crate::schema_set::SetType;
use crate::schema_set::SetUnion;
use crate::schema_set::StringKeyNamed;

impl SchemaSet {
    pub fn print_base_and_client_definitions(&self) -> (Vec<String>, Vec<String>) {
        let without_builtin_definitions = remove_built_in_scalars(self);

        let (base_set, client_set) =
            partition_schema_set_base_and_extensions(&without_builtin_definitions);

        let base_definitions: Vec<String> = base_set.print_definitions_for_used_schema(None);
        let client_definitions: Vec<String> =
            client_set.print_definitions_for_used_schema(Some(&base_set));

        (base_definitions, client_definitions)
    }

    /// schema { query: QueryType }
    /// See https://spec.graphql.org/draft/#sec-Root-Operation-Types
    /// Skip printing if all root operation types are (None | == to default value)
    /// See https://spec.graphql.org/draft/#sec-Root-Operation-Types.Default-Root-Operation-Type-Names
    fn print_schema_definition(&self) -> Option<String> {
        if self.root_schema.is_empty() {
            None
        } else {
            Some(self.root_schema.print_definition())
        }
    }

    fn print_definitions_for_used_schema(
        &self,
        schema_being_extended: Option<&SchemaSet>,
    ) -> Vec<String> {
        let mut definitions: Vec<String> = Vec::new();

        if let Some(schema_definition) = self.print_schema_definition() {
            definitions.push(schema_definition);
        }

        for item in sorted_from_map(&self.directives) {
            definitions.push(item.print_definition());
        }

        for item in sorted_from_pairs(
            self.types
                .iter()
                .filter_map(|(k, t)| {
                    if let SetType::Scalar(_) = t {
                        Some((k, t))
                    } else {
                        None
                    }
                })
                .collect(),
        ) {
            definitions.push(print_single_definition(item, schema_being_extended))
        }

        for item in sorted_from_pairs(
            self.types
                .iter()
                .filter_map(|(k, t)| {
                    if let SetType::Enum(_) = t {
                        Some((k, t))
                    } else {
                        None
                    }
                })
                .collect(),
        ) {
            definitions.push(print_single_definition(item, schema_being_extended))
        }

        for item in sorted_from_pairs(
            self.types
                .iter()
                .filter_map(|(k, t)| {
                    if let SetType::InputObject(_) = t {
                        Some((k, t))
                    } else {
                        None
                    }
                })
                .collect(),
        ) {
            definitions.push(print_single_definition(item, schema_being_extended))
        }

        for item in sorted_from_pairs(
            self.types
                .iter()
                .filter_map(|(k, t)| {
                    if let SetType::Object(_) = t {
                        Some((k, t))
                    } else {
                        None
                    }
                })
                .collect(),
        ) {
            definitions.push(print_single_definition(item, schema_being_extended))
        }

        for item in sorted_from_pairs(
            self.types
                .iter()
                .filter_map(|(k, t)| {
                    if let SetType::Interface(_) = t {
                        Some((k, t))
                    } else {
                        None
                    }
                })
                .collect(),
        ) {
            definitions.push(print_single_definition(item, schema_being_extended))
        }

        for item in sorted_from_pairs(
            self.types
                .iter()
                .filter_map(|(k, t)| {
                    if let SetType::Union(_) = t {
                        Some((k, t))
                    } else {
                        None
                    }
                })
                .collect(),
        ) {
            definitions.push(print_single_definition(item, schema_being_extended))
        }

        definitions
    }
}

fn print_single_definition(item: &SetType, schema_being_extended: Option<&SchemaSet>) -> String {
    if schema_being_extended.is_some_and(|schema_being_extended| {
        schema_being_extended
            .types
            .contains_key(&item.string_key_name())
    }) {
        item.print_extend_definition()
    } else {
        item.print_definition()
    }
}

pub trait PrintableDefinition {
    fn print_definition(&self) -> String;
}
trait PrintableExtendDefinition:
    PrintableDefinition + CanBeClientDefinition + PartitionsBaseExtension
{
    fn print_extend_definition(&self) -> String {
        format!("extend {}", self.print_definition())
    }
}

impl PrintableDefinition for SetType {
    fn print_definition(&self) -> String {
        match self {
            SetType::Enum(t) => t.print_definition(),
            SetType::Scalar(t) => t.print_definition(),
            SetType::Object(t) => t.print_definition(),
            SetType::Interface(t) => t.print_definition(),
            SetType::Union(t) => t.print_definition(),
            SetType::InputObject(t) => t.print_definition(),
        }
    }
}

impl PrintableExtendDefinition for SetType {}

impl PrintableDefinition for SetRootSchema {
    fn print_definition(&self) -> String {
        let mut operation_types = Vec::new();
        if let Some(query_typename) = self.query_type {
            operation_types.push(format!("query: {}", query_typename));
        }
        if let Some(mutation_typename) = self.mutation_type {
            operation_types.push(format!("mutation: {}", mutation_typename));
        }
        if let Some(subscription_typename) = self.subscription_type {
            operation_types.push(format!("subscription: {}", subscription_typename));
        }

        let description = print_description(self);

        formatdoc!(
            r#"{description}schema{directives} {{
                  {operation_types}
                }}"#,
            description = description,
            directives = print_directive_values(self),
            operation_types = operation_types.join("\n  "),
        )
    }
}

impl PrintableDefinition for SetScalar {
    fn print_definition(&self) -> String {
        format!(
            "{}scalar {}{}",
            print_description(self),
            self.string_key_name(),
            print_directive_values(self)
        )
    }
}
impl PrintableExtendDefinition for SetScalar {}

/// We do not want to print out any built-in scalar types.
/// See https://spec.graphql.org/draft/#sec-Scalars.Built-in-Scalars
fn remove_built_in_scalars(schema_set: &SchemaSet) -> SchemaSet {
    let mut without_builtins_set = schema_set.clone();
    let builtin_scalar_names = [
        "Int".intern(),
        "Float".intern(),
        "String".intern(),
        "Boolean".intern(),
        "ID".intern(),
    ];
    for builtin_name in builtin_scalar_names {
        if let Some(SetType::Scalar(builtin_type)) = without_builtins_set.types.get(&builtin_name)
            && builtin_type.directives.is_empty()
        {
            without_builtins_set.types.remove(&builtin_name);
        }
    }
    without_builtins_set
}

#[allow(dead_code)]
pub trait PrintableBaseAndClientDefinition: CanBeClientDefinition {
    fn print_base_schema_definition(&self, schema_set: &SchemaSet) -> Option<String>;
    fn print_client_schema_definition(&self, schema_set: &SchemaSet) -> Option<String>;
}

impl PrintableDefinition for SetEnum {
    fn print_definition(&self) -> String {
        let printed_values = if self.values.is_empty() {
            String::new()
        } else {
            let field_separator = format!("\n{}", FIELD_INDENT);
            formatdoc!(
                r#" {{
                  {values}
                }}"#,
                values = self
                    .values
                    .values()
                    .map(print_enum_value)
                    .collect::<Vec<_>>()
                    .join(&field_separator),
            )
        };

        format!(
            "{description}enum {name}{directives}{values}",
            description = print_description(self),
            name = self.string_key_name(),
            directives = print_directive_values(self),
            values = printed_values,
        )
    }
}
impl PrintableExtendDefinition for SetEnum {}

fn print_enum_value(value: &schema::EnumValue) -> String {
    format!(
        "{}{}{}",
        format_description_string(value.description, FIELD_INDENT),
        value.value.lookup(),
        print_directive_value_items(&value.directives),
    )
}

impl PrintableDefinition for SetInputObject {
    fn print_definition(&self) -> String {
        let sorted_fields = sorted_from_index_map(&self.fields);

        let printed_fields = if sorted_fields.is_empty() {
            String::new()
        } else {
            let field_separator = format!("\n{}", FIELD_INDENT);
            formatdoc!(
                r#" {{
                  {fields}
                }}"#,
                fields = sorted_fields
                    .into_iter()
                    .map(print_input_field_with_description)
                    .collect::<Vec<_>>()
                    .join(&field_separator)
            )
        };
        format!(
            "{description}input {name}{directives}{fields}",
            description = print_description(self),
            name = self.string_key_name(),
            directives = print_directive_values(self),
            fields = printed_fields
        )
    }
}
impl PrintableExtendDefinition for SetInputObject {}

fn print_input_field_with_description(field: &SetArgument) -> String {
    format!(
        "{}{}",
        format_description_string(field.description(), FIELD_INDENT),
        field.print_definition(),
    )
}

impl PrintableDefinition for SetDirective {
    fn print_definition(&self) -> String {
        let mut sorted_locations = self
            .locations
            .iter()
            .map(|loc| loc.to_string())
            .collect::<Vec<_>>();

        sorted_locations.sort();
        let printed_locations = sorted_locations.join(" | ");
        format!(
            "{}directive @{name}{arguments} on {locations}",
            print_description(self),
            name = self.string_key_name(),
            arguments = print_arguments(&self.arguments),
            locations = printed_locations
        )
    }
}
impl PrintableExtendDefinition for SetDirective {}

impl PrintableDefinition for SetObject {
    fn print_definition(&self) -> String {
        format!(
            "{}type {}",
            print_description(self),
            print_composite_typedef(self)
        )
    }
}
impl PrintableExtendDefinition for SetObject {}

impl PrintableDefinition for SetInterface {
    fn print_definition(&self) -> String {
        format!(
            "{}interface {}",
            print_description(self),
            print_composite_typedef(self)
        )
    }
}
impl PrintableExtendDefinition for SetInterface {}

impl PrintableDefinition for SetUnion {
    fn print_definition(&self) -> String {
        let sorted_members = sorted_from_index_map(&self.members)
            .into_iter()
            .map(|s| s.name.lookup())
            .collect::<Vec<_>>();

        let printed_members = if sorted_members.is_empty() {
            "".to_string()
        } else {
            format!(" =\n  | {}", sorted_members.join("\n  | "))
        };

        format!(
            "{description}union {name}{directives_list}{members}",
            description = print_description(self),
            name = self.string_key_name(),
            directives_list = print_directive_values(self),
            members = printed_members
        )
    }
}

const FIELD_INDENT: &str = "  ";
const BLOCK_STRING_DELIMITER: &str = r#"""""#;

/// Formats a description string in GraphQL block string format.
/// Returns the formatted description followed by a newline (+ indent), or empty string if None.
fn format_description_string(desc: Option<StringKey>, indent: &str) -> String {
    let Some(d) = desc else {
        return String::new();
    };

    let content = d.lookup().trim();
    let sep = format!("\n{}", indent);

    if content.contains('\n') {
        let indented = content.replace('\n', &sep);
        format!("{BLOCK_STRING_DELIMITER}{sep}{indented}{sep}{BLOCK_STRING_DELIMITER}{sep}")
    } else {
        format!("{BLOCK_STRING_DELIMITER}{content}{BLOCK_STRING_DELIMITER}{sep}")
    }
}

fn print_description(item: &dyn HasDescription) -> String {
    format_description_string(item.description(), "")
}

impl PrintableExtendDefinition for SetUnion {}

impl PrintableDefinition for SetField {
    fn print_definition(&self) -> String {
        format!(
            "{name}{args}: {type_}{directives}",
            name = self.string_key_name(),
            args = print_arguments_with_indent(&self.arguments, FIELD_INDENT),
            type_ = print_output_type_reference(&self.type_),
            directives = print_directive_values(self)
        )
    }
}

impl PrintableDefinition for SetArgument {
    fn print_definition(&self) -> String {
        let printed_default_val = if let Some(default_val) = &self.default_value {
            format!(" = {}", default_val)
        } else {
            String::new()
        };
        format!(
            "{name}: {type_}{default_val}{directives}",
            name = self.string_key_name(),
            type_ = print_type_reference(&self.type_),
            default_val = printed_default_val,
            directives = print_directive_values(self),
        )
    }
}

/**
 * Sorts a HashMap<StringKey, T> into a Vec<&T>, sorted by the string-value of the StringKey.
 */
fn sorted_from_map<T>(map: &StringKeyMap<T>) -> Vec<&T> {
    let mut to_sort: Vec<(&StringKey, &T)> = map.iter().collect();
    // Sort the (key, value) pairs by key
    to_sort.sort_by(|(a_key, _a_v), (b_key, _b_v)| a_key.cmp(b_key));
    // Then collect a ref of values
    to_sort.into_iter().map(|(_, v)| v).collect()
}

// We should NOT be sorting index map members, but doing so to preserve used schema printing order!
fn sorted_from_index_map<T>(map: &StringKeyIndexMap<T>) -> Vec<&T> {
    let mut to_sort: Vec<(&StringKey, &T)> = map.iter().collect();
    // Sort the (key, value) pairs by key
    to_sort.sort_by(|(a_key, _a_v), (b_key, _b_v)| a_key.cmp(b_key));
    // Then collect a ref of values
    to_sort.into_iter().map(|(_, v)| v).collect()
}

fn sorted_from_pairs<'a, T>(to_sort: Vec<(&'a StringKey, &'a T)>) -> Vec<&'a T> {
    let mut to_sort = to_sort;
    // Sort the (key, value) pairs by key
    to_sort.sort_by(|(a_key, _a_v), (b_key, _b_v)| a_key.cmp(b_key));
    // Then collect a ref of values
    to_sort.into_iter().map(|(_, v)| v).collect()
}

fn print_composite_typedef<
    UsedType: StringKeyNamed + HasInterfaces + HasFields + CanHaveDirectives,
>(
    set_type: &UsedType,
) -> String {
    let sorted_interfaces: Vec<&SetMemberType> = sorted_from_index_map(set_type.interfaces());

    let interfaces_list = if sorted_interfaces.is_empty() {
        String::new()
    } else {
        format!(
            " implements {}",
            sorted_interfaces
                .iter()
                .map(|s| s.name.lookup())
                .collect::<Vec<_>>()
                .join(" & ")
        )
    };

    let decl = format!(
        "{name}{interfaces_list}{directives_list}",
        name = set_type.string_key_name(),
        interfaces_list = interfaces_list,
        directives_list = print_directive_values(set_type),
    );

    let sorted_fields = sorted_from_map(set_type.fields());
    if sorted_fields.is_empty() {
        decl
    } else {
        let field_separator = format!("\n{}", FIELD_INDENT);
        let printed_fields = sorted_fields
            .iter()
            .map(|set_field| print_field_with_description(set_field))
            .collect::<Vec<_>>()
            .join(&field_separator);
        formatdoc!(
            r#"{decl} {{
              {fields_list}
            }}"#,
            decl = decl,
            fields_list = printed_fields,
        )
    }
}

fn print_field_with_description(field: &SetField) -> String {
    format!(
        "{}{}",
        format_description_string(field.description(), FIELD_INDENT),
        field.print_definition()
    )
}

fn print_arguments(set_arguments: &StringKeyIndexMap<SetArgument>) -> String {
    print_arguments_with_indent(set_arguments, "")
}

fn print_arguments_with_indent(
    set_arguments: &StringKeyIndexMap<SetArgument>,
    current_indent: &str,
) -> String {
    if set_arguments.is_empty() {
        String::new()
    } else {
        // Arguments are stored in insertion-order, but used-schema has historically had arguments printed in alphabetical order.
        let sorted_arguments = sorted_from_index_map(set_arguments);

        // Check if any argument has a description
        let has_descriptions = sorted_arguments
            .iter()
            .any(|arg| arg.description().is_some());

        if has_descriptions {
            // Multi-line format with descriptions
            let arg_indent = format!("{}{}", current_indent, FIELD_INDENT);
            let arg_separator = format!("\n{}", arg_indent);
            format!(
                "(\n{}{}\n{})",
                arg_indent,
                sorted_arguments
                    .iter()
                    .map(|arg| print_argument_with_description(arg, &arg_indent))
                    .collect::<Vec<_>>()
                    .join(&arg_separator),
                current_indent
            )
        } else {
            // Single-line format without descriptions
            format!(
                "({})",
                sorted_arguments
                    .iter()
                    .map(|set_argument| set_argument.print_definition())
                    .collect::<Vec<_>>()
                    .join(", ")
            )
        }
    }
}

fn print_argument_with_description(arg: &SetArgument, indent: &str) -> String {
    format!(
        "{}{}{}",
        format_description_string(arg.description(), indent),
        arg.print_definition(),
        print_directive_value_items(&arg.directives),
    )
}

fn print_directive_values(item: &dyn CanHaveDirectives) -> String {
    print_directive_value_items(item.directives())
}

fn print_directive_value_items(directives: &[DirectiveValue]) -> String {
    if directives.is_empty() {
        String::new()
    } else {
        format!(
            " {}",
            directives
                .iter()
                .map(print_directive_value)
                .collect::<Vec<_>>()
                .join(" ")
        )
    }
}

fn print_directive_value(directive: &DirectiveValue) -> String {
    let printed_args = if directive.arguments.is_empty() {
        String::new()
    } else {
        format!(
            "({})",
            directive
                .arguments
                .iter()
                .map(print_argument_value)
                .collect::<Vec<_>>()
                .join(", ")
        )
    };

    format!(
        "@{name}{args}",
        name = directive.name.0,
        args = printed_args
    )
}

fn print_argument_value(arg: &ArgumentValue) -> String {
    format!("{}: {}", arg.name.0, arg.value)
}

fn print_type_reference(type_reference: &TypeReference<StringKey>) -> String {
    match type_reference {
        TypeReference::Named(t) => t.to_string(),
        TypeReference::NonNull(t) => format!("{}!", print_type_reference(t)),
        TypeReference::List(t) => format!("[{}]", print_type_reference(t)),
    }
}

fn print_output_type_reference(type_reference: &OutputTypeReference<StringKey>) -> String {
    let (type_reference_sdl, semantic_non_null) =
        output_type_ref_to_semantic_sdl_type(type_reference);
    if let Some(semantic_non_null_directive) = semantic_non_null {
        format!("{} {}", type_reference_sdl, semantic_non_null_directive)
    } else {
        format!("{}", type_reference_sdl)
    }
}
