/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Document builders for prettier-compatible formatting using the `pretty` crate.
//!
//! This module provides document builders that map 1:1 to prettier-JS primitives,
//! enabling declarative formatting that matches prettier-graphql output.
//!
//! ## Prettier-JS to Rust Mapping
//!
//! | Prettier-JS | Rust `pretty` Equivalent |
//! |-------------|--------------------------|
//! | `line` | `RcDoc::line()` - space when flat, newline when broken |
//! | `softline` | `RcDoc::softline()` - empty when flat, newline when broken |
//! | `hardline` | `RcDoc::hardline()` - always newline + force break |
//! | `indent(contents)` | `doc.nest(INDENT_WIDTH)` |
//! | `group(contents)` | `doc.group()` |
//! | `ifBreak(break, flat)` | `if_break_doc(break_contents, flat_contents)` |
//! | `join(sep, docs)` | `balanced_intersperse(docs, sep)` |

#![allow(dead_code)]

use graphql_syntax::ConstantArgument;
use graphql_syntax::ConstantDirective;
use graphql_syntax::ConstantValue;
use graphql_syntax::TypeAnnotation;
use pretty::RcDoc;

/// Indentation width (2 spaces, matching prettier-graphql).
pub const INDENT_WIDTH: isize = 2;

/// Line width for prettier-graphql formatting decisions.
pub const LINE_WIDTH: usize = 80;

/// Like `RcDoc::intersperse`, but builds a balanced binary tree of `Append`
/// nodes (depth O(log N)) instead of a linear chain (depth O(N)).
///
/// `RcDoc::intersperse` produces a left-nested `Append` chain. For large
/// lists, the compiler-generated recursive `Drop` for `Rc<Doc>` overflows
/// the stack. A balanced tree keeps the depth logarithmic.
pub fn balanced_intersperse(
    docs: Vec<RcDoc<'static, ()>>,
    sep: RcDoc<'static, ()>,
) -> RcDoc<'static, ()> {
    if docs.is_empty() {
        return RcDoc::nil();
    }
    if docs.len() == 1 {
        return docs
            .into_iter()
            .next()
            .expect("should have exactly one element after length check");
    }

    // Interleave separators: [a, sep, b, sep, c]
    let mut items: Vec<RcDoc<'static, ()>> = Vec::with_capacity(docs.len() * 2 - 1);
    for (i, doc) in docs.into_iter().enumerate() {
        if i > 0 {
            items.push(sep.clone());
        }
        items.push(doc);
    }

    // Pairwise-merge into a balanced binary tree of Append nodes
    while items.len() > 1 {
        let mut next = Vec::with_capacity(items.len().div_ceil(2));
        let mut iter = items.into_iter();
        while let Some(a) = iter.next() {
            if let Some(b) = iter.next() {
                next.push(a.append(b));
            } else {
                next.push(a);
            }
        }
        items = next;
    }

    items
        .into_iter()
        .next()
        .expect("should have exactly one element after pairwise merge")
}

/// Creates a document that renders differently when flat vs broken.
///
/// This is the Rust equivalent of prettier-JS's `ifBreak(breakContents, flatContents)`.
/// When the containing group fits on one line (flat mode), `flat_contents` is used.
/// When the group breaks to multiple lines, `break_contents` is used.
///
/// # Example
///
/// ```ignore
/// // Prettier-JS: ifBreak("", ", ")
/// if_break_doc(RcDoc::nil(), RcDoc::text(", "))
/// ```
pub fn if_break_doc<'a>(
    break_contents: RcDoc<'a, ()>,
    flat_contents: RcDoc<'a, ()>,
) -> RcDoc<'a, ()> {
    RcDoc::flat_alt(break_contents, flat_contents)
}

