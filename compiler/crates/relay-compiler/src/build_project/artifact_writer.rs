/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#[cfg(unix)]
use std::collections::HashMap;
use std::fmt::Write as _;
use std::fs::File;
use std::fs::create_dir_all;
use std::io;
use std::io::prelude::*;
use std::path::Path;
use std::path::PathBuf;
#[cfg(unix)]
use std::sync::Arc;
use std::sync::Mutex;

use dashmap::DashSet;
use log::debug;
use log::info;
use sha1::Digest;
use sha1::Sha1;

use crate::build_project::source_control::SourceControl;
use crate::errors::BuildProjectError;
use crate::errors::Error;

type BuildProjectResult = Result<(), BuildProjectError>;

pub trait ArtifactWriter {
    fn should_write(
        &self,
        path: &Path,
        content: &[u8],
        hash: Option<String>,
    ) -> Result<bool, BuildProjectError>;
    fn write(&self, path: PathBuf, content: Vec<u8>) -> BuildProjectResult;
    fn remove(&self, path: PathBuf) -> BuildProjectResult;
    fn finalize(&self) -> crate::errors::Result<()>;

    /// Clear all pending operations. Called when the watch loop restarts
    /// after a source control update (rebase) to discard stale cached
    /// operations that were derived from the pre-rebase compiler state.
    fn reset(&self) {}

    /// Check if the file on disk matches the content the compiler last wrote.
    ///
    /// Used to distinguish the compiler's own writes from external modifications
    /// when watchman reports changes to generated artifact files. Returns `true`
    /// if the file content matches what was last written, `false` otherwise.
    ///
    /// The default implementation returns `false` (conservatively assumes all
    /// changes are external).
    fn content_matches_last_write(&self, _path: &Path) -> bool {
        false
    }
}

#[derive(Default)]
pub struct ArtifactFileWriter {
    added: Mutex<Vec<PathBuf>>,
    removed: Mutex<Vec<PathBuf>>,
    source_control: Option<Box<dyn SourceControl + Send + Sync>>,
    root_dir: PathBuf,
}

impl ArtifactFileWriter {
    pub fn new(
        source_control: Option<Box<dyn SourceControl + Send + Sync>>,
        root_dir: PathBuf,
    ) -> Self {
        Self {
            added: Default::default(),
            removed: Default::default(),
            source_control,
            root_dir,
        }
    }

    fn write_file(&self, path: &PathBuf, content: &[u8]) -> io::Result<()> {
        let mut should_add = false;
        if !path.exists() {
            should_add = true;
            ensure_file_directory_exists(path)?;
        }

        let mut file = File::create(path)?;
        file.write_all(content)?;
        if should_add {
            self.added.lock().unwrap().push(path.clone());
        }
        Ok(())
    }
}
impl ArtifactWriter for ArtifactFileWriter {
    fn should_write(
        &self,
        path: &Path,
        content: &[u8],
        hash: Option<String>,
    ) -> Result<bool, BuildProjectError> {
        let op = |error| BuildProjectError::WriteFileError {
            file: path.to_owned(),
            source: error,
        };
        if let Some(file_hash) = hash {
            hash_is_different(file_hash, content).map_err(op)
        } else {
            content_is_different(path, content).map_err(op)
        }
    }

    fn write(&self, path: PathBuf, content: Vec<u8>) -> BuildProjectResult {
        self.write_file(&path, &content)
            .map_err(|error| BuildProjectError::WriteFileError {
                file: path,
                source: error,
            })
    }

    fn remove(&self, path: PathBuf) -> BuildProjectResult {
        match std::fs::remove_file(&path) {
            Ok(_) => {
                self.removed.lock().unwrap().push(path);
            }
            Err(error) => {
                info!("tried to delete already deleted file: {path:?}");
                debug!("[artifact_writer] error when deleting file: {error:?}");
            }
        }
        Ok(())
    }

    fn finalize(&self) -> crate::errors::Result<()> {
        if let Some(source_control) = &self.source_control {
            source_control.add_files(&self.root_dir, &self.added)?;
            source_control.remove_files(&self.root_dir, &self.removed)
        } else {
            Ok(())
        }
    }
}

fn ensure_file_directory_exists(file_path: &Path) -> io::Result<()> {
    if let Some(file_directory) = file_path.parent()
        && !file_directory.exists()
    {
        create_dir_all(file_directory)?;
    }

    Ok(())
}

pub fn content_is_different(path: &Path, content: &[u8]) -> io::Result<bool> {
    if path.exists() {
        let existing_content = std::fs::read(path)?;
        Ok(existing_content != content)
    } else {
        Ok(true)
    }
}

