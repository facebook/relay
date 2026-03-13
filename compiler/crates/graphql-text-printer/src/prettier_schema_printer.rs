/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Prettier-compatible SDL printer for GraphQL schema documents.
//!
//! This module provides formatting that matches prettier-graphql output,
//! ensuring that generated SDL files don't trigger PRETTIERGRAPHQL lint errors.
//!
//! Uses the `pretty` crate for declarative document-based formatting.

use graphql_syntax::ConstantDirective;
use graphql_syntax::ConstantValue;
use graphql_syntax::DirectiveDefinition;
use graphql_syntax::DirectiveLocation;
use graphql_syntax::EnumTypeDefinition;
use graphql_syntax::EnumTypeExtension;
use graphql_syntax::EnumValueDefinition;
use graphql_syntax::FieldDefinition;
use graphql_syntax::Identifier;
use graphql_syntax::InputObjectTypeDefinition;
use graphql_syntax::InputObjectTypeExtension;
use graphql_syntax::InputValueDefinition;
use graphql_syntax::InterfaceTypeDefinition;
use graphql_syntax::InterfaceTypeExtension;
use graphql_syntax::ObjectTypeDefinition;
use graphql_syntax::ObjectTypeExtension;
use graphql_syntax::OperationTypeDefinition;
use graphql_syntax::ScalarTypeDefinition;
use graphql_syntax::ScalarTypeExtension;
use graphql_syntax::SchemaDefinition;
use graphql_syntax::SchemaDocument;
use graphql_syntax::SchemaExtension;
use graphql_syntax::StringNode;
use graphql_syntax::TypeSystemDefinition;
use graphql_syntax::UnionTypeDefinition;
use graphql_syntax::UnionTypeExtension;
use pretty::RcDoc;

use crate::prettier_doc_builders::INDENT_WIDTH;
use crate::prettier_doc_builders::LINE_WIDTH;
use crate::prettier_doc_builders::constant_argument_doc;
use crate::prettier_doc_builders::constant_directive_doc;
use crate::prettier_doc_builders::constant_directives_doc;
use crate::prettier_doc_builders::constant_value_doc;
use crate::prettier_doc_builders::render_doc;
use crate::prettier_doc_builders::type_annotation_doc;

/// Prints a SchemaDocument in prettier-graphql compatible format.
///
/// This function produces SDL output that matches prettier-graphql formatting,
/// avoiding PRETTIERGRAPHQL lint errors in generated files.
pub fn prettier_print_schema_document(document: &SchemaDocument) -> String {
    let docs: Vec<RcDoc<'static, ()>> = document
        .definitions
        .iter()
        .map(type_system_definition_doc)
        .collect();

    if docs.is_empty() {
        return String::new();
    }

    let doc = RcDoc::intersperse(docs, RcDoc::hardline());
    render_doc(doc, LINE_WIDTH)
}

/// Prints a TypeSystemDefinition in prettier-graphql compatible format.
pub fn prettier_print_type_system_definition(definition: &TypeSystemDefinition) -> String {
    let doc = type_system_definition_doc(definition);
    render_doc(doc, LINE_WIDTH)
}

fn type_system_definition_doc(definition: &TypeSystemDefinition) -> RcDoc<'static, ()> {
    match definition {
        TypeSystemDefinition::SchemaDefinition(def) => schema_definition_doc(def),
        TypeSystemDefinition::SchemaExtension(ext) => schema_extension_doc(ext),
        TypeSystemDefinition::ObjectTypeDefinition(def) => object_type_definition_doc(def),
        TypeSystemDefinition::ObjectTypeExtension(ext) => object_type_extension_doc(ext),
        TypeSystemDefinition::InterfaceTypeDefinition(def) => interface_type_definition_doc(def),
        TypeSystemDefinition::InterfaceTypeExtension(ext) => interface_type_extension_doc(ext),
        TypeSystemDefinition::UnionTypeDefinition(def) => union_type_definition_doc(def),
        TypeSystemDefinition::UnionTypeExtension(ext) => union_type_extension_doc(ext),
        TypeSystemDefinition::EnumTypeDefinition(def) => enum_type_definition_doc(def),
        TypeSystemDefinition::EnumTypeExtension(ext) => enum_type_extension_doc(ext),
        TypeSystemDefinition::InputObjectTypeDefinition(def) => {
            input_object_type_definition_doc(def)
        }
        TypeSystemDefinition::InputObjectTypeExtension(ext) => input_object_type_extension_doc(ext),
        TypeSystemDefinition::ScalarTypeDefinition(def) => scalar_type_definition_doc(def),
        TypeSystemDefinition::ScalarTypeExtension(ext) => scalar_type_extension_doc(ext),
        TypeSystemDefinition::DirectiveDefinition(def) => directive_definition_doc(def),
    }
}

// =============================================================================
// Schema Definition/Extension
// =============================================================================

fn schema_definition_doc(def: &SchemaDefinition) -> RcDoc<'static, ()> {
    let mut doc = description_doc(&def.description, "");
    doc = doc.append(RcDoc::text("schema"));

    let has_fields = !def.operation_types.items.is_empty();
    doc = doc.append(directives_with_suffix_doc(
        &def.directives,
        "schema".len(),
        if has_fields { 2 } else { 0 },
        INDENT_WIDTH,
    ));

    if has_fields {
        doc = doc.append(operation_type_fields_doc(&def.operation_types.items));
    }

    doc.append(RcDoc::hardline())
}

fn schema_extension_doc(ext: &SchemaExtension) -> RcDoc<'static, ()> {
    let mut doc = RcDoc::text("extend schema");

    let has_fields = ext.operation_types.is_some();
    doc = doc.append(directives_with_suffix_doc(
        &ext.directives,
        "extend schema".len(),
        if has_fields { 2 } else { 0 },
        INDENT_WIDTH,
    ));

    if let Some(ref operation_types) = ext.operation_types {
        doc = doc.append(operation_type_fields_doc(&operation_types.items));
    }

    doc.append(RcDoc::hardline())
}