/// Formats a `ConstantValue` as a document.
///
/// This handles all constant value types: Int, Float, String, Boolean,
/// Null, Enum, List, and Object.
pub fn constant_value_doc(value: &ConstantValue) -> RcDoc<'static, ()> {
    match value {
        ConstantValue::Int(i) => RcDoc::text(i.value.to_string()),
        ConstantValue::Float(f) => RcDoc::text(f.source_value.to_string()),
        ConstantValue::String(s) => RcDoc::text(format!("\"{}\"", s.value)),
        ConstantValue::Boolean(b) => RcDoc::text(if b.value { "true" } else { "false" }),
        ConstantValue::Null(_) => RcDoc::text("null"),
        ConstantValue::Enum(e) => RcDoc::text(e.value.to_string()),
        ConstantValue::List(list) => {
            if list.items.is_empty() {
                RcDoc::text("[]")
            } else {
                let items: Vec<RcDoc<'static, ()>> =
                    list.items.iter().map(constant_value_doc).collect();
                RcDoc::text("[")
                    .append(balanced_intersperse(items, RcDoc::text(", ")))
                    .append(RcDoc::text("]"))
            }
        }
        ConstantValue::Object(obj) => {
            if obj.items.is_empty() {
                RcDoc::text("{}")
            } else {
                let fields: Vec<RcDoc<'static, ()>> =
                    obj.items.iter().map(constant_argument_doc).collect();
                RcDoc::text("{")
                    .append(balanced_intersperse(fields, RcDoc::text(", ")))
                    .append(RcDoc::text("}"))
            }
        }
    }
}

/// Formats a `ConstantArgument` as "name: value".
pub fn constant_argument_doc(arg: &ConstantArgument) -> RcDoc<'static, ()> {
    RcDoc::text(arg.name.value.to_string())
        .append(RcDoc::text(": "))
        .append(constant_value_doc(&arg.value))
}

/// Formats a `TypeAnnotation` as a document.
///
/// Handles Named types, List types, and NonNull types.
pub fn type_annotation_doc(type_: &TypeAnnotation) -> RcDoc<'static, ()> {
    match type_ {
        TypeAnnotation::Named(named) => RcDoc::text(named.name.value.to_string()),
        TypeAnnotation::List(list) => RcDoc::text("[")
            .append(type_annotation_doc(&list.type_))
            .append(RcDoc::text("]")),
        TypeAnnotation::NonNull(non_null) => {
            type_annotation_doc(&non_null.type_).append(RcDoc::text("!"))
        }
    }
}

/// Formats a single `ConstantDirective` as a document.
///
/// Produces `@name` or `@name(arg1: value1, arg2: value2)`.
pub fn constant_directive_doc(directive: &ConstantDirective) -> RcDoc<'static, ()> {
    let name_doc = RcDoc::text(format!("@{}", directive.name.value));

    if let Some(ref arguments) = directive.arguments {
        if arguments.items.is_empty() {
            name_doc
        } else {
            let args: Vec<RcDoc<'static, ()>> =
                arguments.items.iter().map(constant_argument_doc).collect();
            name_doc
                .append(RcDoc::text("("))
                .append(balanced_intersperse(args, RcDoc::text(", ")))
                .append(RcDoc::text(")"))
        }
    } else {
        name_doc
    }
}

/// Formats a slice of `ConstantDirective` as a space-separated document.
pub fn constant_directives_doc(directives: &[ConstantDirective]) -> RcDoc<'static, ()> {
    if directives.is_empty() {
        RcDoc::nil()
    } else {
        let docs: Vec<RcDoc<'static, ()>> = directives.iter().map(constant_directive_doc).collect();
        balanced_intersperse(docs, RcDoc::text(" "))
    }
}

/// Renders a document to a string with the given line width.
pub fn render_doc(doc: RcDoc<'static, ()>, width: usize) -> String {
    let mut output = Vec::new();
    doc.render(width, &mut output)
        .expect("Failed to render document to buffer");
    String::from_utf8(output).expect("Document output contained invalid UTF-8")
}

#[cfg(test)]
mod tests {
    use common::SourceLocationKey;
    use graphql_syntax::parse_executable;
    use graphql_syntax::parse_schema_document;

    use super::*;

    #[test]
    fn test_balanced_intersperse_empty() {
        let result = render_doc(balanced_intersperse(vec![], RcDoc::text(", ")), LINE_WIDTH);
        assert_eq!(result, "");
    }

