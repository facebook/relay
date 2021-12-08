/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::{
    atomic_arena::{self, AtomicArena},
    idhasher::BuildIdHasher,
    sharded_set::ShardedSet,
};
use once_cell::sync::OnceCell;
use serde::{
    de::{self, Error, VariantAccess},
    Deserialize, Deserializer, Serialize, Serializer,
};
use std::{
    any::type_name,
    borrow::Borrow,
    cell::RefCell,
    collections::HashMap,
    fmt::{self, Debug},
    hash::{Hash, Hasher},
    marker::PhantomData,
    num::NonZeroU32,
    sync::atomic::{AtomicU32, Ordering},
    u32,
};

/// `InternId`s wrap the `Ref<T>` type.
#[doc(hidden)]
pub type Ref<T> = atomic_arena::Ref<'static, T>;

/// The `InternId` trait is applied to the identifiers of interned data, and
/// `InternId::Intern` is the type of the data that was interned.  You should
/// not implement `InternId` manually; instead, use the [intern_struct] macro.
pub trait InternId: 'static + Eq + Copy {
    /// Actual type of the interned data.
    type Intern: Hash + Eq + 'static + Borrow<Self::Lookup>;
    /// Type by which interned data can be looked up.  This lets us support
    /// (for example) looking up a `StringId` using `&str` in `get_interned`.
    /// In most cases it will be the same as `Intern`.
    type Lookup: Hash + Eq + ?Sized;

    /// Return the static intern table for this type, which encapsulates the
    /// mapping from `InternId`s to their corresponding data.
    fn table() -> &'static InternTable<Self, Self::Intern>;

    /// Wrap and unwrap references.
    #[doc(hidden)]
    fn wrap(r: Ref<Self::Intern>) -> Self;

    #[doc(hidden)]
    fn unwrap(self) -> Ref<Self::Intern>;

    // Methods from here on are implemented for you,
    // and you should not override them.

    /// Intern a value.
    fn intern<U>(t: U) -> Self
    where
        U: Into<Self::Intern> + Borrow<Self::Lookup>,
        AsInterned<Self>: Borrow<Self::Lookup>,
    {
        Self::table().intern(t)
    }

    /// Fetch an existing interned value if it exists.  You can use
    /// any type that you would use for a hash table lookup keyed by
    /// `Self::Intern`; by contrast `intern()` requires that you be able
    /// to convert the key `Into<Self::Intern>` if it hasn't been
    /// interned yet.
    fn get_interned<U>(t: &U) -> Option<Self>
    where
        U: Borrow<Self::Lookup>,
        AsInterned<Self>: Borrow<Self::Lookup>,
    {
        Self::table().get_interned(t)
    }

    /// Given an `InternId`, retrieve the corresponding data.  Equivalent to
    /// `Deref::deref`, but specifies the resulting reference is `'static`.
    #[inline]
    fn get(self) -> &'static Self::Intern {
        Self::table().get(self)
    }

    /// 0-based index of interned value among all interned values of this type,
    /// suitable for indexing arrays with interned values.
    #[inline]
    fn index(self) -> u32 {
        self.unwrap().index()
    }

    /// Unsafely reverse the results of `index()`.
    #[doc(hidden)]
    #[inline]
    unsafe fn from_index(i: u32) -> Self {
        Self::wrap(Ref::from_index(i))
    }

    /// Raw index for internal use only.
    #[doc(hidden)]
    #[inline]
    fn raw(self) -> NonZeroU32 {
        self.unwrap().raw()
    }

    /// Unsafely reverse the results of `raw()`.
    #[doc(hidden)]
    #[inline]
    unsafe fn from_raw(i: NonZeroU32) -> Self {
        Self::wrap(Ref::from_raw(i))
    }
}

