/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::SourceLocationKey;
use common::Span;
use graphql_syntax::FragmentArgumentSyntaxKind;
use graphql_syntax::ParserFeatures;
use graphql_syntax::parse_executable_with_features;
use graphql_syntax::parse_schema_document;

use super::*;

pub(super) fn test_resolution(source: &str, sub_str: &str, cb: impl Fn(&ResolutionPath<'_>)) {
    let document = parse_executable_with_features(
        source,
        SourceLocationKey::standalone("/test/file"),
        ParserFeatures {
            fragment_argument_capability:
                FragmentArgumentSyntaxKind::SpreadArgumentsAndFragmentVariableDefinitions,
            allow_string_literal_alias: false,
        },
    )
    .unwrap();

    let pos = source.find(sub_str).unwrap() as u32;

    // Select the `uri` field
    let position_span = Span {
        start: pos,
        end: pos,
    };

    let resolved = document.resolve((), position_span);

    cb(&resolved);
}

pub(super) fn test_schema_resolution(
    source: &str,
    sub_str: &str,
    cb: impl Fn(&ResolutionPath<'_>),
) {
    let document =
        parse_schema_document(source, SourceLocationKey::standalone("/test/file")).unwrap();

    let pos = source.find(sub_str).unwrap() as u32;

    // Select the `uri` field
    let position_span = Span {
        start: pos,
        end: pos,
    };

    let resolved = document.resolve((), position_span);

    cb(&resolved);
}

#[test]
fn operation_definition_operation() {
    let source = r#"
            query Foo {
                me {
                    id
                }
            }
        "#;
    test_resolution(source, "query", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Operation(OperationPath {
                inner: (_, OperationKind::Query),
                parent: _,
            })
        );
    })
}

#[test]
fn operation_definition_name() {
    let source = r#"
            query Foo {
                me {
                    id
                }
            }
        "#;
    test_resolution(source, "Foo", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::OperationDefinitionName(_),
            })
        );
    })
}

#[test]
fn operation_definition_variable_definition_name() {
    let source = r#"
            query Foo($bar: ID!) {
                me {
                    id
                }
            }
        "#;
    test_resolution(source, "bar", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::VariableIdentifier(VariableIdentifierPath {
                inner: _,
                parent: VariableIdentifierParent::VariableDefinition(VariableDefinitionPath {
                    inner: _,
                    parent: VariableDefinitionListPath {
                        inner: _,
                        parent: VariableDefinitionListParent::OperationDefinition(_),
                    },
                }),
            })
        );
    })
}

#[test]
fn operation_definition_variable_definition_type() {
    let source = r#"
            query Foo($bar: ID!) {
                me {
                    id
                }
            }
        "#;
    test_resolution(source, "ID!", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::NamedTypeAnnotation(NamedTypeAnnotationPath {
                    inner: _,
                    parent: TypeAnnotationPath {
                        inner: _,
                        parent: TypeAnnotationParent::NonNullTypeAnnotation(_),
                    }
                }),
            })
        )
    })
}

#[test]
fn operation_definition_variable_definition_default_value() {
    let source = r#"
            query Foo($localId: ID! = "1") {
                me {
                    id
                }
            }
        "#;
    test_resolution(source, r#""1""#, |resolved| {
        assert_matches!(resolved, ResolutionPath::ConstantString(_));
    })
}

#[test]
fn linked_field_name() {
    let source = r#"
            query Foo {
                me {
                    id
                }
            }
        "#;
    test_resolution(source, "me", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::LinkedFieldName(_),
            })
        );
    })
}

#[test]
fn linked_field_alias() {
    let source = r#"
            query Foo {
                mario: me {
                    id
                }
            }
        "#;
    test_resolution(source, "mario", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::LinkedFieldAlias(_),
            })
        );
    })
}

#[test]
fn scalar_field_name() {
    let source = r#"
            query Foo {
                me {
                    id
                }
            }
        "#;
    test_resolution(source, "id", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::ScalarFieldName(_),
            })
        );
    })
}

