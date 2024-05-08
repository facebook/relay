/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::escalate_and_check;
use common::CriticalDiagnostics;
use common::DiagnosticsResult;
use common::StableDiagnostics;
use common::WithDiagnostics;
use errors::try_all;
use graphql_ir::Program;
use relay_config::ProjectConfig;
use relay_transforms::disallow_circular_no_inline_fragments;
use relay_transforms::disallow_readtime_features_in_mutations;
use relay_transforms::disallow_reserved_aliases;
use relay_transforms::disallow_typename_on_root;
use relay_transforms::validate_assignable_directive;
use relay_transforms::validate_connections;
use relay_transforms::validate_global_variable_names;
use relay_transforms::validate_module_names;
use relay_transforms::validate_no_double_underscore_alias;
use relay_transforms::validate_no_inline_fragments_with_raw_response_type;
use relay_transforms::validate_no_unselectable_selections;
use relay_transforms::validate_relay_directives;
use relay_transforms::validate_resolver_fragments;
use relay_transforms::validate_static_args;
use relay_transforms::validate_unused_fragment_variables;
use relay_transforms::validate_unused_variables;
use relay_transforms::validate_updatable_directive;
use relay_transforms::validate_updatable_fragment_spread;

pub type AdditionalValidations =
    Box<dyn Fn(&Program, &ProjectConfig) -> DiagnosticsResult<()> + Sync + Send>;

pub fn validate(
    program: &Program,
    project_config: &ProjectConfig,
    additional_validations: &Option<AdditionalValidations>,
) -> DiagnosticsResult<WithDiagnostics<()>> {
    let output = try_all(vec![
        disallow_reserved_aliases(program, &project_config.schema_config),
        validate_no_unselectable_selections(program, &project_config.schema_config),
        validate_no_double_underscore_alias(program),
        validate_unused_variables(program),
        validate_unused_fragment_variables(program),
        validate_connections(program, &project_config.schema_config.connection_interface),
        validate_relay_directives(program),
        validate_global_variable_names(program),
        validate_module_names(program),
        validate_no_inline_fragments_with_raw_response_type(program),
        disallow_typename_on_root(program),
        validate_static_args(program),
        if let Some(ref validate) = additional_validations {
            validate(program, project_config)
        } else {
            Ok(())
        },
        disallow_circular_no_inline_fragments(program),
        validate_updatable_directive(program),
        validate_updatable_fragment_spread(program),
        validate_assignable_directive(program),
        if project_config.feature_flags.enable_relay_resolver_transform {
            validate_resolver_fragments(program)
        } else {
            Ok(())
        },
        disallow_readtime_features_in_mutations(
            program,
            &project_config
                .feature_flags
                .allow_resolvers_in_mutation_response,
            &project_config
                .feature_flags
                .allow_required_in_mutation_response,
            project_config.feature_flags.enable_relay_resolver_mutations,
        ),
    ]);

    match output {
        Ok(_) => Ok(WithDiagnostics {
            item: (),
            diagnostics: Vec::new(),
        }),
        Err(errors) => {
            let critical_level = project_config.diagnostic_report_config.critical_level;

            // We are ignoring the results of successful validations in the error branch, since
            // `try_map` returns a vector of all errors if any validator returned an error.
            // This is okay because successful validations return no special information
            // (i.e. their Ok variant contains ()).

            escalate_and_check(critical_level.into(), errors)
                .map(|StableDiagnostics(diagnostics)| WithDiagnostics {
                    item: (),
                    diagnostics,
                })
                .map_err(|CriticalDiagnostics(errors)| errors)
        }
    }
}
