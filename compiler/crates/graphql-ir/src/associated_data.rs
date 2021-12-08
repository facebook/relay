/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::{any::Any, fmt, hash::Hash};

pub trait AssociatedData: Send + Sync + fmt::Debug + AsAny {
    fn clone_box(&self) -> Box<dyn AssociatedData>;
    fn eq_box(&self, other: &Box<dyn AssociatedData>) -> bool;
    fn hash_box(&self) -> u64;
}
impl dyn AssociatedData {
    #[inline]
    pub fn downcast_ref<T: AssociatedData>(&self) -> Option<&T> {
        AsAny::as_any(self).downcast_ref::<T>()
    }
}

impl Clone for Box<dyn AssociatedData> {
    fn clone(&self) -> Self {
        self.clone_box()
    }
}

impl PartialEq for Box<dyn AssociatedData> {
    fn eq(&self, other: &Self) -> bool {
        self.eq_box(other)
    }
}

impl Hash for Box<dyn AssociatedData> {
    fn hash<H: std::hash::Hasher>(&self, state: &mut H) {
        // What's going on here?
        // Typically a `hash()` implementation should pass the `Hasher` down
        // and call `field.hash(hasher)` on all fields to hash. I couldn't
        // get that to work, because `H: Hasher` is not Sized which makes this
        // not a trait object.
        // https://doc.rust-lang.org/reference/types/trait-object.html
        // Instead, we just use hash internally the data fixed with `fnv`
        // and then hash that hash into the outer hasher. Not ideal, but makes
        // this work.
        self.hash_box().hash(state);
    }
}

impl Eq for Box<dyn AssociatedData> {}

#[macro_export]
macro_rules! associated_data_impl {
    ($name:ident) => {
        impl $crate::AssociatedData for $name {
            fn clone_box(&self) -> Box<dyn $crate::AssociatedData> {
                Box::new(self.clone())
            }

            fn eq_box(&self, other: &Box<dyn $crate::AssociatedData>) -> bool {
                other
                    .downcast_ref::<Self>()
                    .map_or(false, |other| other == self)
            }

            fn hash_box(&self) -> u64 {
                use std::hash::{Hash, Hasher};
                use $crate::reexport::{AsAny, FnvHasher};
                let mut state = FnvHasher::default();
                self.hash(&mut state);
                self.as_any().type_id().hash(&mut state);
                state.finish()
            }
        }

        impl Into<$crate::Directive> for $name {
            fn into(self) -> $crate::Directive {
                $crate::Directive {
                    name: $crate::reexport::WithLocation::generated(Self::directive_name()),
                    arguments: Vec::new(),
                    data: Some(Box::new(self)),
                }
            }
        }

        impl $name {
            pub fn directive_name() -> $crate::reexport::StringKey {
                static DIRECTIVE_NAME: $crate::reexport::Lazy<$crate::reexport::StringKey> =
                    $crate::reexport::Lazy::new(|| {
                        use $crate::reexport::string_key::Intern;
                        concat!("__", stringify!($name)).intern()
                    });
                return *DIRECTIVE_NAME;
            }

            #[allow(dead_code)]
            pub fn find(directives: &[$crate::Directive]) -> Option<&Self> {
                use $crate::reexport::NamedItem;
                directives.named(Self::directive_name()).map(|directive| {
                    directive
                        .data
                        .as_ref()
                        .expect(concat!(
                            "missing data on @__",
                            stringify!($name),
                            " directive"
                        ))
                        .downcast_ref::<Self>()
                        .expect(concat!(
                            "data on @__",
                            stringify!($name),
                            " directive not of right type"
                        ))
                })
            }
        }
    };
}

/// Internal helper trait to add an `as_any()` method to every type we need it
/// on.
pub trait AsAny: Any {
    fn as_any(&self) -> &dyn Any;
}

impl<T: Any> AsAny for T {
    fn as_any(&self) -> &dyn Any {
        self
    }
}

#[cfg(test)]
mod tests {
    use std::{
        collections::hash_map::RandomState,
        hash::{BuildHasher, Hasher},
    };

    use once_cell::sync::Lazy;

    use super::*;

    #[test]
    fn test_hash() {
        #[derive(Debug, PartialEq, Eq, Clone, Hash)]
        struct Foo(u8);
        associated_data_impl!(Foo);

        #[derive(Debug, PartialEq, Eq, Clone, Hash)]
        struct Bar(u8);
        associated_data_impl!(Bar);

        let boxed_foo_1: Box<dyn AssociatedData> = Box::new(Foo(1));
        let boxed_foo_2: Box<dyn AssociatedData> = Box::new(Foo(2));
        let boxed_bar_1: Box<dyn AssociatedData> = Box::new(Bar(1));

        static BUILD_HASHER: Lazy<RandomState> = Lazy::new(RandomState::new);
        fn hash<T: Hash>(x: T) -> u64 {
            let mut hasher = BUILD_HASHER.build_hasher();
            x.hash(&mut hasher);
            hasher.finish()
        }

        assert_eq!(
            hash(&boxed_foo_1),
            hash(&boxed_foo_1),
            "same value should hash same"
        );
        assert_ne!(
            hash(&boxed_foo_1),
            hash(&boxed_foo_2),
            "different value should hash different"
        );
        assert_eq!(
            hash(Foo(1)),
            hash(Bar(1)),
            "same value unwrapped hashes to same even for different types"
        );
        assert_ne!(
            hash(&boxed_foo_1),
            hash(&boxed_bar_1),
            "same value wrapped hashes differently"
        );
    }
}