/// There are two very different ways you might want to use an `InternId` as a
/// hash table key.  The default if you `derive(Hash, PartialEq, Eq)` is to use
/// the representation of the `Id` itself (roughly equivalent to `.index()`) as
/// the hash code.  This yields fast equality and hash, but you can only look
/// up interned values.  The default `Set` and `Map` types created by the macro
/// use this hash code with the custom fast hasher
/// `idhasher::BuildIdHasher<T>`.
///
/// `AsInterned` is a simple wrapper that supports the opposite view:
/// treat the `InternId` as a reference to `InternId::Intern` and use the
/// hash code of `InternId::Intern`.  This allows you to compare to
/// uninterned data, by comparing the results of `InternId::get`.
/// `AsInterned` is public so that it can be used if you need it (for
/// example if you're using a mix of interned and uninterned values to
/// avoid interning intermediate data that you want to throw away).
///
/// It's unsafe to `impl Borrow<InternId::Intern> for InternId`; `Borrow`
/// requires hash codes to be equal.  You can't directly use `InternId` as a
/// hash table key and then expect to be able to use `InternId::Intern` to
/// perform lookups without interning.
/// An explicit `impl Borrow<InternId::Intern> for AsInterned<InternId>` is
/// still required for every `InternId`.  The [intern_struct] macro provides
/// this implementation as it's used internally for the intern process itself.
#[derive(Debug, Copy, Clone)]
#[repr(transparent)]
pub struct AsInterned<Id>(pub Id);

impl<Id: InternId> Hash for AsInterned<Id> {
    fn hash<H: Hasher>(&self, h: &mut H) {
        self.0.get().hash(h)
    }
}

impl<Id: InternId> PartialEq for AsInterned<Id> {
    fn eq(&self, other: &Self) -> bool {
        // Note: intern yields equal ids *iff* the underlying equality did so,
        // and the underlying hashing is consistent with equality (which is an
        // invariant of Hash).  That's because the underlying equality and hash
        // are used when the data is interned in the first place.  Thus this is
        // safe.
        self.0 == other.0
    }
}

impl<Id: InternId> Eq for AsInterned<Id> {}

impl<Id> Ord for AsInterned<Id>
where
    Id: InternId,
    Id::Intern: Ord,
{
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        self.0.get().cmp(other.0.get())
    }
}

impl<Id> PartialOrd for AsInterned<Id>
where
    Id: InternId,
    Id::Intern: PartialOrd,
{
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        self.0.get().partial_cmp(other.0.get())
    }
}

type Shards<Id> = ShardedSet<AsInterned<Id>, std::hash::BuildHasherDefault<fnv::FnvHasher>>;

/// An `InternTable` manages all the storage associated with the `Id`.
#[derive(Default)]
pub struct InternTable<Id, Type> {
    shards: OnceCell<Shards<Id>>,      // Allocated lazily.
    arena: AtomicArena<'static, Type>, // Static.
    serdes_type_index: AtomicU32,      // Initialized lazily.
}

static NEXT_SERDES_TYPE_INDEX: AtomicU32 = AtomicU32::new(1);

impl<Id, Type> InternTable<Id, Type> {
    /// Create new `InternTable`
    #[doc(hidden)]
    pub const fn new() -> Self {
        InternTable {
            shards: OnceCell::new(),
            arena: AtomicArena::new(),
            serdes_type_index: AtomicU32::new(u32::MAX),
        }
    }

    /// Create new `InternTable` with a distinguished constant as the first
    /// interned value.
    #[doc(hidden)]
    pub const fn with_zero(z: &'static atomic_arena::Zero<Type>) -> Self {
        InternTable {
            shards: OnceCell::new(),
            arena: AtomicArena::with_zero(z),
            serdes_type_index: AtomicU32::new(u32::MAX),
        }
    }

    /// Yields the current count of interned values; this can be used
    /// in conjunction with `.index()` on those values to allocate and
    /// index a direct-mapped array.
    pub fn len(&self) -> usize {
        self.arena.len()
    }

    pub fn is_empty(&self) -> bool {
        self.arena.is_empty()
    }
}

