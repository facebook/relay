/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Shadow Field Schema Extension
//!
//! This module provides functionality for extending schemas with shadow fields
//! based on compiler configuration.
//!
//! A shadow field is a field that conditionally switches between two different fields
//! based on a variable value. It's defined by:
//! 1. A parent type name
//! 2. A name for the shadow field
//! 3. Two field names that it will switch between (true/false branches)
//! 4. A variable name that it will use to switch on
//! 5. A return type which both conditional fields must implement
//!
//! # Usage Example
//!
//! ```rust,ignore
//! use intern::intern;
//! use relay_transforms::ShadowFieldConfig;
//!
//! let config = ShadowFieldConfig {
//!     parent_type_name: intern!("User"),
//!     shadow_field_name: intern!("email"),
//!     true_field_name: intern!("internalEmail"),
//!     false_field_name: intern!("externalEmail"),
//!     variable_name: intern!("isInternal"),
//!     return_type_name: intern!("String"),
//! };
//! ```
//!
//! To implement schema extension, the function directly adds fields to the schema:
//!
//! ```rust,ignore
//! // For each shadow field config:
//! let shadow_directive = create_shadow_field_directive(
//!     config.variable_name,
//!     config.true_field_name,
//!     config.false_field_name,
//! );
//!
//! let field = Field {
//!     name: WithLocation::generated(config.shadow_field_name),
//!     is_extension: true,
//!     arguments: ArgumentDefinitions::new(vec![]),
//!     type_: TypeReference::Named(return_type),
//!     directives: vec![shadow_directive],
//!     parent_type: Some(parent_type),
//!     description: None,
//!     hack_source: None,
//! };
//!
//! schema.add_field(field)?;
//! ```

use common::ArgumentName;
use common::Diagnostic;
use common::DiagnosticsResult;
use common::DirectiveName;
use common::Location;
use common::SourceLocationKey;
use common::Span;
use graphql_syntax::ConstantArgument;
use graphql_syntax::ConstantDirective;
use graphql_syntax::ConstantValue;
use graphql_syntax::FieldDefinition;
use graphql_syntax::Identifier;
use graphql_syntax::List;
use graphql_syntax::NamedTypeAnnotation;
use graphql_syntax::ObjectTypeExtension;
use graphql_syntax::StringNode;
use graphql_syntax::Token;
use graphql_syntax::TokenKind;
use graphql_syntax::TypeAnnotation;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use lazy_static::lazy_static;
use relay_config::SchemaConfig;
use schema::ArgumentValue;
use schema::DirectiveValue;
use schema::SDLSchema;
use schema::Schema;
use schema::Type;

lazy_static! {
    /// Directive name for shadow field metadata
    static ref SHADOW_FIELD_DIRECTIVE: DirectiveName = DirectiveName("__shadowField".intern());

    /// Argument names for shadow field directive
    static ref VARIABLE_NAME_ARG: ArgumentName = ArgumentName("variableName".intern());
    static ref TRUE_FIELD_ARG: ArgumentName = ArgumentName("trueField".intern());
    static ref FALSE_FIELD_ARG: ArgumentName = ArgumentName("falseField".intern());
}

/// Creates a dummy token for generated AST nodes
#[allow(dead_code)]
fn dummy_token() -> Token {
    Token {
        span: Span::empty(),
        kind: TokenKind::Empty,
    }
}

