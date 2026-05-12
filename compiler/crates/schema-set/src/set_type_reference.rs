/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use schema::TypeReference;

/// The type_reference type from Relay's crates does not include a concept of SemanticOutputNonNull.
/// This does, which makes merging/excluding based on the actual type much simpler.
#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub enum OutputTypeReference<T> {
    Named(T),
    NonNull(OutputNonNull<T>),
    List(Box<OutputTypeReference<T>>),
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub enum OutputNonNull<T> {
    KillsParent(Box<OutputTypeReference<T>>),
    Semantic(Box<OutputTypeReference<T>>),
}

impl<T: Copy> OutputTypeReference<T> {
    pub fn from_type_reference(type_ref: &TypeReference<T>) -> OutputTypeReference<T> {
        match type_ref {
            TypeReference::Named(type_) => OutputTypeReference::Named(*type_),
            TypeReference::NonNull(of) => OutputTypeReference::NonNull(OutputNonNull::KillsParent(
                Box::new(Self::from_type_reference(of)),
            )),
            TypeReference::List(of) => {
                OutputTypeReference::List(Box::new(Self::from_type_reference(of)))
            }
        }
    }

    pub fn inner(&self) -> T {
        match self {
            OutputTypeReference::Named(type_) => *type_,
            OutputTypeReference::List(of) => of.inner(),
            OutputTypeReference::NonNull(nonnull) => nonnull.inner(),
        }
    }

    pub fn non_null(&self) -> OutputTypeReference<T> {
        match self {
            // Default to the KillsParent version of OutputNonNull, as that's the default
            OutputTypeReference::Named(_) => {
                OutputTypeReference::NonNull(OutputNonNull::KillsParent(Box::new(self.clone())))
            }
            OutputTypeReference::List(_) => {
                OutputTypeReference::NonNull(OutputNonNull::KillsParent(Box::new(self.clone())))
            }
            OutputTypeReference::NonNull(_) => self.clone(),
        }
    }

    // Given a multi-dimensional list type, return a new type where the level'th nested
    // list is non-null.
    pub fn with_non_null_level(&self, level: i64) -> OutputTypeReference<T> {
        match self {
            OutputTypeReference::Named(_) => {
                if level == 0 {
                    self.non_null()
                } else {
                    panic!("Invalid level {level} for Named type")
                }
            }
            OutputTypeReference::List(of) => {
                if level == 0 {
                    self.non_null()
                } else {
                    OutputTypeReference::List(Box::new(of.with_non_null_level(level - 1)))
                }
            }
            OutputTypeReference::NonNull(nonnull) => {
                if level == 0 {
                    panic!("Invalid level {level} for OutputNonNull type")
                } else {
                    OutputTypeReference::NonNull(
                        nonnull.replace_of(nonnull.of().with_non_null_level(level)),
                    )
                }
            }
        }
    }

    // If the type is Named or OutputNonNull<Named> return the inner named.
    // If the type is a List or OutputNonNull<List> returns a matching list with nullable items.
    pub fn with_nullable_item_type(&self) -> OutputTypeReference<T> {
        match self {
            OutputTypeReference::Named(_) => self.clone(),
            OutputTypeReference::List(of) => {
                OutputTypeReference::List(Box::new(of.nullable_type().clone()))
            }
            OutputTypeReference::NonNull(nonnull) => {
                let inner: &OutputTypeReference<T> = nonnull.of();
                match inner {
                    OutputTypeReference::List(_) => OutputTypeReference::NonNull(
                        nonnull.replace_of(inner.with_nullable_item_type()),
                    ),
                    OutputTypeReference::Named(_) => inner.clone(),
                    OutputTypeReference::NonNull(_) => {
                        unreachable!("Invalid nested TypeReference::OutputNonNull")
                    }
                }
            }
        }
    }

    // Return None if the type is a List, otherwise return the inner type
    pub fn non_list_type(&self) -> Option<T> {
        match self {
            OutputTypeReference::List(_) => None,
            OutputTypeReference::Named(type_) => Some(*type_),
            OutputTypeReference::NonNull(of) => of.non_list_type(),
        }
    }

    pub fn map<U>(self, transform: impl FnOnce(T) -> U) -> OutputTypeReference<U> {
        match self {
            OutputTypeReference::Named(inner) => OutputTypeReference::Named(transform(inner)),
            OutputTypeReference::NonNull(inner) => {
                OutputTypeReference::NonNull(inner.map(transform))
            }
            OutputTypeReference::List(inner) => {
                OutputTypeReference::List(Box::new(inner.map(transform)))
            }
        }
    }

