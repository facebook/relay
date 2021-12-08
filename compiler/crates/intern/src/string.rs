/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::{
    idhasher::BuildIdHasher,
    intern::{InternId, InternSerdes},
    intern_struct,
    small_bytes::SmallBytes,
};
#[doc(hidden)]
pub use once_cell::sync::Lazy; // For macros
use serde_derive::{Deserialize, Serialize};
use std::{
    borrow::{Borrow, Cow},
    cmp::Ordering,
    collections::{HashMap, HashSet},
    fmt::{self, Formatter},
    hash::Hash,
    str::{FromStr, Utf8Error},
};

intern_struct! {
    /// An opaque token corresponding to an interned &[u8].
    pub struct BytesId = Intern<SmallBytes> {
        serdes("InternSerdes<BytesId>");
        type Lookup = [u8];
        const EMPTY = SmallBytes::empty();
    }
}

impl BytesId {
    /// Recover the original interned bytes.
    #[inline]
    pub fn as_bytes(self) -> &'static [u8] {
        // Safe because BytesId can only be generated
        // by a call to intern, which returns the result
        // of id_to_bytes.push.
        &*self.get()
    }
}

impl PartialOrd for BytesId {
    fn partial_cmp(&self, other: &BytesId) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for BytesId {
    fn cmp(&self, other: &BytesId) -> Ordering {
        if self == other {
            std::cmp::Ordering::Equal
        } else {
            self.get().cmp(other.get())
        }
    }
}

pub type BytesIdMap<V> = HashMap<BytesId, V, BuildIdHasher<u32>>;
pub type BytesIdSet = HashSet<BytesId, BuildIdHasher<u32>>;

/// An opaque token corresponding to an interned &str.
///
/// You can recover the str with id.as_str() or using format!.
#[derive(Copy, Clone, Hash, Eq, PartialEq, Ord, PartialOrd)]
#[derive(Serialize, Deserialize)]
#[repr(transparent)]
pub struct StringId(BytesId);

impl StringId {
    /// We always pre-reserve a blank entry.
    pub const EMPTY: StringId = StringId(BytesId::EMPTY);

    /// Convert from raw bytes, which can only succeed if the bytes are valid utf-8.
    pub fn from_bytes(bytes: BytesId) -> Result<StringId, Utf8Error> {
        match std::str::from_utf8(bytes.as_bytes()) {
            Ok(_) => Ok(StringId(bytes)),
            Err(e) => Err(e),
        }
    }

    /// Convert to a static string.
    pub fn as_str(self) -> &'static str {
        // This is actually safe because the bytes we are converting originally came
        // from a str when we interned it. So they must be well-formed UTF8.
        unsafe { std::str::from_utf8_unchecked(self.0.as_bytes()) }
    }

    /// Intern index for the underlying bytes.
    pub fn index(self) -> u32 {
        (self.0).0.index() as u32
    }

    /// 0-cost conversion to interned bytes.
    pub fn as_bytes(self) -> BytesId {
        self.0
    }

    pub fn is_empty(self) -> bool {
        self == Self::EMPTY
    }
}

impl fmt::Display for StringId {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        f.write_str(self.as_str())
    }
}

impl fmt::Debug for StringId {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        f.write_str(self.as_str())
    }
}

// Describes types that can be viewed as a `[u8]`.
pub trait IntoUtf8Bytes: Sized {
    type Bytes: Into<SmallBytes> + Borrow<[u8]>;
    /// Convert into utf-8 encoded bytes while preserving the
    /// ownedness of the underlying storage if possible.
    fn into_bytes(self) -> Self::Bytes;
}

impl<'a> IntoUtf8Bytes for &'a str {
    type Bytes = &'a [u8];
    fn into_bytes(self) -> &'a [u8] {
        self.as_ref()
    }
}

impl IntoUtf8Bytes for Box<str> {
    type Bytes = Box<[u8]>;
    fn into_bytes(self) -> Box<[u8]> {
        From::from(self)
    }
}

impl<'a> IntoUtf8Bytes for Cow<'a, str> {
    type Bytes = Vec<u8>;
    fn into_bytes(self) -> Self::Bytes {
        self.into_owned().into_bytes()
    }
}

