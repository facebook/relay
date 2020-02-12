/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::*;

use interner::Intern;
use schema::parse_definitions;
use std::fmt;

fn diff(current: &str, previous: &str) -> SchemaChange {
    let definitions = parse_definitions(current).unwrap();
    let mut change = detect_changes(&definitions, current, previous);
    sort_change(&mut change);
    change
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
            DefinitionChange::EnumAdded(name) => write!(f, "EnumAdded {:?}", name),
            DefinitionChange::EnumRemoved(name) => write!(f, "EnumRemoved {:?}", name),
            DefinitionChange::UnionAdded(name) => write!(f, "UnionAdded {:?}", name),
            DefinitionChange::UnionRemoved(name) => write!(f, "UnionRemoved {:?}", name),
            DefinitionChange::ScalarAdded(name) => write!(f, "ScalarAdded {:?}", name),
            DefinitionChange::ScalarRemoved(name) => write!(f, "ScalarRemoved {:?}", name),
        }
    }
}
