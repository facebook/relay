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

use graphql_syntax::ConstantDirective;
use graphql_syntax::ConstantValue;
use graphql_syntax::DirectiveDefinition;
use graphql_syntax::DirectiveLocation;
use graphql_syntax::EnumTypeDefinition;
use graphql_syntax::EnumTypeExtension;
use graphql_syntax::EnumValueDefinition;
use graphql_syntax::FieldDefinition;
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

use crate::prettier_common::DOUBLE_INDENT;
use crate::prettier_common::INDENT;
use crate::prettier_common::LINE_WIDTH;
use crate::prettier_common::TRIPLE_INDENT;
use crate::prettier_common::current_line_length;
use crate::prettier_common::fits_on_line;
use crate::prettier_common::format_constant_argument;
use crate::prettier_common::format_constant_directive;
use crate::prettier_common::format_constant_directives;
use crate::prettier_common::format_constant_value;
use crate::prettier_common::format_type_annotation;

/// Prints a SchemaDocument in prettier-graphql compatible format.
///
/// This function produces SDL output that matches prettier-graphql formatting,
/// avoiding PRETTIERGRAPHQL lint errors in generated files.
pub fn prettier_print_schema_document(document: &SchemaDocument) -> String {
    let mut printer = PrettierSchemaPrinter::new();
    printer.print_document(document);
    printer.output
}

/// Prints a TypeSystemDefinition in prettier-graphql compatible format.
pub fn prettier_print_type_system_definition(definition: &TypeSystemDefinition) -> String {
    let mut printer = PrettierSchemaPrinter::new();
    printer.print_type_system_definition(definition);
    printer.output
}

struct PrettierSchemaPrinter {
    output: String,
}

impl PrettierSchemaPrinter {
    fn new() -> Self {
        Self {
            output: String::new(),
        }
    }

    fn print_document(&mut self, document: &SchemaDocument) {
        let mut first = true;
        for definition in &document.definitions {
            if !first {
                self.output.push('\n');
            }
            first = false;
            self.print_type_system_definition(definition);
        }
    }

    fn print_type_system_definition(&mut self, definition: &TypeSystemDefinition) {
        match definition {
            TypeSystemDefinition::SchemaDefinition(def) => self.print_schema_definition(def),
            TypeSystemDefinition::SchemaExtension(ext) => self.print_schema_extension(ext),
            TypeSystemDefinition::ObjectTypeDefinition(def) => {
                self.print_object_type_definition(def)
            }
            TypeSystemDefinition::ObjectTypeExtension(ext) => self.print_object_type_extension(ext),
            TypeSystemDefinition::InterfaceTypeDefinition(def) => {
                self.print_interface_type_definition(def)
            }
            TypeSystemDefinition::InterfaceTypeExtension(ext) => {
                self.print_interface_type_extension(ext)
            }
            TypeSystemDefinition::UnionTypeDefinition(def) => self.print_union_type_definition(def),
            TypeSystemDefinition::UnionTypeExtension(ext) => self.print_union_type_extension(ext),
            TypeSystemDefinition::EnumTypeDefinition(def) => self.print_enum_type_definition(def),
            TypeSystemDefinition::EnumTypeExtension(ext) => self.print_enum_type_extension(ext),
            TypeSystemDefinition::InputObjectTypeDefinition(def) => {
                self.print_input_object_type_definition(def)
            }
            TypeSystemDefinition::InputObjectTypeExtension(ext) => {
                self.print_input_object_type_extension(ext)
            }
            TypeSystemDefinition::ScalarTypeDefinition(def) => {
                self.print_scalar_type_definition(def)
            }
            TypeSystemDefinition::ScalarTypeExtension(ext) => self.print_scalar_type_extension(ext),
            TypeSystemDefinition::DirectiveDefinition(def) => self.print_directive_definition(def),
        }
    }

    fn print_schema_definition(&mut self, def: &SchemaDefinition) {
        self.print_description(&def.description, "");
        self.output.push_str("schema");
        let prefix_len = self.current_line_len();
        let suffix_len = if def.operation_types.items.is_empty() {
            0
        } else {
            2
        }; // " {"
        self.print_directives_with_breaking(&def.directives, prefix_len, suffix_len, INDENT);
        self.print_operation_type_fields(&def.operation_types.items);
        self.output.push('\n');
    }

    fn print_schema_extension(&mut self, ext: &SchemaExtension) {
        self.output.push_str("extend schema");
        let prefix_len = self.current_line_len();
        let suffix_len = if ext.operation_types.is_some() { 2 } else { 0 }; // " {"
        self.print_directives_with_breaking(&ext.directives, prefix_len, suffix_len, INDENT);
        if let Some(ref operation_types) = ext.operation_types {
            self.print_operation_type_fields(&operation_types.items);
        }
        self.output.push('\n');
    }

