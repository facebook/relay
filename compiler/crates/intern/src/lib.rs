/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Compact, serializable, mostly-lock-free interning.
//!
//! A library for [interning](https://en.wikipedia.org/wiki/String_interning)
//! strings, byte slices, and other data in Rust.  Interned values are
//! deduplicated.  A reference to interned data can be represented in 32 bits,
//! so that frequently-used references take up half as much space on a system
//! with 64-bit pointers.
//!
//! # Why another intern crate?
//!
//! Compared to similar crates (such as
//! [internment](https://crates.io/crates/internment)), this crate offers the
//! following advantages:
//! * Compact 32-bit ids.  This crate was written to save space on internal
//!   program analysis data structures.  (If you don't need this, you can use
//!   `get()` to turn an `Id` into a `&'static T`.)
//! * Sharded locking when interning new objects.  We use
//!   [rayon](https://docs.rs/rayon/1.5.1/rayon/) in our code and need to be
//!   able to intern data in parallel.
//! * Lock-free constant-time `deref()` of intern ids.  Again, we need to be
//!   able read interned data from numerous threads.  Compared to using a
//!   pointer, this requires a single extra load and no extra storage beyond
//!   the fixed-size part of the arena.
//! * Support for deduplicating serialization and deserialization using
//!   [serde](https://serde.rs/).  This allows us to preserve sharing when
//!   doing I/O, and to automatically re-intern data when it is read.
//! * Support for fast hashing using the `IdHasher` type.
//!
//! # Data is leaked
//!
//! There is one important downside to this crate that is shared by some, but
//! not all, intern crates: interned data is leaked and will not be reclaimed
//! until the program terminates.  If that's a problem you may need to consider
//! a scoped interning crate (but note that efficient threading support may be
//! hard to find).
//!
//! # Using string interning
//!
//! Simply import `intern::string` and go to town:
//! ```
//! use intern::string::{self, StringId};
//!
//! let a: StringId = string::intern("a");
//! let b = string::intern("b");
//! let a_again: Option<StringId> = Some(string::intern("a")); // still 32 bits
//! assert_eq!(Some(a), a_again);
//! assert_eq!(format!("{} {} {}", a, b, a_again.unwrap()), "a b a");
//! ```
//!
//! # How to define an interned type
//!
//! Say we want to intern `MyType`.  Simply use the
//! [`intern_struct!`](intern_struct) macro as shown below.  Now
//! `MyId::intern(my_type)` will intern an object and `&*my_id` will retrieve a
//! static reference to the interned object referred to by `my_id`.
//! ```
//! # #[macro_use]
//! use intern::{InternId, InternSerdes, intern_struct};
//! use serde_derive::{Deserialize, Serialize};
//!
//! #[derive(Debug, PartialEq, Eq, Hash, Deserialize, Serialize)]
//! struct MyType{ v: i64 }
//!
//! intern_struct! {
//!     struct MyId = Intern<MyType> { serdes("InternSerdes<MyId>"); }
//! }
//!
//! # fn main() {
//! let m1 = MyType{ v: 1 };
//! let m2 = MyType{ v: 1 };
//! let m3 = MyType{ v: -57 };
//! let i1 = MyId::intern(m1);
//! let i2 = MyId::intern(m2);
//! let i3 = MyId::intern(m3);
//! assert_eq!(i1, i2);
//! assert_eq!(i1.get().v, 1);
//! assert!(i1 != i3);
//! assert_eq!(i3.v, -57);  // Uses Deref
//! # }
//! ```
//!
//! # Using InternId serde support
//!
//! `InternId`s defined with a `serdes` clause as shown above support
//! de-duplication of common ids during serialization.  This can be especially
//! useful for interned strings, but is applicable to any intern type whose
//! target is serializable.  Because this deduplication is stateful but the
//! serde api is stateless, you'll need to create a thread-local capability
//! token each time you use deduplicating serialization:
//! ```
//! # use bincode::Result;
//! # type MyId = crate::intern::string::StringId;
//! pub fn serialize(v: &[MyId]) -> Result<Vec<u8>> {
//!     let mut result = Vec::new();
//!     let g = intern::SerGuard::default();  // Create serialization context
//!     bincode::serialize_into(&mut result, v)?;
//!     drop(g); // Clean up and reset serialization context
//!     Ok(result)
//! }
//!
//! pub fn deserialize(encoded: &[u8]) -> Result<Vec<MyId>> {
//!     let g = intern::DeGuard::default();  // Create deserialization context
//!     let result = bincode::deserialize(encoded)?;
//!     drop(g); // Clean up and reset deserialization context
//!     Ok(result)
//! }
//! ```
//! Note in particular that dropping a context resets sharing; if you create
//! and drop a context during serialization, you must create and drop it at the
//! same point during deserialization and vice versa.

mod atomic_arena;
#[doc(hidden)]
pub mod idhasher;
pub mod intern;
pub mod path;
mod sharded_set;
mod small_bytes;
pub mod string;
pub mod string_key;
#[doc(hidden)]
pub use crate::atomic_arena::Zero;
#[doc(inline)]
pub use crate::idhasher::{BuildIdHasher, IdHasher};
#[doc(inline)]
pub use crate::intern::{AsInterned, DeGuard, InternId, InternSerdes, SerGuard};