fn operation_type_fields_doc(fields: &[OperationTypeDefinition]) -> RcDoc<'static, ()> {
    if fields.is_empty() {
        return RcDoc::nil();
    }

    let field_docs: Vec<RcDoc<'static, ()>> = fields
        .iter()
        .map(|field| {
            RcDoc::text("  ")
                .append(RcDoc::text(field.operation.to_string()))
                .append(RcDoc::text(": "))
                .append(RcDoc::text(field.type_.to_string()))
        })
        .collect();

    RcDoc::text(" {")
        .append(RcDoc::hardline())
        .append(RcDoc::intersperse(field_docs, RcDoc::hardline()))
        .append(RcDoc::hardline())
        .append(RcDoc::text("}"))
}

// =============================================================================
// Object Type Definition/Extension
// =============================================================================

fn object_type_definition_doc(def: &ObjectTypeDefinition) -> RcDoc<'static, ()> {
    let mut doc = description_doc(&def.description, "");
    doc = doc.append(RcDoc::text("type "));
    doc = doc.append(RcDoc::text(def.name.value.to_string()));
    doc = doc.append(implements_interfaces_doc(&def.interfaces));

    let prefix_len = compute_type_prefix_len("type ", &def.name.value, &def.interfaces);
    let has_fields = def.fields.is_some();

    doc = doc.append(directives_with_suffix_doc(
        &def.directives,
        prefix_len,
        if has_fields { 2 } else { 0 },
        INDENT_WIDTH,
    ));

    if let Some(ref fields) = def.fields {
        doc = doc.append(field_definitions_doc(&fields.items));
    }

    doc.append(RcDoc::hardline())
}

fn object_type_extension_doc(ext: &ObjectTypeExtension) -> RcDoc<'static, ()> {
    let mut doc = RcDoc::text("extend type ");
    doc = doc.append(RcDoc::text(ext.name.value.to_string()));
    doc = doc.append(implements_interfaces_doc(&ext.interfaces));

    let prefix_len = compute_type_prefix_len("extend type ", &ext.name.value, &ext.interfaces);
    let has_fields = ext.fields.is_some();

    doc = doc.append(directives_with_suffix_doc(
        &ext.directives,
        prefix_len,
        if has_fields { 2 } else { 0 },
        INDENT_WIDTH,
    ));

    if let Some(ref fields) = ext.fields {
        doc = doc.append(field_definitions_doc(&fields.items));
    }

    doc.append(RcDoc::hardline())
}

// =============================================================================
// Interface Type Definition/Extension
// =============================================================================

fn interface_type_definition_doc(def: &InterfaceTypeDefinition) -> RcDoc<'static, ()> {
    let mut doc = description_doc(&def.description, "");
    doc = doc.append(RcDoc::text("interface "));
    doc = doc.append(RcDoc::text(def.name.value.to_string()));
    doc = doc.append(implements_interfaces_doc(&def.interfaces));

    let prefix_len = compute_type_prefix_len("interface ", &def.name.value, &def.interfaces);
    let has_fields = def.fields.is_some();

    doc = doc.append(directives_with_suffix_doc(
        &def.directives,
        prefix_len,
        if has_fields { 2 } else { 0 },
        INDENT_WIDTH,
    ));

    if let Some(ref fields) = def.fields {
        doc = doc.append(field_definitions_doc(&fields.items));
    }

    doc.append(RcDoc::hardline())
}

fn interface_type_extension_doc(ext: &InterfaceTypeExtension) -> RcDoc<'static, ()> {
    let mut doc = RcDoc::text("extend interface ");
    doc = doc.append(RcDoc::text(ext.name.value.to_string()));
    doc = doc.append(implements_interfaces_doc(&ext.interfaces));

    let prefix_len = compute_type_prefix_len("extend interface ", &ext.name.value, &ext.interfaces);
    let has_fields = ext.fields.is_some();

    doc = doc.append(directives_with_suffix_doc(
        &ext.directives,
        prefix_len,
        if has_fields { 2 } else { 0 },
        INDENT_WIDTH,
    ));

    if let Some(ref fields) = ext.fields {
        doc = doc.append(field_definitions_doc(&fields.items));
    }

    doc.append(RcDoc::hardline())
}

fn implements_interfaces_doc(interfaces: &[Identifier]) -> RcDoc<'static, ()> {
    if interfaces.is_empty() {
        return RcDoc::nil();
    }

    let interface_names: Vec<String> = interfaces.iter().map(|i| i.value.to_string()).collect();
    RcDoc::text(" implements ").append(RcDoc::text(interface_names.join(" & ")))
}

fn compute_type_prefix_len(
    keyword: &str,
    name: &intern::string_key::StringKey,
    interfaces: &[Identifier],
) -> usize {
    let mut len = keyword.len() + name.to_string().len();
    if !interfaces.is_empty() {
        len += " implements ".len();
        let interface_names: Vec<String> = interfaces.iter().map(|i| i.value.to_string()).collect();
        len += interface_names.join(" & ").len();
    }
    len
}

// =============================================================================
// Union Type Definition/Extension
// =============================================================================

