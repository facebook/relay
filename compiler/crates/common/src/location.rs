/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::span::Span;
use interner::{Intern, StringKey};
use std::fmt;
use std::path::PathBuf;

/// An interned file path
#[derive(Copy, Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct FileKey(StringKey);

impl FileKey {
    pub fn new(path: &str) -> Self {
        FileKey(path.intern())
    }

    pub fn lookup(self) -> &'static str {
        self.0.lookup()
    }
}

/// An absolute source location describing both the file and position (span)
/// with that file.
#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct Location {
    /// The (interned) path of the file containing this location
    file: FileKey,

    /// Relative position with the file
    span: Span,
}

impl fmt::Debug for Location {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let path = PathBuf::from(self.file.lookup());
        let file_name = path.file_name().expect("Expected a valid file path");
        write!(f, "{:?}:{:?}", file_name, self.span)
    }
}

impl Location {
    pub fn new(file: FileKey, span: Span) -> Self {
        Self { file, span }
    }

    pub fn file(&self) -> FileKey {
        self.file
    }

    pub fn new_from_path(path: &str, span: Span) -> Self {
        Self {
            file: FileKey::new(path),
            span,
        }
    }

    pub fn with_span(&self, span: Span) -> Self {
        Self {
            file: self.file,
            span,
        }
    }

    pub fn print(&self, source: &str) -> String {
        format!("{}:{}", self.file.lookup(), self.span.print(source))
    }
}
