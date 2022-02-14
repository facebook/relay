/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

pub use super::artifact_content::ArtifactContent;
use crate::config::ProjectConfig;
use common::SourceLocationKey;
use intern::string_key::StringKey;
use relay_typegen::TypegenLanguage;
use std::path::PathBuf;

/// This function will create a correct path for artifact based on the project configuration
pub fn create_path_for_artifact(
    project_config: &ProjectConfig,
    source_file: SourceLocationKey,
    artifact_file_name: String,
) -> PathBuf {
    if let Some(output) = &project_config.output {
        // If an output directory is specified, output into that directory.
        if project_config.shard_output {
            if let Some(ref regex) = project_config.shard_strip_regex {
                let full_source_path = regex.replace_all(source_file.path(), "");
                let mut output = output.join(full_source_path.to_string());
                output.pop();
                output
            } else {
                output.join(source_file.get_dir())
            }
            .join(artifact_file_name)
        } else {
            output.join(artifact_file_name)
        }
    } else {
        // Otherwise, output into a file relative to the source.
        source_file
            .get_dir()
            .join("__generated__")
            .join(artifact_file_name)
    }
}

pub fn path_for_artifact(
    project_config: &ProjectConfig,
    source_file: SourceLocationKey,
    definition_name: StringKey,
) -> PathBuf {
    let filename = if let Some(filename_for_artifact) = &project_config.filename_for_artifact {
        filename_for_artifact(source_file, definition_name)
    } else {
        match &project_config.typegen_config.language {
            TypegenLanguage::Flow => format!("{}.graphql.js", definition_name),
            TypegenLanguage::TypeScript => format!("{}.graphql.ts", definition_name),
        }
    };
    create_path_for_artifact(project_config, source_file, filename)
}