impl<Id: InternId> InternTable<Id, Id::Intern> {
    /// The methods from here on are internal and private.
    fn shards(&'static self) -> &Shards<Id> {
        self.shards.get_or_init(|| {
            let shards: Shards<Id> = ShardedSet::default();
            if !self.arena.is_empty() {
                let iwz = AsInterned(Id::wrap(atomic_arena::Zero::zero()));
                shards.unchecked_insert(iwz);
            }
            shards
        })
    }

    /// Intern `t`, and return the resulting `Id`.
    fn intern<U>(&'static self, t: U) -> Id
    where
        U: Into<Id::Intern> + Borrow<Id::Lookup>,
        AsInterned<Id>: Borrow<Id::Lookup>,
    {
        let wt = t.borrow();
        // Optimistically try to write lock (because it only requires
        // one lock acquisition check for the new-string case), but if
        // there's write contention take a slower path.
        let shards = self.shards();
        let mut insert_lock = match shards.get_or_insert_lock(wt) {
            Ok(AsInterned(id)) => return id,
            Err(insert_lock) => insert_lock,
        };
        let id = Id::wrap(self.arena.add(t.into()));
        insert_lock.insert(AsInterned(id));
        id
    }

    /// If `t` has already been interned, return the corresponding `Id`.
    /// Note that this only borrows `t`, and thus avoids
    /// creating an `Id::Intern`.
    fn get_interned<U>(&'static self, t: &U) -> Option<Id>
    where
        U: Borrow<Id::Lookup>,
        AsInterned<Id>: Borrow<Id::Lookup>,
    {
        if let Some(AsInterned(id)) = self.shards().get(t.borrow()) {
            Some(id)
        } else {
            None
        }
    }

    /// Get a shared reference to the underlying `Id::Intern`.
    /// Usually you can rely on `deref` to do this implicitly.
    #[inline]
    fn get(&'static self, r: Id) -> &Id::Intern {
        &*self.arena.get(r.unwrap())
    }

    /// Getter that checks for the need to allocate.
    fn serdes_type_index(&'static self) -> u32 {
        let i = self.serdes_type_index.load(Ordering::Acquire);
        if i != u32::MAX {
            i
        } else {
            self.serdes_type_index_slow()
        }
    }

    fn serdes_type_index_slow(&'static self) -> u32 {
        let i = NEXT_SERDES_TYPE_INDEX.fetch_add(1, Ordering::Relaxed);
        assert!(i != u32::MAX); // Or we've overflowed.
                                // Now, we might be racing another thread to assign self.type_index.
                                // So CAS it in, keeping any entry that was already there (since it's
                                // already being used).
        if let Err(winner) = self.serdes_type_index.compare_exchange(
            u32::MAX,
            i,
            Ordering::AcqRel,
            Ordering::Acquire,
        ) {
            winner
        } else {
            i
        }
    }
}

impl<Id, Type> Debug for InternTable<Id, Type> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "InternTable[{} entries]", self.len())
    }
}

// `PerInternIdVec` can be used to allocate a data structure for each
// distinct `Id` type.  Note, however, that the underlying type `T` has to
// be the same for all `Id` types.
#[derive(Default, Debug)]
struct PerInternIdVec<T> {
    v: Vec<T>,
}

impl<T: Default> PerInternIdVec<T> {
    /// Ensure there is an element for all currently-extant `Id` types,
    /// extending with default elements if they are missing.
    fn ensure_default(&mut self) {
        let n = NEXT_SERDES_TYPE_INDEX.load(Ordering::Relaxed);
        if n as usize > self.v.len() {
            self.v.resize_with(n as usize, T::default);
        }
    }

    /// Discard all memory.
    fn clear(&mut self) {
        self.v = Default::default();
    }

    // Make sure there's an entry for `Id` and return its index.
    fn ensure_and_index<Id: InternId>(&mut self) -> u32 {
        let i = Id::table().serdes_type_index(); // May increment NEXT_SERDES_TYPE_INDEX, do first.
        self.ensure_default();
        i
    }