    fn print_operation_type_fields(&mut self, fields: &[OperationTypeDefinition]) {
        if fields.is_empty() {
            return;
        }
        self.output.push_str(" {\n");
        for field in fields {
            self.output.push_str(INDENT);
            self.output
                .push_str(&format!("{}: {}", field.operation, field.type_));
            self.output.push('\n');
        }
        self.output.push('}');
    }

    fn print_object_type_definition(&mut self, def: &ObjectTypeDefinition) {
        self.print_description(&def.description, "");
        self.output.push_str("type ");
        self.output.push_str(&def.name.value.to_string());
        self.print_implements_interfaces(&def.interfaces);
        let prefix_len = self.current_line_len();
        let suffix_len = if def.fields.is_some() { 2 } else { 0 };
        self.print_directives_with_breaking(&def.directives, prefix_len, suffix_len, INDENT);
        if let Some(ref fields) = def.fields {
            self.print_field_definitions(&fields.items);
        }
        self.output.push('\n');
    }

    fn print_object_type_extension(&mut self, ext: &ObjectTypeExtension) {
        self.output.push_str("extend type ");
        self.output.push_str(&ext.name.value.to_string());
        self.print_implements_interfaces(&ext.interfaces);
        let prefix_len = self.current_line_len();
        let suffix_len = if ext.fields.is_some() { 2 } else { 0 };
        self.print_directives_with_breaking(&ext.directives, prefix_len, suffix_len, INDENT);
        if let Some(ref fields) = ext.fields {
            self.print_field_definitions(&fields.items);
        }
        self.output.push('\n');
    }

    fn print_interface_type_definition(&mut self, def: &InterfaceTypeDefinition) {
        self.print_description(&def.description, "");
        self.output.push_str("interface ");
        self.output.push_str(&def.name.value.to_string());
        self.print_implements_interfaces(&def.interfaces);
        let prefix_len = self.current_line_len();
        let suffix_len = if def.fields.is_some() { 2 } else { 0 };
        self.print_directives_with_breaking(&def.directives, prefix_len, suffix_len, INDENT);
        if let Some(ref fields) = def.fields {
            self.print_field_definitions(&fields.items);
        }
        self.output.push('\n');
    }

    fn print_interface_type_extension(&mut self, ext: &InterfaceTypeExtension) {
        self.output.push_str("extend interface ");
        self.output.push_str(&ext.name.value.to_string());
        self.print_implements_interfaces(&ext.interfaces);
        let prefix_len = self.current_line_len();
        let suffix_len = if ext.fields.is_some() { 2 } else { 0 };
        self.print_directives_with_breaking(&ext.directives, prefix_len, suffix_len, INDENT);
        if let Some(ref fields) = ext.fields {
            self.print_field_definitions(&fields.items);
        }
        self.output.push('\n');
    }

    fn print_implements_interfaces(&mut self, interfaces: &[graphql_syntax::Identifier]) {
        if interfaces.is_empty() {
            return;
        }
        self.output.push_str(" implements ");
        let interface_names: Vec<String> = interfaces.iter().map(|i| i.value.to_string()).collect();
        self.output.push_str(&interface_names.join(" & "));
    }

    fn print_field_definitions(&mut self, fields: &[FieldDefinition]) {
        if fields.is_empty() {
            return;
        }
        self.output.push_str(" {\n");
        for field in fields {
            self.print_description(&field.description, INDENT);
            self.output.push_str(INDENT);
            self.print_field_definition(field);
            self.output.push('\n');
        }
        self.output.push('}');
    }

    fn print_field_definition(&mut self, field: &FieldDefinition) {
        let type_str = format_type_annotation(&field.type_);
        let suffix_len = ": ".len() + type_str.len();
        let has_directives = !field.directives.is_empty();

        self.output.push_str(&field.name.value.to_string());
        if let Some(ref arguments) = field.arguments {
            self.print_arguments_definition(
                &arguments.items,
                &field.name.value.to_string(),
                suffix_len,
                has_directives,
            );
        }
        self.output.push_str(": ");
        self.output.push_str(&type_str);
        let current_line_len = self.current_line_len();
        self.print_directives_with_breaking(&field.directives, current_line_len, 0, DOUBLE_INDENT);
    }