#[test]
fn scalar_field_alias() {
    let source = r#"
            query Foo {
                me {
                    identity: id
                }
            }
        "#;
    test_resolution(source, "identity", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::ScalarFieldAlias(_),
            })
        );
    })
}

#[test]
fn inline_fragment() {
    let source = r#"
            query Foo {
                me {
                    ... on User {
                        id
                    }
                }
            }
        "#;
    test_resolution(source, "...", |resolved| {
        assert_matches!(resolved, ResolutionPath::InlineFragment(_));
    })
}

#[test]
fn inline_fragment_type_condition() {
    let source = r#"
            query Foo {
                me {
                    ... on User {
                        id
                    }
                }
            }
        "#;
    test_resolution(source, "User", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::TypeConditionType(_),
            })
        );
    })
}
#[test]
fn fragment_definition_name() {
    let source = r#"
            fragment Foo on User {
                id
            }
        "#;
    test_resolution(source, "Foo", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::FragmentDefinitionName(_),
            })
        );
    })
}

#[test]
fn fragment_definition_type() {
    let source = r#"
            fragment Foo on User {
                id
            }
        "#;
    test_resolution(source, "User", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::TypeConditionType(_),
            })
        );
    })
}

#[test]
fn fragment_spread_name() {
    let source = r#"
            fragment Foo on Node {
                ...someFragment
            }
        "#;
    test_resolution(source, "someFragment", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::FragmentSpreadName(_),
            })
        );
    })
}

#[test]
fn fragment_spread_argument_name() {
    let source = r#"
            fragment Foo on Node {
                ...someFragment(someArg: 5)
            }
        "#;
    test_resolution(source, "someArg", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::ArgumentName(ArgumentPath {
                    inner: _,
                    parent: ArgumentParent::FragmentSpread(_),
                }),
            })
        );
    })
}

#[test]
fn directive_name() {
    let source = r#"
            fragment Foo on Node {
                id @required(action: LOG)
            }
        "#;
    test_resolution(source, "required", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::DirectiveName(_),
            })
        );
    })
}

#[test]
fn argument_name() {
    let source = r#"
            fragment Foo on Node {
                id @required(action: LOG)
            }
        "#;
    test_resolution(source, "action", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::ArgumentName(_),
            })
        );
    })
}

#[test]
fn argument_value() {
    let source = r#"
            fragment Foo on Node {
                id @required(action: LOG)
            }
        "#;
    test_resolution(source, "LOG", |resolved| {
        assert_matches!(resolved, ResolutionPath::ConstantEnum(_));
    })
}

#[test]
fn list_literal() {
    let source = r#"
            query Foo {
                checkinSearchQuery(query: {
                    query: "Hello",
                    inputs: [{query: "Goodbye", inputs: []}]
                })
            }
        "#;
    test_resolution(source, "Goodbye", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::ConstantString(ConstantStringPath {
                inner: _,
                parent: ConstantValuePath {
                    inner: _,
                    parent: ConstantValueParent::ConstantArgumentValue(_),
                },
            })
        );
    })
}

#[test]
fn fragment_argument_definition_name() {
    let source = r#"
        fragment Foo($localId: ID!) on User {
            id
          }
        "#;
    test_resolution(source, "localId", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::VariableIdentifier(VariableIdentifierPath {
                inner: _,
                parent: VariableIdentifierParent::VariableDefinition(VariableDefinitionPath {
                    inner: _,
                    parent: VariableDefinitionListPath {
                        inner: _,
                        parent: VariableDefinitionListParent::FragmentDefinition(_),
                    },
                }),
            })
        );
    })
}

#[test]
fn fragment_argument_definition_type() {
    let source = r#"
        fragment Foo($localId: ID!) on User {
            id
          }
        "#;
    test_resolution(source, "ID!", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::NamedTypeAnnotation(NamedTypeAnnotationPath {
                    inner: _,
                    parent: TypeAnnotationPath {
                        inner: _,
                        parent: TypeAnnotationParent::NonNullTypeAnnotation(_),
                    }
                }),
            })
        )
    })
}

