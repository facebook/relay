/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::types::{Intern, RawInternKey};
use core::cmp::Ordering;
use fnv::FnvHashMap;
use lazy_static::lazy_static;
use parking_lot::RwLock;
use serde::{Deserialize, Deserializer, Serialize, Serializer};
use std::fmt;
use std::num::NonZeroU32;
use std::str::FromStr;
use std::sync::Arc;

/// Slices of bytes intern as BytesKey
impl Intern for &[u8] {
    type Key = BytesKey;

    fn intern(self) -> Self::Key {
        BytesKey(BYTES_TABLE.intern(self))
    }
}

/// Owned strings intern as StringKey, with the interning
/// based on the raw bytes of the string
impl Intern for String {
    type Key = StringKey;

    fn intern(self) -> Self::Key {
        StringKey(BYTES_TABLE.intern(self.as_bytes()))
    }
}

/// Str (slices) intern as StringKey, with the interning
/// based on the raw bytes of the str.
impl Intern for &str {
    type Key = StringKey;

    fn intern(self) -> Self::Key {
        StringKey(BYTES_TABLE.intern(self.as_bytes()))
    }
}

impl Intern for &String {
    type Key = StringKey;

    fn intern(self) -> Self::Key {
        StringKey(BYTES_TABLE.intern(self.as_bytes()))
    }
}

/// Interned bytes
#[derive(Copy, Clone, Eq, Ord, Hash, PartialEq, PartialOrd)]
pub struct BytesKey(RawInternKey);

impl BytesKey {
    pub fn lookup(self) -> &'static [u8] {
        BYTES_TABLE.lookup(self.0)
    }
}

impl fmt::Debug for BytesKey {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let bytes_value = self.lookup();
        write!(f, "{:?}", bytes_value)
    }
}

/// An interned string
#[derive(Copy, Clone, Eq, Hash, PartialEq)]
pub struct StringKey(RawInternKey);

impl Ord for StringKey {
    fn cmp(&self, other: &Self) -> Ordering {
        self.lookup().cmp(other.lookup())
    }
}

impl PartialOrd for StringKey {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        self.lookup().partial_cmp(other.lookup())
    }
}

impl FromStr for StringKey {
    type Err = std::convert::Infallible;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Ok(s.intern())
    }
}

impl StringKey {
    /// Get a reference to the original str.
    pub fn lookup(self) -> &'static str {
        let bytes = BYTES_TABLE.lookup(self.0);
        // This is safe because the bytes we are converting originally came
        // from a str when we interned it: the only way to get a StringKey is
        // to intern an (already valid) string, so if we have a StringKey then
        // its bytes must be valid UTF-8.
        unsafe { std::str::from_utf8_unchecked(bytes) }
    }

    /// Convert the interned string key into an interned bytes key. Because
    /// strings intern as their raw bytes, this is an O(1) operation.
    /// Note the reverse (BytesKey.as_str) is a fallible operation since
    /// the bytes may not be valid UTF-8.
    pub fn as_bytes(self) -> BytesKey {
        BytesKey(self.0)
    }
}

impl fmt::Debug for StringKey {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let str_value = self.lookup();
        write!(f, "{:?}", str_value)
    }
}

impl fmt::Display for StringKey {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let str_value = self.lookup();
        write!(f, "{}", str_value)
    }
}

impl Serialize for StringKey {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(self.lookup())
    }
}

impl<'de> Deserialize<'de> for StringKey {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        Deserialize::deserialize(deserializer).map(|s: String| s.intern())
    }
}

// Static table used in the bytes/str Intern implementations
lazy_static! {
    static ref BYTES_TABLE: BytesTable = BytesTable::new();
}

/// Similar to the generic `InternTable` but customized for sequences of raw bytes (and strings).
pub struct BytesTable {
    data: Arc<RwLock<BytesTableData>>,
}

impl BytesTable {
    pub fn new() -> Self {
        Self {
            data: Arc::new(RwLock::new(BytesTableData::new())),
        }
    }

    pub fn intern(&self, value: &[u8]) -> RawInternKey {
        if let Some(prev) = self.data.read().get(value) {
            return prev;
        }
        let mut writer = self.data.write();
        writer.intern(value)
    }

    pub fn lookup(&self, key: RawInternKey) -> &'static [u8] {
        self.data.read().lookup(key)
    }
}

/// BytesTableData is similar to InternTableData but customized for sequences
/// of raw bytes (and notably, strings).
struct BytesTableData {
    // Raw data storage, allocated in large chunks
    buffer: Option<&'static mut [u8]>,
    // Reverse mapping of index=>value, used to convert an
    // interned key back to (a reference to) its value
    items: Vec<&'static [u8]>,
    // Mapping of values to their interned indices
    table: FnvHashMap<&'static [u8], RawInternKey>,
}

impl BytesTableData {
    const BUFFER_SIZE: usize = 4096;

    pub fn new() -> Self {
        Self {
            buffer: Some(Self::new_buffer()),
            items: vec![
                // Add buffer value so the used index starts at 1
                // and we can use a NonZero type.
                b"<sentinel>",
            ],
            table: Default::default(),
        }
    }

    fn new_buffer() -> &'static mut [u8] {
        Box::leak(Box::new([0; Self::BUFFER_SIZE]))
    }

    pub fn get(&self, value: &[u8]) -> Option<RawInternKey> {
        self.table.get(value).cloned()
    }

    // Copy the byte slice into 'static memory by appending it to a buffer, if there is room.
    // If the buffer fills up and the value is small, start over with a new buffer.
    // If the value is large, just give it its own memory.
    fn alloc(&mut self, value: &[u8]) -> &'static [u8] {
        let len = value.len();

        let mut buffer = self.buffer.take().unwrap();
        if len > buffer.len() {
            if len >= Self::BUFFER_SIZE / 16 {
                // This byte slice is so big it can just have its own memory.
                self.buffer = Some(buffer);
                return Box::leak(value.into());
            } else {
                buffer = Self::new_buffer()
            }
        }

        let (mem, remaining) = buffer.split_at_mut(len);
        mem.copy_from_slice(value);
        self.buffer = Some(remaining);

        mem
    }

    pub fn intern(&mut self, value: &[u8]) -> RawInternKey {
        // If there's an existing value return it
        if let Some(prev) = self.get(value) {
            return prev;
        }

        // Otherwise intern
        let key = RawInternKey::new(unsafe {
            // Safe because we initialize `self.items` with a sentinel value
            NonZeroU32::new_unchecked(self.items.len() as u32)
        });
        let static_bytes = self.alloc(value);
        self.items.push(static_bytes);
        self.table.insert(static_bytes, key);

        key
    }

    pub fn lookup(&self, key: RawInternKey) -> &'static [u8] {
        let index = key.as_usize();
        self.items[index]
    }
}
