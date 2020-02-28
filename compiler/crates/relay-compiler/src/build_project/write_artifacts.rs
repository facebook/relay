/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::generate_artifacts::Artifact;
use crate::config::{Config, ConfigProject};
use std::fs::File;
use std::io::prelude::*;

pub fn write_artifacts(
    config: &Config,
    project_config: &ConfigProject,
    artifacts: &[Artifact],
) -> std::io::Result<()> {
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
        let mut file = File::create(generated_path)?;
        file.write_all(&artifact.content.as_bytes())?;
    }

    Ok(())
}
