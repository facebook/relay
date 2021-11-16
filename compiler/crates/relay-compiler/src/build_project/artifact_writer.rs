/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::errors::BuildProjectError;
use log::info;
use serde::{Serialize, Serializer};
use std::io::prelude::*;
use std::{
    fs::{create_dir_all, File},
    io,
};
use std::{path::PathBuf, sync::Mutex};

type BuildProjectResult = Result<(), BuildProjectError>;

pub trait ArtifactWriter {
    fn should_write(&self, path: &PathBuf, content: &[u8]) -> Result<bool, BuildProjectError>;
    fn write(&self, path: PathBuf, content: Vec<u8>) -> BuildProjectResult;
    fn remove(&self, path: PathBuf) -> BuildProjectResult;
    fn finalize(&self) -> crate::errors::Result<()>;
}

type SourceControlFn =
    fn(&PathBuf, &Mutex<Vec<PathBuf>>, &Mutex<Vec<PathBuf>>) -> crate::errors::Result<()>;
pub struct ArtifactFileWriter {
    added: Mutex<Vec<PathBuf>>,
    removed: Mutex<Vec<PathBuf>>,
    source_control_fn: Option<SourceControlFn>,
    root_dir: PathBuf,
}

impl Default for ArtifactFileWriter {
    fn default() -> Self {
        Self {
            added: Default::default(),
            removed: Default::default(),
            source_control_fn: None,
            root_dir: Default::default(),
        }
    }
}

impl ArtifactFileWriter {
    pub fn new(source_control_fn: Option<SourceControlFn>, root_dir: PathBuf) -> Self {
        Self {
            added: Default::default(),
            removed: Default::default(),
            source_control_fn,
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
    fn should_write(&self, path: &PathBuf, content: &[u8]) -> Result<bool, BuildProjectError> {
        content_is_different(path, content).map_err(|error| BuildProjectError::WriteFileError {
            file: path.clone(),
            source: error,
        })
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
            _ => info!("tried to delete already deleted file: {:?}", path),
        }
        Ok(())
    }

    fn finalize(&self) -> crate::errors::Result<()> {
        if let Some(source_control_fn) = self.source_control_fn {
            (source_control_fn)(&self.root_dir, &self.added, &self.removed)
        } else {
            Ok(())
        }
    }
}

#[derive(Serialize)]
struct CodegenRecords {
    pub removed: Vec<ArtifactDeletionRecord>,
    pub changed: Vec<ArtifactUpdateRecord>,
}

#[derive(Serialize)]
struct ArtifactDeletionRecord {
    pub path: PathBuf,
}

#[derive(Serialize)]
struct ArtifactUpdateRecord {
    pub path: PathBuf,
    #[serde(serialize_with = "from_utf8")]
    pub data: Vec<u8>,
}

fn from_utf8<S>(slice: &[u8], s: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    s.serialize_str(std::str::from_utf8(slice).unwrap())
}

pub struct ArtifactDifferenceWriter {
    codegen_records: Mutex<CodegenRecords>,
    codegen_filepath: PathBuf,
    verify_changes_against_filesystem: bool,
}

impl ArtifactDifferenceWriter {
    pub fn new(
        codegen_filepath: PathBuf,
        verify_changes_against_filesystem: bool,
    ) -> ArtifactDifferenceWriter {
        ArtifactDifferenceWriter {
            codegen_filepath,
            codegen_records: Mutex::new(CodegenRecords {
                changed: Vec::new(),
                removed: Vec::new(),
            }),
            verify_changes_against_filesystem,
        }
    }
}

impl ArtifactWriter for ArtifactDifferenceWriter {
    fn should_write(&self, path: &PathBuf, content: &[u8]) -> Result<bool, BuildProjectError> {
        Ok(!self.verify_changes_against_filesystem
            || content_is_different(path, content).map_err(|error| {
                BuildProjectError::WriteFileError {
                    file: path.clone(),
                    source: error,
                }
            })?)
    }

    fn write(&self, path: PathBuf, content: Vec<u8>) -> BuildProjectResult {
        self.codegen_records
            .lock()
            .unwrap()
            .changed
            .push(ArtifactUpdateRecord {
                path,
                data: content,
            });
        Ok(())
    }

    fn remove(&self, path: PathBuf) -> BuildProjectResult {
        if path.exists() {
            self.codegen_records
                .lock()
                .unwrap()
                .removed
                .push(ArtifactDeletionRecord { path });
        }
        Ok(())
    }

    fn finalize(&self) -> crate::errors::Result<()> {
        (|| {
            let mut file = File::create(&self.codegen_filepath)?;
            file.write_all(serde_json::to_string(&self.codegen_records)?.as_bytes())
        })()
        .map_err(|error| crate::errors::Error::WriteFileError {
            file: self.codegen_filepath.clone(),
            source: error,
        })
    }
}

fn ensure_file_directory_exists(file_path: &PathBuf) -> io::Result<()> {
    if let Some(file_directory) = file_path.parent() {
        if !file_directory.exists() {
            create_dir_all(file_directory)?;
        }
    }

    Ok(())
}

fn content_is_different(path: &PathBuf, content: &[u8]) -> io::Result<bool> {
    if path.exists() {
        let existing_content = std::fs::read(path)?;
        Ok(existing_content != content)
    } else {
        Ok(true)
    }
}

pub struct NoopArtifactWriter;
impl ArtifactWriter for NoopArtifactWriter {
    fn should_write(&self, _: &PathBuf, _: &[u8]) -> Result<bool, BuildProjectError> {
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
