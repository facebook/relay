/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::types::{InternKey, RawInternKey};
use fnv::FnvHashMap;
use parking_lot::RwLock;
use std::hash::Hash;
use std::mem::MaybeUninit;
use std::num::NonZeroU32;
use std::sync::Arc;

/// An interner implementation that can be used to intern new values and lookup
/// the value of previously interned keys.
pub struct InternTable<K, V: 'static> {
    data: Arc<RwLock<InternTableData<K, V>>>,
}

impl<K, V> Default for InternTable<K, V>
where
    K: InternKey + Clone,
    V: Eq + Hash + Clone,
{
    fn default() -> Self {
        Self::new()
    }
}

impl<K, V> InternTable<K, V>
where
    K: InternKey + Clone,
    V: Eq + Hash + Clone,
{
    pub fn new() -> Self {
        Self {
            data: Arc::new(RwLock::new(InternTableData::new())),
        }
    }

    pub fn intern(&self, value: V) -> K {
        if let Some(prev) = self.data.read().get(&value) {
            return prev;
        }
        let mut writer = self.data.write();
        writer.intern(value)
    }

    pub fn lookup(&self, key: K) -> &'static V {
        self.data.read().lookup(key)
    }
}

/// Internal data used for public InternTable type.
struct InternTableData<K, V: 'static> {
    // Raw data storage, allocated in large chunks
    buffer: Option<&'static mut [MaybeUninit<V>]>,
    // Reverse mapping of index=>value, used to convert an
    // interned key back to (a reference to) its value
    items: Vec<&'static V>,
    // Mapping of values to their interned indices
    table: FnvHashMap<&'static V, K>,
}

// For some reason making this a const of InternTableData's impl block triggers
// an error that the size isn't known at compile time, but moving it here works:
// shrug, this works.
const INTERN_TABLE_BUFFER_SIZE: usize = 1000;

impl<K, V> InternTableData<K, V>
where
    K: InternKey + Clone,
    V: Eq + Hash + Clone,
{
    pub fn new() -> Self {
        Self {
            buffer: Some(Self::new_buffer()),
            items: Default::default(),
            table: Default::default(),
        }
    }

    fn new_buffer() -> &'static mut [MaybeUninit<V>] {
        // Create an uninitialized slice of values and leak it
        // to promote it to the static lifetime
        let buffer: [MaybeUninit<V>; INTERN_TABLE_BUFFER_SIZE] =
            unsafe { MaybeUninit::uninit().assume_init() };
        Box::leak(Box::new(buffer))
    }

    pub fn get(&self, value: &V) -> Option<K> {
        self.table.get(value).cloned()
    }

    pub fn intern(&mut self, value: V) -> K {
        // If there's an existing value return it
        if let Some(prev) = self.get(&value) {
            return prev;
        }
        // Ensure that there is sufficient space in the buffer for another item
        let mut buffer = self.buffer.take().unwrap();
        if buffer.is_empty() {
            buffer = Self::new_buffer();
        }
        // Split the buffer into a pointer to the first element and the remainder
        // of the slice, writing the new element into the first element pointer
        let (dest_ptr, remaining) = buffer.split_first_mut().unwrap();
        unsafe {
            std::ptr::write(dest_ptr, MaybeUninit::new(value))
        };

        // Cast the mutable pointer to immutable
        let dest_ptr: &'static V = unsafe { &*dest_ptr.as_ptr() };

        // Create a key for this entry and update both the intern/lookup
        // mappings
        let key = K::from_raw(RawInternKey::new(unsafe {
            NonZeroU32::new_unchecked((self.items.len() + 1) as u32)
        }));
        self.items.push(dest_ptr);
        self.table.insert(dest_ptr, key.clone());
        self.buffer = Some(remaining);
        key
    }

    pub fn lookup(&self, key: K) -> &'static V {
        let index = key.into_raw().as_usize() - 1;
        self.items[index]
    }
}