impl IntoUtf8Bytes for String {
    type Bytes = Vec<u8>;
    fn into_bytes(self) -> Vec<u8> {
        From::from(self)
    }
}

impl<'a> IntoUtf8Bytes for &'a String {
    type Bytes = &'a [u8];
    fn into_bytes(self) -> &'a [u8] {
        self.as_ref()
    }
}

impl FromStr for StringId {
    type Err = std::convert::Infallible;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Ok(intern(s))
    }
}

pub type StringIdMap<V> = HashMap<StringId, V, BuildIdHasher<u32>>;
pub type StringIdSet = HashSet<StringId, BuildIdHasher<u32>>;

// A copy-on-write object that can be an interned string, a reference to a
// string, or an owned but uninterned string.
#[derive(Debug)]
pub enum CowStringId<'a> {
    Id(StringId),
    Ref(&'a str),
    Owned(String),
}

impl CowStringId<'_> {
    pub fn as_bytes(&self) -> &[u8] {
        self.as_str().as_bytes()
    }

    pub fn as_str(&self) -> &str {
        match self {
            CowStringId::Id(s) => s.as_str(),
            CowStringId::Ref(s) => s,
            CowStringId::Owned(s) => s,
        }
    }

    pub fn into_owned(self) -> String {
        match self {
            CowStringId::Id(s) => s.as_str().to_owned(),
            CowStringId::Ref(s) => s.to_owned(),
            CowStringId::Owned(s) => s,
        }
    }

    pub fn to_string_id(&self) -> StringId {
        match self {
            CowStringId::Id(s) => *s,
            CowStringId::Ref(s) => intern(*s),
            CowStringId::Owned(s) => intern(s.as_str()),
        }
    }

    pub fn to_bytes_id(&self) -> BytesId {
        self.to_string_id().as_bytes()
    }
}

impl fmt::Display for CowStringId<'_> {
    fn fmt(&self, fmt: &mut Formatter<'_>) -> std::fmt::Result {
        self.as_str().fmt(fmt)
    }
}

impl From<StringId> for CowStringId<'_> {
    fn from(id: StringId) -> Self {
        CowStringId::Id(id)
    }
}

impl<'a> From<&'a str> for CowStringId<'a> {
    fn from(s: &'a str) -> CowStringId<'a> {
        CowStringId::Ref(s)
    }
}

impl<'a> From<String> for CowStringId<'a> {
    fn from(s: String) -> Self {
        CowStringId::Owned(s)
    }
}

pub fn intern<S: IntoUtf8Bytes>(s: S) -> StringId {
    StringId(intern_bytes(s.into_bytes()))
}

#[inline]
pub fn intern_bytes<S>(s: S) -> BytesId
where
    S: Into<SmallBytes> + Borrow<[u8]>,
{
    let b: SmallBytes = s.into();
    BytesId::intern(b)
}

/// Statically declare an interned string.
#[macro_export]
macro_rules! string_id {
    ($value:literal) => {{
        static INSTANCE: $crate::string::Lazy<$crate::string::StringId> =
            $crate::string::Lazy::new(|| $crate::string::intern($value));
        *INSTANCE
    }};
    ($_:expr) => {
        compile_error!("string_id! macro can only be used with string literals.")
    };
}

