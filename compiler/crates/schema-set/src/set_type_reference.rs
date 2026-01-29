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

    use crate::OutputNonNull;
    use crate::OutputTypeReference;

    // Tests for OutputTypeReference::with_non_null_level
    #[test]
    fn test_with_non_null_level() {
        let matrix = OutputTypeReference::List(Box::new(OutputTypeReference::List(Box::new(
            OutputTypeReference::Named("T".intern()),
        ))));

        assert_eq!(
            matrix.with_non_null_level(0),
            OutputTypeReference::NonNull(OutputNonNull::KillsParent(Box::new(
                OutputTypeReference::List(Box::new(OutputTypeReference::List(Box::new(
                    OutputTypeReference::Named("T".intern())
                ))))
            )))
        );

        assert_eq!(
            matrix.with_non_null_level(1),
            OutputTypeReference::List(Box::new(OutputTypeReference::NonNull(
                OutputNonNull::KillsParent(Box::new(OutputTypeReference::List(Box::new(
                    OutputTypeReference::Named("T".intern())
                ))))
            )))
        );

        assert_eq!(
            OutputTypeReference::Named("T".intern()).with_non_null_level(0),
            OutputTypeReference::NonNull(OutputNonNull::KillsParent(Box::new(
                OutputTypeReference::Named("T".intern())
            ))),
        );
    }
}
