/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Prettier-compatible printer for GraphQL documents containing both
//! executable and type system definitions.
//!
//! This module delegates to the schema printer and executable printer
//! as appropriate for each definition in the document.

use graphql_syntax::Definition;
use graphql_syntax::Document;

use crate::prettier_executable_printer::prettier_print_executable_definition;
use crate::prettier_schema_printer::prettier_print_type_system_definition;

/// Prints a Document (containing any GraphQL definitions) in prettier-graphql compatible format.
///
/// This function handles mixed documents containing both executable definitions
/// (operations, fragments) and type system definitions (types, directives, etc.).
pub fn prettier_print_document(document: &Document) -> String {
    let mut output = String::new();
    let mut first = true;

    for definition in &document.definitions {
        if !first {
            output.push('\n');
        }
        first = false;

        match definition {
            Definition::ExecutableDefinition(exec_def) => {
                output.push_str(&prettier_print_executable_definition(exec_def));
            }
            Definition::TypeSystemDefinition(type_def) => {
                output.push_str(&prettier_print_type_system_definition(type_def));
            }
        }
    }

    output
}

#[cfg(test)]
mod tests {
    use common::SourceLocationKey;
    use graphql_syntax::parse_document;

    use super::*;

    fn print(source: &str) -> String {
        let document =
            parse_document(source, SourceLocationKey::generated()).expect("Failed to parse");
        prettier_print_document(&document)
    }

    #[test]
    fn test_query_only() {
        let result = print(
            r#"
            query UserQuery {
                user {
                    id
                }
            }
            "#,
        );
        assert_eq!(result, "query UserQuery {\n  user {\n    id\n  }\n}\n");
    }

    #[test]
    fn test_type_only() {
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
    fn test_mixed_document() {
        let result = print(
            r#"
            type User {
                id: ID!
                name: String
            }

            query UserQuery {
                user {
                    id
                }
            }
            "#,
        );
        assert!(result.contains("type User"));
        assert!(result.contains("query UserQuery"));
    }

    #[test]
    fn test_fragment_and_type() {
        let result = print(
            r#"
            type User {
                id: ID!
            }

            fragment UserFields on User {
                id
            }
            "#,
        );
        assert!(result.contains("type User"));
        assert!(result.contains("fragment UserFields on User"));
    }
}
