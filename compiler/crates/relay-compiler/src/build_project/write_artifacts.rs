/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::generate_artifacts::Artifact;
use crate::config::{Config, ProjectConfig};
use crate::errors::BuildProjectError;
use relay_codegen::Printer;
use schema::Schema;
use std::fs::{create_dir_all, File};
use std::io;
use std::io::prelude::*;
use std::path::PathBuf;

pub fn write_artifacts(
    config: &Config,
    project_config: &ProjectConfig,
    artifacts: &[Artifact],
    schema: &Schema,
) -> Result<(), BuildProjectError> {
    let mut printer = Printer::default();
    for artifact in artifacts {
        let generated_path = &config.root_dir.join(&artifact.path);
        let content = artifact
            .content
            .as_bytes(config, project_config, &mut printer, schema);
        write_file(generated_path, &content).map_err(|error| {
            BuildProjectError::WriteFileError {
                file: generated_path.clone(),
                source: error,
            }
        })?;
    }
    Ok(())
}

fn ensure_file_directory_exists(file_path: &PathBuf) -> io::Result<()> {
    if let Some(file_directory) = file_path.parent() {
        if !file_directory.exists() {
            create_dir_all(file_directory)?;
        }
    }

    Ok(())
}

fn write_file(path: &PathBuf, content: &[u8]) -> io::Result<()> {
    if path.exists() {
        let existing_content = std::fs::read(path)?;
        if existing_content == content {
            return Ok(());
        }
    } else {
        ensure_file_directory_exists(path)?;
    }

    let mut file = File::create(path)?;
    file.write_all(&content)?;
    Ok(())
}