pub fn hash_is_different(file_hash: String, content: &[u8]) -> io::Result<bool> {
    let hasher = Sha1::new_with_prefix(content);
    let content_hash = format!("{:x}", hasher.finalize());
    Ok(file_hash != content_hash)
}

pub struct NoopArtifactWriter;
impl ArtifactWriter for NoopArtifactWriter {
    fn should_write(
        &self,
        _: &Path,
        _: &[u8],
        _: Option<String>,
    ) -> Result<bool, BuildProjectError> {
        Ok(false)
    }

    fn write(&self, _: PathBuf, _: Vec<u8>) -> Result<(), BuildProjectError> {
        Ok(())
    }
    fn remove(&self, _: PathBuf) -> Result<(), BuildProjectError> {
        Ok(())
    }
    fn finalize(&self) -> crate::errors::Result<()> {
        Ok(())
    }
}

#[derive(Default)]
pub struct ArtifactValidationWriter {
    added: DashSet<PathBuf>,
    updated: DashSet<PathBuf>,
    removed: DashSet<PathBuf>,
}

impl ArtifactWriter for ArtifactValidationWriter {
    fn should_write(
        &self,
        path: &Path,
        content: &[u8],
        hash: Option<String>,
    ) -> Result<bool, BuildProjectError> {
        let op = |error| BuildProjectError::WriteFileError {
            file: path.to_owned(),
            source: error,
        };
        if let Some(file_hash) = hash {
            hash_is_different(file_hash, content).map_err(op)
        } else {
            content_is_different(path, content).map_err(op)
        }
    }

    fn write(&self, path: PathBuf, _: Vec<u8>) -> BuildProjectResult {
        if path.exists() {
            self.updated.insert(path);
        } else {
            self.added.insert(path);
        }
        Ok(())
    }

    fn remove(&self, path: PathBuf) -> BuildProjectResult {
        if path.exists() {
            self.removed.insert(path);
        }
        Ok(())
    }

    fn finalize(&self) -> crate::errors::Result<()> {
        let mut output = String::new();
        write_outdated_artifacts(&mut output, "\nOut of date:", &self.updated);
        write_outdated_artifacts(&mut output, "\nMissing:", &self.added);
        write_outdated_artifacts(&mut output, "\nExtra:", &self.removed);

        if output.is_empty() {
            Ok(())
        } else {
            Err(Error::ArtifactsValidationError { error: output })
        }
    }
}

fn write_outdated_artifacts(output: &mut String, title: &str, artifacts: &DashSet<PathBuf>) {
    if !artifacts.is_empty() {
        writeln!(output, "{title}").unwrap();
        artifacts.iter().for_each(|artifact_path| {
            writeln!(output, " - {:#?}", artifact_path.as_path()).unwrap()
        });
    }
}

/// An operation to be performed on the filesystem during deferred write.
#[cfg(unix)]
#[derive(Clone)]
pub enum ArtifactOperation {
    Write { content: Vec<u8> },
    Remove,
}

/// A thread-safe cache for deferred artifact operations.
///
/// This cache stores artifact operations (writes and removes) in memory,
/// deferring actual filesystem operations until `flush_to_disk` is called.
/// Used by the server daemon to hold compilation output until a client
/// requests a flush.
#[cfg(unix)]
pub struct DeferredArtifactCache {
    operations: Mutex<HashMap<PathBuf, ArtifactOperation>>,
    /// The inner writer used to perform actual write/remove operations during flush
    inner_writer: Box<dyn ArtifactWriter + Send + Sync>,
    /// SHA1 hashes of content last written by the compiler, keyed by artifact path.
    /// Used to distinguish the compiler's own writes from external modifications
    /// when watchman reports changes to generated artifact files.
    written_content_hashes: Mutex<HashMap<PathBuf, [u8; 20]>>,
}

#[cfg(unix)]
impl DeferredArtifactCache {
    pub fn new(inner_writer: Box<dyn ArtifactWriter + Send + Sync>) -> Self {
        Self {
            operations: Mutex::new(HashMap::new()),
            inner_writer,
            written_content_hashes: Mutex::new(HashMap::new()),
        }
    }

    fn should_write_to_cache(
        &self,
        path: &Path,
        content: &[u8],
        hash: Option<String>,
    ) -> Result<bool, BuildProjectError> {
        self.inner_writer.should_write(path, content, hash)
    }

