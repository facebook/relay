/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::generate_artifacts::Artifact;
use crate::config::{Config, ConfigProject};
use crate::errors::BuildProjectError;
use std::fs::File;
use std::io;
use std::io::prelude::*;
use std::path::PathBuf;

pub fn write_artifacts(
    config: &Config,
    project_config: &ConfigProject,
    artifacts: &[Artifact],
) -> Result<(), BuildProjectError> {
    // For now, just write test projects
    if !project_config.name.0.lookup().ends_with("-test") {
        return Ok(());
    }

    for artifact in artifacts {
        let generated_path = &config
            .root_dir
            .join(
                project_config
                    .output
                    .as_ref()
                    .expect("TODO: implement source relative generated files"),
            )
            .join(format!("{}.graphql.js", artifact.name));
        write_file(generated_path, &artifact.content).map_err(|error| {
            BuildProjectError::WriteFileError {
                file: generated_path.clone(),
                source: error,
            }
        })?;
    }

    Ok(())
}

fn write_file(path: &PathBuf, content: &str) -> io::Result<()> {
    let mut file = File::create(path)?;
    file.write_all(&content.as_bytes())?;
    Ok(())
}