/// Statically declare some interned bytes.
#[macro_export]
macro_rules! bytes_id {
    ($value:literal) => {{
        static INSTANCE: $crate::string::Lazy<$crate::string::BytesId> =
            $crate::string::Lazy::new(|| $crate::string::intern_bytes($value as &[u8]));
        *INSTANCE
    }};
    ($_:expr) => {
        compile_error!("bytes_id! macro can only be used with literals.")
    };
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn simple_bytes() {
        // Test EMPTY first to catch race with pool init.
        assert_eq!(BytesId::EMPTY.as_bytes(), b"");
        let e = intern_bytes(&b""[..]);
        assert_eq!(BytesId::EMPTY, e);
        let ek: &'static [u8] = b"";
        let ee = intern_bytes(ek);
        assert_eq!(BytesId::EMPTY, ee);
        let a = intern_bytes(&b"this is interned bytes"[..]);
        let b = intern("this is interned bytes").as_bytes();
        let c = intern_bytes(&b"this is different"[..]);
        assert_eq!(a, b);
        assert_ne!(a, c);
        assert_eq!(a.as_bytes(), b"this is interned bytes");
        assert_eq!(c.as_bytes(), b"this is different");
    }

    #[test]
    fn simple() {
        let a = intern("this is an interned string");
        let b = intern("this is an interned string".to_string());
        let c = intern("this is different");
        assert_eq!(a, b);
        assert_ne!(a, c);
        assert_eq!(a.to_string(), "this is an interned string");
        assert_eq!(c.to_string(), "this is different");
        assert_eq!(StringId::EMPTY.to_string(), "");
    }

    fn test_interning(strs: Vec<String>) {
        // Make sure interning produces the same tokens.
        let ids1: Vec<StringId> = strs.iter().map(|s| intern(s.clone())).collect();
        let ids2: Vec<StringId> = strs.iter().map(|s| intern(s.as_ref() as &str)).collect();
        assert_eq!(ids1, ids2);

        // Make sure they map back to the original strings.
        let strs2: Vec<String> = ids1.iter().map(|sid| sid.to_string()).collect();
        assert_eq!(strs, strs2);
    }

    #[test]
    fn many() {
        let strs: Vec<String> = (0..3000).map(|n| format!("some {}", n)).collect();
        test_interning(strs)
    }

    #[test]
    fn big() {
        let long = format!("{:900}", "");
        let strs: Vec<String> = (0..20).map(|n| format!("{}{}", long, n)).collect();
        test_interning(strs);
    }

    #[test]
    fn serde() {
        use crate::intern::{DeGuard, SerGuard};
        let original = intern("hello world");
        let mut encoded = Vec::new();
        let g = SerGuard::default();
        bincode::serialize_into(&mut encoded, &original).unwrap();
        drop(g);
        assert!(encoded.len() > 11);
        let g = DeGuard::default();
        let decoded: StringId = bincode::deserialize(&encoded).unwrap();
        drop(g);
        assert_eq!(original, decoded);
    }

    #[test]
    fn multithreaded() {
        use rand::{thread_rng, Rng};
        use std::sync::atomic::{AtomicU32, Ordering};
        use std::sync::Arc;
        use std::thread;
        use std::u32;

        // Load test lots of threads creating strings, with load
        // gradually getting heavier on later (popular) strings.
        const N: usize = 20_000_000;
        const WRITERS: usize = 100;
        const MAX: usize = N / WRITERS;
        // Array to track index issued to each string.
        let mut avail: Arc<Vec<AtomicU32>> = Arc::new(Vec::with_capacity(MAX as usize));
        Arc::get_mut(&mut avail)
            .unwrap()
            .resize_with(N as usize, || AtomicU32::new(u32::MAX));
        let mut workers = Vec::new();
        for k in 0..WRITERS {
            let avail = avail.clone();
            workers.push(thread::spawn(move || {
                let mut rng = thread_rng();
                for i in 0..MAX {
                    let r = if k == 0 { i } else { rng.gen_range(i..MAX) };
                    let id = intern(r.to_string());
                    let ix = id.0.index();
                    let av = avail[r].load(Ordering::Relaxed);
                    if av == u32::MAX {
                        avail[r].store(ix, Ordering::Relaxed);
                    } else {
                        assert_eq!(av, ix);
                    }
                }
            }));
        }
        for w in workers {
            w.join().unwrap();
        }
    }

    #[test]
    fn all_kinds_of_bytes() {
        let d: &[u8] = b"Hello";
        let e: Vec<u8> = d.into();
        let f: Box<[u8]> = d.into();
        let di = intern_bytes(d);
        let ei = intern_bytes(e);
        let fi = intern_bytes(f);
        assert_eq!(di, ei);
        assert_eq!(di, fi);
    }

    #[test]
    fn all_kinds_of_strings() {
        let a: &str = "Hello";
        let b: String = a.into();
        let c: Box<str> = a.into();
        let ai = intern(a);
        let bi = intern(b);
        let ci = intern(c);
        assert_eq!(ai, bi);
        assert_eq!(ai, ci);
    }
}