    fn print_arguments_definition(
        &mut self,
        arguments: &[InputValueDefinition],
        context: &str,
        suffix_len: usize,
        has_following_directives: bool,
    ) {
        if arguments.is_empty() {
            return;
        }

        let single_line = self.format_arguments_single_line(arguments);
        let prefix_len = INDENT.len() + context.len();

        let has_descriptions = arguments.iter().any(|a| a.description.is_some());
        let total_len = prefix_len + single_line.len() + suffix_len;
        if !has_descriptions && fits_on_line(total_len, has_following_directives) {
            self.output.push_str(&single_line);
        } else {
            self.output.push_str("(\n");
            for arg in arguments {
                let double_indent = format!("{}{}", INDENT, INDENT);
                self.print_description(&arg.description, &double_indent);
                self.output.push_str(INDENT);
                self.output.push_str(INDENT);
                self.print_input_value_definition(arg, TRIPLE_INDENT);
                self.output.push('\n');
            }
            self.output.push_str(INDENT);
            self.output.push(')');
        }
    }

    fn format_arguments_single_line(&self, arguments: &[InputValueDefinition]) -> String {
        let args: Vec<String> = arguments
            .iter()
            .map(|a| self.format_input_value(a))
            .collect();
        format!("({})", args.join(", "))
    }

    fn format_input_value(&self, input: &InputValueDefinition) -> String {
        let mut result = format!(
            "{}: {}",
            input.name.value,
            format_type_annotation(&input.type_)
        );
        if let Some(ref default_value) = input.default_value {
            result.push_str(" = ");
            result.push_str(&format_constant_value(&default_value.value));
        }
        if !input.directives.is_empty() {
            result.push(' ');
            result.push_str(&format_constant_directives(&input.directives));
        }
        result
    }

    fn print_input_value_definition(
        &mut self,
        input: &InputValueDefinition,
        directive_break_indent: &str,
    ) {
        self.output.push_str(&input.name.value.to_string());
        self.output.push_str(": ");
        self.output.push_str(&format_type_annotation(&input.type_));
        if let Some(ref default_value) = input.default_value {
            self.output.push_str(" = ");
            // Check if this is an empty list and the line is already long
            let current_line_len = self.current_line_len();
            match &default_value.value {
                ConstantValue::List(list) if list.items.is_empty() => {
                    // Empty list: check if we need to expand it
                    // Adding "[]" (2 chars) would make current_line_len + 2
                    if current_line_len + 2 > LINE_WIDTH {
                        // Line too long, expand empty array with blank line inside
                        self.output.push_str("[\n\n");
                        self.output.push_str(INDENT);
                        self.output.push(']');
                    } else {
                        self.output.push_str("[]");
                    }
                }
                _ => {
                    self.output
                        .push_str(&format_constant_value(&default_value.value));
                }
            }
        }
        let current_line_len = self.current_line_len();
        self.print_directives_with_breaking(
            &input.directives,
            current_line_len,
            0,
            directive_break_indent,
        );
    }

    fn print_union_type_definition(&mut self, def: &UnionTypeDefinition) {
        self.print_description(&def.description, "");
        self.output.push_str("union ");
        self.output.push_str(&def.name.value.to_string());
        let prefix_len = self.current_line_len();
        let suffix_len = if def.members.is_empty() { 0 } else { 2 };
        let directives_broken =
            self.print_directives_with_breaking(&def.directives, prefix_len, suffix_len, INDENT);
        self.print_union_members(&def.members, directives_broken);
        self.output.push('\n');
    }

    fn print_union_type_extension(&mut self, ext: &UnionTypeExtension) {
        self.output.push_str("extend union ");
        self.output.push_str(&ext.name.value.to_string());
        let prefix_len = self.current_line_len();
        let suffix_len = if ext.members.is_empty() { 0 } else { 2 };
        let directives_broken =
            self.print_directives_with_breaking(&ext.directives, prefix_len, suffix_len, INDENT);
        self.print_union_members(&ext.members, directives_broken);
        self.output.push('\n');
    }

    fn print_union_members(
        &mut self,
        members: &[graphql_syntax::Identifier],
        force_expanded: bool,
    ) {
        if members.is_empty() {
            return;
        }

        let member_names: Vec<String> = members.iter().map(|m| m.value.to_string()).collect();
        let single_line = format!(" = {}", member_names.join(" | "));
        let current_line_len = self.current_line_len();

        if !force_expanded && current_line_len + single_line.len() <= LINE_WIDTH {
            self.output.push_str(&single_line);
        } else {
            self.output.push_str(" =\n");
            for member in &member_names {
                self.output.push_str(INDENT);
                self.output.push_str("| ");
                self.output.push_str(member);
                self.output.push('\n');
            }
            let len = self.output.len();
            self.output.truncate(len - 1);
        }
    }

