/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::span::Span;
use core::cmp::Ordering;
use intern::string_key::{Intern, StringKey};
use std::fmt;
use std::path::PathBuf;

/// The location of a source. Could be a standalone file (e.g. test.graphql),
/// an embedded source (GraphQL tag in a JS file) or generated code without a
/// location.
#[derive(Copy, Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub enum SourceLocationKey {
    /// A source embedded within a file. The 0-based index is an index into the
    /// embedded sources. E.g. the second graphql tag has index 1.
    Embedded {
        path: StringKey,
        index: u16,
    },
    Standalone {
        path: StringKey,
    },
    Generated,
}

impl SourceLocationKey {
    /// Returns a `SourceLocationKey` that's not backed by a real file. In most
    /// cases it's preferred to use a related real file.
    pub fn generated() -> Self {
        SourceLocationKey::Generated
    }

    pub fn standalone(path: &str) -> Self {
        SourceLocationKey::Standalone {
            path: path.intern(),
        }
    }
    pub fn embedded(path: &str, index: usize) -> Self {
        SourceLocationKey::Embedded {
            path: path.intern(),
            index: index.try_into().unwrap(),
        }
    }

    pub fn path(self) -> &'static str {
        match self {
            SourceLocationKey::Embedded { path, .. } => path.lookup(),
            SourceLocationKey::Standalone { path } => path.lookup(),
            SourceLocationKey::Generated => "<generated>",
        }
    }

    pub fn get_dir(self) -> PathBuf {
        let mut path = PathBuf::from(self.path());
        path.pop();
        path
    }
}

/// An absolute source location describing both the file and position (span)
/// with that file.
#[derive(Copy, Clone, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct Location {
    /// The source containing this location (e.g. embedded or standalone file).
    source_location: SourceLocationKey,

    /// Relative position with the file
    span: Span,
}

impl fmt::Debug for Location {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}:{:?}", self.source_location.path(), self.span)
    }
}

impl Location {
    /// Returns a location that's not backed by a real file. In most cases it's
    /// preferred to use a related real location.
    pub fn generated() -> Self {
        Location::new(SourceLocationKey::generated(), Span::new(0, 0))
    }

    pub fn new(source_location: SourceLocationKey, span: Span) -> Self {
        Self {
            source_location,
            span,
        }
    }

    pub fn source_location(&self) -> SourceLocationKey {
        self.source_location
    }

    pub fn span(&self) -> &Span {
        &self.span
    }

    pub fn with_span(&self, span: Span) -> Self {
        Self {
            source_location: self.source_location,
            span,
        }
    }

    pub fn contains(&self, subspan: Span) -> bool {
        self.span.contains(subspan)
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
    pub fn from_span(source_location: SourceLocationKey, span: Span, item: T) -> Self {
        Self {
            location: Location::new(source_location, span),
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
    fn with_location_memory() {
        assert_eq!(20, std::mem::size_of::<WithLocation<StringKey>>());
    }

    #[test]
    fn location_debug_printing() {
        assert_eq!(
            format!(
                "{:?}",
                Location::new(
                    SourceLocationKey::embedded("example/file.js", 2),
                    Span::new(10, 30)
                )
            ),
            "example/file.js:10:30".to_string()
        );
    }
}