    /// Returns `true` when a watchman-reported change to a generated artifact
    /// should be ignored (i.e., it originated from the compiler, not an
    /// external modification).
    pub fn content_matches_last_write(&self, path: &Path) -> bool {
        let hashes = self.written_content_hashes.lock().unwrap();
        let stored_hash = match hashes.get(path) {
            Some(hash) => *hash,
            None => return false,
        };

        match std::fs::read(path) {
            Ok(disk_content) => {
                let disk_hash: [u8; 20] = Sha1::digest(&disk_content).into();
                disk_hash == stored_hash
            }
            Err(_) => false,
        }
    }

    /// Flush all cached operations to disk.
    ///
    /// Writes all cached content to disk and performs any pending removals,
    /// then runs source control operations (add/remove) via the inner writer's
    /// finalize.
    pub fn flush_to_disk(&self) -> crate::errors::Result<usize> {
        self.flush_to_writer(&*self.inner_writer)
    }

    /// Flush all cached operations through the provided writer.
    ///
    /// Drains the operation cache, routes each write/remove through
    /// `writer`, then calls `writer.finalize()`. Updates the
    /// `written_content_hashes` map so subsequent
    /// `content_matches_last_write` checks see the freshly written bytes.
    pub fn flush_to_writer(
        &self,
        writer: &(dyn ArtifactWriter + Send + Sync),
    ) -> crate::errors::Result<usize> {
        use rayon::prelude::*;

        let operations = std::mem::take(&mut *self.operations.lock().unwrap());

        let count = operations.len();

        if count == 0 {
            info!("No artifacts to flush");
            return Ok(0);
        }

        info!("Flushing {} artifact operations", count);

        // The hash-map lock is held across the file write so that
        // `content_matches_last_write` cannot observe a stored hash whose
        // corresponding on-disk content is mid-write (or stale).
        operations
            .into_par_iter()
            .try_for_each(|(path, op)| -> Result<(), BuildProjectError> {
                match op {
                    ArtifactOperation::Write { content } => {
                        let hash: [u8; 20] = Sha1::digest(&content).into();
                        let mut hashes = self.written_content_hashes.lock().unwrap();
                        hashes.insert(path.clone(), hash);
                        writer.write(path, content)?;
                    }
                    ArtifactOperation::Remove => {
                        let mut hashes = self.written_content_hashes.lock().unwrap();
                        hashes.remove(&path);
                        writer.remove(path)?;
                    }
                }
                Ok(())
            })
            .map_err(|e| crate::errors::Error::BuildProjectsErrors { errors: vec![e] })?;

        writer.finalize()?;

        info!("Successfully flushed {} artifacts", count);

        Ok(count)
    }
}

/// Artifact writer that caches operations in memory for deferred execution.
///
/// Implements [`ArtifactWriter`] but stores all write/remove operations in a
/// shared [`DeferredArtifactCache`] instead of performing them immediately.
/// The actual filesystem operations are deferred until
/// [`DeferredArtifactCache::flush_to_disk`] is called.
#[cfg(unix)]
pub struct DeferredArtifactWriter {
    cache: Arc<DeferredArtifactCache>,
}

#[cfg(unix)]
impl DeferredArtifactWriter {
    pub fn new(cache: Arc<DeferredArtifactCache>) -> Self {
        Self { cache }
    }
}

#[cfg(unix)]
impl ArtifactWriter for DeferredArtifactWriter {
    fn should_write(
        &self,
        path: &Path,
        content: &[u8],
        hash: Option<String>,
    ) -> Result<bool, BuildProjectError> {
        let res = self.cache.should_write_to_cache(path, content, hash);

        // If the content matches disk, remove any stale cache entry for this path.
        // This prevents outdated cached operations from being flushed when the
        // artifact has been reverted to match disk in a subsequent build.
        if let Ok(should_write) = res
            && !should_write
        {
            self.cache
                .operations
                .lock()
                .unwrap()
                .remove(&path.to_path_buf());
        }

        res
    }

    fn write(&self, path: PathBuf, content: Vec<u8>) -> BuildProjectResult {
        self.cache
            .operations
            .lock()
            .unwrap()
            .insert(path, ArtifactOperation::Write { content });
        Ok(())
    }

    fn remove(&self, path: PathBuf) -> BuildProjectResult {
        self.cache
            .operations
            .lock()
            .unwrap()
            .insert(path, ArtifactOperation::Remove);
        Ok(())
    }

    fn finalize(&self) -> crate::errors::Result<()> {
        // Don't finalize (run source control commands) until flush is triggered.
        // The actual finalize happens when the cache is flushed.
        Ok(())
    }

    fn reset(&self) {
        self.cache.operations.lock().unwrap().clear();
        self.cache.written_content_hashes.lock().unwrap().clear();
    }

    fn content_matches_last_write(&self, path: &Path) -> bool {
        self.cache.content_matches_last_write(path)
    }
}
