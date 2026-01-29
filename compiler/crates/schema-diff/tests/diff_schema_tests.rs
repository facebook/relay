/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use intern::string_key::Intern;
use rustc_hash::FxHashSet;
use schema::build_schema;
use schema_diff::check::IncrementalBuildSchemaChange;
use schema_diff::check::SchemaChangeSafety;
use schema_diff::definitions::*;
use schema_diff::*;

fn diff(current: &str, previous: &str) -> SchemaChange {
    let mut change = detect_changes(&[current], &[previous]);
    sort_change(&mut change);
    change
}

fn get_safety(current: &str, previous: &str) -> SchemaChangeSafety {
    let schema = build_schema(current).unwrap();
    let change = detect_changes(&[current], &[previous]);
    change.get_safety(&schema, &Default::default())
}

#[test]
fn test_same_text() {
    assert_eq!(
        diff(
            r"
         enum A {
             OK
             NOT_OK
             MAYBE
         }
         #",
            r"
         enum A {
             OK
             NOT_OK
             MAYBE
         }
         #",
        ),
        SchemaChange::None
    );
}

#[test]
fn test_invalid_text() {
    assert_eq!(
        diff(
            r"
         enum A {
             OK
             NOT_OK
             MAYBE

         #",
            r"
         enum A {
             OK
             NOT_OK
             MAYBE
         }
         #",
        ),
        SchemaChange::InvalidSchema
    );
}

#[test]
fn test_add_enum_value() {
    assert_eq!(
        diff(
            r"
         enum A {
             OK
             NOT_OK
             MAYBE
           }
         #",
            r"
         enum A {
             OK
             NOT_OK
           }
         #",
        ),
        SchemaChange::DefinitionChanges(vec![DefinitionChange::EnumChanged { name: "A".intern() }])
    );
}

#[test]
fn test_sort_enum_value() {
    assert_eq!(
        diff(
            r"
         enum A {
             OK
             NOT_OK
             MAYBE
           }
         #",
            r"
         enum A {
             OK
             MAYBE
             NOT_OK
           }
         #",
        ),
        SchemaChange::DefinitionChanges(vec![DefinitionChange::EnumChanged { name: "A".intern() }])
    );
}

#[test]
fn test_remove_enum_value() {
    assert_eq!(
        diff(
            r"
         enum A {
             OK
             NOT_OK
           }
         #",
            r"
         enum A {
             OK
             NOT_OK
             MAYBE
           }
         #",
        ),
        SchemaChange::DefinitionChanges(vec![DefinitionChange::EnumChanged { name: "A".intern() }])
    );
}

#[test]
fn test_add_remove_enum_value() {
    assert_eq!(
        diff(
            r"
         enum A {
             OK
             NOT_OK
             ZUCK
             NOT_ZUCK
           }
         #",
            r"
         enum A {
             OK
             MARK
             NOT_MARK
             NOT_OK
           }
         #",
        ),
        SchemaChange::DefinitionChanges(vec![DefinitionChange::EnumChanged { name: "A".intern() }])
    );
}

#[test]
fn test_add_comment_to_enum() {
    assert_eq!(
        diff(
            r"
            enum A {
                OK
                NOT_OK
            }
         #",
            r"
            # comment
            enum A {
                OK
                NOT_OK
            }
         #",
        ),
        SchemaChange::GenericChange
    );
}

#[test]
fn test_add_remove_enum_type() {
    assert_eq!(
        diff(
            r"
        enum A {
            OK
            NOT_OK
        }
        enum B {
            OK
        }
         #",
            r"
        enum A {
            OK
            NOT_OK
        }
        enum C {
            OK
        }
         #",
        ),
        SchemaChange::DefinitionChanges(vec![
            DefinitionChange::EnumAdded("B".intern()),
            DefinitionChange::EnumRemoved("C".intern()),
        ])
    );
}

#[test]
fn test_add_remove_union_value() {
    assert_eq!(
        diff(
            r"
           type A {
             key: String
           }

           type B {
             key: String
           }

           type C {
             key: String
           }

           type D {
             key: String
           }

           union AB = A | B | D
         #",
            r"
         type A {
             key: String
         }

         type B {
             key: String
         }

         type C {
             key: String
         }

         type D {
             key: String
         }

         union AB = A | C
         #",
        ),
        SchemaChange::DefinitionChanges(vec![DefinitionChange::UnionChanged {
            name: "AB".intern(),
            added: vec!["B".intern(), "D".intern()],
            removed: vec!["C".intern()],
        }])
    );
}

#[test]
fn test_add_remove_union_type() {
    assert_eq!(
        diff(
            r"
           type A {
             key: String
           }

           type B {
             key: String
           }

           type C {
             key: String
           }

           type D {
             key: String
           }

           union union1 = A | B | D
           union union2 = A | B | D
         #",
            r"
         type A {
             key: String
         }

         type B {
             key: String
         }

         type C {
             key: String
         }

         type D {
             key: String
         }

         union union3 = A | B | D
         union union4 = A | B | D
         #",
        ),
        SchemaChange::DefinitionChanges(vec![
            DefinitionChange::UnionAdded("union1".intern()),
            DefinitionChange::UnionAdded("union2".intern()),
            DefinitionChange::UnionRemoved("union3".intern()),
            DefinitionChange::UnionRemoved("union4".intern()),
        ])
    );
}

#[test]
fn test_add_remove_scalar_type() {
    assert_eq!(
        diff(
            r"
        scalar A
        scalar B
         #",
            r"
        scalar A
        scalar C
        scalar D
         #",
        ),
        SchemaChange::DefinitionChanges(vec![
            DefinitionChange::ScalarAdded("B".intern()),
            DefinitionChange::ScalarRemoved("C".intern()),
            DefinitionChange::ScalarRemoved("D".intern()),
        ])
    );
}

#[test]
fn test_add_remove_input_object() {
    assert_eq!(
        diff(
            r"
        input Add {
            value: Float
        }
         #",
            r"
        input Remove {
            name: String
        }
         #",
        ),
        SchemaChange::DefinitionChanges(vec![
            DefinitionChange::InputObjectAdded("Add".intern()),
            DefinitionChange::InputObjectRemoved("Remove".intern()),
        ])
    );
}

#[test]
fn test_add_remove_input_object_fields() {
    assert_eq!(
        diff(
            r"
        input Input {
            add: String
            value: Float
        }
         #",
            r"
        input Input {
            value: Float
            remove: Int
        }
         #",
        ),
        SchemaChange::DefinitionChanges(vec![DefinitionChange::InputObjectChanged {
            name: "Input".intern(),
            added: vec![TypeChange {
                name: "add".intern(),
                type_: Type::Named("String".intern()),
            }],
            removed: vec![TypeChange {
                name: "remove".intern(),
                type_: Type::Named("Int".intern()),
            }],
        },])
    );
}

#[test]
fn test_change_input_object_fields() {
    assert_eq!(
        diff(
            r"
        input Input {
           value: Float
           key: String
        }
         #",
            r"
        input Input {
            value: Float
            key: Int
        }
         #",
        ),
        SchemaChange::DefinitionChanges(vec![DefinitionChange::InputObjectChanged {
            name: "Input".intern(),
            added: vec![TypeChange {
                name: "key".intern(),
                type_: Type::Named("String".intern()),
            }],
            removed: vec![TypeChange {
                name: "key".intern(),
                type_: Type::Named("Int".intern()),
            }],
        },])
    );
}

#[test]
fn test_add_remove_interface() {
    assert_eq!(
        diff(
            r"
        interface Add {
           value: Float
           key: String
        }
         #",
            r"
        interface Remove {
            value: Float
            key: Int
        }
         #",
        ),
        SchemaChange::DefinitionChanges(vec![
            DefinitionChange::InterfaceAdded("Add".intern()),
            DefinitionChange::InterfaceRemoved("Remove".intern()),
        ])
    );
}

#[test]
fn test_add_remove_interface_fields() {
    assert_eq!(
        diff(
            r"
        interface I {
           value: Float
           key: String
        }
         #",
            r"
        interface I {
            value: Float
            key: Int
        }
         #",
        ),
        SchemaChange::DefinitionChanges(vec![DefinitionChange::InterfaceChanged {
            name: "I".intern(),
            added: vec![TypeChange {
                name: "key".intern(),
                type_: Type::Named("String".intern()),
            }],
            removed: vec![TypeChange {
                name: "key".intern(),
                type_: Type::Named("Int".intern()),
            }],
            changed: vec![],
        },])
    );
}

#[test]
fn test_add_remove_object() {
    assert_eq!(
        diff(
            r"
        type Add {
            value: Float
        }
         #",
            r"
        type Remove {
            name: String
        }
         #",
        ),
        SchemaChange::DefinitionChanges(vec![
            DefinitionChange::ObjectAdded("Add".intern()),
            DefinitionChange::ObjectRemoved("Remove".intern()),
        ])
    );
}

#[test]
fn test_change_object_interfaces() {
    assert_eq!(
        diff(
            r"
        type User implements Node {
            id: ID
            value: Float
        }
         #",
            r"
        type User implements Actor {
            id: ID
            value: Float
        }
         #",
        ),
        SchemaChange::DefinitionChanges(vec![DefinitionChange::ObjectChanged {
            name: "User".intern(),
            added: vec![],
            removed: vec![],
            changed: vec![],
            interfaces_removed: vec!["Actor".intern()],
            interfaces_added: vec!["Node".intern()],
        }])
    );
}

#[test]
fn test_change_object_fields() {
    assert_eq!(
        diff(
            r"
        type User implements Actor {
            id: ID
            value: Float
        }
         #",
            r"
        type User implements Actor {
            id: ID!
        }
         #",
        ),
        SchemaChange::DefinitionChanges(vec![DefinitionChange::ObjectChanged {
            name: "User".intern(),
            added: vec![
                TypeChange {
                    name: "id".intern(),
                    type_: Type::Named("ID".intern()),
                },
                TypeChange {
                    name: "value".intern(),
                    type_: Type::Named("Float".intern()),
                },
            ],
            removed: vec![TypeChange {
                name: "id".intern(),
                type_: Type::NonNull(Box::new(Type::Named("ID".intern()))),
            }],
            changed: vec![],
            interfaces_removed: vec![],
            interfaces_added: vec![],
        }])
    );
}

#[test]
fn test_change_object_field_arguments() {
    assert_eq!(
        diff(
            r"
        type User implements Actor {
            key(a: ID): String
            name: String
            user(a: ID): String
        }
         #",
            r"
        type User implements Actor {
            key: String
            name(a: ID!): String
            user(a: ID!): String
        }
         #",
        ),
        SchemaChange::DefinitionChanges(vec![DefinitionChange::ObjectChanged {
            name: "User".intern(),
            added: vec![],
            removed: vec![],
            changed: vec![
                ArgumentChange {
                    name: "key".intern(),
                    added: vec![TypeChange {
                        name: "a".intern(),
                        type_: Type::Named("ID".intern()),
                    }],
                    removed: vec![],
                },
                ArgumentChange {
                    name: "name".intern(),
                    added: vec![],
                    removed: vec![TypeChange {
                        name: "a".intern(),
                        type_: Type::NonNull(Box::new(Type::Named("ID".intern()))),
                    }],
                },
                ArgumentChange {
                    name: "user".intern(),
                    added: vec![TypeChange {
                        name: "a".intern(),
                        type_: Type::Named("ID".intern()),
                    }],
                    removed: vec![TypeChange {
                        name: "a".intern(),
                        type_: Type::NonNull(Box::new(Type::Named("ID".intern()))),
                    }],
                }
            ],
            interfaces_removed: vec![],
            interfaces_added: vec![],
        }])
    );
}

#[test]
fn test_change_type_input_object() {
    assert_eq!(
        diff(
            r"
        input User {
            value: Float
        }
         #",
            r"
        type User {
            name: String
        }
         #",
        ),
        SchemaChange::DefinitionChanges(vec![
            DefinitionChange::InputObjectAdded("User".intern()),
            DefinitionChange::ObjectRemoved("User".intern()),
        ])
    );
}

#[test]
fn test_change_type_object_interface() {
    assert_eq!(
        diff(
            r"
        type User {
            value: Float
        }
         #",
            r"
        interface User {
            name: String
        }
         #",
        ),
        SchemaChange::DefinitionChanges(vec![
            DefinitionChange::InterfaceRemoved("User".intern()),
            DefinitionChange::ObjectAdded("User".intern()),
        ])
    );
}

#[test]
fn test_change_type_enum_scalar() {
    assert_eq!(
        diff(
            r"
        scalar A
         #",
            r"
        enum A {
            OK
            NOT_OK
        }
         #",
        ),
        SchemaChange::DefinitionChanges(vec![
            DefinitionChange::EnumRemoved("A".intern()),
            DefinitionChange::ScalarAdded("A".intern()),
        ])
    );
}

#[test]
fn test_change_type_enum_union() {
    assert_eq!(
        diff(
            r"
        type A {
            id: ID
        }
        enum B {
            OK
            NOT_OK
        }
        union C = A
         #",
            r"
        type A {
            id: ID
        }
        enum C {
            OK
            NOT_OK
        }
        union B = A
         #",
        ),
        SchemaChange::DefinitionChanges(vec![
            DefinitionChange::EnumAdded("B".intern()),
            DefinitionChange::EnumRemoved("C".intern()),
            DefinitionChange::UnionAdded("C".intern()),
            DefinitionChange::UnionRemoved("B".intern()),
        ])
    );
}

#[test]
fn test_add_object_without_id() {
    assert_eq!(
        get_safety(
            r"
            type A {
                key: String
            }
            type B {
                key: String
            }
            #",
            r"
            type A {
                key: String
            }
            #"
        ),
        SchemaChangeSafety::Safe
    )
}

#[test]
fn test_change_object_interface() {
    assert_eq!(
        get_safety(
            r"
            type A implements B {
                key: String
            }
            interface B {
                id: ID!
            }
            #",
            r"
            type A {
                key: String
            }
            interface B {
                id: ID!
            }
            #"
        ),
        SchemaChangeSafety::SafeWithIncrementalBuild(FxHashSet::from_iter([
            IncrementalBuildSchemaChange::Object("A".intern())
        ]))
    )
}

#[test]
fn test_add_object_with_id_node_interface() {
    assert_eq!(
        get_safety(
            r"
            type A {
                key: String
            }
            type B implements Node {
                id: ID
                key: String
            }
            interface Node {
                id: ID!
            }
            #",
            r"
            type A {
                key: String
            }
            interface Node {
                id: ID!
            }
            #"
        ),
        SchemaChangeSafety::Safe
    )
}

#[test]
fn test_object_special_field_added() {
    assert_eq!(
        get_safety(
            r"
            type A {
                key: String
                foo: String # regular field is okay
            }
        #",
            r"
            type A {
                key: String
            }
        #",
        ),
        SchemaChangeSafety::Safe
    );
    assert_eq!(
        get_safety(
            r"
            type A {
                key: String
                id: String # id field is breaking
            }
        #",
            r"
            type A {
                key: String
            }
        #",
        ),
        SchemaChangeSafety::SafeWithIncrementalBuild(FxHashSet::from_iter([
            IncrementalBuildSchemaChange::Object("A".intern())
        ]))
    );
    assert_eq!(
        get_safety(
            r"
            type A {
                key: String
                js: String # js field is breaking
            }
        #",
            r"
            type A {
                key: String
            }
        #",
        ),
        SchemaChangeSafety::SafeWithIncrementalBuild(FxHashSet::from_iter([
            IncrementalBuildSchemaChange::Object("A".intern())
        ]))
    );
}

#[test]
fn test_add_type_with_id_actor_interface() {
    assert_eq!(
        get_safety(
            r"
            type A {
                key: String
            }
            type B implements Actor {
                id: ID
                key: String
            }
            interface Actor {
                name: String
            }
            #",
            r"
            type A {
                key: String
            }
            interface Actor {
                name: String
            }
            #"
        ),
        SchemaChangeSafety::Unsafe
    )
}

#[test]
fn test_add_optional_field_arg() {
    assert_eq!(
        get_safety(
            r"
            type A {
                key(a: ID): String
            }

            #",
            r"
            type A {
                key: String
            }
            #"
        ),
        SchemaChangeSafety::Safe
    )
}

#[test]
fn test_add_required_field_arg() {
    assert_eq!(
        get_safety(
            r"
            type A {
                key(a: ID!): String
            }

            #",
            r"
            type A {
                key: String
            }
            #"
        ),
        SchemaChangeSafety::SafeWithIncrementalBuild(FxHashSet::from_iter([
            IncrementalBuildSchemaChange::Object("A".intern())
        ]))
    )
}

#[test]
fn test_remove_field_arg() {
    assert_eq!(
        get_safety(
            r"
            type A {
                key: String
            }

            #",
            r"
            type A {
                key(a: ID): String
            }
            #"
        ),
        SchemaChangeSafety::SafeWithIncrementalBuild(FxHashSet::from_iter([
            IncrementalBuildSchemaChange::Object("A".intern())
        ]))
    )
}

#[test]
fn test_add_safe_types() {
    assert_eq!(
        get_safety(
            r"
            type A {
                key: String
            }
            interface B {
                key: String
            }
            type C {
                key: String
            }
            union D = A
            enum E {
                OK
                NOT_OK
            }
            input F {
                key: String
            }
            scalar Mark
            #",
            r"
            type A {
                key: String
            }
            #"
        ),
        SchemaChangeSafety::Safe
    )
}

#[test]
fn test_unimplemented_changes() {
    assert_eq!(
        get_safety(
            r"
            type A {
                key: String
            }
            extend type A {
                name: String
            }
            #",
            r"
            type A {
                key: String
            }
            #"
        ),
        SchemaChangeSafety::Unsafe
    )
}

#[test]
fn test_add_enum() {
    assert_eq!(
        get_safety(
            r"
         enum A {
             OK
             MAYBE
             NOT_OK
         }
         enum B {
            OTHER
         }
         #",
            r"
         enum A {
             OK
             MAYBE
             NOT_OK
         }
         #",
        ),
        SchemaChangeSafety::Safe
    );
}

#[test]
fn test_enums_safe_with_incremental_build_changes() {
    // Change enum
    assert_eq!(
        get_safety(
            r"
         enum A {
             OK
             NOT_OK
             MAYBE
         }
         #",
            r"
         enum A {
             OK
             MAYBE
             NOT_OK
         }
         #",
        ),
        SchemaChangeSafety::SafeWithIncrementalBuild(FxHashSet::from_iter([
            IncrementalBuildSchemaChange::Enum("A".intern())
        ]))
    );

    // Add enum value
    assert_eq!(
        get_safety(
            r"
         enum A {
             OK
             NOT_OK
             MAYBE
         }
         #",
            r"
         enum A {
             OK
             NOT_OK
         }
         #",
        ),
        SchemaChangeSafety::SafeWithIncrementalBuild(FxHashSet::from_iter([
            IncrementalBuildSchemaChange::Enum("A".intern())
        ]))
    );

    // Delete enum
    assert_eq!(
        get_safety(
            r"
         enum B {
             OTHER
         }
         #",
            r"
         enum A {
             OK
             NOT_OK
             MAYBE
         }
         enum B {
             OTHER
         }
         #",
        ),
        SchemaChangeSafety::SafeWithIncrementalBuild(FxHashSet::from_iter([
            IncrementalBuildSchemaChange::Enum("A".intern())
        ]))
    );
}

#[test]
fn test_unions_safe_with_incremental_build_changes() {
    // Remove object in union
    assert_eq!(
        get_safety(
            r"
         union U = A | B
         type A {
            A1: String
         }
         type B {
            B1: String
         }
         type C {
            C1: String
         }
         #",
            r"
            union U = A | B | C
            type A {
               A1: String
            }
            type B {
               B1: String
            }
            type C {
               C1: String
            }
         #",
        ),
        SchemaChangeSafety::SafeWithIncrementalBuild(FxHashSet::from_iter([
            IncrementalBuildSchemaChange::Union("U".intern()),
        ]))
    );

    // Add object to union
    assert_eq!(
        get_safety(
            r"
         union U = A | B | C
         type A {
            A1: String
         }
         type B {
            B1: String
         }
         type C {
            C1: String
         }
         #",
            r"
         union U = A | B
         type A {
            A1: String
         }
         type B {
            B1: String
         }
         #",
        ),
        SchemaChangeSafety::SafeWithIncrementalBuild(FxHashSet::from_iter([
            IncrementalBuildSchemaChange::Union("U".intern()),
        ]))
    );

    // Change object in union
    assert_eq!(
        get_safety(
            r"
         union U = A | B
         type A {
            A1: String
         }
         type B {
            B1: String
         }
         #",
            r"
         union U = A | B
         type A {
            A1: String
         }
         type B {
            B1: String
            B2: String
         }
         #",
        ),
        SchemaChangeSafety::SafeWithIncrementalBuild(FxHashSet::from_iter([
            IncrementalBuildSchemaChange::Object("B".intern()),
            IncrementalBuildSchemaChange::Union("U".intern()),
        ]))
    );

    // Non-union objects don't affect the union
    assert_eq!(
        get_safety(
            r"
         union U = A | B
         type A {
            A1: String
         }
         type B {
            B1: String
         }
         type C {
            C1: String
         }
         #",
            r"
         union U = A | B
         type A {
            A1: String
         }
         type B {
            B1: String
         }
         type C {
            C1: String
            C2: String
         }
         #",
        ),
        SchemaChangeSafety::SafeWithIncrementalBuild(FxHashSet::from_iter([
            IncrementalBuildSchemaChange::Object("C".intern()),
        ]))
    );
}

#[test]
fn test_interfaces_safe_with_incremental_build_changes() {
    // Changing interfaces on an object without an id doesn't rebuild interfaces
    assert_eq!(
        get_safety(
            r"
         interface I {
            x: String
         }
         type A implements I {
            A1: String
            x: String
         }
         #",
            r"
         type A {
            A1: String
            x: String
         }
         #",
        ),
        SchemaChangeSafety::SafeWithIncrementalBuild(FxHashSet::from_iter([
            IncrementalBuildSchemaChange::Object("A".intern()),
        ]))
    );
    // Changing interfaces on an object with an id rebuilds the interface
    assert_eq!(
        get_safety(
            r"
         interface I {
            x: String
         }
         type A implements I {
            id: ID!
            x: String
         }
         #",
            r"
         interface I {
            x: String
         }
         type A {
            id: ID!
            x: String
         }
         #",
        ),
        SchemaChangeSafety::SafeWithIncrementalBuild(FxHashSet::from_iter([
            IncrementalBuildSchemaChange::Object("A".intern()),
            IncrementalBuildSchemaChange::Interface("I".intern()),
        ]))
    );
    assert_eq!(
        get_safety(
            r"
         interface I {
            x: String
         }
         type A {
            id: ID!
            x: String
         }
         #",
            r"
         interface I {
            x: String
         }
         type A implements I {
            id: ID!
            x: String
         }
         #",
        ),
        SchemaChangeSafety::SafeWithIncrementalBuild(FxHashSet::from_iter([
            IncrementalBuildSchemaChange::Object("A".intern()),
            IncrementalBuildSchemaChange::Interface("I".intern()),
        ]))
    );
    // Rebuild the correct interfaces
    assert_eq!(
        get_safety(
            r"
         interface I {
            x: String
         }
         interface I2 {
            y: String
         }
         interface I3 {
            z: String
         }
         type A implements I & I2 {
            id: ID!
            x: String
            y: String
         }
         #",
            r"
         interface I {
            x: String
         }
         interface I2 {
            y: String
         }
         interface I3 {
            z: String
         }
         type A implements I {
            id: ID!
            x: String
            y: String
         }
         #",
        ),
        SchemaChangeSafety::SafeWithIncrementalBuild(FxHashSet::from_iter([
            IncrementalBuildSchemaChange::Object("A".intern()),
            IncrementalBuildSchemaChange::Interface("I".intern()),
            IncrementalBuildSchemaChange::Interface("I2".intern()),
        ]))
    );
    // Adding an id to an object with interfaces rebuilds the interface
    assert_eq!(
        get_safety(
            r"
         interface I {
            x: String
         }
         type A implements I {
            id: ID!
            x: String
         }
         #",
            r"
         interface I {
            x: String
         }
         type A implements I {
            x: String
         }
         #",
        ),
        SchemaChangeSafety::SafeWithIncrementalBuild(FxHashSet::from_iter([
            IncrementalBuildSchemaChange::Object("A".intern()),
            IncrementalBuildSchemaChange::Interface("I".intern()),
        ]))
    );
    // Adding an id and interface together rebuilds the interface
    assert_eq!(
        get_safety(
            r"
         interface I {
            x: String
         }
         type A implements I {
            id: ID!
            x: String
         }
         #",
            r"
         interface I {
            x: String
         }
         type A {
            x: String
         }
         #",
        ),
        SchemaChangeSafety::SafeWithIncrementalBuild(FxHashSet::from_iter([
            IncrementalBuildSchemaChange::Object("A".intern()),
            IncrementalBuildSchemaChange::Interface("I".intern()),
        ]))
    );
    // Editing an id on an object with an interface rebuilds the interface
    // Note: this is treated as an id add + remove by the compiler
    assert_eq!(
        get_safety(
            r"
         interface I {
            x: String
         }
         type A implements I {
            id: ID!
            x: String
         }
         #",
            r"
         interface I {
            x: String
         }
         type A implements I {
            id: String
            x: String
         }
         #",
        ),
        SchemaChangeSafety::SafeWithIncrementalBuild(FxHashSet::from_iter([
            IncrementalBuildSchemaChange::Object("A".intern()),
            IncrementalBuildSchemaChange::Interface("I".intern()),
        ]))
    );
}

fn sort_change(change: &mut SchemaChange) {
    if let SchemaChange::DefinitionChanges(changes) = change {
        changes.sort();
        for c in changes {
            match c {
                DefinitionChange::UnionChanged { added, removed, .. } => {
                    added.sort();
                    removed.sort();
                }
                DefinitionChange::InputObjectChanged { added, removed, .. } => {
                    added.sort_by_key(|item| item.name);
                    removed.sort_by_key(|item| item.name);
                }
                DefinitionChange::InterfaceChanged { added, removed, .. } => {
                    added.sort_by_key(|item| item.name);
                    removed.sort_by_key(|item| item.name);
                }
                DefinitionChange::ObjectChanged {
                    added,
                    removed,
                    changed,
                    interfaces_added,
                    interfaces_removed,
                    ..
                } => {
                    added.sort_by_key(|item| item.name);
                    removed.sort_by_key(|item| item.name);
                    changed.sort_by_key(|item| item.name);
                    interfaces_added.sort();
                    interfaces_removed.sort();
                }
                _ => {}
            }
        }
    }
}
