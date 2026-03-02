/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Prettier-compatible printer for GraphQL executable documents.
//!
//! This module provides formatting that matches prettier-graphql output
//! for operations (queries, mutations, subscriptions) and fragments.

use graphql_syntax::Argument;
use graphql_syntax::ConstantValue;
use graphql_syntax::Directive;
use graphql_syntax::ExecutableDefinition;
use graphql_syntax::ExecutableDocument;
use graphql_syntax::FragmentDefinition;
use graphql_syntax::FragmentSpread;
use graphql_syntax::InlineFragment;
use graphql_syntax::LinkedField;
use graphql_syntax::OperationDefinition;
use graphql_syntax::ScalarField;
use graphql_syntax::Selection;
use graphql_syntax::TypeAnnotation;
use graphql_syntax::Value;
use graphql_syntax::VariableDefinition;

const LINE_WIDTH: usize = 80;
const INDENT: &str = "  ";

/// Prints an ExecutableDocument in prettier-graphql compatible format.
///
/// This function produces output that matches prettier-graphql formatting
/// for executable definitions (operations and fragments).
pub fn prettier_print_executable_document(document: &ExecutableDocument) -> String {
    let mut printer = PrettierExecutablePrinter::new();
    printer.print_document(document);
    printer.output
}

/// Prints an OperationDefinition in prettier-graphql compatible format.
pub fn prettier_print_operation(operation: &OperationDefinition) -> String {
    let mut printer = PrettierExecutablePrinter::new();
    printer.print_operation(operation);
    printer.output
}

/// Prints a FragmentDefinition in prettier-graphql compatible format.
pub fn prettier_print_fragment(fragment: &FragmentDefinition) -> String {
    let mut printer = PrettierExecutablePrinter::new();
    printer.print_fragment(fragment);
    printer.output
}

/// Prints an ExecutableDefinition in prettier-graphql compatible format.
pub fn prettier_print_executable_definition(definition: &ExecutableDefinition) -> String {
    let mut printer = PrettierExecutablePrinter::new();
    printer.print_executable_definition(definition);
    printer.output
}

struct PrettierExecutablePrinter {
    output: String,
    indent_level: usize,
}

impl PrettierExecutablePrinter {
    fn new() -> Self {
        Self {
            output: String::new(),
            indent_level: 0,
        }
    }

    fn print_document(&mut self, document: &ExecutableDocument) {
        let mut first = true;
        for definition in &document.definitions {
            if !first {
                self.output.push('\n');
            }
            first = false;
            self.print_executable_definition(definition);
        }
    }

    fn print_executable_definition(&mut self, definition: &ExecutableDefinition) {
        match definition {
            ExecutableDefinition::Operation(op) => self.print_operation(op),
            ExecutableDefinition::Fragment(frag) => self.print_fragment(frag),
        }
    }

    fn print_operation(&mut self, operation: &OperationDefinition) {
        let is_anonymous_query = operation.operation.is_none()
            && operation.name.is_none()
            && operation.variable_definitions.is_none()
            && operation.directives.is_empty();

        if is_anonymous_query {
            self.print_selection_set(&operation.selections.items);
            self.output.push('\n');
            return;
        }

        let kind = operation.operation_kind();
        self.output.push_str(&kind.to_string());

        if let Some(ref name) = operation.name {
            self.output.push(' ');
            self.output.push_str(&name.value.to_string());
        }

        if let Some(ref var_defs) = operation.variable_definitions {
            self.print_variable_definitions(&var_defs.items, operation);
        }

        self.print_directives(&operation.directives);

        self.output.push(' ');
        self.print_selection_set(&operation.selections.items);
        self.output.push('\n');
    }

    fn print_fragment(&mut self, fragment: &FragmentDefinition) {
        self.output.push_str("fragment ");
        self.output.push_str(&fragment.name.value.to_string());

        if let Some(ref var_defs) = fragment.variable_definitions {
            self.print_fragment_variable_definitions(&var_defs.items, fragment);
        }

        self.output.push_str(" on ");
        self.output
            .push_str(&fragment.type_condition.type_.value.to_string());

        self.print_directives(&fragment.directives);

        self.output.push(' ');
        self.print_selection_set(&fragment.selections.items);
        self.output.push('\n');
    }

    fn print_variable_definitions(
        &mut self,
        var_defs: &[VariableDefinition],
        operation: &OperationDefinition,
    ) {
        if var_defs.is_empty() {
            return;
        }

        let single_line = self.format_variable_definitions_single_line(var_defs);
        let operation_prefix = self.get_operation_prefix_length(operation);

        if operation_prefix + single_line.len() <= LINE_WIDTH {
            self.output.push_str(&single_line);
        } else {
            self.output.push_str("(\n");
            for var_def in var_defs {
                self.output.push_str(INDENT);
                self.print_variable_definition(var_def);
                self.output.push('\n');
            }
            self.output.push(')');
        }
    }

