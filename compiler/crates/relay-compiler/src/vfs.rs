/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::BTreeMap;
use std::collections::HashMap;
use std::collections::HashSet;
use std::io;
use std::path::Component;
use std::path::Path;
use std::path::PathBuf;
use std::sync::RwLock;

/// A virtual file system abstraction for the Relay compiler.
///
/// This trait provides the minimal set of file operations needed by
/// the compilation pipeline. Production use is via `OsVfs` (delegating
/// to `std::fs`); tests can use `InMemoryVfs` to avoid disk I/O.
pub trait Vfs: Send + Sync {
    /// Read file contents as bytes.
    fn read(&self, path: &Path) -> io::Result<Vec<u8>>;

    /// Read file contents as a UTF-8 string.
    fn read_to_string(&self, path: &Path) -> io::Result<String> {
        let bytes = self.read(path)?;
        String::from_utf8(bytes).map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))
    }

    /// Write bytes to a file, creating parent directories as needed.
    fn write(&self, path: &Path, content: &[u8]) -> io::Result<()>;

    /// Remove a file. Non-existence should not be treated as an error.
    fn remove_file(&self, path: &Path) -> io::Result<()>;

    /// Create a directory and all parent directories.
    fn create_dir_all(&self, path: &Path) -> io::Result<()>;

    /// Check if a path exists (file or directory).
    fn exists(&self, path: &Path) -> bool;

    /// Check if a path is a regular file.
    fn is_file(&self, path: &Path) -> bool;

    /// Check if a path is a directory.
    fn is_dir(&self, path: &Path) -> bool;

    /// Canonicalize a path (resolve symlinks, normalize, make absolute).
    fn canonicalize(&self, path: &Path) -> io::Result<PathBuf>;

    /// List all file paths under a directory recursively.
    /// Returns paths relative to `root`.
    fn read_dir_recursive(&self, root: &Path) -> io::Result<Vec<PathBuf>>;
}

/// Production VFS implementation that delegates to `std::fs`.
pub struct OsVfs;

impl Vfs for OsVfs {
    fn read(&self, path: &Path) -> io::Result<Vec<u8>> {
        std::fs::read(path)
    }

    fn read_to_string(&self, path: &Path) -> io::Result<String> {
        std::fs::read_to_string(path)
    }

    fn write(&self, path: &Path, content: &[u8]) -> io::Result<()> {
        if let Some(parent) = path.parent() {
            if !parent.exists() {
                std::fs::create_dir_all(parent)?;
            }
        }
        std::fs::write(path, content)
    }

    fn remove_file(&self, path: &Path) -> io::Result<()> {
        match std::fs::remove_file(path) {
            Ok(()) => Ok(()),
            Err(e) if e.kind() == io::ErrorKind::NotFound => Ok(()),
            Err(e) => Err(e),
        }
    }

    fn create_dir_all(&self, path: &Path) -> io::Result<()> {
        std::fs::create_dir_all(path)
    }

    fn exists(&self, path: &Path) -> bool {
        path.exists()
    }

    fn is_file(&self, path: &Path) -> bool {
        path.is_file()
    }

    fn is_dir(&self, path: &Path) -> bool {
        path.is_dir()
    }

    fn canonicalize(&self, path: &Path) -> io::Result<PathBuf> {
        dunce::canonicalize(path)
    }

    fn read_dir_recursive(&self, root: &Path) -> io::Result<Vec<PathBuf>> {
        let mut result = Vec::new();
        for entry in walkdir::WalkDir::new(root) {
            let entry = entry.map_err(|e| {
                io::Error::new(io::ErrorKind::Other, format!("walkdir error: {}", e))
            })?;
            if entry.file_type().is_file() {
                if let Ok(relative) = entry.path().strip_prefix(root) {
                    result.push(relative.to_path_buf());
                }
            }
        }
        Ok(result)
    }
}

/// In-memory VFS for tests. Thread-safe via internal RwLock.
pub struct InMemoryVfs {
    files: RwLock<HashMap<PathBuf, Vec<u8>>>,
    dirs: RwLock<HashSet<PathBuf>>,
}

impl InMemoryVfs {
    pub fn new() -> Self {
        let dirs = HashSet::from([PathBuf::from("/")]);
        Self {
            files: RwLock::new(HashMap::new()),
            dirs: RwLock::new(dirs),
        }
    }

    /// Add a directory entry (and all ancestor directories).
    pub fn add_dir(&self, path: PathBuf) {
        let mut dirs = self.dirs.write().unwrap();
        for ancestor in path.ancestors() {
            if !dirs.insert(ancestor.to_path_buf()) {
                break; // already present, ancestors must be too
            }
        }
    }

    /// Add a file with the given content. Auto-creates ancestor directory entries.
    pub fn add_file(&self, path: PathBuf, content: impl Into<Vec<u8>>) {
        if let Some(parent) = path.parent() {
            self.add_dir(parent.to_path_buf());
        }
        self.files.write().unwrap().insert(path, content.into());
    }