#[test]
fn fragment_argument_definition_default_value() {
    let source = r#"
        fragment Foo($localId: ID! = "1") on User {
            id
          }
        "#;
    test_resolution(source, r#""1""#, |resolved| {
        assert_matches!(resolved, ResolutionPath::ConstantString(_));
    })
}

#[test]
fn fragment_argument_definition_directive() {
    let source = r#"
        fragment Foo($localId: ID! = "1" @bar) on User {
            id
          }
        "#;
    test_resolution(source, "bar", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::DirectiveName(_)
            })
        );
    })
}

// ## Directives

#[test]
fn directive_definition_name() {
    let source = r#"
        directive @foo on FIELD
        "#;
    test_schema_resolution(source, "foo", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::DirectiveDefinitionName(_),
            })
        );
    })
}

#[test]
fn directive_definition_argument_name() {
    let source = r#"
        directive @foo(bar: Baz) on FIELD
        "#;
    test_schema_resolution(source, "bar", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::InputValueDefinitionName(InputValueDefinitionPath {
                    inner: _,
                    parent: InputValueDefinitionParent::DirectiveDefinition(_),
                }),
            })
        );
    })
}

// ## Union Types

#[test]
fn union_type_definition_name() {
    let source = r#"
        union Foo = Bar | Baz
        "#;
    test_schema_resolution(source, "Foo", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::UnionTypeDefinitionName(_),
            })
        );
    })
}

#[test]
fn union_type_definition_member_name() {
    let source = r#"
        union Foo = Bar | Baz
        "#;
    test_schema_resolution(source, "Bar", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::UnionTypeMemberType(
                    UnionTypeMemberParent::UnionTypeDefinition(_),
                )
            })
        );
    })
}

#[test]
fn union_type_definition_directive() {
    let source = r#"
        union Foo @bar = Baz
        "#;
    test_schema_resolution(source, "bar", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::ConstantDirectiveName(ConstantDirectivePath {
                    inner: _,
                    parent: ConstantDirectiveParent::UnionTypeDefinition(_),
                })
            })
        );
    })
}

// ## Union Type Extensions

#[test]
fn union_type_extension_name() {
    let source = r#"
        extend union Foo = Bar | Baz
        "#;
    test_schema_resolution(source, "Foo", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::UnionTypeExtensionName(_),
            })
        );
    })
}

#[test]
fn union_type_extension_member_name() {
    let source = r#"
        extend union Foo = Bar | Baz
        "#;
    test_schema_resolution(source, "Bar", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::UnionTypeMemberType(
                    UnionTypeMemberParent::UnionTypeExtension(_),
                )
            })
        );
    })
}

#[test]
fn union_type_extension_directive() {
    let source = r#"
        extend union Foo @bar = Baz
        "#;
    test_schema_resolution(source, "bar", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::ConstantDirectiveName(ConstantDirectivePath {
                    inner: _,
                    parent: ConstantDirectiveParent::UnionTypeExtension(_),
                })
            })
        );
    })
}

// ## Interface Types

#[test]
fn interface_type_definition_name() {
    let source = r#"
        interface Foo {
            bar: Baz
        }
        "#;
    test_schema_resolution(source, "Foo", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::InterfaceTypeDefinitionName(_),
            })
        );
    })
}

#[test]
fn interface_type_definition_implements_interface() {
    let source = r#"
        interface Foo implements Bar {
            baz: Qux
        }
        "#;
    test_schema_resolution(source, "Bar", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::ImplementedInterfaceName(
                    ImplementedInterfaceParent::InterfaceTypeDefinition(_),
                )
            })
        );
    })
}

#[test]
fn interface_type_definition_field() {
    let source = r#"
        interface Foo {
            bar: Baz
        }
        "#;
    test_schema_resolution(source, "bar", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::FieldDefinitionName(FieldDefinitionPath {
                    inner: _,
                    parent: FieldDefinitionParent::InterfaceTypeDefinition(_),
                }),
            })
        );
    })
}

#[test]
fn interface_type_definition_directive() {
    let source = r#"
        interface Foo @bar {
            baz: Qux
        }
        "#;
    test_schema_resolution(source, "bar", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::ConstantDirectiveName(ConstantDirectivePath {
                    inner: _,
                    parent: ConstantDirectiveParent::InterfaceTypeDefinition(_),
                }),
            })
        );
    })
}