    fn for_id<Id: InternId>(&mut self) -> &T {
        let i = self.ensure_and_index::<Id>();
        &self.v[i as usize]
    }

    fn for_id_mut<Id: InternId>(&mut self) -> &mut T {
        let i = self.ensure_and_index::<Id>();
        &mut self.v[i as usize]
    }
}

#[derive(Default)]
struct SerState {
    next_index: u32,
    ref_to_index: HashMap<Ref<usize>, u32, BuildIdHasher<u32>>,
}

thread_local! {
    static REF_TO_INDEX: RefCell<PerInternIdVec<SerState>> = Default::default();
    static INDEX_TO_REF: RefCell<PerInternIdVec<Vec<Ref<usize>>>> = Default::default();
}

/// Create a `SerGuard::default()` before serializing types that transitively
/// contain `InternId`s, then drop the resulting `SerGuard` when serialization
/// is complete.
#[derive(Debug)]
pub struct SerGuard {
    _v: (), // Prevent construction except via Default
}

impl Default for SerGuard {
    fn default() -> Self {
        REF_TO_INDEX.with(|rti| rti.borrow_mut().ensure_default());
        SerGuard { _v: () }
    }
}

impl Drop for SerGuard {
    fn drop(&mut self) {
        REF_TO_INDEX.with(|rti| rti.borrow_mut().clear());
    }
}

/// Create a `DeGuard::default()` before deserializing types that transitively
/// contain `InternId`s, then drop the resulting `DeGuard` when deserialization
/// is complete.
#[derive(Debug)]
pub struct DeGuard {
    _v: (), // Prevent construction except via Default
}

impl Default for DeGuard {
    fn default() -> Self {
        INDEX_TO_REF.with(|itr| itr.borrow_mut().ensure_default());
        DeGuard { _v: () }
    }
}

impl Drop for DeGuard {
    fn drop(&mut self) {
        INDEX_TO_REF.with(|itr| itr.borrow_mut().clear());
    }
}

/// `InternId`s do serdes via `InternSerdes`.
#[derive(Debug)]
#[repr(transparent)]
pub struct InternSerdes<Id: InternId>(pub Id);

impl<Id: InternId> From<Id> for InternSerdes<Id> {
    fn from(id: Id) -> Self {
        InternSerdes(id)
    }
}

impl<Id> Serialize for InternSerdes<Id>
where
    Id: InternId,
    Id::Intern: Serialize,
{
    fn serialize<S: Serializer>(&self, s: S) -> Result<S::Ok, S::Error> {
        // strip the actual type off self's internal Ref.
        let r: Ref<usize> = unsafe { self.0.unwrap().rebrand() };
        debug_assert_eq!(r.index(), self.0.unwrap().index());
        REF_TO_INDEX.with(|cell| {
            let mut tls = cell.borrow_mut();
            let state = tls.for_id::<Id>();
            let opt_ser_id = state.ref_to_index.get(&r).copied();
            drop(tls);

            if let Some(ser_id) = opt_ser_id {
                s.serialize_newtype_variant(type_name::<Id>(), 1, "Id", &ser_id)
            } else {
                let res =
                    s.serialize_newtype_variant(type_name::<Id>(), 0, "Value", self.0.get())?;

                let mut tls = cell.borrow_mut();
                let state = tls.for_id_mut::<Id>();

                // Grab the next backref index. This is not necessarily the same as
                // `ref_to_index.len()` in certain recursive cases. Incrementing a simple
                // counter matches the index numbering the deserializer expects.
                let index = state.next_index;
                state.next_index = index + 1;

                // Associate this Ref with the new index, for back references.  However, if it
                // already got associated with a back reference when we recursively serialized
                // the value above, just leave it alone. Either index will work in the
                // deserializer, since it just deserialized (and interned) the same value
                // twice, but we might as well consistently use the lowest-numbered ID.
                state.ref_to_index.entry(r).or_insert(index);

                Ok(res)
            }
        })
    }
}

