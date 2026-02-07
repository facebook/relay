/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Utilities for extracting a subschema from a full schema based on usage.

use std::fs;
use std::path::Path;
use std::path::PathBuf;
use std::sync::Arc;

use common::ConsoleLogger;
use program_with_dependencies::ProgramWithDependencies;
use relay_transforms::Programs;
use schema_set::SchemaSet;
use schema_set::UsedSchemaCollectionOptions;
use thiserror::Error;

use crate::SchemaLocation;
use crate::config::Config;
use crate::errors::print_compiler_error;
use crate::get_programs;

/// Errors that can occur during subschema extraction.
#[derive(Debug, Error)]
pub enum SubschemaError {
    #[error("Expected exactly one project, but found {0}")]
    MultipleProjects(usize),

    #[error("Expected a single file schema, but found a directory schema location")]
    DirectorySchemaNotSupported,

    #[error("Full schema path not found: {0}")]
    FullSchemaNotFound(String),

    #[error("Full schema path exists but is neither a file nor directory: {0}")]
    InvalidFullSchemaPath(String),

    #[error("Failed to canonicalize full schema path: {0}")]
    CanonicalizeFailed(String),

    #[error("Full schema path must be under root dir")]
    FullSchemaOutsideRoot,

    #[error("Compilation failed: {0}")]
    CompilationFailed(String),
}

/// Result of subschema extraction.
pub struct SubschemaResult {
    /// The extracted subschema content as a GraphQL SDL string.
    pub schema_content: String,
    /// The path where the subschema should be written (original schema location).
    pub original_schema_path: PathBuf,
}

/// Compile a project against a full schema and extract the used subschema.
///
/// This is the high-level function that:
/// 1. Validates the config has exactly one project
/// 2. Gets the original schema location
/// 3. Swaps the schema to point to the full schema
/// 4. Compiles the project
/// 5. Extracts the used subschema
///
/// Returns the extracted schema content and the path where it should be written.
pub async fn compile_and_extract_subschema(
    mut config: Config,
    full_schema_path: &Path,
) -> Result<SubschemaResult, SubschemaError> {
    // Verify exactly one project
    if config.projects.len() != 1 {
        return Err(SubschemaError::MultipleProjects(config.projects.len()));
    }

    let project_name = *config.projects.keys().next().unwrap();

    // Get the original schema location (where we'll write the subschema)
    let original_schema_path = match &config.projects[&project_name].schema_location {
        SchemaLocation::File(file) => file.clone(),
        SchemaLocation::Directory(_) => {
            return Err(SubschemaError::DirectorySchemaNotSupported);
        }
    };

    // Normalize the full schema path relative to root_dir
    let absolute_full_schema = if full_schema_path.is_absolute() {
        full_schema_path.to_path_buf()
    } else {
        config.root_dir.join(full_schema_path)
    };

    // Canonicalize both paths to ensure consistent comparison across platforms.
    // On Windows, canonicalize() may produce UNC paths or different casing,
    // so we need to canonicalize root_dir as well for strip_prefix to work.
    let canonical_full_schema = absolute_full_schema.canonicalize().map_err(|e| {
        // Use ErrorKind to produce a consistent error message across platforms
        // (e.g., Unix says "No such file or directory" while Windows says
        // "The system cannot find the file specified")
        SubschemaError::CanonicalizeFailed(format!("{:?}", e.kind()))
    })?;

    let canonical_root_dir = config
        .root_dir
        .canonicalize()
        .map_err(|e| SubschemaError::CanonicalizeFailed(format!("{:?}", e.kind())))?;

    let relative_full_schema = canonical_full_schema
        .strip_prefix(&canonical_root_dir)
        .map(|p| p.to_path_buf())
        .map_err(|_| SubschemaError::FullSchemaOutsideRoot)?;

    // Determine schema location type
    let schema_location = match fs::metadata(&absolute_full_schema) {
        Ok(metadata) => {
            if metadata.is_dir() {
                SchemaLocation::Directory(relative_full_schema)
            } else if metadata.is_file() {
                SchemaLocation::File(relative_full_schema)
            } else {
                return Err(SubschemaError::InvalidFullSchemaPath(
                    full_schema_path.display().to_string(),
                ));
            }
        }
        Err(_) => {
            return Err(SubschemaError::FullSchemaNotFound(
                full_schema_path.display().to_string(),
            ));
        }
    };

    // Swap the schema location to point to the full schema
    config
        .projects
        .get_mut(&project_name)
        .unwrap()
        .schema_location = schema_location;

    // Compile the project to get IR
    let root_dir = config.root_dir.clone();
    let programs_result = get_programs(config, Arc::new(ConsoleLogger))
        .await
        .map(|(programs, _, _)| programs.values().cloned().collect::<Vec<_>>());

    let programs_vec = programs_result.map_err(|e| {
        // Use print_compiler_error to get detailed error output with source context
        let formatted_error = print_compiler_error(&root_dir, e);
        SubschemaError::CompilationFailed(formatted_error)
    })?;

    // Expect exactly one program based on exactly one project asserted earlier
    let programs = programs_vec
        .into_iter()
        .next()
        .expect("Expected exactly one program");

    // Extract the used subschema
    let schema_content = extract_subschema(&programs)?;

    Ok(SubschemaResult {
        schema_content,
        original_schema_path,
    })
}

/// Extract the used subschema from compiled programs.
///
/// This takes the compiled programs and extracts only the schema types
/// that are actually used by the project's operations and fragments.
pub fn extract_subschema(programs: &Programs) -> Result<String, SubschemaError> {
    let program_with_deps = ProgramWithDependencies::from_full_program(
        &programs.source.schema,
        // Pass the operation text program since it has had all the Relay-specific
        // features stripped out and should pass validation
        &programs.operation_text,
    );

    let mut used_schema = SchemaSet::from_ir(
        &program_with_deps,
        UsedSchemaCollectionOptions {
            include_implementations_when_typename_requested: None,
            include_all_overlapping_concrete_types: false,
            include_directives_on_schema_definitions: true,
            include_directive_definitions: true,
            include_implicit_output_enum_values: true,
            include_implicit_input_fields_and_enum_values: true,
        },
    );

    used_schema.fix_all_types();

    let (printed_base_schema, _printed_client_schema) =
        used_schema.print_base_and_client_definitions();

    let mut output = printed_base_schema
        .into_iter()
        .collect::<Vec<_>>()
        .join("\n\n");
    output.push('\n');

    Ok(output)
}