fn union_type_definition_doc(def: &UnionTypeDefinition) -> RcDoc<'static, ()> {
    let mut doc = description_doc(&def.description, "");
    doc = doc.append(RcDoc::text("union "));
    doc = doc.append(RcDoc::text(def.name.value.to_string()));

    let prefix_len = "union ".len() + def.name.value.to_string().len();
    let has_members = !def.members.is_empty();

    // For unions, we need to track if directives broke to force member expansion
    let (directive_doc, directives_inline) =
        directives_with_breaking_info(&def.directives, prefix_len, if has_members { 2 } else { 0 });

    doc = doc.append(directive_doc);

    if has_members {
        doc = doc.append(union_members_doc(
            &def.members,
            prefix_len,
            !directives_inline,
        ));
    }

    doc.append(RcDoc::hardline())
}

fn union_type_extension_doc(ext: &UnionTypeExtension) -> RcDoc<'static, ()> {
    let mut doc = RcDoc::text("extend union ");
    doc = doc.append(RcDoc::text(ext.name.value.to_string()));

    let prefix_len = "extend union ".len() + ext.name.value.to_string().len();
    let has_members = !ext.members.is_empty();

    let (directive_doc, directives_inline) =
        directives_with_breaking_info(&ext.directives, prefix_len, if has_members { 2 } else { 0 });

    doc = doc.append(directive_doc);

    if has_members {
        doc = doc.append(union_members_doc(
            &ext.members,
            prefix_len,
            !directives_inline,
        ));
    }

    doc.append(RcDoc::hardline())
}

fn union_members_doc(
    members: &[Identifier],
    prefix_len: usize,
    force_expanded: bool,
) -> RcDoc<'static, ()> {
    if members.is_empty() {
        return RcDoc::nil();
    }

    let member_names: Vec<String> = members.iter().map(|m| m.value.to_string()).collect();
    let single_line = format!(" = {}", member_names.join(" | "));

    // Calculate total line length including prefix (e.g., "union Name")
    let total_line_len = prefix_len + single_line.len();

    // If directives broke or inline is too long, expand
    if force_expanded || total_line_len > LINE_WIDTH {
        let member_docs: Vec<RcDoc<'static, ()>> = member_names
            .iter()
            .map(|m| RcDoc::text("  | ").append(RcDoc::text(m.clone())))
            .collect();

        RcDoc::text(" =")
            .append(RcDoc::hardline())
            .append(RcDoc::intersperse(member_docs, RcDoc::hardline()))
    } else {
        RcDoc::text(single_line)
    }
}

// =============================================================================
// Enum Type Definition/Extension
// =============================================================================

fn enum_type_definition_doc(def: &EnumTypeDefinition) -> RcDoc<'static, ()> {
    let mut doc = description_doc(&def.description, "");
    doc = doc.append(RcDoc::text("enum "));
    doc = doc.append(RcDoc::text(def.name.value.to_string()));

    let prefix_len = "enum ".len() + def.name.value.to_string().len();
    let has_values = def.values.is_some();

    doc = doc.append(directives_with_suffix_doc(
        &def.directives,
        prefix_len,
        if has_values { 2 } else { 0 },
        INDENT_WIDTH,
    ));

    if let Some(ref values) = def.values {
        doc = doc.append(enum_values_doc(&values.items));
    }

    doc.append(RcDoc::hardline())
}

fn enum_type_extension_doc(ext: &EnumTypeExtension) -> RcDoc<'static, ()> {
    let mut doc = RcDoc::text("extend enum ");
    doc = doc.append(RcDoc::text(ext.name.value.to_string()));

    let prefix_len = "extend enum ".len() + ext.name.value.to_string().len();
    let has_values = ext.values.is_some();

    doc = doc.append(directives_with_suffix_doc(
        &ext.directives,
        prefix_len,
        if has_values { 2 } else { 0 },
        INDENT_WIDTH,
    ));

    if let Some(ref values) = ext.values {
        doc = doc.append(enum_values_doc(&values.items));
    }

    doc.append(RcDoc::hardline())
}

fn enum_values_doc(values: &[EnumValueDefinition]) -> RcDoc<'static, ()> {
    if values.is_empty() {
        return RcDoc::nil();
    }

    let value_docs: Vec<RcDoc<'static, ()>> = values.iter().map(enum_value_doc).collect();

    RcDoc::text(" {")
        .append(RcDoc::hardline())
        .append(RcDoc::intersperse(value_docs, RcDoc::hardline()))
        .append(RcDoc::hardline())
        .append(RcDoc::text("}"))
}

fn enum_value_doc(value: &EnumValueDefinition) -> RcDoc<'static, ()> {
    let mut doc = description_doc(&value.description, "  ");
    doc = doc.append(RcDoc::text("  "));
    doc = doc.append(RcDoc::text(value.name.value.to_string()));

    let prefix_len = 2 + value.name.value.to_string().len();
    doc = doc.append(directives_with_suffix_doc(
        &value.directives,
        prefix_len,
        0,
        INDENT_WIDTH * 2,
    ));

    doc
}

// =============================================================================
// Input Object Type Definition/Extension
// =============================================================================

fn input_object_type_definition_doc(def: &InputObjectTypeDefinition) -> RcDoc<'static, ()> {
    let mut doc = description_doc(&def.description, "");
    doc = doc.append(RcDoc::text("input "));
    doc = doc.append(RcDoc::text(def.name.value.to_string()));

    let prefix_len = "input ".len() + def.name.value.to_string().len();
    let has_fields = def.fields.is_some();

    doc = doc.append(directives_with_suffix_doc(
        &def.directives,
        prefix_len,
        if has_fields { 2 } else { 0 },
        INDENT_WIDTH,
    ));

    if let Some(ref fields) = def.fields {
        doc = doc.append(input_fields_doc(&fields.items));
    }

    doc.append(RcDoc::hardline())
}