// ## Interface Type Extensions

#[test]
fn interface_type_extension_name() {
    let source = r#"
        extend interface Foo {
            bar: String
        }
        "#;
    test_schema_resolution(source, "Foo", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::InterfaceTypeExtensionName(_),
            })
        );
    })
}

#[test]
fn interface_type_extension_implements_interface() {
    let source = r#"
        extend interface Foo implements Bar {
            baz: String
        }
        "#;
    test_schema_resolution(source, "Bar", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::ImplementedInterfaceName(
                    ImplementedInterfaceParent::InterfaceTypeExtension(_),
                )
            })
        );
    })
}

#[test]
fn interface_type_extension_field() {
    let source = r#"
        extend interface Foo {
            bar: String
        }
        "#;
    test_schema_resolution(source, "bar", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::FieldDefinitionName(FieldDefinitionPath {
                    inner: _,
                    parent: FieldDefinitionParent::InterfaceTypeExtension(_),
                }),
            })
        );
    })
}

#[test]
fn interface_type_extension_directive() {
    let source = r#"
        extend interface Foo @bar {
            baz: Qux
        }
        "#;
    test_schema_resolution(source, "bar", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::ConstantDirectiveName(ConstantDirectivePath {
                    inner: _,
                    parent: ConstantDirectiveParent::InterfaceTypeExtension(_),
                }),
            })
        );
    })
}

// ## Object Types

#[test]
fn object_type_definition_name() {
    let source = r#"
        type Foo {
            bar: Baz
        }
        "#;
    test_schema_resolution(source, "Foo", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::ObjectTypeDefinitionName(_),
            })
        );
    })
}

#[test]
fn object_type_definition_implements_interface_name() {
    let source = r#"
        type Foo implements Node {
            bar: Baz
        }
        "#;
    test_schema_resolution(source, "Node", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::ImplementedInterfaceName(
                    ImplementedInterfaceParent::ObjectTypeDefinition(_)
                )
            })
        );
    })
}

#[test]
fn object_type_definition_field_name() {
    let source = r#"
        type Foo {
            bar: Baz
        }
        "#;
    test_schema_resolution(source, "bar", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::FieldDefinitionName(FieldDefinitionPath {
                    inner: _,
                    parent: FieldDefinitionParent::ObjectTypeDefinition(_),
                }),
            })
        );
    })
}

#[test]
fn object_type_definition_directive() {
    let source = r#"
        type Foo @bar {
            baz: Qux
        }
        "#;
    test_schema_resolution(source, "bar", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::ConstantDirectiveName(ConstantDirectivePath {
                    inner: _,
                    parent: ConstantDirectiveParent::ObjectTypeDefinition(_),
                }),
            })
        );
    })
}

// ## Object Type Extensions

#[test]
fn object_type_extension_name() {
    let source = r#"
        extend type Foo {
            bar: Baz
        }
        "#;
    test_schema_resolution(source, "Foo", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::ObjectTypeExtensionName(_),
            })
        );
    })
}

#[test]
fn object_type_extension_implements_interface_name() {
    let source = r#"
        extend type Foo implements Node {
            bar: Baz
        }
        "#;
    test_schema_resolution(source, "Node", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::ImplementedInterfaceName(
                    ImplementedInterfaceParent::ObjectTypeExtension(_)
                )
            })
        );
    })
}

#[test]
fn object_type_extension_field_name() {
    let source = r#"
        extend type Foo {
            bar: Baz
        }
        "#;
    test_schema_resolution(source, "bar", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::FieldDefinitionName(FieldDefinitionPath {
                    inner: _,
                    parent: FieldDefinitionParent::ObjectTypeExtension(_),
                }),
            })
        );
    })
}

#[test]
fn object_type_extension_directive() {
    let source = r#"
        extend type Foo @bar {
            baz: Qux
        }
        "#;
    test_schema_resolution(source, "bar", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::ConstantDirectiveName(ConstantDirectivePath {
                    inner: _,
                    parent: ConstantDirectiveParent::ObjectTypeExtension(_),
                }),
            })
        );
    })
}

