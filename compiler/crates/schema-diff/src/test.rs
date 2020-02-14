/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::*;

use interner::Intern;
use schema::{build_schema, parse_definitions, AstType};
use std::fmt;

fn diff(current: &str, previous: &str) -> SchemaChange {
    let definitions = parse_definitions(current).unwrap();
    let mut change = detect_changes(&definitions, current, previous);
    sort_change(&mut change);
    change
}

fn is_safe(current: &str, previous: &str) -> bool {
    let definitions = parse_definitions(current).unwrap();
    let schema = build_schema(current).unwrap();
    let change = detect_changes(&definitions, current, previous);
    change.is_safe(&schema)
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
        SchemaChange::DefinitionChanges(vec![DefinitionChange::EnumChanged {
            name: "A".intern(),
            added: vec!["MAYBE".intern()],
            removed: vec![],
        }])
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
        SchemaChange::DefinitionChanges(vec![DefinitionChange::EnumChanged {
            name: "A".intern(),
            added: vec![],
            removed: vec!["MAYBE".intern()],
        }])
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
        SchemaChange::DefinitionChanges(vec![DefinitionChange::EnumChanged {
            name: "A".intern(),
            added: vec!["ZUCK".intern(), "NOT_ZUCK".intern()],
            removed: vec!["MARK".intern(), "NOT_MARK".intern()],
        }])
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
                type_: AstType::Named("String".intern()),
            }],
            removed: vec![TypeChange {
                name: "remove".intern(),
                type_: AstType::Named("Int".intern()),
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
                type_: AstType::Named("String".intern()),
            }],
            removed: vec![TypeChange {
                name: "key".intern(),
                type_: AstType::Named("Int".intern()),
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
                type_: AstType::Named("String".intern()),
            }],
            removed: vec![TypeChange {
                name: "key".intern(),
                type_: AstType::Named("Int".intern()),
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
                    type_: AstType::Named("ID".intern()),
                },
                TypeChange {
                    name: "value".intern(),
                    type_: AstType::Named("Float".intern()),
                },
            ],
            removed: vec![TypeChange {
                name: "id".intern(),
                type_: AstType::NonNull(Box::new(AstType::Named("ID".intern()))),
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
                        type_: AstType::Named("ID".intern()),
                    }],
                    removed: vec![],
                },
                ArgumentChange {
                    name: "name".intern(),
                    added: vec![],
                    removed: vec![TypeChange {
                        name: "a".intern(),
                        type_: AstType::NonNull(Box::new(AstType::Named("ID".intern()))),
                    }],
                },
                ArgumentChange {
                    name: "user".intern(),
                    added: vec![TypeChange {
                        name: "a".intern(),
                        type_: AstType::Named("ID".intern()),
                    }],
                    removed: vec![TypeChange {
                        name: "a".intern(),
                        type_: AstType::NonNull(Box::new(AstType::Named("ID".intern()))),
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
    assert!(is_safe(
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
    ))
}

#[test]
fn test_change_object_interface() {
    assert!(!is_safe(
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
    ))
}

#[test]
fn test_add_object_with_id_node_interface() {
    assert!(is_safe(
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
    ))
}

#[test]
fn test_add_type_with_id_actor_interface() {
    assert!(!is_safe(
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
    ))
}

#[test]
fn test_add_optional_field_arg() {
    assert!(is_safe(
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
    ))
}

#[test]
fn test_add_required_field_arg() {
    assert!(!is_safe(
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
    ))
}

#[test]
fn test_remove_field_arg() {
    assert!(!is_safe(
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
    ))
}

#[test]
fn test_add_safe_types() {
    assert!(is_safe(
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
    ))
}

#[test]
fn test_unimplmented_changes() {
    assert!(!is_safe(
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
    ))
}

fn sort_change(change: &mut SchemaChange) {
    if let SchemaChange::DefinitionChanges(changes) = change {
        changes.sort();
        for c in changes {
            match c {
                DefinitionChange::EnumChanged {
                    ref mut added,
                    ref mut removed,
                    ..
                } => {
                    added.sort();
                    removed.sort();
                }
                DefinitionChange::UnionChanged {
                    ref mut added,
                    ref mut removed,
                    ..
                } => {
                    added.sort();
                    removed.sort();
                }
                DefinitionChange::InputObjectChanged {
                    ref mut added,
                    ref mut removed,
                    ..
                } => {
                    added.sort_by(|a, b| a.name.lookup().cmp(b.name.lookup()));
                    removed.sort_by(|a, b| a.name.lookup().cmp(b.name.lookup()));
                }
                DefinitionChange::InterfaceChanged {
                    ref mut added,
                    ref mut removed,
                    ..
                } => {
                    added.sort_by(|a, b| a.name.lookup().cmp(b.name.lookup()));
                    removed.sort_by(|a, b| a.name.lookup().cmp(b.name.lookup()));
                }
                DefinitionChange::ObjectChanged {
                    ref mut added,
                    ref mut removed,
                    ref mut changed,
                    ref mut interfaces_added,
                    ref mut interfaces_removed,
                    ..
                } => {
                    added.sort_by(|a, b| a.name.lookup().cmp(b.name.lookup()));
                    removed.sort_by(|a, b| a.name.lookup().cmp(b.name.lookup()));
                    changed.sort_by(|a, b| a.name.lookup().cmp(b.name.lookup()));
                    interfaces_added.sort();
                    interfaces_removed.sort();
                }
                _ => {}
            }
        }
    }
}

impl fmt::Debug for SchemaChange {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            SchemaChange::None => write!(f, "None"),
            SchemaChange::GenericChange => write!(f, "GenericChange"),
            SchemaChange::DefinitionChanges(changes) => write!(f, "{:?}", changes),
        }
    }
}

