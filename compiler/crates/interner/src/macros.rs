/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/// Interns the passed string literal and memoizes the result in a static
/// variable. This can be used in performance sensitive code.
/// ```
/// use interner::intern;
/// assert_eq!(intern!("example").lookup(), "example");
/// ```
#[macro_export]
macro_rules! intern {
    ($value:literal) => {{
        use $crate::{reexport::Lazy, Intern, StringKey};
        static KEY: Lazy<StringKey> = Lazy::new(|| Intern::intern($value));
        *KEY
    }};
    ($_:expr) => {
        compile_error!("intern! macro can only be used with string literals.")
    };
}

/// Macro to implement an interner for an arbitrary type.
/// Given `intern!(<Foo> as <FooKey>);`, this macro will implement the
/// `Intern` trait for `<Foo>`, interning it a generated `<FooKey>` wrapper
/// type. Calling `FooKey::lookup()` will return a reference to the original
/// `<Foo>` value.
///
/// # Example
///
/// ```ignore
/// use common::{Intern, intern, StringKey};
/// pub struct User {
///   name: StringKey,
/// }
/// intern!(User as UserKey); // defines the `UserKey` type
///
/// let name: StringKey = "Joe".intern();
/// let user: User = User { name };
/// let user_key: UserKey = user.intern();
/// ```
///
#[macro_export]
macro_rules! make_intern {
    ($name:ident as $alias:ident) => {
        use crate::{Intern, InternKey, InternTable, RawInternKey};
        use lazy_static::lazy_static;

        lazy_static! {
            /// Global interning table for this type
            static ref INTERN_TABLE: InternTable<$alias, $name> = InternTable::new();
        }

        /// Wrapper type for the intern key
        #[derive(Copy, Clone, Debug, Eq, Ord, Hash, PartialEq, PartialOrd)]
        pub struct $alias(RawInternKey);

        impl InternKey for $alias {
            type Value = $name;

            fn from_raw(raw: RawInternKey) -> Self {
                Self(raw)
            }

            fn into_raw(self) -> RawInternKey {
                self.0
            }

            fn lookup(self) -> &'static Self::Value {
                INTERN_TABLE.lookup(self)
            }
        }

        /// The type interns into the generated key type
        impl Intern for $name {
            type Key = $alias;

            fn intern(self) -> Self::Key {
                INTERN_TABLE.intern(self)
            }
        }
    };
}
