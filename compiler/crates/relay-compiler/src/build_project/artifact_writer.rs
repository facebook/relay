/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::fmt::Write as _;
use std::fs::File;
use std::fs::create_dir_all;
use std::io;
use std::io::prelude::*;
use std::path::Path;
use std::path::PathBuf;
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

fn content_is_different(path: &Path, content: &[u8]) -> io::Result<bool> {
    if path.exists() {
        let existing_content = std::fs::read(path)?;
        Ok(existing_content != content)
    } else {
        Ok(true)
    }
}

fn hash_is_different(file_hash: String, content: &[u8]) -> io::Result<bool> {
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