    fn print_fragment_variable_definitions(
        &mut self,
        var_defs: &[VariableDefinition],
        fragment: &FragmentDefinition,
    ) {
        if var_defs.is_empty() {
            return;
        }

        let single_line = self.format_variable_definitions_single_line(var_defs);
        let prefix_len = "fragment ".len() + fragment.name.value.to_string().len();

        if prefix_len + single_line.len() <= LINE_WIDTH {
            self.output.push_str(&single_line);
        } else {
            self.output.push_str("(\n");
            for var_def in var_defs {
                self.output.push_str(INDENT);
                self.print_variable_definition(var_def);
                self.output.push('\n');
            }
            self.output.push(')');
        }
    }

    fn get_operation_prefix_length(&self, operation: &OperationDefinition) -> usize {
        let mut len = operation.operation_kind().to_string().len();
        if let Some(ref name) = operation.name {
            len += 1 + name.value.to_string().len();
        }
        len
    }

    fn format_variable_definitions_single_line(&self, var_defs: &[VariableDefinition]) -> String {
        let defs: Vec<String> = var_defs
            .iter()
            .map(|v| self.format_variable_definition(v))
            .collect();
        format!("({})", defs.join(", "))
    }

    fn format_variable_definition(&self, var_def: &VariableDefinition) -> String {
        let mut result = format!(
            "${}: {}",
            var_def.name.name,
            self.format_type_annotation(&var_def.type_)
        );

        if let Some(ref default) = var_def.default_value {
            result.push_str(" = ");
            result.push_str(&self.format_constant_value(&default.value));
        }

        if !var_def.directives.is_empty() {
            result.push(' ');
            result.push_str(&self.format_directives(&var_def.directives));
        }

        result
    }

    fn print_variable_definition(&mut self, var_def: &VariableDefinition) {
        self.output.push('$');
        self.output.push_str(&var_def.name.name.to_string());
        self.output.push_str(": ");
        self.print_type_annotation(&var_def.type_);

        if let Some(ref default) = var_def.default_value {
            self.output.push_str(" = ");
            self.print_constant_value(&default.value);
        }

        self.print_directives(&var_def.directives);
    }

    fn print_selection_set(&mut self, selections: &[Selection]) {
        if selections.is_empty() {
            return;
        }

        self.output.push_str("{\n");
        self.indent_level += 1;

        for selection in selections {
            self.print_indent();
            self.print_selection(selection);
            self.output.push('\n');
        }

        self.indent_level -= 1;
        self.print_indent();
        self.output.push('}');
    }

    fn print_selection(&mut self, selection: &Selection) {
        match selection {
            Selection::ScalarField(field) => self.print_scalar_field(field),
            Selection::LinkedField(field) => self.print_linked_field(field),
            Selection::FragmentSpread(spread) => self.print_fragment_spread(spread),
            Selection::InlineFragment(inline) => self.print_inline_fragment(inline),
        }
    }

    fn print_scalar_field(&mut self, field: &ScalarField) {
        if let Some(ref alias) = field.alias {
            self.output.push_str(&alias.alias.value.to_string());
            self.output.push_str(": ");
        }

        self.output.push_str(&field.name.value.to_string());

        if let Some(ref args) = field.arguments {
            self.print_arguments(&args.items, &field.name.value.to_string());
        }

        self.print_directives(&field.directives);
    }

    fn print_linked_field(&mut self, field: &LinkedField) {
        if let Some(ref alias) = field.alias {
            self.output.push_str(&alias.alias.value.to_string());
            self.output.push_str(": ");
        }

        self.output.push_str(&field.name.value.to_string());

        if let Some(ref args) = field.arguments {
            self.print_arguments(&args.items, &field.name.value.to_string());
        }

        self.print_directives(&field.directives);

        self.output.push(' ');
        self.print_selection_set(&field.selections.items);
    }

    fn print_fragment_spread(&mut self, spread: &FragmentSpread) {
        self.output.push_str("...");
        self.output.push_str(&spread.name.value.to_string());

        if let Some(ref args) = spread.arguments {
            self.print_arguments(&args.items, &spread.name.value.to_string());
        }

        self.print_directives(&spread.directives);
    }

    fn print_inline_fragment(&mut self, inline: &InlineFragment) {
        self.output.push_str("...");

        if let Some(ref type_condition) = inline.type_condition {
            self.output.push_str(" on ");
            self.output
                .push_str(&type_condition.type_.value.to_string());
        }

        self.print_directives(&inline.directives);

        self.output.push(' ');
        self.print_selection_set(&inline.selections.items);
    }