    pub fn as_ref(&self) -> OutputTypeReference<&T> {
        match self {
            OutputTypeReference::Named(inner) => OutputTypeReference::Named(inner),
            OutputTypeReference::NonNull(inner) => OutputTypeReference::NonNull(inner.as_ref()),
            OutputTypeReference::List(inner) => {
                OutputTypeReference::List(Box::new(Box::as_ref(inner).as_ref()))
            }
        }
    }

    pub fn nullable_type(&self) -> &OutputTypeReference<T> {
        match self {
            OutputTypeReference::Named(_) => self,
            OutputTypeReference::List(_) => self,
            OutputTypeReference::NonNull(of) => of.of(),
        }
    }

    pub fn is_non_null(&self) -> bool {
        matches!(self, OutputTypeReference::NonNull(_))
    }

    pub fn is_kills_parent_non_null(&self) -> bool {
        matches!(
            self,
            OutputTypeReference::NonNull(OutputNonNull::KillsParent(_))
        )
    }

    pub fn is_semantic_non_null(&self) -> bool {
        matches!(
            self,
            OutputTypeReference::NonNull(OutputNonNull::Semantic(_))
        )
    }

    pub fn is_list(&self) -> bool {
        matches!(self.nullable_type(), OutputTypeReference::List(_))
    }

    pub fn list_item_type(&self) -> Option<&OutputTypeReference<T>> {
        match self.nullable_type() {
            OutputTypeReference::List(of) => Some(of),
            _ => None,
        }
    }
}

impl<T: Copy> OutputNonNull<T> {
    pub fn of(&self) -> &OutputTypeReference<T> {
        match self {
            OutputNonNull::KillsParent(of) | OutputNonNull::Semantic(of) => of,
        }
    }

    pub fn inner(&self) -> T {
        match self {
            OutputNonNull::KillsParent(of) | OutputNonNull::Semantic(of) => of.inner(),
        }
    }

    pub fn replace_of(&self, of: OutputTypeReference<T>) -> OutputNonNull<T> {
        match self {
            OutputNonNull::KillsParent(_) => OutputNonNull::KillsParent(Box::new(of)),
            OutputNonNull::Semantic(_) => OutputNonNull::Semantic(Box::new(of)),
        }
    }

    pub fn non_list_type(&self) -> Option<T> {
        match self {
            OutputNonNull::KillsParent(of) | OutputNonNull::Semantic(of) => of.non_list_type(),
        }
    }

    pub fn map<U>(self, transform: impl FnOnce(T) -> U) -> OutputNonNull<U> {
        match self {
            OutputNonNull::KillsParent(inner) => {
                OutputNonNull::KillsParent(Box::new(inner.map(transform)))
            }
            OutputNonNull::Semantic(inner) => {
                OutputNonNull::Semantic(Box::new(inner.map(transform)))
            }
        }
    }

    pub fn as_ref(&self) -> OutputNonNull<&T> {
        let inner_as_ref = self.of().as_ref();
        match self {
            OutputNonNull::KillsParent(_) => OutputNonNull::KillsParent(Box::new(inner_as_ref)),
            OutputNonNull::Semantic(_) => OutputNonNull::Semantic(Box::new(inner_as_ref)),
        }
    }
}

#[cfg(test)]
pub mod test {
    use intern::string_key::Intern;
    use intern::string_key::StringKey;
    use schema::TypeReference;

    use crate::OutputNonNull;
    use crate::OutputTypeReference;

    fn named(s: &str) -> OutputTypeReference<StringKey> {
        OutputTypeReference::Named(s.intern())
    }

    fn non_null(inner: OutputTypeReference<StringKey>) -> OutputTypeReference<StringKey> {
        OutputTypeReference::NonNull(OutputNonNull::KillsParent(Box::new(inner)))
    }

    fn semantic_non_null(inner: OutputTypeReference<StringKey>) -> OutputTypeReference<StringKey> {
        OutputTypeReference::NonNull(OutputNonNull::Semantic(Box::new(inner)))
    }

    fn list(inner: OutputTypeReference<StringKey>) -> OutputTypeReference<StringKey> {
        OutputTypeReference::List(Box::new(inner))
    }

    // --- from_type_reference ---

    #[test]
    fn test_from_type_reference_named() {
        let tr = TypeReference::Named("String".intern());
        let result = OutputTypeReference::from_type_reference(&tr);
        assert_eq!(result, named("String"));
    }

    #[test]
    fn test_from_type_reference_non_null() {
        let tr = TypeReference::NonNull(Box::new(TypeReference::Named("Int".intern())));
        let result = OutputTypeReference::from_type_reference(&tr);
        assert_eq!(result, non_null(named("Int")));
    }