fn input_object_type_extension_doc(ext: &InputObjectTypeExtension) -> RcDoc<'static, ()> {
    let mut doc = RcDoc::text("extend input ");
    doc = doc.append(RcDoc::text(ext.name.value.to_string()));

    let prefix_len = "extend input ".len() + ext.name.value.to_string().len();
    let has_fields = ext.fields.is_some();

    doc = doc.append(directives_with_suffix_doc(
        &ext.directives,
        prefix_len,
        if has_fields { 2 } else { 0 },
        INDENT_WIDTH,
    ));

    if let Some(ref fields) = ext.fields {
        doc = doc.append(input_fields_doc(&fields.items));
    }

    doc.append(RcDoc::hardline())
}

fn input_fields_doc(fields: &[InputValueDefinition]) -> RcDoc<'static, ()> {
    if fields.is_empty() {
        return RcDoc::nil();
    }

    let field_docs: Vec<RcDoc<'static, ()>> = fields
        .iter()
        .map(|f| input_field_doc(f, INDENT_WIDTH * 2))
        .collect();

    RcDoc::text(" {")
        .append(RcDoc::hardline())
        .append(RcDoc::intersperse(field_docs, RcDoc::hardline()))
        .append(RcDoc::hardline())
        .append(RcDoc::text("}"))
}

fn input_field_doc(input: &InputValueDefinition, directive_indent: isize) -> RcDoc<'static, ()> {
    let mut doc = description_doc(&input.description, "  ");
    doc = doc.append(RcDoc::text("  "));
    // Base indent for input fields is 2 spaces
    doc = doc.append(input_value_definition_doc(input, 2, directive_indent));
    doc
}

// =============================================================================
// Scalar Type Definition/Extension
// =============================================================================

fn scalar_type_definition_doc(def: &ScalarTypeDefinition) -> RcDoc<'static, ()> {
    let mut doc = description_doc(&def.description, "");
    doc = doc.append(RcDoc::text("scalar "));
    doc = doc.append(RcDoc::text(def.name.value.to_string()));

    let prefix_len = "scalar ".len() + def.name.value.to_string().len();
    doc = doc.append(directives_with_suffix_doc(
        &def.directives,
        prefix_len,
        0,
        INDENT_WIDTH,
    ));

    doc.append(RcDoc::hardline())
}

fn scalar_type_extension_doc(ext: &ScalarTypeExtension) -> RcDoc<'static, ()> {
    let mut doc = RcDoc::text("extend scalar ");
    doc = doc.append(RcDoc::text(ext.name.value.to_string()));

    let prefix_len = "extend scalar ".len() + ext.name.value.to_string().len();
    doc = doc.append(directives_with_suffix_doc(
        &ext.directives,
        prefix_len,
        0,
        INDENT_WIDTH,
    ));

    doc.append(RcDoc::hardline())
}

// =============================================================================
// Directive Definition
// =============================================================================

fn directive_definition_doc(def: &DirectiveDefinition) -> RcDoc<'static, ()> {
    let mut doc = description_doc(&def.description, "");
    doc = doc.append(RcDoc::text("directive @"));
    doc = doc.append(RcDoc::text(def.name.value.to_string()));

    let args = def.arguments.as_ref().map(|a| &a.items[..]);
    let locations_str = format_locations_inline(&def.locations);
    let repeatable_str = if def.repeatable { " repeatable" } else { "" };

    let prefix = format!("directive @{}", def.name.value);
    let args_inline = args.map_or(String::new(), format_arguments_single_line);
    let suffix = format!("{} on {}", repeatable_str, locations_str);

    let has_arg_descriptions = args.is_some_and(|a| a.iter().any(|arg| arg.description.is_some()));

    if !has_arg_descriptions && prefix.len() + args_inline.len() + suffix.len() <= LINE_WIDTH {
        // Everything fits on one line
        if let Some(arguments) = args.filter(|a| !a.is_empty()) {
            doc = doc.append(RcDoc::text(format_arguments_single_line(arguments)));
        }
        doc = doc.append(RcDoc::text(suffix));
    } else {
        // Expanded form
        if let Some(arguments) = args.filter(|a| !a.is_empty()) {
            let arg_docs: Vec<RcDoc<'static, ()>> = arguments
                .iter()
                .map(|arg| {
                    let mut arg_doc = description_doc(&arg.description, "  ");
                    // Base indent for directive definition args is 2 spaces
                    arg_doc = arg_doc.append(RcDoc::text("  ").append(input_value_definition_doc(
                        arg,
                        2,
                        INDENT_WIDTH * 2,
                    )));
                    arg_doc
                })
                .collect();

            doc = doc
                .append(RcDoc::text("("))
                .append(RcDoc::hardline())
                .append(RcDoc::intersperse(arg_docs, RcDoc::hardline()))
                .append(RcDoc::hardline())
                .append(RcDoc::text(")"));
        }
        doc = doc
            .append(RcDoc::text(repeatable_str))
            .append(RcDoc::text(" on "))
            .append(RcDoc::text(locations_str));
    }

    doc.append(RcDoc::hardline())
}

fn format_locations_inline(locations: &[DirectiveLocation]) -> String {
    locations
        .iter()
        .map(|l| l.to_string())
        .collect::<Vec<_>>()
        .join(" | ")
}

// =============================================================================
// Field Definitions
// =============================================================================

fn field_definitions_doc(fields: &[FieldDefinition]) -> RcDoc<'static, ()> {
    if fields.is_empty() {
        return RcDoc::nil();
    }

    let field_docs: Vec<RcDoc<'static, ()>> = fields.iter().map(field_definition_doc).collect();

    RcDoc::text(" {")
        .append(RcDoc::hardline())
        .append(RcDoc::intersperse(field_docs, RcDoc::hardline()))
        .append(RcDoc::hardline())
        .append(RcDoc::text("}"))
}

