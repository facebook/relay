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
//!
//! Uses the `pretty` crate for declarative document-based formatting.

use graphql_syntax::Argument;
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
use graphql_syntax::Value;
use graphql_syntax::VariableDefinition;
use pretty::RcDoc;

use crate::prettier_common::format_constant_value;
use crate::prettier_common::format_type_annotation;
use crate::prettier_doc_builders::INDENT_WIDTH;
use crate::prettier_doc_builders::LINE_WIDTH;
use crate::prettier_doc_builders::render_doc;

/// Prints an ExecutableDocument in prettier-graphql compatible format.
///
/// This function produces output that matches prettier-graphql formatting
/// for executable definitions (operations and fragments).
pub fn prettier_print_executable_document(document: &ExecutableDocument) -> String {
    let docs: Vec<RcDoc<'static, ()>> = document
        .definitions
        .iter()
        .map(executable_definition_doc)
        .collect();

    if docs.is_empty() {
        return String::new();
    }

    let doc = RcDoc::intersperse(docs, RcDoc::hardline());
    render_doc(doc, LINE_WIDTH)
}

/// Prints an OperationDefinition in prettier-graphql compatible format.
pub fn prettier_print_operation(operation: &OperationDefinition) -> String {
    let doc = operation_doc(operation);
    render_doc(doc, LINE_WIDTH)
}

/// Prints a FragmentDefinition in prettier-graphql compatible format.
pub fn prettier_print_fragment(fragment: &FragmentDefinition) -> String {
    let doc = fragment_doc(fragment);
    render_doc(doc, LINE_WIDTH)
}

/// Prints an ExecutableDefinition in prettier-graphql compatible format.
pub fn prettier_print_executable_definition(definition: &ExecutableDefinition) -> String {
    let doc = executable_definition_doc(definition);
    render_doc(doc, LINE_WIDTH)
}

fn executable_definition_doc(definition: &ExecutableDefinition) -> RcDoc<'static, ()> {
    match definition {
        ExecutableDefinition::Operation(op) => operation_doc(op),
        ExecutableDefinition::Fragment(frag) => fragment_doc(frag),
    }
}

fn operation_doc(operation: &OperationDefinition) -> RcDoc<'static, ()> {
    let is_anonymous_query = operation.operation.is_none()
        && operation.name.is_none()
        && operation.variable_definitions.is_none()
        && operation.directives.is_empty();

    if is_anonymous_query {
        return selection_set_doc(&operation.selections.items).append(RcDoc::hardline());
    }

    let kind = operation.operation_kind().to_string();
    let mut prefix_len = kind.len();

    let mut doc = RcDoc::text(kind);

    if let Some(ref name) = operation.name {
        let name_str = name.value.to_string();
        prefix_len += 1 + name_str.len();
        doc = doc.append(RcDoc::text(" ")).append(RcDoc::text(name_str));
    }

    if let Some(ref var_defs) = operation.variable_definitions {
        doc = doc.append(variable_definitions_doc(&var_defs.items, prefix_len));
    }

    doc = doc.append(directives_inline_doc(&operation.directives));

    doc.append(RcDoc::text(" "))
        .append(selection_set_doc(&operation.selections.items))
        .append(RcDoc::hardline())
}

fn fragment_doc(fragment: &FragmentDefinition) -> RcDoc<'static, ()> {
    let name = fragment.name.value.to_string();
    let prefix_len = "fragment ".len() + name.len();

    let mut doc = RcDoc::text("fragment ").append(RcDoc::text(name));

    if let Some(ref var_defs) = fragment.variable_definitions {
        doc = doc.append(variable_definitions_doc(&var_defs.items, prefix_len));
    }

    doc = doc
        .append(RcDoc::text(" on "))
        .append(RcDoc::text(fragment.type_condition.type_.value.to_string()));

    doc = doc.append(directives_for_fragment_doc(&fragment.directives));

    doc.append(RcDoc::text(" "))
        .append(selection_set_doc(&fragment.selections.items))
        .append(RcDoc::hardline())
}

/// Build a document for variable definitions.
/// Computes whether everything fits on one line and formats accordingly.
fn variable_definitions_doc(
    var_defs: &[VariableDefinition],
    prefix_len: usize,
) -> RcDoc<'static, ()> {
    if var_defs.is_empty() {
        return RcDoc::nil();
    }

    let formatted: Vec<String> = var_defs.iter().map(format_variable_definition).collect();
    let single_line = format!("({})", formatted.join(", "));

    if prefix_len + single_line.len() <= LINE_WIDTH {
        RcDoc::text(single_line)
    } else {
        let var_docs: Vec<RcDoc<'static, ()>> = formatted.into_iter().map(RcDoc::text).collect();

        RcDoc::text("(")
            .append(
                RcDoc::hardline()
                    .append(RcDoc::intersperse(var_docs, RcDoc::hardline()))
                    .nest(INDENT_WIDTH),
            )
            .append(RcDoc::hardline())
            .append(RcDoc::text(")"))
    }
}