    #[test]
    fn test_from_type_reference_list() {
        let tr = TypeReference::List(Box::new(TypeReference::Named("String".intern())));
        let result = OutputTypeReference::from_type_reference(&tr);
        assert_eq!(result, list(named("String")));
    }

    #[test]
    fn test_from_type_reference_non_null_list() {
        let tr = TypeReference::NonNull(Box::new(TypeReference::List(Box::new(
            TypeReference::Named("ID".intern()),
        ))));
        let result = OutputTypeReference::from_type_reference(&tr);
        assert_eq!(result, non_null(list(named("ID"))));
    }

    // --- inner ---

    #[test]
    fn test_inner_named() {
        assert_eq!(named("Foo").inner(), "Foo".intern());
    }

    #[test]
    fn test_inner_non_null() {
        assert_eq!(non_null(named("Bar")).inner(), "Bar".intern());
    }

    #[test]
    fn test_inner_list() {
        assert_eq!(list(named("Baz")).inner(), "Baz".intern());
    }

    #[test]
    fn test_inner_nested() {
        assert_eq!(non_null(list(named("X"))).inner(), "X".intern());
    }

    // --- non_null ---

    #[test]
    fn test_non_null_named() {
        let result = named("T").non_null();
        assert_eq!(result, non_null(named("T")));
    }

    #[test]
    fn test_non_null_list() {
        let result = list(named("T")).non_null();
        assert_eq!(result, non_null(list(named("T"))));
    }

    #[test]
    fn test_non_null_already_non_null() {
        let original = non_null(named("T"));
        let result = original.non_null();
        // Already non-null, should remain unchanged
        assert_eq!(result, non_null(named("T")));
    }

    // --- with_non_null_level ---

    #[test]
    fn test_with_non_null_level() {
        let matrix = list(list(named("T")));

        assert_eq!(
            matrix.with_non_null_level(0),
            non_null(list(list(named("T"))))
        );
        assert_eq!(
            matrix.with_non_null_level(1),
            list(non_null(list(named("T"))))
        );
        assert_eq!(
            OutputTypeReference::Named("T".intern()).with_non_null_level(0),
            non_null(named("T")),
        );
    }

    // --- nullable_type ---

    #[test]
    fn test_nullable_type_named() {
        let t = named("T");
        assert_eq!(t.nullable_type(), &named("T"));
    }

    #[test]
    fn test_nullable_type_list() {
        let t = list(named("T"));
        assert_eq!(t.nullable_type(), &list(named("T")));
    }

    #[test]
    fn test_nullable_type_non_null() {
        let inner = named("T");
        let t = non_null(inner.clone());
        assert_eq!(t.nullable_type(), &inner);
    }

    // --- is_non_null ---

    #[test]
    fn test_is_non_null() {
        assert!(!named("T").is_non_null());
        assert!(!list(named("T")).is_non_null());
        assert!(non_null(named("T")).is_non_null());
        assert!(semantic_non_null(named("T")).is_non_null());
    }

    // --- is_kills_parent_non_null ---

    #[test]
    fn test_is_kills_parent_non_null() {
        assert!(!named("T").is_kills_parent_non_null());
        assert!(non_null(named("T")).is_kills_parent_non_null());
        assert!(!semantic_non_null(named("T")).is_kills_parent_non_null());
    }

    // --- is_semantic_non_null ---

    #[test]
    fn test_is_semantic_non_null() {
        assert!(!named("T").is_semantic_non_null());
        assert!(!non_null(named("T")).is_semantic_non_null());
        assert!(semantic_non_null(named("T")).is_semantic_non_null());
    }

    // --- is_list ---

    #[test]
    fn test_is_list() {
        assert!(!named("T").is_list());
        assert!(list(named("T")).is_list());
        // NonNull wrapping a list should also report is_list=true
        assert!(non_null(list(named("T"))).is_list());
        assert!(!non_null(named("T")).is_list());
    }

    // --- list_item_type ---

    #[test]
    fn test_list_item_type_for_list() {
        let t = list(named("T"));
        assert_eq!(t.list_item_type(), Some(&named("T")));
    }

    #[test]
    fn test_list_item_type_for_non_null_list() {
        let t = non_null(list(named("T")));
        assert_eq!(t.list_item_type(), Some(&named("T")));
    }

    #[test]
    fn test_list_item_type_for_named() {
        assert_eq!(named("T").list_item_type(), None);
    }

    // --- non_list_type ---

    #[test]
    fn test_non_list_type_named() {
        assert_eq!(named("T").non_list_type(), Some("T".intern()));
    }

    #[test]
    fn test_non_list_type_non_null() {
        assert_eq!(non_null(named("T")).non_list_type(), Some("T".intern()));
    }