// ## Input Object Types

#[test]
fn input_object_type_definition_name() {
    let source = r#"
        input Foo {
            bar: Baz
        }
        "#;
    test_schema_resolution(source, "Foo", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::InputObjectTypeDefinitionName(_),
            })
        );
    })
}

#[test]
fn input_object_type_definition_field_name() {
    let source = r#"
        input Foo {
            bar: Baz
        }
        "#;
    test_schema_resolution(source, "bar", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::InputValueDefinitionName(InputValueDefinitionPath {
                    inner: _,
                    parent: InputValueDefinitionParent::InputObjectTypeDefinition(_),
                }),
            })
        );
    })
}

#[test]
fn input_object_type_definition_directive() {
    let source = r#"
        input Foo @bar {
            baz: Qux
        }
        "#;
    test_schema_resolution(source, "bar", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::ConstantDirectiveName(ConstantDirectivePath {
                    inner: _,
                    parent: ConstantDirectiveParent::InputObjectTypeDefinition(_),
                }),
            })
        );
    })
}

// ## Input Object Type Extensions

#[test]
fn input_object_type_extension_name() {
    let source = r#"
        extend input Foo {
            bar: Baz
        }
        "#;
    test_schema_resolution(source, "Foo", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::InputObjectTypeExtensionName(_),
            })
        );
    })
}

#[test]
fn input_object_type_extension_field_name() {
    let source = r#"
        extend input Foo {
            bar: Baz
        }
        "#;
    test_schema_resolution(source, "bar", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::InputValueDefinitionName(InputValueDefinitionPath {
                    inner: _,
                    parent: InputValueDefinitionParent::InputObjectTypeExtension(_),
                }),
            })
        );
    })
}

#[test]
fn input_object_type_extension_directive() {
    let source = r#"
        extend input Foo @bar {
            baz: Qux
        }
        "#;
    test_schema_resolution(source, "bar", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::ConstantDirectiveName(ConstantDirectivePath {
                    inner: _,
                    parent: ConstantDirectiveParent::InputObjectTypeExtension(_),
                }),
            })
        );
    })
}

// ## Enum Types

#[test]
fn enum_definition_name() {
    let source = r#"
        enum Foo {
            BAR
            BAZ
        }
        "#;
    test_schema_resolution(source, "Foo", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::EnumTypeDefinitionName(_),
            })
        );
    })
}

#[test]
fn enum_definition_value() {
    let source = r#"
        enum Foo {
            BAZ
        }
        "#;
    test_schema_resolution(source, "BAZ", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::EnumValueDefinitionName(EnumValueDefinitionPath {
                    inner: _,
                    parent: EnumValueDefinitionParent::EnumTypeDefinition(_),
                }),
            })
        );
    })
}

#[test]
fn enum_definition_directive() {
    let source = r#"
        enum Foo @bar {
            BAZ
        }
        "#;
    test_schema_resolution(source, "bar", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::ConstantDirectiveName(ConstantDirectivePath {
                    inner: _,
                    parent: ConstantDirectiveParent::EnumTypeDefinition(_),
                }),
            })
        );
    })
}

// ## Enum Type Extensions

#[test]
fn enum_extension_name() {
    let source = r#"
        extend enum Foo {
            BAR
            BAZ
        }
        "#;
    test_schema_resolution(source, "Foo", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::EnumTypeExtensionName(_),
            })
        );
    })
}

#[test]
fn enum_extension_value() {
    let source = r#"
        extend enum Foo {
            BAZ
        }
        "#;
    test_schema_resolution(source, "BAZ", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::EnumValueDefinitionName(EnumValueDefinitionPath {
                    inner: _,
                    parent: EnumValueDefinitionParent::EnumTypeExtension(_),
                }),
            })
        );
    })
}

#[test]
fn enum_extension_directive() {
    let source = r#"
        extend enum Foo @bar {
            BAZ
        }
        "#;
    test_schema_resolution(source, "bar", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::ConstantDirectiveName(ConstantDirectivePath {
                    inner: _,
                    parent: ConstantDirectiveParent::EnumTypeExtension(_),
                }),
            })
        );
    })
}