fn field_definition_doc(field: &FieldDefinition) -> RcDoc<'static, ()> {
    let mut doc = description_doc(&field.description, "  ");
    doc = doc.append(RcDoc::text("  "));
    doc = doc.append(RcDoc::text(field.name.value.to_string()));

    let type_str = render_doc(type_annotation_doc(&field.type_), LINE_WIDTH);
    let suffix_len = ": ".len() + type_str.len();
    let has_directives = !field.directives.is_empty();

    if let Some(ref arguments) = field.arguments {
        doc = doc.append(arguments_definition_doc(
            &arguments.items,
            &field.name.value.to_string(),
            suffix_len,
            has_directives,
        ));
    }

    doc = doc.append(RcDoc::text(": ")).append(RcDoc::text(type_str));

    // Add directives with breaking
    if !field.directives.is_empty() {
        let current_line_estimate = 2 + field.name.value.to_string().len() + suffix_len;
        doc = doc.append(directives_with_suffix_doc(
            &field.directives,
            current_line_estimate,
            0,
            INDENT_WIDTH * 2,
        ));
    }

    doc
}

fn arguments_definition_doc(
    arguments: &[InputValueDefinition],
    context: &str,
    suffix_len: usize,
    has_following_directives: bool,
) -> RcDoc<'static, ()> {
    if arguments.is_empty() {
        return RcDoc::nil();
    }

    let single_line = format_arguments_single_line(arguments);
    let prefix_len = 2 + context.len(); // 2 for indent

    let has_descriptions = arguments.iter().any(|a| a.description.is_some());
    let total_len = prefix_len + single_line.len() + suffix_len;

    let fits = if has_following_directives {
        total_len < LINE_WIDTH
    } else {
        total_len <= LINE_WIDTH
    };

    if !has_descriptions && fits {
        RcDoc::text(single_line)
    } else {
        // Expanded form
        let arg_docs: Vec<RcDoc<'static, ()>> = arguments
            .iter()
            .map(|arg| {
                let mut arg_doc = description_doc(&arg.description, "    ");
                // Base indent for field args is 4 spaces, directive break adds 2 more = 6 total
                arg_doc = arg_doc.append(RcDoc::text("    ").append(input_value_definition_doc(
                    arg,
                    4,
                    INDENT_WIDTH * 3,
                )));
                arg_doc
            })
            .collect();

        RcDoc::text("(")
            .append(RcDoc::hardline())
            .append(RcDoc::intersperse(arg_docs, RcDoc::hardline()))
            .append(RcDoc::hardline())
            .append(RcDoc::text("  )"))
    }
}

fn format_arguments_single_line(arguments: &[InputValueDefinition]) -> String {
    let args: Vec<String> = arguments.iter().map(format_input_value).collect();
    format!("({})", args.join(", "))
}

fn format_input_value(input: &InputValueDefinition) -> String {
    let type_str = render_doc(type_annotation_doc(&input.type_), LINE_WIDTH);
    let mut result = format!("{}: {}", input.name.value, type_str);

    if let Some(ref default_value) = input.default_value {
        result.push_str(" = ");
        result.push_str(&render_doc(
            constant_value_doc(&default_value.value),
            LINE_WIDTH,
        ));
    }

    if !input.directives.is_empty() {
        result.push(' ');
        result.push_str(&render_doc(
            constant_directives_doc(&input.directives),
            LINE_WIDTH,
        ));
    }

    result
}

fn input_value_definition_doc(
    input: &InputValueDefinition,
    base_indent: usize,
    directive_break_indent: isize,
) -> RcDoc<'static, ()> {
    let mut doc = RcDoc::text(input.name.value.to_string());
    doc = doc.append(RcDoc::text(": "));
    let type_str = render_doc(type_annotation_doc(&input.type_), LINE_WIDTH);
    doc = doc.append(RcDoc::text(type_str.clone()));

    // Calculate the full line position: base_indent + name + ": " + type
    let current_pos = base_indent + input.name.value.to_string().len() + 2 + type_str.len();

    if let Some(ref default_value) = input.default_value {
        doc = doc.append(RcDoc::text(" = "));

        // Check if this is an empty list - special handling
        match &default_value.value {
            ConstantValue::List(list) if list.items.is_empty() => {
                // Check if the line with " = []" would exceed LINE_WIDTH
                // current_pos + " = ".len() + "[]".len() = current_pos + 5
                if current_pos + 5 > LINE_WIDTH {
                    // Expand empty list to [\n\n] with proper indent
                    let indent_str = " ".repeat(base_indent);
                    doc = doc
                        .append(RcDoc::text("["))
                        .append(RcDoc::hardline())
                        .append(RcDoc::hardline())
                        .append(RcDoc::text(indent_str))
                        .append(RcDoc::text("]"));
                } else {
                    doc = doc.append(RcDoc::text("[]"));
                }
            }
            _ => {
                doc = doc.append(constant_value_doc(&default_value.value));
            }
        }
    }

    if !input.directives.is_empty() {
        doc = doc.append(directives_with_suffix_doc(
            &input.directives,
            current_pos,
            0,
            directive_break_indent,
        ));
    }

    doc
}

// =============================================================================
// Description
// =============================================================================

fn description_doc(description: &Option<StringNode>, indent: &str) -> RcDoc<'static, ()> {
    match description {
        Some(desc) => {
            let value = desc.value.to_string();
            let indent_doc = RcDoc::text(indent.to_string());

            if value.contains('\n') {
                // Multi-line block string
                let mut doc = indent_doc.clone().append(RcDoc::text("\"\"\"\n"));
                for line in value.lines() {
                    doc = doc
                        .append(RcDoc::text(indent.to_string()))
                        .append(RcDoc::text(line.to_string()))
                        .append(RcDoc::text("\n"));
                }
                doc = doc
                    .append(RcDoc::text(indent.to_string()))
                    .append(RcDoc::text("\"\"\"\n"));
                doc
            } else {
                // Single-line block string (but formatted as block)
                indent_doc
                    .clone()
                    .append(RcDoc::text("\"\"\"\n"))
                    .append(RcDoc::text(indent.to_string()))
                    .append(RcDoc::text(value))
                    .append(RcDoc::text("\n"))
                    .append(RcDoc::text(indent.to_string()))
                    .append(RcDoc::text("\"\"\"\n"))
            }
        }
        None => RcDoc::nil(),
    }
}