    #[test]
    fn test_balanced_intersperse_single() {
        let docs = vec![RcDoc::text("a")];
        let result = render_doc(balanced_intersperse(docs, RcDoc::text(", ")), LINE_WIDTH);
        assert_eq!(result, "a");
    }

    #[test]
    fn test_balanced_intersperse_two() {
        let docs = vec![RcDoc::text("a"), RcDoc::text("b")];
        let result = render_doc(balanced_intersperse(docs, RcDoc::text(", ")), LINE_WIDTH);
        assert_eq!(result, "a, b");
    }

    #[test]
    fn test_balanced_intersperse_multiple() {
        let docs = vec![
            RcDoc::text("a"),
            RcDoc::text("b"),
            RcDoc::text("c"),
            RcDoc::text("d"),
            RcDoc::text("e"),
        ];
        let result = render_doc(
            balanced_intersperse(docs.clone(), RcDoc::text(", ")),
            LINE_WIDTH,
        );
        let expected = render_doc(RcDoc::intersperse(docs, RcDoc::text(", ")), LINE_WIDTH);
        assert_eq!(
            result, expected,
            "balanced_intersperse should produce the same output as RcDoc::intersperse"
        );
    }

    #[test]
    fn test_balanced_intersperse_odd_count() {
        let docs = vec![RcDoc::text("x"), RcDoc::text("y"), RcDoc::text("z")];
        let result = render_doc(
            balanced_intersperse(docs.clone(), RcDoc::text(" | ")),
            LINE_WIDTH,
        );
        let expected = render_doc(RcDoc::intersperse(docs, RcDoc::text(" | ")), LINE_WIDTH);
        assert_eq!(result, expected);
    }

    #[test]
    fn test_if_break_doc_flat() {
        let doc = if_break_doc(RcDoc::text("BROKEN"), RcDoc::text("flat"))
            .group()
            .append(RcDoc::text(" end"));

        let result = render_doc(doc, 80);
        assert_eq!(result, "flat end");
    }

    #[test]
    fn test_if_break_doc_broken() {
        let inner = if_break_doc(RcDoc::text("BROKEN"), RcDoc::text("flat"));
        let doc = RcDoc::text("start")
            .append(RcDoc::line())
            .append(inner)
            .append(RcDoc::line())
            .append(RcDoc::text("a very long text that will cause breaking"))
            .group();

        let result = render_doc(doc, 20);
        assert!(
            result.contains("BROKEN"),
            "Expected 'BROKEN' in: {}",
            result
        );
    }

    #[test]
    fn test_constant_value_primitives() {
        let source = "query Q { field(int: 42, float: 3.14, str: \"hello\", bool: true, null_val: null, enum_val: ACTIVE) }";
        let doc = parse_executable(source, SourceLocationKey::generated()).unwrap();

        if let graphql_syntax::ExecutableDefinition::Operation(op) = &doc.definitions[0]
            && let graphql_syntax::Selection::ScalarField(field) = &op.selections.items[0]
        {
            let args = field.arguments.as_ref().unwrap();

            if let graphql_syntax::Value::Constant(cv) = &args.items[0].value {
                assert_eq!(render_doc(constant_value_doc(cv), 80), "42");
            }
            if let graphql_syntax::Value::Constant(cv) = &args.items[1].value {
                assert_eq!(render_doc(constant_value_doc(cv), 80), "3.14");
            }
            if let graphql_syntax::Value::Constant(cv) = &args.items[2].value {
                assert_eq!(render_doc(constant_value_doc(cv), 80), "\"hello\"");
            }
            if let graphql_syntax::Value::Constant(cv) = &args.items[3].value {
                assert_eq!(render_doc(constant_value_doc(cv), 80), "true");
            }
            if let graphql_syntax::Value::Constant(cv) = &args.items[4].value {
                assert_eq!(render_doc(constant_value_doc(cv), 80), "null");
            }
            if let graphql_syntax::Value::Constant(cv) = &args.items[5].value {
                assert_eq!(render_doc(constant_value_doc(cv), 80), "ACTIVE");
            }
        }
    }

