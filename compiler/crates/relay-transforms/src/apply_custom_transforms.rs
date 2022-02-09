/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{DiagnosticsResult, PerfLogEvent};
use graphql_ir::Program;
use intern::string_key::StringKeySet;
use relay_config::ProjectConfig;

#[derive(Clone)]
pub struct CustomTransform {
    pub name: &'static str,
    pub transform: fn(&ProjectConfig, &Program, &StringKeySet) -> DiagnosticsResult<Program>,
}

impl std::fmt::Debug for CustomTransform {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Transform")
            .field("name", &self.name)
            .finish()
    }
}

#[derive(Debug)]
pub struct CustomTransforms {
    pub apply_before: Vec<CustomTransform>,
    pub apply_after: Vec<CustomTransform>,
}

#[derive(Debug)]
pub struct CustomTransformsConfig {
    pub common_transforms: Option<CustomTransforms>,
    pub reader_transforms: Option<CustomTransforms>,
    pub operation_transforms: Option<CustomTransforms>,
    pub normalization_transforms: Option<CustomTransforms>,
    pub operation_text_transforms: Option<CustomTransforms>,
    pub typegen_transforms: Option<CustomTransforms>,
}

pub(crate) fn apply_before_custom_transforms(
    program: &Program,
    custom_transforms: &Option<&CustomTransforms>,
    project_config: &ProjectConfig,
    base_fragment_names: &StringKeySet,
    log_event: &impl PerfLogEvent,
    maybe_print_stats: Option<fn(extra_info: &str, program: &Program) -> ()>,
) -> DiagnosticsResult<Program> {
    match custom_transforms {
        Some(CustomTransforms { apply_before, .. }) => apply_custom_transforms(
            program,
            apply_before,
            project_config,
            base_fragment_names,
            log_event,
            maybe_print_stats,
        ),
        _ => Ok(program.clone()),
    }
}

pub(crate) fn apply_after_custom_transforms(
    program: &Program,
    custom_transforms: &Option<&CustomTransforms>,
    project_config: &ProjectConfig,
    base_fragment_names: &StringKeySet,
    log_event: &impl PerfLogEvent,
    maybe_print_stats: Option<fn(extra_info: &str, program: &Program) -> ()>,
) -> DiagnosticsResult<Program> {
    match custom_transforms {
        Some(CustomTransforms { apply_after, .. }) => apply_custom_transforms(
            program,
            apply_after,
            project_config,
            base_fragment_names,
            log_event,
            maybe_print_stats,
        ),
        _ => Ok(program.clone()),
    }
}

fn apply_custom_transforms(
    program: &Program,
    transforms: &[CustomTransform],
    project_config: &ProjectConfig,
    base_fragment_names: &StringKeySet,
    log_event: &impl PerfLogEvent,
    maybe_print_stats: Option<fn(extra_info: &str, program: &Program) -> ()>,
) -> DiagnosticsResult<Program> {
    if transforms.is_empty() {
        return Ok(program.clone());
    }

    let apply = |program: &Program, transform: &CustomTransform| {
        apply_custom_transform(
            program,
            transform,
            project_config,
            base_fragment_names,
            log_event,
            maybe_print_stats,
        )
    };
    let mut next_program = program.clone();
    for custom_transform in transforms.iter() {
        next_program = apply(&next_program, custom_transform)?;
    }

    Ok(next_program)
}

fn apply_custom_transform(
    program: &Program,
    transform: &CustomTransform,
    project_config: &ProjectConfig,
    base_fragment_names: &StringKeySet,
    log_event: &impl PerfLogEvent,
    maybe_print_stats: Option<fn(extra_info: &str, program: &Program) -> ()>,
) -> DiagnosticsResult<Program> {
    let CustomTransform { name, transform } = transform;
    let program = log_event.time(name, || {
        transform(project_config, program, base_fragment_names)
    })?;

    if let Some(print_stats) = maybe_print_stats {
        print_stats(name, &program);
    }
    Ok(program)
}