/// Extends the schema with additional fields based on shadow field configuration.
/// This function can be called during schema construction to add fields programmatically
/// based on options in the compiler config.
///
/// For each shadow field in the configuration:
/// 1. Adds a new field with the given name to the parent type
/// 2. Adds a metadata directive (@__shadowField) to that field with:
///    - variableName: The variable to switch on
///    - trueField: The field name to use when variable is true
///    - falseField: The field name to use when variable is false
///
/// # Arguments
/// * `schema` - The mutable schema to extend
/// * `schema_config` - Configuration containing shadow field options
///
/// # Returns
/// * `DiagnosticsResult<()>` - Ok if successful, Err with diagnostics on failure
///
/// # Example
/// ```ignore
/// let mut schema = build_schema(...)?;
/// extend_schema_with_shadow_fields(&mut schema, &project_config.schema_config)?;
/// ```
pub fn extend_schema_with_shadow_fields(
    schema: &mut SDLSchema,
    schema_config: &SchemaConfig,
) -> DiagnosticsResult<()> {
    let location_key = SourceLocationKey::generated();

    for shadow_field_config in &schema_config.shadow_fields {
        // Validate parent type exists
        let parent_type_name = shadow_field_config.parent_type_name;
        match schema.get_type(parent_type_name) {
            Some(Type::Object(_)) => {}
            Some(_) => {
                return Err(vec![Diagnostic::error(
                    format!(
                        "Shadow field parent type '{}' must be an object type",
                        parent_type_name
                    ),
                    Location::generated(),
                )]);
            }
            None => {
                return Err(vec![Diagnostic::error(
                    format!(
                        "Shadow field parent type '{}' not found in schema",
                        parent_type_name
                    ),
                    Location::generated(),
                )]);
            }
        };

        // Validate return type exists
        let return_type_name = shadow_field_config.return_type_name;
        if schema.get_type(return_type_name).is_none() {
            return Err(vec![Diagnostic::error(
                format!(
                    "Shadow field return type '{}' not found in schema",
                    return_type_name
                ),
                Location::generated(),
            )]);
        }

        // Create a field definition with the shadow field directive
        let field_definition = FieldDefinition {
            name: Identifier {
                span: Span::empty(),
                token: dummy_token(),
                value: shadow_field_config.shadow_field_name,
            },
            type_: TypeAnnotation::Named(NamedTypeAnnotation {
                name: Identifier {
                    span: Span::empty(),
                    token: dummy_token(),
                    value: return_type_name,
                },
            }),
            arguments: None,
            directives: vec![ConstantDirective {
                span: Span::empty(),
                at: dummy_token(),
                name: Identifier {
                    span: Span::empty(),
                    token: dummy_token(),
                    value: SHADOW_FIELD_DIRECTIVE.0,
                },
                arguments: Some(List {
                    span: Span::empty(),
                    start: dummy_token(),
                    items: vec![
                        ConstantArgument {
                            span: Span::empty(),
                            name: Identifier {
                                span: Span::empty(),
                                token: dummy_token(),
                                value: VARIABLE_NAME_ARG.0,
                            },
                            colon: dummy_token(),
                            value: ConstantValue::String(StringNode {
                                token: dummy_token(),
                                value: shadow_field_config.variable_name,
                            }),
                        },
                        ConstantArgument {
                            span: Span::empty(),
                            name: Identifier {
                                span: Span::empty(),
                                token: dummy_token(),
                                value: TRUE_FIELD_ARG.0,
                            },
                            colon: dummy_token(),
                            value: ConstantValue::String(StringNode {
                                token: dummy_token(),
                                value: shadow_field_config.true_field_name,
                            }),
                        },
                        ConstantArgument {
                            span: Span::empty(),
                            name: Identifier {
                                span: Span::empty(),
                                token: dummy_token(),
                                value: FALSE_FIELD_ARG.0,
                            },
                            colon: dummy_token(),
                            value: ConstantValue::String(StringNode {
                                token: dummy_token(),
                                value: shadow_field_config.false_field_name,
                            }),
                        },
                    ],
                    end: dummy_token(),
                }),
            }],
            description: None,
            hack_source: None,
            span: Span::empty(),
        };

        // Create an object type extension with the new field
        let extension = ObjectTypeExtension {
            name: Identifier {
                span: Span::empty(),
                token: dummy_token(),
                value: parent_type_name,
            },
            interfaces: vec![],
            directives: vec![],
            fields: Some(List {
                span: Span::empty(),
                start: dummy_token(),
                items: vec![field_definition],
                end: dummy_token(),
            }),
            span: Span::empty(),
        };

        // Add the extension to the schema
        schema.add_object_type_extension(extension, location_key)?;
    }

    Ok(())
}