fn format_variable_definition(var_def: &VariableDefinition) -> String {
    let mut result = format!(
        "${}: {}",
        var_def.name.name,
        format_type_annotation(&var_def.type_)
    );

    if let Some(ref default) = var_def.default_value {
        result.push_str(&format!(" = {}", format_constant_value(&default.value)));
    }

    if !var_def.directives.is_empty() {
        result.push(' ');
        result.push_str(&format_directives_inline(&var_def.directives));
    }

    result
}

/// Build a document for selection set (always expanded).
fn selection_set_doc(selections: &[Selection]) -> RcDoc<'static, ()> {
    if selections.is_empty() {
        return RcDoc::nil();
    }

    let selection_docs: Vec<RcDoc<'static, ()>> = selections.iter().map(selection_doc).collect();

    RcDoc::text("{")
        .append(
            RcDoc::hardline()
                .append(RcDoc::intersperse(selection_docs, RcDoc::hardline()))
                .nest(INDENT_WIDTH),
        )
        .append(RcDoc::hardline())
        .append(RcDoc::text("}"))
}

fn selection_doc(selection: &Selection) -> RcDoc<'static, ()> {
    match selection {
        Selection::ScalarField(field) => scalar_field_doc(field),
        Selection::LinkedField(field) => linked_field_doc(field),
        Selection::FragmentSpread(spread) => fragment_spread_doc(spread),
        Selection::InlineFragment(inline) => inline_fragment_doc(inline),
    }
}

fn scalar_field_doc(field: &ScalarField) -> RcDoc<'static, ()> {
    let mut prefix = String::new();
    if let Some(ref alias) = field.alias {
        prefix.push_str(&format!("{}: ", alias.alias.value));
    }
    prefix.push_str(&field.name.value.to_string());

    let mut doc = RcDoc::text(prefix.clone());

    if let Some(ref args) = field.arguments {
        doc = doc.append(arguments_doc(&args.items, prefix.len()));
    }

    doc.append(directives_inline_doc(&field.directives))
}

fn linked_field_doc(field: &LinkedField) -> RcDoc<'static, ()> {
    let mut prefix = String::new();
    if let Some(ref alias) = field.alias {
        prefix.push_str(&format!("{}: ", alias.alias.value));
    }
    prefix.push_str(&field.name.value.to_string());

    let mut doc = RcDoc::text(prefix.clone());

    if let Some(ref args) = field.arguments {
        doc = doc.append(arguments_doc(&args.items, prefix.len()));
    }

    doc = doc.append(directives_inline_doc(&field.directives));

    doc.append(RcDoc::text(" "))
        .append(selection_set_doc(&field.selections.items))
}

fn fragment_spread_doc(spread: &FragmentSpread) -> RcDoc<'static, ()> {
    let prefix = format!("...{}", spread.name.value);
    let prefix_len = prefix.len();
    let mut doc = RcDoc::text(prefix);

    if let Some(ref args) = spread.arguments {
        doc = doc.append(arguments_doc(&args.items, prefix_len));
    }

    doc.append(directives_inline_doc(&spread.directives))
}

fn inline_fragment_doc(inline: &InlineFragment) -> RcDoc<'static, ()> {
    let mut prefix = "...".to_string();
    if let Some(ref type_condition) = inline.type_condition {
        prefix.push_str(&format!(" on {}", type_condition.type_.value));
    }

    let mut doc = RcDoc::text(prefix);
    doc = doc.append(directives_inline_doc(&inline.directives));

    doc.append(RcDoc::text(" "))
        .append(selection_set_doc(&inline.selections.items))
}

/// Build a document for arguments.
/// Computes whether everything fits on one line and formats accordingly.
fn arguments_doc(arguments: &[Argument], context_len: usize) -> RcDoc<'static, ()> {
    if arguments.is_empty() {
        return RcDoc::nil();
    }

    let formatted: Vec<String> = arguments.iter().map(format_argument).collect();
    let single_line = format!("({})", formatted.join(", "));

    if context_len + single_line.len() <= LINE_WIDTH {
        RcDoc::text(single_line)
    } else {
        let arg_docs: Vec<RcDoc<'static, ()>> = formatted.into_iter().map(RcDoc::text).collect();

        RcDoc::text("(")
            .append(
                RcDoc::hardline()
                    .append(RcDoc::intersperse(arg_docs, RcDoc::hardline()))
                    .nest(INDENT_WIDTH),
            )
            .append(RcDoc::hardline())
            .append(RcDoc::text(")"))
    }
}