    fn print_arguments(&mut self, arguments: &[Argument], context: &str) {
        if arguments.is_empty() {
            return;
        }

        let single_line = self.format_arguments_single_line(arguments);
        let current_line_len = self.current_line_length() + context.len();

        if current_line_len + single_line.len() <= LINE_WIDTH {
            self.output.push_str(&single_line);
        } else {
            self.output.push_str("(\n");
            self.indent_level += 1;

            for arg in arguments {
                self.print_indent();
                self.output.push_str(&arg.name.value.to_string());
                self.output.push_str(": ");
                self.print_value(&arg.value);
                self.output.push('\n');
            }

            self.indent_level -= 1;
            self.print_indent();
            self.output.push(')');
        }
    }

    fn format_arguments_single_line(&self, arguments: &[Argument]) -> String {
        let args: Vec<String> = arguments
            .iter()
            .map(|arg| format!("{}: {}", arg.name.value, self.format_value(&arg.value)))
            .collect();
        format!("({})", args.join(", "))
    }

    fn print_directives(&mut self, directives: &[Directive]) {
        for directive in directives {
            self.output.push(' ');
            self.print_directive(directive);
        }
    }

    fn print_directive(&mut self, directive: &Directive) {
        self.output.push('@');
        self.output.push_str(&directive.name.value.to_string());

        if let Some(ref arguments) = directive.arguments {
            let single_line = self.format_arguments_single_line(&arguments.items);
            if self.current_line_length() + single_line.len() <= LINE_WIDTH {
                self.output.push_str(&single_line);
            } else {
                self.output.push_str("(\n");
                self.indent_level += 1;

                for arg in &arguments.items {
                    self.print_indent();
                    self.output.push_str(&arg.name.value.to_string());
                    self.output.push_str(": ");
                    self.print_value(&arg.value);
                    self.output.push('\n');
                }

                self.indent_level -= 1;
                self.print_indent();
                self.output.push(')');
            }
        }
    }