// =============================================================================
// Directives with Breaking
// =============================================================================

/// Returns a document for directives, handling line-width breaking.
/// This simulates the old `print_directives_with_breaking` behavior.
fn directives_with_suffix_doc(
    directives: &[ConstantDirective],
    prefix_len: usize,
    suffix_len: usize,
    break_indent: isize,
) -> RcDoc<'static, ()> {
    if directives.is_empty() {
        return RcDoc::nil();
    }

    let inline = format!(
        " {}",
        render_doc(constant_directives_doc(directives), LINE_WIDTH)
    );

    if prefix_len + inline.len() + suffix_len <= LINE_WIDTH {
        // Fits inline
        RcDoc::text(inline)
    } else {
        // Need to break directives
        let break_indent_str = " ".repeat(break_indent as usize);
        let mut docs: Vec<RcDoc<'static, ()>> = Vec::new();

        for (idx, directive) in directives.iter().enumerate() {
            let directive_str = render_doc(constant_directive_doc(directive), LINE_WIDTH);
            let is_last = idx == directives.len() - 1;
            let effective_suffix = if is_last { suffix_len } else { 0 };

            if break_indent_str.len() + directive_str.len() + effective_suffix <= LINE_WIDTH {
                // Directive fits on its own line
                docs.push(
                    RcDoc::hardline()
                        .append(RcDoc::text(break_indent_str.clone()))
                        .append(RcDoc::text(directive_str)),
                );
            } else {
                // Need to expand the directive
                docs.push(
                    RcDoc::hardline().append(expanded_directive_doc(directive, &break_indent_str)),
                );
            }
        }

        RcDoc::concat(docs)
    }
}

/// Returns (doc, is_inline) - used by union to track if directives broke
fn directives_with_breaking_info(
    directives: &[ConstantDirective],
    prefix_len: usize,
    suffix_len: usize,
) -> (RcDoc<'static, ()>, bool) {
    if directives.is_empty() {
        return (RcDoc::nil(), true);
    }

    let inline = format!(
        " {}",
        render_doc(constant_directives_doc(directives), LINE_WIDTH)
    );

    if prefix_len + inline.len() + suffix_len <= LINE_WIDTH {
        (RcDoc::text(inline), true)
    } else {
        let break_indent_str = "  ";
        let mut docs: Vec<RcDoc<'static, ()>> = Vec::new();

        for (idx, directive) in directives.iter().enumerate() {
            let directive_str = render_doc(constant_directive_doc(directive), LINE_WIDTH);
            let is_last = idx == directives.len() - 1;
            let effective_suffix = if is_last { suffix_len } else { 0 };

            if break_indent_str.len() + directive_str.len() + effective_suffix <= LINE_WIDTH {
                docs.push(
                    RcDoc::hardline()
                        .append(RcDoc::text(break_indent_str))
                        .append(RcDoc::text(directive_str)),
                );
            } else {
                docs.push(
                    RcDoc::hardline().append(expanded_directive_doc(directive, break_indent_str)),
                );
            }
        }

        (RcDoc::concat(docs), false)
    }
}

fn expanded_directive_doc(directive: &ConstantDirective, base_indent: &str) -> RcDoc<'static, ()> {
    let arg_indent = format!("{}  ", base_indent);
    let value_indent = format!("{}    ", base_indent);

    let mut doc = RcDoc::text(base_indent.to_string())
        .append(RcDoc::text(format!("@{}", directive.name.value)));

    if let Some(ref arguments) = directive.arguments {
        doc = doc.append(RcDoc::text("(")).append(RcDoc::hardline());

        for arg in &arguments.items {
            let arg_str = render_doc(constant_argument_doc(arg), LINE_WIDTH);

            if arg_indent.len() + arg_str.len() <= LINE_WIDTH {
                doc = doc
                    .append(RcDoc::text(arg_indent.clone()))
                    .append(RcDoc::text(arg_str))
                    .append(RcDoc::hardline());
            } else {
                // Need to expand the argument value (especially for lists)
                match &arg.value {
                    ConstantValue::List(list) => {
                        doc = doc
                            .append(RcDoc::text(arg_indent.clone()))
                            .append(RcDoc::text(format!("{}: [", arg.name.value)))
                            .append(RcDoc::hardline());

                        for item in &list.items {
                            doc = doc
                                .append(RcDoc::text(value_indent.clone()))
                                .append(constant_value_doc(item))
                                .append(RcDoc::hardline());
                        }

                        doc = doc
                            .append(RcDoc::text(arg_indent.clone()))
                            .append(RcDoc::text("]"))
                            .append(RcDoc::hardline());
                    }
                    _ => {
                        doc = doc
                            .append(RcDoc::text(arg_indent.clone()))
                            .append(RcDoc::text(arg_str))
                            .append(RcDoc::hardline());
                    }
                }
            }
        }

        doc = doc
            .append(RcDoc::text(base_indent.to_string()))
            .append(RcDoc::text(")"));
    }

    doc
}

#[cfg(test)]
mod tests {
    use common::SourceLocationKey;
    use graphql_syntax::parse_schema_document;

    use super::*;
    use crate::test_utils::assert_prettier_output;