fn format_argument(arg: &Argument) -> String {
    format!("{}: {}", arg.name.value, format_value(&arg.value))
}

/// Inline directives (space-separated, stays on same line).
fn directives_inline_doc(directives: &[Directive]) -> RcDoc<'static, ()> {
    if directives.is_empty() {
        return RcDoc::nil();
    }

    RcDoc::text(format!(" {}", format_directives_inline(directives)))
}

fn format_directives_inline(directives: &[Directive]) -> String {
    directives
        .iter()
        .map(format_directive)
        .collect::<Vec<_>>()
        .join(" ")
}

/// For fragment definitions, directives that would overflow go to a new line.
/// When directive arguments are too long, expand them across multiple lines.
fn directives_for_fragment_doc(directives: &[Directive]) -> RcDoc<'static, ()> {
    if directives.is_empty() {
        return RcDoc::nil();
    }

    let mut docs: Vec<RcDoc<'static, ()>> = Vec::new();

    for directive in directives {
        let simple_str = format_directive(directive);

        if simple_str.len() <= LINE_WIDTH {
            docs.push(RcDoc::text(simple_str));
        } else {
            docs.push(format_directive_expanded(directive));
        }
    }

    RcDoc::line()
        .append(RcDoc::intersperse(docs, RcDoc::line()))
        .group()
}

/// Format a directive with its arguments expanded across multiple lines.
fn format_directive_expanded(directive: &Directive) -> RcDoc<'static, ()> {
    let name_doc = RcDoc::text(format!("@{}", directive.name.value));

    if let Some(ref arguments) = directive.arguments {
        if arguments.items.is_empty() {
            name_doc
        } else {
            let arg_docs: Vec<RcDoc<'static, ()>> = arguments
                .items
                .iter()
                .map(|arg| RcDoc::text(format_argument(arg)))
                .collect();

            name_doc
                .append(RcDoc::text("("))
                .append(
                    RcDoc::hardline()
                        .append(RcDoc::intersperse(arg_docs, RcDoc::hardline()))
                        .nest(INDENT_WIDTH),
                )
                .append(RcDoc::hardline())
                .append(RcDoc::text(")"))
        }
    } else {
        name_doc
    }
}

fn format_directive(directive: &Directive) -> String {
    let mut result = format!("@{}", directive.name.value);
    if let Some(ref arguments) = directive.arguments
        && !arguments.items.is_empty()
    {
        let args: Vec<String> = arguments.items.iter().map(format_argument).collect();
        result.push_str(&format!("({})", args.join(", ")));
    }
    result
}

fn format_value(value: &Value) -> String {
    match value {
        Value::Constant(cv) => format_constant_value(cv),
        Value::Variable(v) => format!("${}", v.name),
        Value::List(list) => {
            let items: Vec<String> = list.items.iter().map(format_value).collect();
            format!("[{}]", items.join(", "))
        }
        Value::Object(obj) => {
            let fields: Vec<String> = obj
                .items
                .iter()
                .map(|arg| format!("{}: {}", arg.name.value, format_value(&arg.value)))
                .collect();
            format!("{{{}}}", fields.join(", "))
        }
    }
}

#[cfg(test)]
mod tests {
    use common::SourceLocationKey;
    use graphql_syntax::parse_executable;

    use super::*;
    use crate::test_utils::assert_prettier_output;

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
        assert_prettier_output!(
            result,
            [
                "fragment UserFields on User",
                "@argumentDefinitions(showEmail: {type: \"Boolean!\", defaultValue: false}) {",
                "  id",
                "  name",
                "}",
            ]
        );
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
        assert_prettier_output!(
            result,
            [
                "query UserQuery {",
                "  user {",
                "    ...UserFields",
                "  }",
                "}",
                "",
                "fragment UserFields on User {",
                "  id",
                "  name",
                "}",
            ]
        );
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
        assert_prettier_output!(
            result,
            [
                "query TestQuery {",
                "  field(",
                "    stringArg: \"hello\"",
                "    intArg: 42",
                "    floatArg: 3.14",
                "    boolArg: true",
                "    nullArg: null",
                "    enumArg: ACTIVE",
                "    listArg: [1, 2, 3]",
                "    objectArg: {key: \"value\"}",
                "  )",
                "}",
            ]
        );
    }
}
