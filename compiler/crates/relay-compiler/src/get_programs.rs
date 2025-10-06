/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::HashMap;
use std::sync::Arc;
use std::sync::Mutex;

use common::PerfLogger;
use relay_config::ProjectName;
use relay_transforms::Programs;

use crate::NoopArtifactWriter;
use crate::compiler::Compiler;
use crate::compiler_state::CompilerState;
use crate::config::Config;
use crate::errors::Result;

type RelayPrograms = (
    HashMap<ProjectName, Arc<Programs>>,
    CompilerState,
    Arc<Config>,
);

type ProgramsResult = Result<RelayPrograms>;

/// Many CLI tools use `get_programs` to compile Relay programs as a prerequisite to other operations.
/// In those cases it's often not practical to to continue if the programs
/// cannot be created. In those cases, it makes sense to exit the process with
/// an error code.
pub fn assert_programs(programs_result: ProgramsResult) -> RelayPrograms {
    match programs_result {
        Ok(programs) => programs,
        Err(e) => {
            eprintln!("{e}");
            std::process::exit(1);
        }
    }
}

/// Asynchronously compiles Relay programs and returns them along with the compiler state and configuration.
///
/// A Relay program represents a compiled GraphQL operation or fragment that can be executed by the Relay runtime.
/// It contains the necessary information to fetch and manage data efficiently, including the query or mutation,
/// variables, and caching instructions.
pub async fn get_programs<TPerfLogger: PerfLogger + 'static>(
    mut config: Config,
    perf_logger: Arc<TPerfLogger>,
) -> ProgramsResult {
    let raw_programs: Arc<Mutex<HashMap<ProjectName, Arc<Programs>>>> =
        Arc::new(Mutex::new(HashMap::new()));
    let raw_programs_cloned = raw_programs.clone();

    config.compile_everything = true;
    config.generate_virtual_id_file_name = None;
    config.artifact_writer = Box::new(NoopArtifactWriter);
    config.generate_extra_artifacts = Some(Box::new(
        move |_config, project_config, _schema, programs, _artifacts| {
            raw_programs_cloned
                .lock()
                .unwrap()
                .insert(project_config.name, Arc::new(programs.clone()));
            vec![]
        },
    ));
    let config = Arc::new(config);

    let compiler = Compiler::new(Arc::clone(&config), Arc::clone(&perf_logger));
    let compiler_state = compiler.compile().await?;
    let programs = {
        let guard = raw_programs.lock().unwrap();
        if guard.is_empty() {
            eprintln!("Failed to extract program from compiler state");
            std::process::exit(1);
        }
        guard.clone()
    };
    Ok((programs, compiler_state, Arc::clone(&config)))
}