    fn print(source: &str) -> String {
        let document = parse_schema_document(source, SourceLocationKey::generated())
            .expect("Failed to parse schema");
        prettier_print_schema_document(&document)
    }

    #[test]
    fn test_scalar_definition() {
        let result = print("scalar DateTime");
        assert_eq!(result, "scalar DateTime\n");
    }

    #[test]
    fn test_scalar_with_directive() {
        let result = print("scalar DateTime @specifiedBy(url: \"https://example.com\")");
        assert_eq!(
            result,
            "scalar DateTime @specifiedBy(url: \"https://example.com\")\n"
        );
    }

    #[test]
    fn test_enum_definition() {
        let result = print(
            r#"
            enum Status {
                ACTIVE
                INACTIVE
                PENDING
            }
            "#,
        );
        assert_eq!(
            result,
            "enum Status {\n  ACTIVE\n  INACTIVE\n  PENDING\n}\n"
        );
    }

    #[test]
    fn test_object_type_simple() {
        let result = print(
            r#"
            type User {
                id: ID!
                name: String
            }
            "#,
        );
        assert_eq!(result, "type User {\n  id: ID!\n  name: String\n}\n");
    }

    #[test]
    fn test_object_type_with_interface() {
        let result = print(
            r#"
            type User implements Node {
                id: ID!
            }
            "#,
        );
        assert_eq!(result, "type User implements Node {\n  id: ID!\n}\n");
    }

    #[test]
    fn test_object_type_with_multiple_interfaces() {
        let result = print(
            r#"
            type User implements Node & Actor {
                id: ID!
            }
            "#,
        );
        assert_eq!(
            result,
            "type User implements Node & Actor {\n  id: ID!\n}\n"
        );
    }

    #[test]
    fn test_object_type_with_directives() {
        let result = print(
            r#"
            type User @key(fields: "id") {
                id: ID!
            }
            "#,
        );
        assert_eq!(result, "type User @key(fields: \"id\") {\n  id: ID!\n}\n");
    }

    #[test]
    fn test_interface_type() {
        let result = print(
            r#"
            interface Node {
                id: ID!
            }
            "#,
        );
        assert_eq!(result, "interface Node {\n  id: ID!\n}\n");
    }

    #[test]
    fn test_input_object_type() {
        let result = print(
            r#"
            input CreateUserInput {
                name: String!
                email: String
            }
            "#,
        );
        assert_eq!(
            result,
            "input CreateUserInput {\n  name: String!\n  email: String\n}\n"
        );
    }

    #[test]
    fn test_input_with_default_value() {
        let result = print(
            r#"
            input PaginationInput {
                first: Int = 10
                after: String
            }
            "#,
        );
        assert_eq!(
            result,
            "input PaginationInput {\n  first: Int = 10\n  after: String\n}\n"
        );
    }

    #[test]
    fn test_union_short() {
        let result = print("union SearchResult = User | Post");
        assert_eq!(result, "union SearchResult = User | Post\n");
    }

    #[test]
    fn test_union_long_multiline() {
        let result = print(
            "union VeryLongUnionNameThatExceedsLineWidth = TypeOne | TypeTwo | TypeThree | TypeFour",
        );
        assert_eq!(
            result,
            "union VeryLongUnionNameThatExceedsLineWidth =\n  | TypeOne\n  | TypeTwo\n  | TypeThree\n  | TypeFour\n"
        );
    }

    #[test]
    fn test_directive_definition_simple() {
        let result = print("directive @deprecated(reason: String) on FIELD_DEFINITION");
        assert_eq!(
            result,
            "directive @deprecated(reason: String) on FIELD_DEFINITION\n"
        );
    }

    #[test]
    fn test_directive_definition_multiple_locations() {
        let result = print("directive @auth on OBJECT | FIELD_DEFINITION");
        assert_eq!(result, "directive @auth on OBJECT | FIELD_DEFINITION\n");
    }

    #[test]
    fn test_directive_definition_repeatable() {
        let result = print("directive @tag(name: String!) repeatable on FIELD_DEFINITION");
        assert_eq!(
            result,
            "directive @tag(name: String!) repeatable on FIELD_DEFINITION\n"
        );
    }

    #[test]
    fn test_field_with_arguments() {
        let result = print(
            r#"
            type Query {
                user(id: ID!): User
            }
            "#,
        );
        assert_eq!(result, "type Query {\n  user(id: ID!): User\n}\n");
    }

    #[test]
    fn test_field_with_directives() {
        let result = print(
            r#"
            type User {
                name: String @semanticNonNull
            }
            "#,
        );
        assert_eq!(result, "type User {\n  name: String @semanticNonNull\n}\n");
    }

    #[test]
    fn test_multiple_definitions_blank_line_separation() {
        let result = print(
            r#"
            scalar DateTime
            enum Status { ACTIVE }
            "#,
        );
        assert_eq!(result, "scalar DateTime\n\nenum Status {\n  ACTIVE\n}\n");
    }

    #[test]
    fn test_constant_value_object_no_bracket_spacing() {
        let result = print(
            r#"
            type User @policy(vars: {key: "value"}) {
                id: ID!
            }
            "#,
        );
        assert_prettier_output!(
            result,
            [
                "type User @policy(vars: {key: \"value\"}) {",
                "  id: ID!",
                "}",
            ]
        );
    }

    #[test]
    fn test_constant_value_list() {
        let result = print(
            r#"
            type User @roles(allowed: ["admin", "user"]) {
                id: ID!
            }
            "#,
        );
        assert_prettier_output!(
            result,
            [
                "type User @roles(allowed: [\"admin\", \"user\"]) {",
                "  id: ID!",
                "}",
            ]
        );
    }

