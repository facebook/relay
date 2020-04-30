/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::generate_artifacts::Artifact;
use super::WrittenArtifacts;
use crate::config::{Config, ProjectConfig};
use crate::errors::BuildProjectError;
use std::fs::File;
use std::io;
use std::io::prelude::*;
use std::path::PathBuf;

pub fn write_artifacts(
    config: &Config,
    project_config: &ProjectConfig,
    artifacts: &[Artifact],
) -> Result<WrittenArtifacts, BuildProjectError> {
    let mut written_artifacts: WrittenArtifacts = vec![];

    for artifact in artifacts {
        let generated_relative_path: &PathBuf = &match project_config.output {
            Some(ref output) => {
                if project_config.shard_output {
                    if let Some(ref prefix) = project_config.shard_strip_prefix {
                        output.join(artifact.source_file.get_dir().strip_prefix(prefix).unwrap())
                    } else {
                        output.join(artifact.source_file.get_dir())
                    }
                    .join(format!("{}.graphql.js", artifact.name))
                } else {
                    output.join(format!("{}.graphql.js", artifact.name))
                }
            }
            None => {
                let path = artifact.source_file.get_dir();
                path.join(format!("__generated__/{}.graphql.js", artifact.name))
            }
        };

        let generated_path = &config.root_dir.join(generated_relative_path);

        write_file(generated_path, &artifact.content).map_err(|error| {
            BuildProjectError::WriteFileError {
                file: generated_path.clone(),
                source: error,
            }
        })?;
        written_artifacts.push((generated_relative_path.to_owned(), artifact.to_owned()));
    }

    Ok(written_artifacts)
}

fn write_file(path: &PathBuf, content: &str) -> io::Result<()> {
    let mut file = File::create(path)?;
    file.write_all(&content.as_bytes())?;
    Ok(())
}