impl fmt::Debug for TypeChange {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{:?}: {:?} ", self.name, self.type_)
    }
}

impl fmt::Debug for ArgumentChange {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "{:?}: added:{:?} removed:{:?} ",
            self.name, self.added, self.removed
        )
    }
}

impl fmt::Debug for DefinitionChange {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            DefinitionChange::EnumChanged {
                added,
                removed,
                name,
            } => write!(
                f,
                "EnumChanged {:?}: added:{:?} removed:{:?}",
                name, added, removed,
            ),
            DefinitionChange::UnionChanged {
                added,
                removed,
                name,
            } => write!(
                f,
                "UnionChanged {:?}: added:{:?} removed:{:?}",
                name, added, removed,
            ),
            DefinitionChange::InputObjectChanged {
                added,
                removed,
                name,
            } => write!(
                f,
                "InputObjectChanged {:?}: added:{:?} removed:{:?}",
                name, added, removed
            ),
            DefinitionChange::InterfaceChanged {
                added,
                removed,
                name,
                ..
            } => write!(
                f,
                "InterfaceChanged {:?}: added:{:?} removed:{:?}",
                name, added, removed,
            ),
            DefinitionChange::ObjectChanged {
                name,
                added,
                removed,
                changed,
                interfaces_added,
                interfaces_removed
            } => write!(
                f,
                "ObjectChanged {:?}: added:{:?} removed:{:?} changed: {:?}; interface: added:{:?} removed:{:?}",
                name, added, removed, changed, interfaces_added, interfaces_removed
            ),
            DefinitionChange::EnumAdded(name) => write!(f, "EnumAdded {:?}", name),
            DefinitionChange::EnumRemoved(name) => write!(f, "EnumRemoved {:?}", name),
            DefinitionChange::UnionAdded(name) => write!(f, "UnionAdded {:?}", name),
            DefinitionChange::UnionRemoved(name) => write!(f, "UnionRemoved {:?}", name),
            DefinitionChange::ScalarAdded(name) => write!(f, "ScalarAdded {:?}", name),
            DefinitionChange::ScalarRemoved(name) => write!(f, "ScalarRemoved {:?}", name),
            DefinitionChange::InputObjectAdded(name) => write!(f, "InputObjectAdded {:?}", name),
            DefinitionChange::InputObjectRemoved(name) => {
                write!(f, "InputObjectRemoved {:?}", name)
            }
            DefinitionChange::InterfaceAdded(name) => write!(f, "InterfaceAdded {:?}", name),
            DefinitionChange::InterfaceRemoved(name) => write!(f, "InterfaceRemoved {:?}", name),
            DefinitionChange::ObjectAdded(name) => write!(f, "ObjectAdded {:?}", name),
            DefinitionChange::ObjectRemoved(name) => write!(f, "ObjectRemoved {:?}", name),
        }
    }
}