// ## Scalar Types

#[test]
fn scalar_definition_name() {
    let source = r#"
        scalar Foo
        "#;
    test_schema_resolution(source, "Foo", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::ScalarTypeDefinitionName(_),
            })
        );
    })
}

#[test]
fn scalar_definition_directive() {
    let source = r#"
        scalar Foo @bar
        "#;
    test_schema_resolution(source, "bar", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::ConstantDirectiveName(ConstantDirectivePath {
                    inner: _,
                    parent: ConstantDirectiveParent::ScalarTypeDefinition(_),
                }),
            })
        );
    })
}

// ## Scalar Type Extensions

#[test]
fn scalar_extension_name() {
    let source = r#"
        extend scalar Foo
        "#;
    test_schema_resolution(source, "Foo", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::ScalarTypeExtensionName(_),
            })
        );
    })
}

#[test]
fn scalar_extension_directive() {
    let source = r#"
        extend scalar Foo @bar
        "#;
    test_schema_resolution(source, "bar", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::ConstantDirectiveName(ConstantDirectivePath {
                    inner: _,
                    parent: ConstantDirectiveParent::ScalarTypeExtension(_),
                }),
            })
        );
    })
}

// ## Schema Definition

#[test]
fn schema_definition_operation_type_type_name() {
    let source = r#"
        schema {
            query: Foo
        }
        "#;
    test_schema_resolution(source, "Foo", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::OperationTypeDefinitionType(OperationTypeDefinitionPath {
                    inner: _,
                    parent: OperationTypeDefinitionParent::SchemaDefinition(_),
                }),
            })
        );
    })
}

#[test]
fn schema_definition_directive() {
    let source = r#"
        schema @foo {
            query: Bar
        }
        "#;
    test_schema_resolution(source, "foo", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::ConstantDirectiveName(ConstantDirectivePath {
                    inner: _,
                    parent: ConstantDirectiveParent::SchemaDefinition(_),
                }),
            })
        );
    })
}

// ## Schema Extension

#[test]
fn schema_extension_operation_type_type_name() {
    let source = r#"
        extend schema {
            query: Foo
        }
        "#;
    test_schema_resolution(source, "Foo", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::OperationTypeDefinitionType(OperationTypeDefinitionPath {
                    inner: _,
                    parent: OperationTypeDefinitionParent::SchemaExtension(_),
                }),
            })
        );
    })
}

#[test]
fn schema_extension_directive() {
    let source = r#"
        extend schema @foo {
            query: Bar
        }
        "#;
    test_schema_resolution(source, "foo", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::ConstantDirectiveName(ConstantDirectivePath {
                    inner: _,
                    parent: ConstantDirectiveParent::SchemaExtension(_),
                }),
            })
        );
    })
}

// ## Field Definition

#[test]
fn field_definition_named_type() {
    let source = r#"
        type Foo {
            bar: Baz
        }
        "#;
    test_schema_resolution(source, "Baz", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::NamedTypeAnnotation(_),
            })
        );
    })
}

#[test]
fn field_definition_non_null_type() {
    let source = r#"
        type Foo {
            bar: Baz!
        }
        "#;
    test_schema_resolution(source, "Baz", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::NamedTypeAnnotation(NamedTypeAnnotationPath {
                    inner: _,
                    parent: TypeAnnotationPath {
                        inner: _,
                        parent: TypeAnnotationParent::NonNullTypeAnnotation(_),
                    }
                }),
            })
        );
    })
}

#[test]
fn field_definition_list_type() {
    let source = r#"
        type Foo {
            bar: [Baz]
        }
        "#;
    test_schema_resolution(source, "Baz", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::NamedTypeAnnotation(NamedTypeAnnotationPath {
                    inner: _,
                    parent: TypeAnnotationPath {
                        inner: _,
                        parent: TypeAnnotationParent::ListTypeAnnotation(_),
                    }
                }),
            })
        );
    })
}