    fn print_enum_type_definition(&mut self, def: &EnumTypeDefinition) {
        self.print_description(&def.description, "");
        self.output.push_str("enum ");
        self.output.push_str(&def.name.value.to_string());
        let prefix_len = self.current_line_len();
        let suffix_len = if def.values.is_some() { 2 } else { 0 };
        self.print_directives_with_breaking(&def.directives, prefix_len, suffix_len, INDENT);
        if let Some(ref values) = def.values {
            self.print_enum_values(&values.items);
        }
        self.output.push('\n');
    }

    fn print_enum_type_extension(&mut self, ext: &EnumTypeExtension) {
        self.output.push_str("extend enum ");
        self.output.push_str(&ext.name.value.to_string());
        let prefix_len = self.current_line_len();
        let suffix_len = if ext.values.is_some() { 2 } else { 0 };
        self.print_directives_with_breaking(&ext.directives, prefix_len, suffix_len, INDENT);
        if let Some(ref values) = ext.values {
            self.print_enum_values(&values.items);
        }
        self.output.push('\n');
    }

    fn print_enum_values(&mut self, values: &[EnumValueDefinition]) {
        if values.is_empty() {
            return;
        }
        self.output.push_str(" {\n");
        for value in values {
            self.print_description(&value.description, INDENT);
            self.output.push_str(INDENT);
            self.output.push_str(&value.name.value.to_string());
            let current_line_len = self.current_line_len();
            self.print_directives_with_breaking(
                &value.directives,
                current_line_len,
                0,
                DOUBLE_INDENT,
            );
            self.output.push('\n');
        }
        self.output.push('}');
    }

    fn print_input_object_type_definition(&mut self, def: &InputObjectTypeDefinition) {
        self.print_description(&def.description, "");
        self.output.push_str("input ");
        self.output.push_str(&def.name.value.to_string());
        let prefix_len = self.current_line_len();
        let suffix_len = if def.fields.is_some() { 2 } else { 0 };
        self.print_directives_with_breaking(&def.directives, prefix_len, suffix_len, INDENT);
        if let Some(ref fields) = def.fields {
            self.print_input_fields(&fields.items);
        }
        self.output.push('\n');
    }

    fn print_input_object_type_extension(&mut self, ext: &InputObjectTypeExtension) {
        self.output.push_str("extend input ");
        self.output.push_str(&ext.name.value.to_string());
        let prefix_len = self.current_line_len();
        let suffix_len = if ext.fields.is_some() { 2 } else { 0 };
        self.print_directives_with_breaking(&ext.directives, prefix_len, suffix_len, INDENT);
        if let Some(ref fields) = ext.fields {
            self.print_input_fields(&fields.items);
        }
        self.output.push('\n');
    }

    fn print_input_fields(&mut self, fields: &[InputValueDefinition]) {
        if fields.is_empty() {
            return;
        }
        self.output.push_str(" {\n");
        for field in fields {
            self.print_description(&field.description, INDENT);
            self.output.push_str(INDENT);
            self.print_input_value_definition(field, DOUBLE_INDENT);
            self.output.push('\n');
        }
        self.output.push('}');
    }

    fn print_scalar_type_definition(&mut self, def: &ScalarTypeDefinition) {
        self.print_description(&def.description, "");
        self.output.push_str("scalar ");
        self.output.push_str(&def.name.value.to_string());
        let prefix_len = self.current_line_len();
        self.print_directives_with_breaking(&def.directives, prefix_len, 0, INDENT);
        self.output.push('\n');
    }

    fn print_scalar_type_extension(&mut self, ext: &ScalarTypeExtension) {
        self.output.push_str("extend scalar ");
        self.output.push_str(&ext.name.value.to_string());
        let prefix_len = self.current_line_len();
        self.print_directives_with_breaking(&ext.directives, prefix_len, 0, INDENT);
        self.output.push('\n');
    }