    #[test]
    fn test_constant_value_list() {
        let source = "query Q { field(list: [1, 2, 3]) }";
        let doc = parse_executable(source, SourceLocationKey::generated()).unwrap();

        if let graphql_syntax::ExecutableDefinition::Operation(op) = &doc.definitions[0]
            && let graphql_syntax::Selection::ScalarField(field) = &op.selections.items[0]
        {
            let args = field.arguments.as_ref().unwrap();
            if let graphql_syntax::Value::Constant(cv) = &args.items[0].value {
                assert_eq!(render_doc(constant_value_doc(cv), 80), "[1, 2, 3]");
            }
        }
    }

    #[test]
    fn test_constant_value_object() {
        let source = "query Q { field(obj: {key: \"value\", num: 42}) }";
        let doc = parse_executable(source, SourceLocationKey::generated()).unwrap();

        if let graphql_syntax::ExecutableDefinition::Operation(op) = &doc.definitions[0]
            && let graphql_syntax::Selection::ScalarField(field) = &op.selections.items[0]
        {
            let args = field.arguments.as_ref().unwrap();
            if let graphql_syntax::Value::Constant(cv) = &args.items[0].value {
                assert_eq!(
                    render_doc(constant_value_doc(cv), 80),
                    "{key: \"value\", num: 42}"
                );
            }
        }
    }

    #[test]
    fn test_type_annotation_named() {
        let source = "type User { name: String }";
        let doc = parse_schema_document(source, SourceLocationKey::generated()).unwrap();

        if let graphql_syntax::TypeSystemDefinition::ObjectTypeDefinition(def) = &doc.definitions[0]
        {
            let field = &def.fields.as_ref().unwrap().items[0];
            assert_eq!(render_doc(type_annotation_doc(&field.type_), 80), "String");
        }
    }

    #[test]
    fn test_type_annotation_non_null() {
        let source = "type User { id: ID! }";
        let doc = parse_schema_document(source, SourceLocationKey::generated()).unwrap();

        if let graphql_syntax::TypeSystemDefinition::ObjectTypeDefinition(def) = &doc.definitions[0]
        {
            let field = &def.fields.as_ref().unwrap().items[0];
            assert_eq!(render_doc(type_annotation_doc(&field.type_), 80), "ID!");
        }
    }

    #[test]
    fn test_type_annotation_list() {
        let source = "type User { friends: [User!]! }";
        let doc = parse_schema_document(source, SourceLocationKey::generated()).unwrap();

        if let graphql_syntax::TypeSystemDefinition::ObjectTypeDefinition(def) = &doc.definitions[0]
        {
            let field = &def.fields.as_ref().unwrap().items[0];
            assert_eq!(
                render_doc(type_annotation_doc(&field.type_), 80),
                "[User!]!"
            );
        }
    }

    #[test]
    fn test_constant_directive_simple() {
        let source = "type User @deprecated { name: String }";
        let doc = parse_schema_document(source, SourceLocationKey::generated()).unwrap();

        if let graphql_syntax::TypeSystemDefinition::ObjectTypeDefinition(def) = &doc.definitions[0]
        {
            let directive = &def.directives[0];
            assert_eq!(
                render_doc(constant_directive_doc(directive), 80),
                "@deprecated"
            );
        }
    }

    #[test]
    fn test_constant_directive_with_args() {
        let source = "type User @deprecated(reason: \"use Person\") { name: String }";
        let doc = parse_schema_document(source, SourceLocationKey::generated()).unwrap();

        if let graphql_syntax::TypeSystemDefinition::ObjectTypeDefinition(def) = &doc.definitions[0]
        {
            let directive = &def.directives[0];
            assert_eq!(
                render_doc(constant_directive_doc(directive), 80),
                "@deprecated(reason: \"use Person\")"
            );
        }
    }

    #[test]
    fn test_constant_directives_multiple() {
        let source = "type User @internal @deprecated { name: String }";
        let doc = parse_schema_document(source, SourceLocationKey::generated()).unwrap();

        if let graphql_syntax::TypeSystemDefinition::ObjectTypeDefinition(def) = &doc.definitions[0]
        {
            assert_eq!(
                render_doc(constant_directives_doc(&def.directives), 80),
                "@internal @deprecated"
            );
        }
    }
}