#[test]
fn field_definition_directive() {
    let source = r#"
        type Foo {
            bar: Baz @qux
        }
        "#;
    test_schema_resolution(source, "qux", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::ConstantDirectiveName(ConstantDirectivePath {
                    inner: _,
                    parent: ConstantDirectiveParent::FieldDefinition(_)
                }),
            })
        );
    })
}

#[test]
fn field_definition_argument() {
    let source = r#"
        type Foo {
            bar(baz: Qux): Quux
        }
        "#;
    test_schema_resolution(source, "baz", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::InputValueDefinitionName(InputValueDefinitionPath {
                    inner: _,
                    parent: InputValueDefinitionParent::FieldDefinition(_),
                })
            })
        );
    })
}

// ## Input Value Definition

#[test]
fn input_value_definition_named_type() {
    let source = r#"
        input Foo {
            bar: Baz
        }
        "#;
    test_schema_resolution(source, "Baz", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::NamedTypeAnnotation(_),
            })
        );
    })
}

#[test]
fn input_value_definition_non_null_type() {
    let source = r#"
        input Foo {
            bar: Baz!
        }
        "#;
    test_schema_resolution(source, "Baz", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::NamedTypeAnnotation(NamedTypeAnnotationPath {
                    inner: _,
                    parent: TypeAnnotationPath {
                        inner: _,
                        parent: TypeAnnotationParent::NonNullTypeAnnotation(_),
                    }
                }),
            })
        );
    })
}

#[test]
fn input_value_definition_list_type() {
    let source = r#"
        input Foo {
            bar: [Baz]
        }
        "#;
    test_schema_resolution(source, "Baz", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::NamedTypeAnnotation(NamedTypeAnnotationPath {
                    inner: _,
                    parent: TypeAnnotationPath {
                        inner: _,
                        parent: TypeAnnotationParent::ListTypeAnnotation(_),
                    }
                }),
            })
        );
    })
}

#[test]
fn input_value_definition_default_value() {
    let source = r#"
        input Foo {
            bar: Baz = 5
        }
        "#;
    test_schema_resolution(source, "5", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::ConstantInt(ConstantIntPath {
                inner: _,
                parent: ConstantValuePath {
                    inner: _,
                    parent: ConstantValueParent::DefaultValue(DefaultValuePath {
                        inner: _,
                        parent: DefaultValueParent::InputValueDefinition(_),
                    })
                }
            })
        );
    })
}

#[test]
fn input_value_definition_directive() {
    let source = r#"
        input Foo {
            bar: Baz @qux
        }
        "#;
    test_schema_resolution(source, "qux", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::ConstantDirectiveName(ConstantDirectivePath {
                    inner: _,
                    parent: ConstantDirectiveParent::InputValueDefinition(_)
                }),
            })
        );
    })
}

// ## Enum Value Definition

#[test]
fn enum_value_definition_directive() {
    let source = r#"
       enum Foo {
            BAR @baz
        }
        "#;
    test_schema_resolution(source, "baz", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::ConstantDirectiveName(ConstantDirectivePath {
                    inner: _,
                    parent: ConstantDirectiveParent::EnumValueDefinition(_),
                }),
            })
        );
    })
}

// ## Constant Directive

#[test]
fn constant_directive_argument_name() {
    let source = r#"
       enum Foo {
            BAR @baz(qux: 5)
        }
        "#;
    test_schema_resolution(source, "qux", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent: IdentParent::ConstantArgumentKey(ConstantArgumentPath {
                    inner: _,
                    parent: ConstantArgumentParent::ConstantDirective(_),
                }),
            })
        );
    })
}

#[test]
fn constant_directive_argument_value() {
    let source = r#"
       enum Foo {
            BAR @baz(qux: 5)
        }
        "#;
    test_schema_resolution(source, "5", |resolved| {
        assert_matches!(
            resolved,
            ResolutionPath::ConstantInt(ConstantIntPath {
                inner: _,
                parent: ConstantValuePath {
                    inner: _,
                    parent: ConstantValueParent::ConstantArgumentValue(ConstantArgumentPath {
                        inner: _,
                        parent: ConstantArgumentParent::ConstantDirective(_),
                    })
                }
            })
        );
    })
}
