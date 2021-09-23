/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::{any::Any, fmt};

pub trait AssociatedData: Send + Sync + fmt::Debug + AsAny {
    fn clone_box(&self) -> Box<dyn AssociatedData>;
    fn eq_box(&self, other: &Box<dyn AssociatedData>) -> bool;
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
        }

        impl Into<$crate::Directive> for $name {
            fn into(self) -> $crate::Directive {
                $crate::Directive {
                    name: $crate::reexport::WithLocation::generated(*Self::DIRECTIVE_NAME),
                    arguments: Vec::new(),
                    data: Some(Box::new(self)),
                }
            }
        }

        impl $name {
            pub const DIRECTIVE_NAME: $crate::reexport::Lazy<$crate::reexport::StringKey> =
                $crate::reexport::Lazy::new(|| {
                    $crate::reexport::Intern::intern(concat!("__", stringify!($name)))
                });

            pub fn find(directives: &[$crate::Directive]) -> Option<&Self> {
                use $crate::reexport::NamedItem;
                directives.named(*Self::DIRECTIVE_NAME).map(|directive| {
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