    fn print_directive_definition(&mut self, def: &DirectiveDefinition) {
        self.print_description(&def.description, "");
        self.output.push_str("directive @");
        self.output.push_str(&def.name.value.to_string());

        let args = def.arguments.as_ref().map(|a| &a.items[..]);
        let locations_str = self.format_locations_inline(&def.locations);
        let repeatable_str = if def.repeatable { " repeatable" } else { "" };

        let prefix = format!("directive @{}", def.name.value);
        let args_inline = args.map_or(String::new(), |a| self.format_arguments_single_line(a));
        let suffix = format!("{} on {}", repeatable_str, locations_str);

        let has_arg_descriptions =
            args.is_some_and(|a| a.iter().any(|arg| arg.description.is_some()));
        if !has_arg_descriptions && prefix.len() + args_inline.len() + suffix.len() <= LINE_WIDTH {
            if let Some(arguments) = args.filter(|a| !a.is_empty()) {
                self.output
                    .push_str(&self.format_arguments_single_line(arguments));
            }
            self.output.push_str(&suffix);
        } else {
            if let Some(arguments) = args.filter(|a| !a.is_empty()) {
                self.output.push_str("(\n");
                for arg in arguments {
                    self.print_description(&arg.description, INDENT);
                    self.output.push_str(INDENT);
                    self.print_input_value_definition(arg, DOUBLE_INDENT);
                    self.output.push('\n');
                }
                self.output.push(')');
            }
            self.output.push_str(repeatable_str);
            self.output.push_str(" on ");
            self.output.push_str(&locations_str);
        }

        self.output.push('\n');
    }

    fn format_locations_inline(&self, locations: &[DirectiveLocation]) -> String {
        locations
            .iter()
            .map(|l| l.to_string())
            .collect::<Vec<_>>()
            .join(" | ")
    }

    fn print_description(&mut self, description: &Option<StringNode>, indent: &str) {
        if let Some(desc) = description {
            let value = desc.value.to_string();
            if value.contains('\n') {
                self.output.push_str(indent);
                self.output.push_str("\"\"\"\n");
                for line in value.lines() {
                    self.output.push_str(indent);
                    self.output.push_str(line);
                    self.output.push('\n');
                }
                self.output.push_str(indent);
                self.output.push_str("\"\"\"\n");
            } else {
                self.output.push_str(indent);
                self.output.push_str("\"\"\"\n");
                self.output.push_str(indent);
                self.output.push_str(&value);
                self.output.push('\n');
                self.output.push_str(indent);
                self.output.push_str("\"\"\"\n");
            }
        }
    }

    fn current_line_len(&self) -> usize {
        current_line_length(&self.output)
    }

    fn print_directives_with_breaking(
        &mut self,
        directives: &[ConstantDirective],
        prefix_len: usize,
        suffix_len: usize,
        break_indent: &str,
    ) -> bool {
        if directives.is_empty() {
            return false;
        }

        let inline = format!(" {}", format_constant_directives(directives));
        if prefix_len + inline.len() + suffix_len <= LINE_WIDTH {
            self.output.push_str(&inline);
            false
        } else {
            let last_idx = directives.len() - 1;
            for (idx, directive) in directives.iter().enumerate() {
                let directive_str = format_constant_directive(directive);
                let is_last = idx == last_idx;
                let effective_suffix = if is_last { suffix_len } else { 0 };
                if break_indent.len() + directive_str.len() + effective_suffix <= LINE_WIDTH {
                    self.output.push('\n');
                    self.output.push_str(break_indent);
                    self.output.push_str(&directive_str);
                } else {
                    self.output.push('\n');
                    self.print_expanded_directive(directive, break_indent);
                }
            }
            true
        }
    }

    fn print_expanded_directive(&mut self, directive: &ConstantDirective, base_indent: &str) {
        let arg_indent = format!("{}{}", base_indent, INDENT);
        let value_indent = format!("{}{}", arg_indent, INDENT);

        self.output.push_str(base_indent);
        self.output.push_str(&format!("@{}", directive.name.value));

        if let Some(ref arguments) = directive.arguments {
            self.output.push_str("(\n");
            for arg in &arguments.items {
                let arg_str = format_constant_argument(arg);
                if arg_indent.len() + arg_str.len() <= LINE_WIDTH {
                    self.output.push_str(&arg_indent);
                    self.output.push_str(&arg_str);
                    self.output.push('\n');
                } else {
                    match &arg.value {
                        ConstantValue::List(list) => {
                            self.output.push_str(&arg_indent);
                            self.output.push_str(&format!("{}: [\n", arg.name.value));
                            for item in &list.items {
                                self.output.push_str(&value_indent);
                                self.output.push_str(&format_constant_value(item));
                                self.output.push('\n');
                            }
                            self.output.push_str(&arg_indent);
                            self.output.push_str("]\n");
                        }
                        _ => {
                            self.output.push_str(&arg_indent);
                            self.output.push_str(&arg_str);
                            self.output.push('\n');
                        }
                    }
                }
            }
            self.output.push_str(base_indent);
            self.output.push(')');
        }
    }
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