/// Creates a directive value for shadow field metadata.
/// This directive stores the configuration needed at runtime to switch between fields.
///
/// # Arguments
/// * `variable_name` - The variable to switch on
/// * `true_field_name` - Field to use when variable is true
/// * `false_field_name` - Field to use when variable is false
///
/// # Returns
/// A DirectiveValue that can be attached to a field
#[allow(dead_code)]
fn create_shadow_field_directive(
    variable_name: StringKey,
    true_field_name: StringKey,
    false_field_name: StringKey,
) -> DirectiveValue {
    DirectiveValue {
        name: *SHADOW_FIELD_DIRECTIVE,
        arguments: vec![
            ArgumentValue {
                name: *VARIABLE_NAME_ARG,
                value: ConstantValue::String(StringNode {
                    token: dummy_token(),
                    value: variable_name,
                }),
            },
            ArgumentValue {
                name: *TRUE_FIELD_ARG,
                value: ConstantValue::String(StringNode {
                    token: dummy_token(),
                    value: true_field_name,
                }),
            },
            ArgumentValue {
                name: *FALSE_FIELD_ARG,
                value: ConstantValue::String(StringNode {
                    token: dummy_token(),
                    value: false_field_name,
                }),
            },
        ],
    }
}

#[cfg(test)]
mod tests {
    use relay_config::ShadowFieldConfig;

    use super::*;

    // TODO: Re-enable these tests once we have a better way to test schema mutations
    /*
    use relay_config::SchemaConfig;
    use relay_test_schema::get_test_schema;

    #[test]
    fn test_extend_schema_with_shadow_fields() {
        let mut schema = (*get_test_schema()).clone();
        let schema_config = SchemaConfig::default();

        // Should succeed without errors
        let result = extend_schema_with_shadow_fields(&mut schema, &schema_config);
        assert!(result.is_ok());
    }

    #[test]
    fn test_extend_schema_with_valid_shadow_field() {
        use intern::intern;

        let mut schema = (*get_test_schema()).clone();
        let mut schema_config = SchemaConfig::default();

        // Add a shadow field configuration for User type
        schema_config.shadow_fields = vec![ShadowFieldConfig {
            parent_type_name: intern!("User"),
            shadow_field_name: intern!("emailAddress"),
            true_field_name: intern!("emailAddressInternal"),
            false_field_name: intern!("emailAddressExternal"),
            variable_name: intern!("isInternal"),
            return_type_name: intern!("String"),
        }];

        // Should succeed
        let result = extend_schema_with_shadow_fields(&mut schema, &schema_config);
        assert!(result.is_ok());
    }

    #[test]
    fn test_extend_schema_with_invalid_parent_type() {
        use intern::intern;

        let mut schema = (*get_test_schema()).clone();
        let mut schema_config = SchemaConfig::default();

        // Add a shadow field with non-existent parent type
        schema_config.shadow_fields = vec![ShadowFieldConfig {
            parent_type_name: intern!("NonExistentType"),
            shadow_field_name: intern!("shadowField"),
            true_field_name: intern!("trueField"),
            false_field_name: intern!("falseField"),
            variable_name: intern!("someVar"),
            return_type_name: intern!("String"),
        }];

        // Should fail with diagnostic
        let result = extend_schema_with_shadow_fields(&mut schema, &schema_config);
        assert!(result.is_err());
        let errors = result.unwrap_err();
        assert_eq!(errors.len(), 1);
        assert!(format!("{:?}", errors[0]).contains("not found"));
    }

    #[test]
    fn test_extend_schema_with_invalid_return_type() {
        use intern::intern;

        let mut schema = (*get_test_schema()).clone();
        let mut schema_config = SchemaConfig::default();

        // Add a shadow field with non-existent return type
        schema_config.shadow_fields = vec![ShadowFieldConfig {
            parent_type_name: intern!("User"),
            shadow_field_name: intern!("shadowField"),
            true_field_name: intern!("trueField"),
            false_field_name: intern!("falseField"),
            variable_name: intern!("someVar"),
            return_type_name: intern!("NonExistentReturnType"),
        }];

        // Should fail with diagnostic
        let result = extend_schema_with_shadow_fields(&mut schema, &schema_config);
        assert!(result.is_err());
        let errors = result.unwrap_err();
        assert_eq!(errors.len(), 1);
        assert!(format!("{:?}", errors[0]).contains("return type"));
        assert!(format!("{:?}", errors[0]).contains("not found"));
    }
    */

