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
use graphql_syntax::TypeAnnotation;
use graphql_syntax::TypeSystemDefinition;
use graphql_syntax::UnionTypeDefinition;
use graphql_syntax::UnionTypeExtension;
use intern::string_key::StringKey;

const LINE_WIDTH: usize = 80;
const INDENT: &str = "  ";

/// Prints a SchemaDocument in prettier-graphql compatible format.
///
/// This function produces SDL output that matches prettier-graphql formatting,
/// avoiding PRETTIERGRAPHQL lint errors in generated files.
pub fn prettier_print_schema_document(document: &SchemaDocument) -> String {
    let mut printer = PrettierSchemaPrinter::new();
    printer.print_document(document);
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
        self.output.push_str("schema");
        self.print_directives(&def.directives);
        self.print_operation_type_fields(&def.operation_types.items);
        self.output.push('\n');
    }

    fn print_schema_extension(&mut self, ext: &SchemaExtension) {
        self.output.push_str("extend schema");
        self.print_directives(&ext.directives);
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
        self.output.push_str("type ");
        self.output.push_str(&def.name.value.to_string());
        self.print_implements_interfaces(&def.interfaces);
        self.print_directives(&def.directives);
        if let Some(ref fields) = def.fields {
            self.print_field_definitions(&fields.items);
        }
        self.output.push('\n');
    }

    fn print_object_type_extension(&mut self, ext: &ObjectTypeExtension) {
        self.output.push_str("extend type ");
        self.output.push_str(&ext.name.value.to_string());
        self.print_implements_interfaces(&ext.interfaces);
        self.print_directives(&ext.directives);
        if let Some(ref fields) = ext.fields {
            self.print_field_definitions(&fields.items);
        }
        self.output.push('\n');
    }

    fn print_interface_type_definition(&mut self, def: &InterfaceTypeDefinition) {
        self.output.push_str("interface ");
        self.output.push_str(&def.name.value.to_string());
        self.print_implements_interfaces(&def.interfaces);
        self.print_directives(&def.directives);
        if let Some(ref fields) = def.fields {
            self.print_field_definitions(&fields.items);
        }
        self.output.push('\n');
    }

    fn print_interface_type_extension(&mut self, ext: &InterfaceTypeExtension) {
        self.output.push_str("extend interface ");
        self.output.push_str(&ext.name.value.to_string());
        self.print_implements_interfaces(&ext.interfaces);
        self.print_directives(&ext.directives);
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
            self.output.push_str(INDENT);
            self.print_field_definition(field);
            self.output.push('\n');
        }
        self.output.push('}');
    }

    fn print_field_definition(&mut self, field: &FieldDefinition) {
        self.output.push_str(&field.name.value.to_string());
        if let Some(ref arguments) = field.arguments {
            self.print_arguments_definition(&arguments.items, &field.name.value.to_string());
        }
        self.output.push_str(": ");
        self.print_type_annotation(&field.type_);
        self.print_directives(&field.directives);
    }

    fn print_arguments_definition(&mut self, arguments: &[InputValueDefinition], context: &str) {
        if arguments.is_empty() {
            return;
        }

        let single_line = self.format_arguments_single_line(arguments);
        let prefix_len = INDENT.len() + context.len();

        if prefix_len + single_line.len() <= LINE_WIDTH {
            self.output.push_str(&single_line);
        } else {
            self.output.push_str("(\n");
            for arg in arguments {
                self.output.push_str(INDENT);
                self.output.push_str(INDENT);
                self.print_input_value_definition(arg);
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
            self.format_type_annotation(&input.type_)
        );
        if let Some(ref default_value) = input.default_value {
            result.push_str(" = ");
            result.push_str(&self.format_constant_value(&default_value.value));
        }
        if !input.directives.is_empty() {
            result.push(' ');
            result.push_str(&self.format_directives(&input.directives));
        }
        result
    }

    fn print_input_value_definition(&mut self, input: &InputValueDefinition) {
        self.output.push_str(&input.name.value.to_string());
        self.output.push_str(": ");
        self.print_type_annotation(&input.type_);
        if let Some(ref default_value) = input.default_value {
            self.output.push_str(" = ");
            self.print_constant_value(&default_value.value);
        }
        self.print_directives(&input.directives);
    }

    fn print_union_type_definition(&mut self, def: &UnionTypeDefinition) {
        self.output.push_str("union ");
        self.output.push_str(&def.name.value.to_string());
        self.print_directives(&def.directives);
        self.print_union_members(&def.members, &def.name.value);
        self.output.push('\n');
    }

    fn print_union_type_extension(&mut self, ext: &UnionTypeExtension) {
        self.output.push_str("extend union ");
        self.output.push_str(&ext.name.value.to_string());
        self.print_directives(&ext.directives);
        self.print_union_members(&ext.members, &ext.name.value);
        self.output.push('\n');
    }

    fn print_union_members(&mut self, members: &[graphql_syntax::Identifier], name: &StringKey) {
        if members.is_empty() {
            return;
        }

        let member_names: Vec<String> = members.iter().map(|m| m.value.to_string()).collect();
        let single_line = format!(" = {}", member_names.join(" | "));
        let prefix = format!("union {}", name);

        if prefix.len() + single_line.len() <= LINE_WIDTH {
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
        self.output.push_str("enum ");
        self.output.push_str(&def.name.value.to_string());
        self.print_directives(&def.directives);
        if let Some(ref values) = def.values {
            self.print_enum_values(&values.items);
        }
        self.output.push('\n');
    }

    fn print_enum_type_extension(&mut self, ext: &EnumTypeExtension) {
        self.output.push_str("extend enum ");
        self.output.push_str(&ext.name.value.to_string());
        self.print_directives(&ext.directives);
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
            self.output.push_str(INDENT);
            self.output.push_str(&value.name.value.to_string());
            self.print_directives(&value.directives);
            self.output.push('\n');
        }
        self.output.push('}');
    }

    fn print_input_object_type_definition(&mut self, def: &InputObjectTypeDefinition) {
        self.output.push_str("input ");
        self.output.push_str(&def.name.value.to_string());
        self.print_directives(&def.directives);
        if let Some(ref fields) = def.fields {
            self.print_input_fields(&fields.items);
        }
        self.output.push('\n');
    }

    fn print_input_object_type_extension(&mut self, ext: &InputObjectTypeExtension) {
        self.output.push_str("extend input ");
        self.output.push_str(&ext.name.value.to_string());
        self.print_directives(&ext.directives);
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
            self.output.push_str(INDENT);
            self.print_input_value_definition(field);
            self.output.push('\n');
        }
        self.output.push('}');
    }

    fn print_scalar_type_definition(&mut self, def: &ScalarTypeDefinition) {
        self.output.push_str("scalar ");
        self.output.push_str(&def.name.value.to_string());
        self.print_directives(&def.directives);
        self.output.push('\n');
    }

    fn print_scalar_type_extension(&mut self, ext: &ScalarTypeExtension) {
        self.output.push_str("extend scalar ");
        self.output.push_str(&ext.name.value.to_string());
        self.print_directives(&ext.directives);
        self.output.push('\n');
    }

    fn print_directive_definition(&mut self, def: &DirectiveDefinition) {
        self.output.push_str("directive @");
        self.output.push_str(&def.name.value.to_string());

        let args = def.arguments.as_ref().map(|a| &a.items[..]);
        let locations_str = self.format_locations_inline(&def.locations);
        let repeatable_str = if def.repeatable { " repeatable" } else { "" };

        let prefix = format!("directive @{}", def.name.value);
        let args_inline = args.map_or(String::new(), |a| self.format_arguments_single_line(a));
        let suffix = format!("{} on {}", repeatable_str, locations_str);

        if prefix.len() + args_inline.len() + suffix.len() <= LINE_WIDTH {
            if let Some(arguments) = args.filter(|a| !a.is_empty()) {
                self.output
                    .push_str(&self.format_arguments_single_line(arguments));
            }
            self.output.push_str(&suffix);
        } else {
            if let Some(arguments) = args.filter(|a| !a.is_empty()) {
                self.output.push_str("(\n");
                for arg in arguments {
                    self.output.push_str(INDENT);
                    self.print_input_value_definition(arg);
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

    fn print_directives(&mut self, directives: &[ConstantDirective]) {
        for directive in directives {
            self.output.push(' ');
            self.print_directive(directive);
        }
    }

    fn print_directive(&mut self, directive: &ConstantDirective) {
        self.output.push('@');
        self.output.push_str(&directive.name.value.to_string());
        if let Some(ref arguments) = directive.arguments {
            self.output.push('(');
            let args: Vec<String> = arguments
                .items
                .iter()
                .map(|arg| {
                    format!(
                        "{}: {}",
                        arg.name.value,
                        self.format_constant_value(&arg.value)
                    )
                })
                .collect();
            self.output.push_str(&args.join(", "));
            self.output.push(')');
        }
    }

    fn format_directives(&self, directives: &[ConstantDirective]) -> String {
        directives
            .iter()
            .map(|d| {
                let mut result = format!("@{}", d.name.value);
                if let Some(ref arguments) = d.arguments {
                    let args: Vec<String> = arguments
                        .items
                        .iter()
                        .map(|arg| {
                            format!(
                                "{}: {}",
                                arg.name.value,
                                self.format_constant_value(&arg.value)
                            )
                        })
                        .collect();
                    result.push('(');
                    result.push_str(&args.join(", "));
                    result.push(')');
                }
                result
            })
            .collect::<Vec<_>>()
            .join(" ")
    }

    fn print_type_annotation(&mut self, type_: &TypeAnnotation) {
        self.output.push_str(&self.format_type_annotation(type_));
    }

    fn format_type_annotation(&self, type_: &TypeAnnotation) -> String {
        match type_ {
            TypeAnnotation::Named(named) => named.name.value.to_string(),
            TypeAnnotation::List(list) => format!("[{}]", self.format_type_annotation(&list.type_)),
            TypeAnnotation::NonNull(non_null) => {
                format!("{}!", self.format_type_annotation(&non_null.type_))
            }
        }
    }

    fn print_constant_value(&mut self, value: &ConstantValue) {
        self.output.push_str(&self.format_constant_value(value));
    }

    fn format_constant_value(&self, value: &ConstantValue) -> String {
        match value {
            ConstantValue::Int(i) => i.value.to_string(),
            ConstantValue::Float(f) => f.source_value.to_string(),
            ConstantValue::String(s) => format!("\"{}\"", s.value),
            ConstantValue::Boolean(b) => if b.value { "true" } else { "false" }.to_string(),
            ConstantValue::Null(_) => "null".to_string(),
            ConstantValue::Enum(e) => e.value.to_string(),
            ConstantValue::List(list) => {
                let items: Vec<String> = list
                    .items
                    .iter()
                    .map(|item| self.format_constant_value(item))
                    .collect();
                format!("[{}]", items.join(", "))
            }
            ConstantValue::Object(obj) => {
                let fields: Vec<String> = obj
                    .items
                    .iter()
                    .map(|arg| {
                        format!(
                            "{}: {}",
                            arg.name.value,
                            self.format_constant_value(&arg.value)
                        )
                    })
                    .collect();
                format!("{{{}}}", fields.join(", "))
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use common::SourceLocationKey;
    use graphql_syntax::parse_schema_document;

    use super::*;

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
        assert!(result.contains("{key: \"value\"}"));
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
        assert!(result.contains("[\"admin\", \"user\"]"));
    }
}
