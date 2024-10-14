/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;
use std::sync::Mutex;

use common::PerfLogger;
use relay_transforms::Programs;

use crate::compiler::Compiler;
use crate::compiler_state::CompilerState;
use crate::config::Config;
use crate::NoopArtifactWriter;

pub async fn get_programs<TPerfLogger: PerfLogger + 'static>(
    mut config: Config,
    perf_logger: Arc<TPerfLogger>,
) -> (Vec<Arc<Programs>>, CompilerState, Arc<Config>) {
    let raw_programs: Arc<Mutex<Vec<Arc<Programs>>>> = Arc::new(Mutex::new(vec![]));
    let raw_programs_cloned = raw_programs.clone();

    config.compile_everything = true;
    config.generate_virtual_id_file_name = None;
    config.artifact_writer = Box::new(NoopArtifactWriter);
    config.generate_extra_artifacts = Some(Box::new(
        move |_config, _project_config, _schema, programs, _artifacts| {
            raw_programs_cloned
                .lock()
                .unwrap()
                .push(Arc::new(programs.clone()));
            vec![]
        },
    ));
    let config = Arc::new(config);

    let compiler = Compiler::new(Arc::clone(&config), Arc::clone(&perf_logger));
    let compiler_state = match compiler.compile().await {
        Ok(compiler_state) => compiler_state,
        Err(e) => {
            eprintln!("{}", e);
            std::process::exit(1);
        }
    };
    let programs = {
        let guard = raw_programs.lock().unwrap();
        if guard.len() < 1 {
            eprintln!("Failed to extract program from compiler state");
            std::process::exit(1);
        }
        guard.clone()
    };
    (programs, compiler_state, Arc::clone(&config))
}
