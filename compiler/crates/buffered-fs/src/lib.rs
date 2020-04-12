/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(warnings)]
#![deny(rust_2018_idioms)]
#![deny(clippy::all)]

use std::collections::hash_map::HashMap;
use std::fmt;
use std::fs;
use std::io;
use std::path::{Path, PathBuf};

#[derive(Default)]
pub struct BufferedFileSystem {
    files: HashMap<PathBuf, Option<String>>,
}

///
/// A filesystem wrapper that buffers file reads and writes until `commit()` is called:
///  
/// - Write: it only writes to the cache.
/// - Delete: it only writes to the cache and mark the entry as deleted.
/// - Read/Exists: it first checks the cache, if there is no entry in the cache, delegates to the standard library.
/// - Commit: it clears the cache, write all contents to the disk, and remove all files that are marked as deleted.
///

impl BufferedFileSystem {
    pub fn new() -> Self {
        BufferedFileSystem {
            files: Default::default(),
        }
    }

    pub fn read_to_string<P: AsRef<Path>>(&self, path: P) -> io::Result<String> {
        if let Some(content) = self.files.get(path.as_ref()) {
            match content {
                None => Err(io::Error::new(
                    io::ErrorKind::Other,
                    "Trying to read a deleted file.",
                )),
                Some(content) => Ok(content.clone()),
            }
        } else {
            fs::read_to_string(path)
        }
    }

    pub fn write<P: AsRef<Path>>(&mut self, path: P, content: String) {
        self.files
            .insert(path.as_ref().to_path_buf(), Some(content));
    }

    pub fn remove_file<P: AsRef<Path>>(&mut self, path: P) {
        self.files.insert(path.as_ref().to_path_buf(), None);
    }

    pub fn has_changes(&self) -> bool {
        !self.files.is_empty()
    }

    pub fn exists<P: AsRef<Path>>(&self, path: P) -> bool {
        let path = path.as_ref();
        match self.files.get(path) {
            None => path.exists(),
            Some(data) => data.is_some(),
        }
    }

    // TODO: Optimize, make concurrent writes
    pub fn commit(&mut self) -> io::Result<(Vec<PathBuf>, Vec<PathBuf>)> {
        let mut removed = vec![];
        let mut added = vec![];
        for (path, data) in self.files.drain() {
            match data {
                None => {
                    fs::remove_file(&path)?;
                    removed.push(path);
                }
                Some(data) => {
                    fs::write(&path, data)?;
                    added.push(path);
                }
            }
        }
        Ok((added, removed))
    }
}

impl fmt::Debug for BufferedFileSystem {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let mut added = vec![];
        let mut updated = vec![];
        let mut removed = vec![];
        for (path, data) in self.files.iter() {
            match data {
                None => {
                    removed.push(path);
                }
                Some(_) => {
                    if path.exists() {
                        updated.push(path);
                    } else {
                        added.push(path);
                    }
                }
            }
        }
        write!(
            f,
            "Added: {:#?}\nRemoved: {:#?}\nUpdated: {:#?}",
            added, removed, updated
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::env::temp_dir;
    const CONTENTS: &str = "TEST🤯";

    #[test]
    fn test_write() -> io::Result<()> {
        let mut path = temp_dir();
        path.push("buffered_fs_test_write");
        let mut fs = BufferedFileSystem::new();

        assert!(!fs.has_changes());
        assert!(!fs.exists(&path));
        fs.write(&path, CONTENTS.to_owned());
        assert!(fs.has_changes());
        assert!(fs.exists(&path));
        dbg!(&fs);

        let result = fs.read_to_string(path)?;
        assert_eq!(result, CONTENTS);
        Ok(())
    }

    #[test]
    fn test_commit() -> io::Result<()> {
        let mut path = temp_dir();
        path.push("buffered_fs_test_commit");
        if path.exists() {
            std::fs::remove_file(&path)?;
        }
        let mut fs = BufferedFileSystem::new();
        fs.write(&path, CONTENTS.to_owned());
        let (added, removed) = fs.commit()?;
        assert_eq!(added.len(), 1);
        assert!(removed.is_empty());

        // Read from the disk
        let result = std::fs::read_to_string(path)?;
        assert_eq!(result, CONTENTS);
        Ok(())
    }

    #[test]
    fn test_remove() -> io::Result<()> {
        let mut path = temp_dir();
        path.push("buffered_fs_test_remove");
        let mut fs = BufferedFileSystem::new();
        fs.write(&path, CONTENTS.to_owned());
        assert!(fs.has_changes());
        assert!(fs.exists(&path));
        fs.remove_file(&path);
        assert!(fs.has_changes());
        assert!(!fs.exists(&path));
        Ok(())
    }

    #[test]
    fn test_commit_remove() -> io::Result<()> {
        let mut path = temp_dir();
        path.push("buffered_fs_test_commit_remove");
        std::fs::write(&path, CONTENTS)?;

        let mut fs = BufferedFileSystem::new();
        assert!(fs.exists(&path));
        fs.remove_file(&path);
        assert!(fs.has_changes());
        assert!(!fs.exists(&path));

        let (added, removed) = fs.commit()?;
        assert_eq!(removed.len(), 1);
        assert!(added.is_empty());

        // Should be deleted from the disk
        assert!(!path.exists());
        Ok(())
    }
}
