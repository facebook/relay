/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::span::Span;
use core::cmp::Ordering;
use interner::{Intern, StringKey};
use std::fmt;
use std::path::PathBuf;

use lazy_static::lazy_static;

lazy_static! {
    static ref GENERATED_FILE_KEY: FileKey = FileKey("<generated>".intern());
}

/// An interned file path
#[derive(Copy, Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct FileKey(StringKey);

impl FileKey {
    /// Returns a FileKey that's not backed by a real file. In most cases it's
    /// preferred to use a related real file.
    pub fn generated() -> Self {
        *GENERATED_FILE_KEY
    }

    pub fn new(path: &str) -> Self {
        FileKey(path.intern())
    }

    pub fn lookup(self) -> &'static str {
        self.0.lookup()
    }

    pub fn get_dir(self) -> PathBuf {
        let mut path = PathBuf::from(self.0.lookup());
        path.pop();
        path
    }
}

/// An absolute source location describing both the file and position (span)
/// with that file.
#[derive(Copy, Clone, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct Location {
    /// The (interned) path of the file containing this location
    file: FileKey,

    /// Relative position with the file
    span: Span,
}

impl fmt::Debug for Location {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        if let Some(file_name) = self.file.lookup().rsplitn(2, ":").last() {
            write!(f, "{}:{:?}", file_name, self.span)
        } else {
            write!(f, "invalid file: {:?}", self.file)
        }
    }
}

impl Location {
    /// Returns a location that's not backed by a real file. In most cases it's
    /// preferred to use a related real location.
    pub fn generated() -> Self {
        Location::new(FileKey::generated(), Span::new(0, 0))
    }

    pub fn new(file: FileKey, span: Span) -> Self {
        Self { file, span }
    }

    pub fn file(&self) -> FileKey {
        self.file
    }

    pub fn span(&self) -> &Span {
        &self.span
    }

    pub fn with_span(&self, span: Span) -> Self {
        Self {
            file: self.file,
            span,
        }
    }

    pub fn contains(&self, subspan: Span) -> bool {
        self.span.contains(subspan)
    }

    pub fn print(&self, source: &str, line_offset: usize, column_offset: usize) -> String {
        format!(
            "{}:{}",
            self.file.lookup(),
            self.span.print(source, line_offset, column_offset)
        )
    }
}

#[derive(Copy, Clone, Debug, Hash, PartialEq, Eq)]
pub struct WithLocation<T> {
    pub location: Location,
    pub item: T,
}

impl<T: Ord> Ord for WithLocation<T> {
    fn cmp(&self, other: &Self) -> Ordering {
        self.item.cmp(&other.item)
    }
}

impl<T: PartialOrd> PartialOrd for WithLocation<T> {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        self.item.partial_cmp(&other.item)
    }
}

impl<T> WithLocation<T> {
    pub fn from_span(file: FileKey, span: Span, item: T) -> Self {
        Self {
            location: Location::new(file, span),
            item,
        }
    }

    pub fn new(location: Location, item: T) -> Self {
        Self { location, item }
    }

    /// Wraps the given item in a `WithLocation`, without associating it with
    /// any real location. In most cases it's preferred to use a related real
    /// location the item was derived from.
    pub fn generated(item: T) -> Self {
        Self {
            location: Location::generated(),
            item,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn location_debug_printing() {
        assert_eq!(
            format!(
                "{:?}",
                Location::new(FileKey::new("example/file.js:99"), Span::new(10, 20))
            ),
            "example/file.js:10:30".to_string()
        );
    }
}