    #[test]
    fn test_shadow_field_config_construction() {
        use intern::intern;

        // Test creating a shadow field configuration
        let config = ShadowFieldConfig {
            parent_type_name: intern!("User"),
            shadow_field_name: intern!("email"),
            true_field_name: intern!("internalEmail"),
            false_field_name: intern!("externalEmail"),
            variable_name: intern!("isInternal"),
            return_type_name: intern!("String"),
        };

        assert_eq!(config.parent_type_name, intern!("User"));
        assert_eq!(config.shadow_field_name, intern!("email"));
        assert_eq!(config.true_field_name, intern!("internalEmail"));
        assert_eq!(config.false_field_name, intern!("externalEmail"));
        assert_eq!(config.variable_name, intern!("isInternal"));
        assert_eq!(config.return_type_name, intern!("String"));
    }

    #[test]
    fn test_shadow_field_config_clone() {
        use intern::intern;

        let config = ShadowFieldConfig {
            parent_type_name: intern!("User"),
            shadow_field_name: intern!("email"),
            true_field_name: intern!("internalEmail"),
            false_field_name: intern!("externalEmail"),
            variable_name: intern!("isInternal"),
            return_type_name: intern!("String"),
        };

        let cloned = config.clone();
        assert_eq!(config, cloned);
    }

    #[test]
    fn test_shadow_field_config_equality() {
        use intern::intern;

        let config1 = ShadowFieldConfig {
            parent_type_name: intern!("User"),
            shadow_field_name: intern!("email"),
            true_field_name: intern!("internalEmail"),
            false_field_name: intern!("externalEmail"),
            variable_name: intern!("isInternal"),
            return_type_name: intern!("String"),
        };

        let config2 = ShadowFieldConfig {
            parent_type_name: intern!("User"),
            shadow_field_name: intern!("email"),
            true_field_name: intern!("internalEmail"),
            false_field_name: intern!("externalEmail"),
            variable_name: intern!("isInternal"),
            return_type_name: intern!("String"),
        };

        assert_eq!(config1, config2);
    }

    #[test]
    fn test_create_shadow_field_directive() {
        use intern::intern;

        let directive = create_shadow_field_directive(
            intern!("isInternal"),
            intern!("internalEmail"),
            intern!("externalEmail"),
        );

        // Check directive name
        assert_eq!(directive.name, *SHADOW_FIELD_DIRECTIVE);

        // Check arguments
        assert_eq!(directive.arguments.len(), 3);

        // Check variable name argument
        let var_arg = directive
            .arguments
            .iter()
            .find(|arg| arg.name == *VARIABLE_NAME_ARG)
            .expect("variableName argument should exist");
        if let ConstantValue::String(s) = &var_arg.value {
            assert_eq!(s.value, intern!("isInternal"));
        } else {
            panic!("Expected string value for variableName");
        }

        // Check true field argument
        let true_arg = directive
            .arguments
            .iter()
            .find(|arg| arg.name == *TRUE_FIELD_ARG)
            .expect("trueField argument should exist");
        if let ConstantValue::String(s) = &true_arg.value {
            assert_eq!(s.value, intern!("internalEmail"));
        } else {
            panic!("Expected string value for trueField");
        }

        // Check false field argument
        let false_arg = directive
            .arguments
            .iter()
            .find(|arg| arg.name == *FALSE_FIELD_ARG)
            .expect("falseField argument should exist");
        if let ConstantValue::String(s) = &false_arg.value {
            assert_eq!(s.value, intern!("externalEmail"));
        } else {
            panic!("Expected string value for falseField");
        }
    }
}
