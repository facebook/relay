/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use serde_derive::{Deserialize, Serialize};
use std::{
    ascii::escape_default,
    borrow::Borrow,
    fmt::{Debug, Formatter, Result},
    hash::{Hash, Hasher},
    mem::size_of,
    ops::Deref,
};

const SMALL_MAX_LEN: usize = 3 * size_of::<usize>() - 2;

/// A SmallBytes is 3 pointer-sized words (the same size as a vec);
/// one byte is used for the enum tag and one is used for the length so
/// the longest string that can be stored inline is 2 bytes shorter
/// than that.
#[derive(Eq, Clone, Deserialize, Serialize)]
#[serde(from = "serde_bytes::ByteBuf")]
#[serde(into = "serde_bytes::ByteBuf")]
pub enum SmallBytes {
    Small { len: u8, bytes: [u8; SMALL_MAX_LEN] },
    Large(Box<[u8]>),
}

use SmallBytes::*;

impl SmallBytes {
    pub const fn empty() -> SmallBytes {
        Small {
            len: 0,
            bytes: [0; SMALL_MAX_LEN],
        }
    }

    pub fn len(&self) -> usize {
        match self {
            Small { len, .. } => *len as usize,
            Large(b) => b.len(),
        }
    }

    pub fn is_empty(&self) -> bool {
        self.len() == 0
    }
}

impl Debug for SmallBytes {
    fn fmt(&self, f: &mut Formatter<'_>) -> Result {
        let s: String =
            String::from_utf8(self.iter().map(|b| escape_default(*b)).flatten().collect()).unwrap();
        match self {
            Small { len, .. } => write!(f, "Small{{len:{},bytes:b\"{}\"}}", *len, s),
            Large(_) => write!(f, "Large(b\"{}\")", s),
        }
    }
}

// If a slice is small enough to make a Small, we need to copy across
// the bytes we need.  Don't attempt to take ownership of the existing
// value.
fn make_small(b: &[u8]) -> Option<SmallBytes> {
    let l = b.len();
    if l <= SMALL_MAX_LEN {
        let mut bytes = [0; SMALL_MAX_LEN];
        bytes[0..l].copy_from_slice(b);
        Some(Small {
            len: l as u8,
            bytes,
        })
    } else {
        None
    }
}

impl Deref for SmallBytes {
    type Target = [u8];
    fn deref(&self) -> &[u8] {
        match self {
            Small { len, bytes } => &bytes[0..*len as usize],
            Large(b) => b,
        }
    }
}

impl AsRef<[u8]> for SmallBytes {
    fn as_ref(&self) -> &[u8] {
        self.deref()
    }
}

impl From<&[u8]> for SmallBytes {
    fn from(u: &[u8]) -> SmallBytes {
        if let Some(r) = make_small(u) {
            r
        } else {
            Large(u.into())
        }
    }
}

impl From<Box<[u8]>> for SmallBytes {
    fn from(u: Box<[u8]>) -> SmallBytes {
        if let Some(r) = make_small(&*u) {
            r
        } else {
            Large(u)
        }
    }
}

impl From<Vec<u8>> for SmallBytes {
    fn from(u: Vec<u8>) -> SmallBytes {
        if let Some(r) = make_small(&*u) {
            r
        } else {
            Large(u.into())
        }
    }
}

impl From<&str> for SmallBytes {
    #[inline]
    fn from(u: &str) -> SmallBytes {
        str::as_bytes(u).into()
    }
}

impl From<Box<str>> for SmallBytes {
    #[inline]
    fn from(u: Box<str>) -> SmallBytes {
        u.into_boxed_bytes().into()
    }
}

impl From<String> for SmallBytes {
    #[inline]
    fn from(u: String) -> SmallBytes {
        u.into_bytes().into()
    }
}

impl Borrow<[u8]> for SmallBytes {
    #[inline]
    fn borrow(&self) -> &[u8] {
        self.deref()
    }
}