    fn format_directives(&self, directives: &[Directive]) -> String {
        directives
            .iter()
            .map(|d| {
                let mut result = format!("@{}", d.name.value);
                if let Some(ref arguments) = d.arguments {
                    let args: Vec<String> = arguments
                        .items
                        .iter()
                        .map(|arg| format!("{}: {}", arg.name.value, self.format_value(&arg.value)))
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

    fn print_value(&mut self, value: &Value) {
        self.output.push_str(&self.format_value(value));
    }

    fn format_value(&self, value: &Value) -> String {
        match value {
            Value::Constant(cv) => self.format_constant_value(cv),
            Value::Variable(v) => format!("${}", v.name),
            Value::List(list) => {
                let items: Vec<String> = list.items.iter().map(|v| self.format_value(v)).collect();
                format!("[{}]", items.join(", "))
            }
            Value::Object(obj) => {
                let fields: Vec<String> = obj
                    .items
                    .iter()
                    .map(|arg| format!("{}: {}", arg.name.value, self.format_value(&arg.value)))
                    .collect();
                format!("{{{}}}", fields.join(", "))
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

    fn print_indent(&mut self) {
        for _ in 0..self.indent_level {
            self.output.push_str(INDENT);
        }
    }

    fn current_line_length(&self) -> usize {
        self.output
            .rfind('\n')
            .map(|pos| self.output.len() - pos - 1)
            .unwrap_or(self.output.len())
    }
}

#[cfg(test)]
mod tests {
    use common::SourceLocationKey;
    use graphql_syntax::parse_executable;

    use super::*;

    fn print(source: &str) -> String {
        let document =
            parse_executable(source, SourceLocationKey::generated()).expect("Failed to parse");
        prettier_print_executable_document(&document)
    }

    #[test]
    fn test_simple_query() {
        let result = print(
            r#"
            query UserQuery {
                user {
                    id
                    name
                }
            }
            "#,
        );
        assert_eq!(
            result,
            "query UserQuery {\n  user {\n    id\n    name\n  }\n}\n"
        );
    }

    #[test]
    fn test_anonymous_query() {
        let result = print(
            r#"
            {
                user {
                    id
                }
            }
            "#,
        );
        assert_eq!(result, "{\n  user {\n    id\n  }\n}\n");
    }

    #[test]
    fn test_query_with_variables() {
        let result = print(
            r#"
            query UserQuery($id: ID!) {
                user(id: $id) {
                    name
                }
            }
            "#,
        );
        assert_eq!(
            result,
            "query UserQuery($id: ID!) {\n  user(id: $id) {\n    name\n  }\n}\n"
        );
    }

    #[test]
    fn test_query_with_default_value() {
        let result = print(
            r#"
            query UserQuery($first: Int = 10) {
                users(first: $first) {
                    name
                }
            }
            "#,
        );
        assert_eq!(
            result,
            "query UserQuery($first: Int = 10) {\n  users(first: $first) {\n    name\n  }\n}\n"
        );
    }

    #[test]
    fn test_mutation() {
        let result = print(
            r#"
            mutation CreateUser($input: CreateUserInput!) {
                createUser(input: $input) {
                    user {
                        id
                    }
                }
            }
            "#,
        );
        assert_eq!(
            result,
            "mutation CreateUser($input: CreateUserInput!) {\n  createUser(input: $input) {\n    user {\n      id\n    }\n  }\n}\n"
        );
    }

    #[test]
    fn test_subscription() {
        let result = print(
            r#"
            subscription OnMessage {
                messageAdded {
                    content
                }
            }
            "#,
        );
        assert_eq!(
            result,
            "subscription OnMessage {\n  messageAdded {\n    content\n  }\n}\n"
        );
    }

    #[test]
    fn test_fragment() {
        let result = print(
            r#"
            fragment UserFields on User {
                id
                name
                email
            }
            "#,
        );
        assert_eq!(
            result,
            "fragment UserFields on User {\n  id\n  name\n  email\n}\n"
        );
    }

    #[test]
    fn test_fragment_spread() {
        let result = print(
            r#"
            query UserQuery {
                user {
                    ...UserFields
                }
            }
            "#,
        );
        assert_eq!(
            result,
            "query UserQuery {\n  user {\n    ...UserFields\n  }\n}\n"
        );
    }

    #[test]
    fn test_inline_fragment() {
        let result = print(
            r#"
            query SearchQuery {
                search {
                    ... on User {
                        name
                    }
                    ... on Post {
                        title
                    }
                }
            }
            "#,
        );
        assert_eq!(
            result,
            "query SearchQuery {\n  search {\n    ... on User {\n      name\n    }\n    ... on Post {\n      title\n    }\n  }\n}\n"
        );
    }

    #[test]
    fn test_inline_fragment_without_type() {
        let result = print(
            r#"
            query UserQuery {
                user {
                    ... @include(if: $showDetails) {
                        email
                    }
                }
            }
            "#,
        );
        assert_eq!(
            result,
            "query UserQuery {\n  user {\n    ... @include(if: $showDetails) {\n      email\n    }\n  }\n}\n"
        );
    }

    #[test]
    fn test_field_with_alias() {
        let result = print(
            r#"
            query UserQuery {
                myUser: user {
                    id
                }
            }
            "#,
        );
        assert_eq!(
            result,
            "query UserQuery {\n  myUser: user {\n    id\n  }\n}\n"
        );
    }

    #[test]
    fn test_field_with_arguments() {
        let result = print(
            r#"
            query UserQuery {
                user(id: "123") {
                    name
                }
            }
            "#,
        );
        assert_eq!(
            result,
            "query UserQuery {\n  user(id: \"123\") {\n    name\n  }\n}\n"
        );
    }

    #[test]
    fn test_field_with_directive() {
        let result = print(
            r#"
            query UserQuery {
                user {
                    email @skip(if: true)
                }
            }
            "#,
        );
        assert_eq!(
            result,
            "query UserQuery {\n  user {\n    email @skip(if: true)\n  }\n}\n"
        );
    }

    #[test]
    fn test_operation_with_directive() {
        let result = print(
            r#"
            query UserQuery @cache(maxAge: 3600) {
                user {
                    name
                }
            }
            "#,
        );
        assert_eq!(
            result,
            "query UserQuery @cache(maxAge: 3600) {\n  user {\n    name\n  }\n}\n"
        );
    }

    #[test]
    fn test_fragment_with_directive() {
        let result = print(
            r#"
            fragment UserFields on User @argumentDefinitions(showEmail: {type: "Boolean!", defaultValue: false}) {
                id
                name
            }
            "#,
        );
        assert!(result.starts_with("fragment UserFields on User @argumentDefinitions"));
    }

    #[test]
    fn test_multiple_definitions() {
        let result = print(
            r#"
            query UserQuery {
                user {
                    ...UserFields
                }
            }

            fragment UserFields on User {
                id
                name
            }
            "#,
        );
        assert!(result.contains("query UserQuery"));
        assert!(result.contains("fragment UserFields on User"));
    }

    #[test]
    fn test_value_types() {
        let result = print(
            r#"
            query TestQuery {
                field(
                    stringArg: "hello"
                    intArg: 42
                    floatArg: 3.14
                    boolArg: true
                    nullArg: null
                    enumArg: ACTIVE
                    listArg: [1, 2, 3]
                    objectArg: {key: "value"}
                )
            }
            "#,
        );
        assert!(result.contains("stringArg: \"hello\""));
        assert!(result.contains("intArg: 42"));
        assert!(result.contains("boolArg: true"));
        assert!(result.contains("nullArg: null"));
        assert!(result.contains("enumArg: ACTIVE"));
        assert!(result.contains("listArg: [1, 2, 3]"));
        assert!(result.contains("objectArg: {key: \"value\"}"));
    }
}
