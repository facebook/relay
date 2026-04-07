/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Built-in GraphQL scalar type utilities.
//!
//! This module provides functions to add or remove the built-in scalar types
//! (Int, Float, String, Boolean, ID) from a SchemaSet.
//!
//! See https://spec.graphql.org/draft/#sec-Scalars.Built-in-Scalars

use common::ScalarName;
use intern::string_key::Intern;
use intern::string_key::StringKeySet;
use lazy_static::lazy_static;

use crate::schema_set::SchemaSet;
use crate::schema_set::SetScalar;
use crate::schema_set::SetType;
use crate::set_merges::Merges;

lazy_static! {
    /// A SchemaSet containing only the built-in GraphQL scalar types.
    /// This set has no root types (Query, Mutation, Subscription), no directives,
    /// and only the 5 built-in scalars.
    /// See https://spec.graphql.org/draft/#sec-Scalars.Built-in-Scalars
    pub static ref BUILTIN_SCALAR_SET: SchemaSet = {
        let mut set = SchemaSet::new();

        for name in ["Int", "Float", "String", "Boolean", "ID"] {
            let key = name.intern();
            set.types.insert(
                key,
                SetType::Scalar(SetScalar {
                    name: ScalarName(key),
                    directives: vec![],
                    definition: None,
                }),
            );
        }
        set
    };
}

/// Adds built-in scalar types (Int, Float, String, Boolean, ID) to the schema.
///
/// This is useful for validation when working with partial schemas that don't
/// include built-in scalar definitions.
///
/// See https://spec.graphql.org/draft/#sec-Scalars.Built-in-Scalars
pub fn add_built_in_scalars(schema_set: &mut SchemaSet) {
    schema_set.merge(BUILTIN_SCALAR_SET.clone());
}

/// Removes built-in scalar types (Int, Float, String, Boolean, ID) from the schema.
///
/// Only removes scalars that have no directives (i.e., are plain built-in scalars).
/// We do not want to print out any built-in scalar types in schema output.
///
/// See https://spec.graphql.org/draft/#sec-Scalars.Built-in-Scalars
pub fn remove_built_in_scalars(schema_set: &SchemaSet) -> SchemaSet {
    schema_set.exclude_set(&BUILTIN_SCALAR_SET, &StringKeySet::default())
}

#[cfg(test)]
mod tests {
    use common::SourceLocationKey;
    use graphql_syntax::parse_schema_document;
    use intern::string_key::Intern;

    use super::*;
    use crate::ToSDLDefinition;

    fn set_from_str(sdl: &str) -> SchemaSet {
        SchemaSet::from_schema_documents(&[parse_schema_document(
            sdl,
            SourceLocationKey::generated(),
        )
        .unwrap()])
    }

    // The reason we are testing SchemaSet::new here is that it's important for
    // the assumptions of excluding BUILTIN_SCALAR_SET that the new schema set is
    // empty. If that changes then we could have odd bugs during exclude operations.
    #[test]
    fn test_schema_set_new_is_empty() {
        let set = SchemaSet::new();
        assert!(set.root_schema.query_type.is_none());
        assert!(set.root_schema.mutation_type.is_none());
        assert!(set.root_schema.subscription_type.is_none());
        assert!(set.directives.is_empty());
        assert!(set.types.is_empty());
    }

    #[test]
    fn test_builtin_scalar_set_contains_only_scalars() {
        // Verify BUILTIN_SCALAR_SET contains exactly the 5 built-in scalars
        assert!(BUILTIN_SCALAR_SET.types.contains_key(&"String".intern()));
        assert!(BUILTIN_SCALAR_SET.types.contains_key(&"Int".intern()));
        assert!(BUILTIN_SCALAR_SET.types.contains_key(&"Float".intern()));
        assert!(BUILTIN_SCALAR_SET.types.contains_key(&"Boolean".intern()));
        assert!(BUILTIN_SCALAR_SET.types.contains_key(&"ID".intern()));
        assert_eq!(BUILTIN_SCALAR_SET.types.len(), 5);

        // Verify it has no root types
        assert!(BUILTIN_SCALAR_SET.root_schema.query_type.is_none());
        assert!(BUILTIN_SCALAR_SET.root_schema.mutation_type.is_none());
        assert!(BUILTIN_SCALAR_SET.root_schema.subscription_type.is_none());

        // Verify it has no directives
        assert!(BUILTIN_SCALAR_SET.directives.is_empty());
    }

    #[test]
    fn test_add_built_in_scalars() {
        let mut schema_set = SchemaSet::new();
        assert!(!schema_set.types.contains_key(&"String".intern()));

        add_built_in_scalars(&mut schema_set);

        assert!(schema_set.types.contains_key(&"String".intern()));
        assert!(schema_set.types.contains_key(&"Int".intern()));
        assert!(schema_set.types.contains_key(&"Float".intern()));
        assert!(schema_set.types.contains_key(&"Boolean".intern()));
        assert!(schema_set.types.contains_key(&"ID".intern()));
    }

    #[test]
    fn test_remove_built_in_scalars_from_parsed_schema() {
        // Parse a schema that includes built-in scalars plus an empty Query type.
        // This tests that empty types (with no fields) that are NOT in the
        // BUILTIN_SCALAR_SET are preserved by the exclude operation.
        let schema_set = set_from_str(
            r#"
            scalar String
            scalar Int
            scalar Float
            scalar Boolean
            scalar ID

            type Query
        "#,
        );

        assert_eq!(schema_set.types.len(), 6); // 5 scalars + Query

        let without_builtins = remove_built_in_scalars(&schema_set);

        // Should only have Query remaining - even though it's empty (no fields),
        // it should NOT be filtered out because it wasn't part of the exclude set.
        assert_eq!(without_builtins.types.len(), 1);
        assert!(without_builtins.types.contains_key(&"Query".intern()));
        assert!(!without_builtins.types.contains_key(&"String".intern()));
        assert!(!without_builtins.types.contains_key(&"Int".intern()));
        assert!(!without_builtins.types.contains_key(&"Float".intern()));
        assert!(!without_builtins.types.contains_key(&"Boolean".intern()));
        assert!(!without_builtins.types.contains_key(&"ID".intern()));

        // Verify the output SDL contains Query
        let sdl = format!("{}", without_builtins.to_sdl_definition());
        assert!(sdl.contains("type Query"), "SDL should contain Query");
        assert!(
            !sdl.contains("scalar String"),
            "SDL should not contain scalar String"
        );
    }
}
