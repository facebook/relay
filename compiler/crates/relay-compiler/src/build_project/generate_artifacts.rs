/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::{apply_transforms::Programs, artifact_content::ArtifactContent};
use crate::config::ProjectConfig;
use crate::errors::BuildProjectError;
use common::{FileKey, NamedItem};
use graphql_ir::{FragmentDefinition, OperationDefinition};
use graphql_text_printer::{
    print_fragment, print_full_operation, write_operation_with_graphqljs_formatting,
};
use graphql_transforms::{MATCH_CONSTANTS, REFETCHABLE_CONSTANTS};
use interner::StringKey;
use md5::{Digest, Md5};
use std::path::PathBuf;

/// Represents a generated output artifact.
pub struct Artifact<'a> {
    pub name: StringKey,
    pub path: PathBuf,
    pub content: ArtifactContent<'a>,
    /// The source file responsible for generating this file.
    /// For example: `my_project/Component.react.js`
    pub source_file: FileKey,
}

pub fn generate_artifacts<'a>(
    project_config: &ProjectConfig,
    programs: &'a Programs<'a>,
) -> Result<Vec<Artifact<'a>>, BuildProjectError> {
    let mut artifacts = Vec::new();
    for normalization_operation in programs.normalization.operations() {
        if let Some(directive) = normalization_operation
            .directives
            .named(MATCH_CONSTANTS.custom_module_directive_name)
        {
            // Generate normalization file for SplitOperation
            let name_arg = directive
                .arguments
                .named(MATCH_CONSTANTS.derived_from_arg)
                .unwrap();
            let source_name = name_arg.value.item.expect_string_literal();
            let source_fragment = programs
                .source
                .fragment(source_name)
                .expect("Expected the source document for the SplitOperation to exist.");
            let source_string = print_fragment(programs.source.schema(), &source_fragment);
            let source_hash = md5(&source_string);
            let source_file = source_fragment.name.location.file();
            artifacts.push(Artifact {
                name: normalization_operation.name.item,
                path: path_for_js_artifact(
                    project_config,
                    source_file,
                    normalization_operation.name.item,
                ),
                content: ArtifactContent::SplitOperation {
                    normalization_operation,
                    source_hash,
                },
                source_file,
            });
        } else if let Some(directive) = normalization_operation
            .directives
            .named(REFETCHABLE_CONSTANTS.refetchable_operation_metadata_name)
        {
            let source_name = directive
                .arguments
                .named(REFETCHABLE_CONSTANTS.refetchable_operation_metadata_name)
                .unwrap()
                .value
                .item
                .expect_string_literal();
            let source_fragment = programs
                .source
                .fragment(source_name)
                .expect("Expected the source document for the SplitOperation to exist.");
            let source_string = print_fragment(programs.source.schema(), &source_fragment);
            let source_hash = md5(&source_string);
            artifacts.push(generate_normalization_artifact(
                project_config,
                programs,
                normalization_operation,
                source_hash,
                source_fragment.name.location.file(),
            )?);
        } else {
            let source_operation = programs
                .source
                .operation(normalization_operation.name.item)
                .unwrap();
            // TODO: Consider using the std::io::Write trait here to directly
            // write to the md5. Currently, this doesn't work as `write_operation`
            // expects a `std::fmt::Write`.
            // Same for fragment hashing below.
            let mut source_string = String::new();
            write_operation_with_graphqljs_formatting(
                programs.source.schema(),
                &source_operation,
                &mut source_string,
            )
            .unwrap();
            let source_hash = md5(&source_string);
            artifacts.push(generate_normalization_artifact(
                project_config,
                programs,
                normalization_operation,
                source_hash,
                normalization_operation.name.location.file(),
            )?);
        }
    }

    for reader_fragment in programs.reader.fragments() {
        let source_fragment = programs.source.fragment(reader_fragment.name.item).unwrap();
        // Same as for operation hashing above.
        let source_string = print_fragment(programs.source.schema(), &source_fragment);
        let source_hash = md5(&source_string);
        artifacts.push(generate_reader_artifact(
            project_config,
            programs,
            reader_fragment,
            source_hash,
        ));
    }

    Ok(artifacts)
}

fn generate_normalization_artifact<'a>(
    project_config: &ProjectConfig,
    programs: &'a Programs<'_>,
    normalization_operation: &'a OperationDefinition,
    source_hash: String,
    source_file: FileKey,
) -> Result<Artifact<'a>, BuildProjectError> {
    let name = normalization_operation.name.item;
    let print_operation = programs
        .operation_text
        .operation(name)
        .expect("a query text operation should be generated for this operation");
    let text = print_full_operation(&programs.operation_text, print_operation);
    let reader_operation = programs
        .reader
        .operation(name)
        .expect("a reader fragment should be generated for this operation");
    let typegen_operation = programs
        .typegen
        .operation(name)
        .expect("a type fragment should be generated for this operation");
    Ok(Artifact {
        name,
        path: path_for_js_artifact(project_config, source_file, name),
        content: ArtifactContent::Operation {
            normalization_operation,
            reader_operation,
            typegen_operation,
            source_hash,
            text,
            id: None,
        },
        source_file: normalization_operation.name.location.file(),
    })
}

fn generate_reader_artifact<'a>(
    project_config: &ProjectConfig,
    programs: &'a Programs<'_>,
    reader_fragment: &'a FragmentDefinition,
    source_hash: String,
) -> Artifact<'a> {
    let name = reader_fragment.name.item;
    let typegen_fragment = programs
        .typegen
        .fragment(name)
        .expect("a type fragment should be generated for this fragment");
    Artifact {
        name,
        path: path_for_js_artifact(project_config, reader_fragment.name.location.file(), name),
        content: ArtifactContent::Fragment {
            reader_fragment,
            typegen_fragment,
            source_hash,
        },
        source_file: reader_fragment.name.location.file(),
    }
}

fn path_for_js_artifact(
    project_config: &ProjectConfig,
    source_file: FileKey,
    definition_name: StringKey,
) -> PathBuf {
    if let Some(output) = &project_config.output {
        if project_config.shard_output {
            if let Some(ref regex) = project_config.shard_strip_regex {
                let full_source_path = regex.replace_all(source_file.lookup(), "");
                let mut output = output.join(full_source_path.to_string());
                output.pop();
                output
            } else {
                output.join(source_file.get_dir())
            }
            .join(format!("{}.graphql.js", definition_name))
        } else {
            output.join(format!("{}.graphql.js", definition_name))
        }
    } else {
        let path = source_file.get_dir();
        path.join(format!("__generated__/{}.graphql.js", definition_name))
    }
}

fn md5(data: &str) -> String {
    let mut md5 = Md5::new();
    md5.input(data);
    hex::encode(md5.result())
}
