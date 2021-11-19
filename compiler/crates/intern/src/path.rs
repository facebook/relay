/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::{idhasher::BuildIdHasher, intern_struct, string, InternId, InternSerdes};
use serde_derive::{Deserialize, Serialize};
#[cfg(unix)]
use std::os::unix::ffi::OsStrExt;
use std::{
    cmp::Ordering,
    ffi::OsStr,
    path::{Path, PathBuf},
};

intern_struct! {
    /// A path whose path components are interned.
    pub struct PathId = Intern<PathNode> {
        serdes("InternSerdes<PathId>");
        type Set = PathIdSet;
        type Map = PathIdMap;
    }
}

pub type PathIdIndexMap<V> = indexmap::IndexMap<PathId, V, BuildIdHasher<u32>>;
pub type PathIdIndexSet = indexmap::IndexSet<PathId, BuildIdHasher<u32>>;

impl PathId {
    /// Intern the given path one `std::path::Component` at a time using the
    /// `Path::components()` iterator, which normalizes during parsing.  Panic
    /// on empty paths such as `/`.
    #[cfg(unix)]
    pub fn intern<P: AsRef<Path>>(mut parent: Option<PathId>, path: P) -> Self {
        for c in path.as_ref().iter() {
            let p = InternId::intern(PathNode {
                name: string::intern_bytes(c.as_bytes()),
                parent,
            });
            parent = Some(p);
        }
        parent.unwrap()
    }

    /// Intern the given path one `std::path::Component` at a time using the
    /// `Path::components()` iterator, which normalizes during parsing.  Panic
    /// on empty paths such as `/`.
    #[cfg(not(unix))]
    pub fn intern<P: AsRef<Path>>(mut parent: Option<PathId>, path: P) -> Self {
        for c in path.as_ref().iter() {
            let p = InternId::intern(PathNode {
                name: string::intern(c.to_str().unwrap()),
                parent,
            });
            parent = Some(p);
        }
        parent.unwrap()
    }

    pub fn parent(&self) -> Option<PathId> {
        self.parent
    }

    /// Returns the final component as an &OsStr.
    pub fn file_name(&self) -> &OsStr {
        self.get().file_name()
    }

    /// Linearize this path as a PathBuf.
    pub fn to_path_buf(&self) -> PathBuf {
        self.get().to_path_buf()
    }
}

impl<P: AsRef<Path>> From<P> for PathId {
    fn from(path: P) -> Self {
        Self::intern(None, path)
    }
}

impl From<PathId> for PathBuf {
    fn from(id: PathId) -> Self {
        id.to_path_buf()
    }
}

impl std::fmt::Display for PathId {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        self.to_path_buf().display().fmt(f)
    }
}

impl std::cmp::Ord for PathId {
    /// Compare the linearized components of self to other in top-down order.
    fn cmp(&self, other: &Self) -> Ordering {
        type LinearPath = smallvec::SmallVec<[PathComponentId; 20]>;
        fn linearize(mut p: PathId) -> LinearPath {
            let mut v: LinearPath = Default::default();
            v.push(p.name);
            while let Some(parent) = p.parent {
                v.push(parent.name);
                p = parent;
            }
            v
        }
        linearize(*self)
            .iter()
            .rev()
            .cmp(linearize(*other).iter().rev())
    }
}

impl std::cmp::PartialOrd for PathId {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

#[cfg(unix)]
type PathComponentId = string::BytesId;

#[cfg(not(unix))]
type PathComponentId = string::StringId;

/// A `PathNode` represents a `Path` as a list, starting with a leaf component
/// and walking up the directory tree.  This is really an internal detail, but
/// is exposed by `PathId::Intern`.
#[doc(hidden)]
#[derive(Hash, PartialEq, Eq, Clone, Copy, Serialize, Deserialize)]
pub struct PathNode {
    name: PathComponentId,
    parent: Option<PathId>,
}

impl PathNode {
    /// Returns the final component as an &OsStr.
    #[cfg(unix)]
    fn file_name(&self) -> &OsStr {
        OsStr::from_bytes(self.name.as_bytes())
    }

    /// Returns the final component as an &OsStr.
    #[cfg(not(unix))]
    fn file_name(&self) -> &OsStr {
        OsStr::new(self.name.as_str())
    }

    /// Linearize this path as a PathBuf.
    fn to_path_buf(&self) -> PathBuf {
        let mut path = match self.parent {
            Some(parent) => parent.to_path_buf(),
            None => PathBuf::new(),
        };
        path.push(self.file_name());
        path
    }
}

impl std::fmt::Debug for PathNode {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        self.to_path_buf().fmt(f)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_eq() {
        assert_eq!(PathId::from("a"), PathId::from("a/"));
        assert_ne!(PathId::from("a"), PathId::from("/a"));
        assert_eq!(PathId::from("a/b"), PathId::from("a//b"));
    }

    #[test]
    fn test_cmp() {
        assert_eq!(PathId::from("a").cmp(&PathId::from("a")), Ordering::Equal);
        assert_eq!(PathId::from("a").cmp(&PathId::from("b")), Ordering::Less);
        assert_eq!(PathId::from("a").cmp(&PathId::from("a/a")), Ordering::Less);
        assert_eq!(PathId::from("a").cmp(&PathId::from("a/_")), Ordering::Less);
        assert_eq!(PathId::from("b").cmp(&PathId::from("a")), Ordering::Greater);
        assert_eq!(
            PathId::from("a/a").cmp(&PathId::from("a")),
            Ordering::Greater
        );
        assert_eq!(
            PathId::from("a/_").cmp(&PathId::from("a")),
            Ordering::Greater
        );
        assert_eq!(
            PathId::from("a/b").cmp(&PathId::from("a.b")),
            Ordering::Less
        );
    }

    #[test]
    fn test_intern() {
        assert_eq!(PathId::from("a/b"), PathId::intern(None, "a/b"));
        assert_eq!(
            PathId::from("a/b/c"),
            PathId::intern(Some(PathId::from("a")), "b/c"),
        );
    }
}