impl<'de, Id> Deserialize<'de> for InternSerdes<Id>
where
    Id: InternId,
    Id::Intern: Deserialize<'de>,
    AsInterned<Id>: Borrow<Id::Lookup>,
{
    fn deserialize<D: Deserializer<'de>>(d: D) -> Result<Self, D::Error> {
        struct InternIdVisitor<'de, Id>(PhantomData<&'de Id>);

        impl<'de, Id> de::Visitor<'de> for InternIdVisitor<'de, Id>
        where
            Id: InternId,
            Id::Intern: Deserialize<'de>,
            AsInterned<Id>: Borrow<Id::Lookup>,
        {
            type Value = InternSerdes<Id>;

            fn expecting(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
                f.write_str(type_name::<Id>())
            }

            fn visit_enum<A>(self, data: A) -> Result<Self::Value, A::Error>
            where
                A: de::EnumAccess<'de>,
            {
                match data.variant()? {
                    (0, v) => {
                        let w: Id::Intern = v.newtype_variant()?;
                        let id: Id = Id::intern(w);
                        let r: Ref<usize> = unsafe { id.unwrap().rebrand() };
                        debug_assert_eq!(r.index(), id.unwrap().index());
                        INDEX_TO_REF.with(|itr| itr.borrow_mut().for_id_mut::<Id>().push(r));
                        Ok(InternSerdes(id))
                    }
                    (1, v) => {
                        let i: u32 = v.newtype_variant()?;
                        let r: Ref<usize> = INDEX_TO_REF
                            .with(|itr| itr.borrow_mut().for_id_mut::<Id>()[i as usize]);
                        let id: Id = Id::wrap(unsafe { r.rebrand() });
                        debug_assert_eq!(r.index(), id.unwrap().index());
                        Ok(InternSerdes(id))
                    }
                    _ => Err(A::Error::invalid_value(de::Unexpected::Enum, &self)),
                }
            }
        }
        d.deserialize_enum(
            type_name::<Id>(),
            &["Value", "Id"],
            InternIdVisitor::<'de, Id>(PhantomData),
        )
    }
}