    #[test]
    fn test_type_directive_line_breaking() {
        let result = print(
            r#"
            enum AbraExperienceProductSurface @multiverse_source(name: "genai") @relay_flow_enum {
                ABRA_WEB
                AI_PROFILE_BOT
            }
            "#,
        );
        assert_prettier_output!(
            result,
            [
                "enum AbraExperienceProductSurface",
                "  @multiverse_source(name: \"genai\")",
                "  @relay_flow_enum {",
                "  ABRA_WEB",
                "  AI_PROFILE_BOT",
                "}",
            ]
        );
    }

    #[test]
    fn test_type_directive_stays_inline_when_short() {
        let result = print(
            r#"
            enum ShortEnum @relay_flow_enum {
                A
                B
            }
            "#,
        );
        assert_prettier_output!(
            result,
            ["enum ShortEnum @relay_flow_enum {", "  A", "  B", "}",]
        );
    }

    #[test]
    fn test_type_directive_arg_expansion() {
        let result = print(
            r#"
            enum XFBSpatialAudioFormat @source(name: "SpatialAudioFormat", schema: "facebook", schemas: ["facebook"]) {
                ambiX_4
            }
            "#,
        );
        assert_prettier_output!(
            result,
            [
                "enum XFBSpatialAudioFormat",
                "  @source(",
                "    name: \"SpatialAudioFormat\"",
                "    schema: \"facebook\"",
                "    schemas: [\"facebook\"]",
                "  ) {",
                "  ambiX_4",
                "}",
            ]
        );
    }

    #[test]
    fn test_input_directive_line_breaking() {
        let result = print(
            r#"
            input BloksRootComponentQueryDebugParams @multiverse_source(name: "gql_common") {
                should_collect_debug_metadata: Boolean
            }
            "#,
        );
        assert_prettier_output!(
            result,
            [
                "input BloksRootComponentQueryDebugParams",
                "  @multiverse_source(name: \"gql_common\") {",
                "  should_collect_debug_metadata: Boolean",
                "}",
            ]
        );
    }

    #[test]
    fn test_type_with_implements_directive_line_breaking() {
        let result = print(
            r#"
            type User implements Node @key(fields: "id") @multiverse_source(name: "instagram") {
                id: ID!
            }
            "#,
        );
        assert_prettier_output!(
            result,
            [
                "type User implements Node",
                "  @key(fields: \"id\")",
                "  @multiverse_source(name: \"instagram\") {",
                "  id: ID!",
                "}",
            ]
        );
    }

    #[test]
    fn test_field_directive_line_breaking() {
        let result = print(
            r#"
            interface Entity {
                url(site: SiteEnum): Url @cdn_url @data_annotations(semantic_type_facets: ["3172:Canonical_ID_UID"])
            }
            "#,
        );
        assert_prettier_output!(
            result,
            [
                "interface Entity {",
                "  url(site: SiteEnum): Url",
                "    @cdn_url",
                "    @data_annotations(semantic_type_facets: [\"3172:Canonical_ID_UID\"])",
                "}",
            ]
        );
    }

    #[test]
    fn test_field_directive_argument_expansion() {
        let result = print(
            r#"
            type CommerceAddress {
                zip: String @data_annotations(semantic_type_facets: ["15271:Canonical_Location_PostalCode_Z9DigitZipCode"])
            }
            "#,
        );
        assert_prettier_output!(
            result,
            [
                "type CommerceAddress {",
                "  zip: String",
                "    @data_annotations(",
                "      semantic_type_facets: [",
                "        \"15271:Canonical_Location_PostalCode_Z9DigitZipCode\"",
                "      ]",
                "    )",
                "}",
            ]
        );
    }

    #[test]
    fn test_field_arg_expansion_with_return_type() {
        let result = print(
            r#"
            type Mutation {
                screen_time_sync(data: ScreenTimeSyncMutationInput!): ScreenTimeSyncMutationOutput @semanticNonNull
            }
            "#,
        );
        assert_prettier_output!(
            result,
            [
                "type Mutation {",
                "  screen_time_sync(",
                "    data: ScreenTimeSyncMutationInput!",
                "  ): ScreenTimeSyncMutationOutput @semanticNonNull",
                "}",
            ]
        );
    }

    #[test]
    fn test_field_arg_expansion_no_directives() {
        let result = print(
            r#"
            type Mutation {
                slide_update_basketball_game_team(basketball_game_team: NBATeamName): THNBAGameTeamInfo
            }
            "#,
        );
        assert_prettier_output!(
            result,
            [
                "type Mutation {",
                "  slide_update_basketball_game_team(",
                "    basketball_game_team: NBATeamName",
                "  ): THNBAGameTeamInfo",
                "}",
            ]
        );
    }

    #[test]
    fn test_field_arg_expansion_with_long_directive() {
        let result = print(
            r#"
            type Query {
                xfb_fetch_dogfooding_assistant_session(id: ID!): XFBDogfoodingAssistantSession @source(name: "xfb_fetch_dogfooding_assistant_session", schema: "facebook", schemas: ["facebook"])
            }
            "#,
        );
        assert_prettier_output!(
            result,
            [
                "type Query {",
                "  xfb_fetch_dogfooding_assistant_session(",
                "    id: ID!",
                "  ): XFBDogfoodingAssistantSession",
                "    @source(",
                "      name: \"xfb_fetch_dogfooding_assistant_session\"",
                "      schema: \"facebook\"",
                "      schemas: [\"facebook\"]",
                "    )",
                "}",
            ]
        );
    }

    #[test]
    fn test_field_arg_stays_inline_with_short_directive() {
        let result = print(
            r#"
            type User {
                name(locale: String): String @deprecated
            }
            "#,
        );
        assert_prettier_output!(
            result,
            [
                "type User {",
                "  name(locale: String): String @deprecated",
                "}",
            ]
        );
    }
}