impl From<serde_bytes::ByteBuf> for SmallBytes {
    fn from(bb: serde_bytes::ByteBuf) -> Self {
        bb.into_vec().into() // into_vec is just an unwrap.
    }
}

impl From<SmallBytes> for serde_bytes::ByteBuf {
    fn from(sb: SmallBytes) -> Self {
        let v: Vec<u8> = match sb {
            Small { len, bytes } => (&bytes[0..len as usize]).into(),
            Large(b) => b.into(),
        };
        serde_bytes::ByteBuf::from(v)
    }
}

impl PartialEq for SmallBytes {
    fn eq(&self, other: &Self) -> bool {
        self.deref() == other.deref()
    }
}

impl Hash for SmallBytes {
    fn hash<H: Hasher>(&self, state: &mut H) {
        self.deref().hash(state)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // Make sure we can use empty() in a const context.
    const EMPTY: SmallBytes = SmallBytes::empty();

    fn hash<H: Hash>(h: H) -> u64 {
        use std::collections::hash_map::DefaultHasher;
        let mut hasher = DefaultHasher::new();
        h.hash(&mut hasher);
        hasher.finish()
    }

    #[test]
    fn empty() {
        assert_eq!(3 * size_of::<usize>(), size_of::<SmallBytes>());
        assert_eq!(EMPTY, SmallBytes::empty());
        let e: &'static [u8] = b"";
        let l = SmallBytes::from(e);
        assert_eq!(l, EMPTY);
        assert_eq!(&*l, e);
        assert_eq!(&*EMPTY, e);
        assert_eq!(hash(&l), hash(e));
        let v: Vec<u8> = Vec::new();
        let ll = SmallBytes::from(v); // Consumes v.
        let ls: &[u8] = &*ll;
        assert_eq!(ll, l);
        assert_eq!(ls, b"");
        let vs: &[u8] = &Vec::new();
        assert_eq!(ls, vs);
        assert_eq!(hash(ll), hash(e));
        // Check that all zeros is empty, and fail compile if sizes are wrong.
        let zeros = [0usize; 3];
        let lz: SmallBytes = unsafe { std::mem::transmute(zeros) };
        assert_eq!(EMPTY, lz);
    }

    #[test]
    fn small() {
        let h: &'static [u8] = b"hello";
        let hi: &'static [u8] = b"hi";
        let l = SmallBytes::from(h);
        let li = SmallBytes::from(hi);
        assert_eq!(&*l, h);
        assert_eq!(hi, &*li);
        assert!(l != EMPTY);
        assert!(li != EMPTY);
        assert!(l != li);
        assert!(&*l != hi);
        assert!(hi != &*l);
        assert_eq!(hash(&l), hash(h));
        assert_eq!(hash(&li), hash(hi));
        let mut v = Vec::new();
        v.extend(b"hello");
        let ll = SmallBytes::from(v);
        assert_eq!(l, ll);
        assert_eq!(h, &*ll);
        assert_eq!(hash(&ll), hash(&l));
    }

    #[test]
    fn large() {
        #![allow(clippy::op_ref)]
        let abc: &'static [u8] = b"Jackdaws love my big pink sphinx of quartz.";
        let fox: &'static [u8] = b"The quick brown fox jumps over the lazy dg.";
        let labc = SmallBytes::from(abc);
        let lfox = SmallBytes::from(fox);
        assert_eq!(&*labc, abc);
        assert_eq!(fox, &*lfox);
        assert!(labc != lfox);
        assert!(&labc != &lfox);
        assert!(&*labc != &*lfox);
        assert_eq!(hash(abc), hash(&labc));
        assert_eq!(hash(fox), hash(&lfox));
        let mut v = Vec::new();
        v.extend(abc);
        let lv = SmallBytes::from(v);
        let mut w = Vec::new();
        w.extend(abc);
        assert_eq!(&*lv, &w[..]);
        assert_eq!(&*lv, abc);
        assert_eq!(lv, labc);
        assert_eq!(hash(&lv), hash(labc));
    }
}