/// The body of intern_struct! is a sequence of declarations (the ? lines are optional):
/// ```ignore
///     #[attr]*
///     [pub] struct IdTypeName = Intern<InternType> {
///         serdes("intern::InternSerdes<IdTypeName>"); ?  // Enables serdes
///         type Lookup = LookupType; ?                    // Intern lookup at LookupType
///         type Set = IdSetName; ?                        // Name of set type
///         type Map = IdMapName; ?                        // Name of map type
///         const ZERO_NAME = idtype_expr; ?               // Zero element
///     }
/// ```
#[macro_export]
macro_rules! intern_struct {
    () => { };
    ($(#[$attr:meta])* struct $Name:ident = Intern<$T:ty> {
        $(serdes($l:expr);)?
        $(type Lookup = $L:ty;)?
        $(type Set = $S:ident;)?
        $(type Map = $M:ident;)?
        $(const $Z:ident = $ze:expr;)?
     }
     $($rest:tt)*) => {
        intern_struct!(@DOIT, ($(#[$attr])*), (), $Name, $T,
                       ( $($L)? ), ( $($Z, $ze)? ), ( $($l)? ), ( $($S)? ), ( $($M)? ) );
        intern_struct!{ $($rest)* }
    };
    ($(#[$attr:meta])* pub struct $Name:ident = Intern<$T:ty> {
        $(serdes($l:expr);)?
        $(type Lookup = $L:ty;)?
        $(type Set = $S:ident;)?
        $(type Map = $M:ident;)?
        $(const $Z:ident = $ze:expr;)?
     }
     $($rest:tt)*) => {
        intern_struct!(@DOIT, ($(#[$attr])*), (pub), $Name, $T,
                       ( $($L)? ), ( $($Z, $ze)? ), ( $($l)? ), ( $($S)? ), ( $($M)? ) );
        intern_struct!{ $($rest)* }
    };
    ($(#[$attr:meta])* pub(crate) struct $Name:ident = Intern<$T:ty> {
        $(serdes($l:expr);)?
        $(type Lookup = $L:ty;)?
        $(type Set = $S:ident;)?
        $(type Map = $M:ident;)?
        $(const $Z:ident = $ze:expr;)?
     }
     $($rest:tt)*) => {
        intern_struct!(@DOIT, ($(#[$attr])*), (pub(crate)), $Name, $T,
                       ( $($L)? ), ( $($Z, $ze)? ), ( $($l)? ), ( $($S)? ), ( $($M)? ) );
        intern_struct!{ $($rest)* }
    };
    (@SERDESDERIVE(); $($decl:tt)*) => { $($decl)* };
    (@SERDESDERIVE($l:expr); $($decl:tt)*) => {
        #[derive(serde_derive::Deserialize, serde_derive::Serialize)]
        #[serde(from = $l)]
        #[serde(into = $l)]
        $($decl)*
    };
    (@LOOKUPTYPE($T:ty, ())) => { type Lookup = $T; };
    (@LOOKUPTYPE($T:ty, ($Lookup:ty))) => { type Lookup = $Lookup; };
    (@BORROW($T:ty, $Name:ty, ())) => {
        impl std::borrow::Borrow<$T> for $crate::intern::AsInterned<$Name> {
            #[inline]
            fn borrow(&self) -> & $T {
                use $crate::intern::InternId;
                self.0.get()
            }
        }
    };
    (@BORROW($T:ty, $Name:ty, ($Lookup:ty))) => {
        impl std::borrow::Borrow<$Lookup> for $crate::intern::AsInterned<$Name> {
            #[inline]
            fn borrow(&self) -> & $Lookup {
                use $crate::intern::InternId;
                self.0.get().borrow()
            }
        }
    };
    (@MAP(($($vis:tt)*), $Name:ident, ())) => { };
    (@MAP(($($vis:tt)*), $Name:ident, ($M:ident))) => {
        $($vis)* type $M<V> = std::collections::HashMap<$Name, V, $crate::idhasher::BuildIdHasher<u32>>;
    };
    (@SET(($($vis:tt)*), $Name:ident, ())) => { };
    (@SET(($($vis:tt)*), $Name:ident, ($S:ident))) => {
        $($vis)* type $S = std::collections::HashSet<$Name, $crate::idhasher::BuildIdHasher<u32>>;
    };
    (@TABLE($T:ty, ())) => { $crate::intern::InternTable::new() };
    (@TABLE($T:ty, ($v:ident, $zero:expr))) => {{
        static ZERO: $crate::Zero<$T> = $crate::Zero::new($zero);
        $crate::intern::InternTable::with_zero(&ZERO)
    }};
    (@ZERO($Name:ident, ())) => { };
    (@ZERO($Name:ident, ($v:ident, $zero:expr))) => {
        impl $Name {
            pub const $v: Self = $Name($crate::Zero::zero());
        }
    };
    (@DOIT, ($(#[$attr:meta])*), ($($vis:tt)*), $Name:ident, $T:ty,
     ( $($Lookup:ty)? ), ( $($Z:ident, $ze:expr)* ), ( $($serdes:tt)? ),
     ( $($S:ident)? ), ( $($M:ident)? ) ) => {
        intern_struct!{
            @SERDESDERIVE($($serdes)?);
            $(#[$attr])*
            #[derive(Copy, Clone, Eq, PartialEq, Hash)]
            #[repr(transparent)]
            $($vis)* struct $Name($crate::intern::Ref<$T>);
        }

        impl $crate::intern::InternId for $Name {
            type Intern = $T;
            intern_struct!(@LOOKUPTYPE($T, ($($Lookup)?)));

            #[inline]
            fn wrap(r: $crate::intern::Ref<$T>) -> Self {
                $Name(r)
            }

            #[inline]
            fn unwrap(self) -> $crate::intern::Ref<$T> {
                self.0
            }

            #[inline]
            fn table() -> &'static $crate::intern::InternTable<$Name, $T> {
                static TABLE: $crate::intern::InternTable<$Name, $T> =
                    intern_struct!(@TABLE($T, ($($Z, $ze)?)));
                &TABLE
            }
        }

        intern_struct!(@ZERO($Name, ($($Z, $ze)?)));

        intern_struct!(@BORROW($T, $Name, ($($Lookup)*)));

        intern_struct!(@SET(($($vis)*), $Name, ($($S)?)));

        intern_struct!(@MAP(($($vis)*), $Name, ($($M)?)));

        impl std::convert::From<$crate::intern::InternSerdes<$Name>> for $Name {
            #[inline]
            fn from(iid: $crate::intern::InternSerdes<$Name>) -> Self {
                iid.0
            }
        }

        impl std::ops::Deref for $Name {
            type Target = $T;
            #[inline]
            fn deref(&self) -> & $T {
                use $crate::intern::InternId;
                self.get()
            }
        }

        impl std::fmt::Debug for $Name {
            fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
                use $crate::intern::InternId;
                self.get().fmt(f)
            }
        }
    };
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_derive::{Deserialize, Serialize};

    #[derive(Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Deserialize, Serialize)]
    struct MyType {
        v: i64,
    }

    intern_struct! {
        struct MyId = Intern<MyType> {
            serdes("InternSerdes<MyId>");
            type Set = _MyIdSet;
            type Map = _MyIdMap;
        }
    }

    impl std::cmp::PartialOrd for MyId {
        fn partial_cmp(&self, other: &Self) -> std::option::Option<std::cmp::Ordering> {
            self.get().partial_cmp(other.get())
        }
    }

    impl std::cmp::Ord for MyId {
        fn cmp(&self, other: &Self) -> std::cmp::Ordering {
            self.get().cmp(other.get())
        }
    }

    #[derive(Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Deserialize, Serialize)]
    pub struct PubType {
        v: i64,
    }

    intern_struct! {
        pub struct PubId = Intern<PubType> {
            serdes("InternSerdes<PubId>");
            type Set = _PubIdSet;
            type Map = _PubIdMap;
        }
    }

    #[derive(Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Deserialize, Serialize)]
    pub(crate) struct CrateType {
        v: i64,
    }

    intern_struct! {
        pub(crate) struct CrateId = Intern<CrateType> {
            serdes("InternSerdes<CrateId>");
            type Set = _CrateIdSet;
            type Map = _CrateIdMap;
        }
    }

    #[test]
    fn test() {
        let m1 = MyType { v: 1 };
        let m2 = MyType { v: 1 };
        let m3 = MyType { v: -57 };
        let i1 = MyId::intern(m1);
        let i2 = MyId::intern(m2);
        let i3 = MyId::intern(m3);
        assert_eq!(i1, i2);
        assert_eq!(i1.get().v, 1);
        assert_ne!(i1, i3);
        assert_eq!(i3.v, -57); // Uses Deref
        assert!(i3 < i1);
    }

    #[test]
    fn pub_test() {
        let m1 = PubType { v: 1 };
        let m2 = PubType { v: 1 };
        let m3 = PubType { v: -57 };
        let i1 = PubId::intern(m1);
        let i2 = PubId::intern(m2);
        let i3 = PubId::intern(m3);
        assert_eq!(i1, i2);
        assert_eq!(i1.get().v, 1);
        assert_ne!(i1, i3);
        assert_eq!(i3.v, -57); // Uses Deref
    }

    #[test]
    fn crate_test() {
        let m1 = CrateType { v: 1 };
        let m2 = CrateType { v: 1 };
        let m3 = CrateType { v: -57 };
        let i1 = CrateId::intern(m1);
        let i2 = CrateId::intern(m2);
        let i3 = CrateId::intern(m3);
        assert_eq!(i1, i2);
        assert_eq!(i1.get().v, 1);
        assert_ne!(i1, i3);
        assert_eq!(i3.v, -57); // Uses Deref
    }
}