    #[test]
    fn test_non_list_type_list() {
        assert_eq!(list(named("T")).non_list_type(), None);
    }

    // --- with_nullable_item_type ---

    #[test]
    fn test_with_nullable_item_type_named() {
        let t = named("T");
        assert_eq!(t.with_nullable_item_type(), named("T"));
    }

    #[test]
    fn test_with_nullable_item_type_list_of_non_null() {
        // [T!] -> [T]
        let t = list(non_null(named("T")));
        assert_eq!(t.with_nullable_item_type(), list(named("T")));
    }

    #[test]
    fn test_with_nullable_item_type_non_null_list() {
        // [T!]! -> [T]!
        let t = non_null(list(non_null(named("T"))));
        assert_eq!(t.with_nullable_item_type(), non_null(list(named("T"))));
    }

    #[test]
    fn test_with_nullable_item_type_non_null_named() {
        // T! -> T (strips the non-null since it's not a list)
        let t = non_null(named("T"));
        assert_eq!(t.with_nullable_item_type(), named("T"));
    }

    // --- map ---

    #[test]
    fn test_map_named() {
        let t: OutputTypeReference<i32> = OutputTypeReference::Named(1);
        let result = t.map(|x| x * 2);
        assert_eq!(result, OutputTypeReference::Named(2));
    }

    #[test]
    fn test_map_non_null() {
        let t: OutputTypeReference<i32> = OutputTypeReference::NonNull(OutputNonNull::KillsParent(
            Box::new(OutputTypeReference::Named(5)),
        ));
        let result = t.map(|x| x + 10);
        assert_eq!(
            result,
            OutputTypeReference::NonNull(OutputNonNull::KillsParent(Box::new(
                OutputTypeReference::Named(15)
            )))
        );
    }

    #[test]
    fn test_map_list() {
        let t: OutputTypeReference<i32> =
            OutputTypeReference::List(Box::new(OutputTypeReference::Named(3)));
        let result = t.map(|x| x * 3);
        assert_eq!(
            result,
            OutputTypeReference::List(Box::new(OutputTypeReference::Named(9)))
        );
    }

    // --- OutputNonNull ---

    #[test]
    fn test_output_non_null_of() {
        let nn = OutputNonNull::KillsParent(Box::new(named("T")));
        assert_eq!(nn.of(), &named("T"));

        let nn = OutputNonNull::Semantic(Box::new(named("T")));
        assert_eq!(nn.of(), &named("T"));
    }

    #[test]
    fn test_output_non_null_inner() {
        let nn = OutputNonNull::KillsParent(Box::new(named("X")));
        assert_eq!(nn.inner(), "X".intern());
    }

    #[test]
    fn test_output_non_null_replace_of() {
        let nn = OutputNonNull::KillsParent(Box::new(named("Old")));
        let replaced = nn.replace_of(named("New"));
        assert_eq!(replaced, OutputNonNull::KillsParent(Box::new(named("New"))));

        let nn = OutputNonNull::Semantic(Box::new(named("Old")));
        let replaced = nn.replace_of(named("New"));
        assert_eq!(replaced, OutputNonNull::Semantic(Box::new(named("New"))));
    }

    #[test]
    fn test_output_non_null_non_list_type() {
        let nn = OutputNonNull::KillsParent(Box::new(named("T")));
        assert_eq!(nn.non_list_type(), Some("T".intern()));

        let nn = OutputNonNull::KillsParent(Box::new(list(named("T"))));
        assert_eq!(nn.non_list_type(), None);
    }

    #[test]
    fn test_output_non_null_map() {
        let nn = OutputNonNull::KillsParent(Box::new(OutputTypeReference::Named(1i32)));
        let result = nn.map(|x| x + 100);
        assert_eq!(
            result,
            OutputNonNull::KillsParent(Box::new(OutputTypeReference::Named(101)))
        );

        let nn = OutputNonNull::Semantic(Box::new(OutputTypeReference::Named(2i32)));
        let result = nn.map(|x| x * 5);
        assert_eq!(
            result,
            OutputNonNull::Semantic(Box::new(OutputTypeReference::Named(10)))
        );
    }

    #[test]
    fn test_output_non_null_as_ref() {
        let nn = OutputNonNull::KillsParent(Box::new(named("T")));
        let as_ref = nn.as_ref();
        match as_ref {
            OutputNonNull::KillsParent(inner) => match *inner {
                OutputTypeReference::Named(v) => assert_eq!(*v, "T".intern()),
                _ => panic!("Expected Named"),
            },
            _ => panic!("Expected KillsParent"),
        }
    }
}