    /// Return a sorted snapshot of all files for test assertions.
    pub fn snapshot(&self) -> BTreeMap<PathBuf, Vec<u8>> {
        self.files
            .read()
            .unwrap()
            .iter()
            .map(|(k, v)| (k.clone(), v.clone()))
            .collect()
    }
}

/// Lexically normalize a path: resolve `.` and `..` without FS access.
fn normalize_path(path: &Path) -> PathBuf {
    let mut result = PathBuf::new();
    for component in path.components() {
        match component {
            Component::CurDir => {}
            Component::ParentDir => {
                result.pop();
            }
            other => result.push(other),
        }
    }
    result
}

impl Vfs for InMemoryVfs {
    fn read(&self, path: &Path) -> io::Result<Vec<u8>> {
        let path = normalize_path(path);
        self.files
            .read()
            .unwrap()
            .get(&path)
            .cloned()
            .ok_or_else(|| {
                io::Error::new(
                    io::ErrorKind::NotFound,
                    format!("file not found: {}", path.display()),
                )
            })
    }

    fn write(&self, path: &Path, content: &[u8]) -> io::Result<()> {
        let path = normalize_path(path);
        if let Some(parent) = path.parent() {
            self.add_dir(parent.to_path_buf());
        }
        self.files
            .write()
            .unwrap()
            .insert(path, content.to_vec());
        Ok(())
    }

    fn remove_file(&self, path: &Path) -> io::Result<()> {
        let path = normalize_path(path);
        self.files.write().unwrap().remove(&path);
        Ok(())
    }

    fn create_dir_all(&self, path: &Path) -> io::Result<()> {
        let path = normalize_path(path);
        self.add_dir(path);
        Ok(())
    }

    fn exists(&self, path: &Path) -> bool {
        let path = normalize_path(path);
        self.files.read().unwrap().contains_key(&path)
            || self.dirs.read().unwrap().contains(&path)
    }

    fn is_file(&self, path: &Path) -> bool {
        let path = normalize_path(path);
        self.files.read().unwrap().contains_key(&path)
    }

    fn is_dir(&self, path: &Path) -> bool {
        let path = normalize_path(path);
        self.dirs.read().unwrap().contains(&path)
    }

    fn canonicalize(&self, path: &Path) -> io::Result<PathBuf> {
        Ok(normalize_path(path))
    }

    fn read_dir_recursive(&self, root: &Path) -> io::Result<Vec<PathBuf>> {
        let root = normalize_path(root);
        let files = self.files.read().unwrap();
        let mut result: Vec<PathBuf> = files
            .keys()
            .filter_map(|path| path.strip_prefix(&root).ok().map(|p| p.to_path_buf()))
            .collect();
        result.sort();
        Ok(result)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_in_memory_vfs_basic() {
        let vfs = InMemoryVfs::new();
        vfs.add_file(PathBuf::from("/project/src/foo.js"), b"hello".to_vec());

        assert!(vfs.exists(Path::new("/project/src/foo.js")));
        assert!(vfs.is_file(Path::new("/project/src/foo.js")));
        assert!(!vfs.is_dir(Path::new("/project/src/foo.js")));
        assert!(vfs.is_dir(Path::new("/project/src")));
        assert!(vfs.is_dir(Path::new("/project")));
        assert!(vfs.is_dir(Path::new("/")));
        assert!(!vfs.exists(Path::new("/project/src/bar.js")));

        assert_eq!(
            vfs.read_to_string(Path::new("/project/src/foo.js")).unwrap(),
            "hello"
        );
    }

    #[test]
    fn test_in_memory_vfs_write_and_remove() {
        let vfs = InMemoryVfs::new();
        vfs.write(Path::new("/a/b/c.txt"), b"data").unwrap();
        assert!(vfs.is_file(Path::new("/a/b/c.txt")));
        assert!(vfs.is_dir(Path::new("/a/b")));

        vfs.remove_file(Path::new("/a/b/c.txt")).unwrap();
        assert!(!vfs.exists(Path::new("/a/b/c.txt")));
        // Removing a non-existent file should not error
        vfs.remove_file(Path::new("/a/b/c.txt")).unwrap();
    }

    #[test]
    fn test_in_memory_vfs_read_dir_recursive() {
        let vfs = InMemoryVfs::new();
        vfs.add_file(PathBuf::from("/root/a.js"), b"a");
        vfs.add_file(PathBuf::from("/root/sub/b.js"), b"b");
        vfs.add_file(PathBuf::from("/other/c.js"), b"c");

        let mut files = vfs
            .read_dir_recursive(Path::new("/root"))
            .unwrap();
        files.sort();
        assert_eq!(
            files,
            vec![PathBuf::from("a.js"), PathBuf::from("sub/b.js")]
        );
    }

    #[test]
    fn test_in_memory_vfs_canonicalize() {
        let vfs = InMemoryVfs::new();
        assert_eq!(
            vfs.canonicalize(Path::new("/a/b/../c")).unwrap(),
            PathBuf::from("/a/c")
        );
        assert_eq!(
            vfs.canonicalize(Path::new("/a/./b/c")).unwrap(),
            PathBuf::from("/a/b/c")
        );
    }
}
