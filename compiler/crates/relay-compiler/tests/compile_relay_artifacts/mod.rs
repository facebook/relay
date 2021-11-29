/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{ConsoleLogger, FeatureFlag, FeatureFlags, NamedItem, SourceLocationKey};
use fixture_tests::Fixture;
use graphql_ir::{
    build_ir_with_extra_features, BuilderOptions, FragmentDefinition, FragmentVariablesSemantic,
    OperationDefinition, Program, RelayMode,
};
use graphql_syntax::parse_executable;
use graphql_test_helpers::diagnostics_to_sorted_string;
use graphql_text_printer::print_full_operation;

use intern::string_key::Intern;
use relay_codegen::{
    build_request_params, print_fragment, print_operation, print_request, JsModuleFormat,
};
use relay_compiler::validate;
use relay_test_schema::{get_test_schema, get_test_schema_with_extensions};
use relay_transforms::{apply_transforms, ConnectionInterface, DIRECTIVE_SPLIT_OPERATION};
use std::{array, sync::Arc};

pub fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let source_location = SourceLocationKey::standalone(fixture.file_name);

    if fixture.content.contains("%TODO%") {
        if fixture.content.contains("expected-to-throw") {
            return Err("TODO".to_string());
        }
        return Ok("TODO".to_string());
    }

    let parts: Vec<_> = fixture.content.split("%extensions%").collect();
    let (base, schema) = match parts.as_slice() {
        [base, extensions] => (base, get_test_schema_with_extensions(extensions)),
        [base] => (base, get_test_schema()),
        _ => panic!("Invalid fixture input {}", fixture.content),
    };

    let ast = parse_executable(base, source_location)
        .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))?;
    let ir_result = build_ir_with_extra_features(
        &schema,
        &ast.definitions,
        &BuilderOptions {
            allow_undefined_fragment_spreads: false,
            fragment_variables_semantic: FragmentVariablesSemantic::PassedValue,
            relay_mode: Some(RelayMode {
                enable_provided_variables: &FeatureFlag::Enabled,
            }),
            default_anonymous_operation_name: None,
        },
    );
    let ir = ir_result
        .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))?;
    let program = Program::from_definitions(Arc::clone(&schema), ir);

    let connection_interface = ConnectionInterface::default();

    validate(
        &program,
        &FeatureFlags::default(),
        &connection_interface,
        &None,
    )
    .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))?;

    let feature_flags = FeatureFlags {
        enable_flight_transform: true,
        enable_required_transform: true,
        hash_supported_argument: FeatureFlag::Limited {
            allowlist: array::IntoIter::new(["UserNameRenderer".intern()]).collect(),
        },
        no_inline: FeatureFlag::Enabled,
        enable_relay_resolver_transform: true,
        enable_3d_branch_arg_generation: true,
        actor_change_support: FeatureFlag::Enabled,
        text_artifacts: FeatureFlag::Disabled,
        enable_client_edges: FeatureFlag::Enabled,
        enable_provided_variables: FeatureFlag::Enabled,
    };

    // TODO pass base fragment names
    let programs = apply_transforms(
        "test".intern(),
        Arc::new(program),
        Default::default(),
        &connection_interface,
        Arc::new(feature_flags),
        &None,
        Arc::new(ConsoleLogger),
        None,
    )
    .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))?;

    let mut operations: Vec<&std::sync::Arc<OperationDefinition>> =
        programs.normalization.operations().collect();
    operations.sort_by_key(|operation| operation.name.item);
    let result = operations
        .into_iter()
        .map(|operation| {
            if operation
                .directives
                .named(*DIRECTIVE_SPLIT_OPERATION)
                .is_some()
            {
                print_operation(&schema, operation, JsModuleFormat::Haste)
            } else {
                let name = operation.name.item;
                let print_operation_node = programs
                    .operation_text
                    .operation(name)
                    .expect("a query text operation should be generated for this operation");
                let text = print_full_operation(&programs.operation_text, print_operation_node);

                let reader_operation = programs
                    .reader
                    .operation(name)
                    .expect("a reader fragment should be generated for this operation");
                let operation_fragment = FragmentDefinition {
                    name: reader_operation.name,
                    variable_definitions: reader_operation.variable_definitions.clone(),
                    selections: reader_operation.selections.clone(),
                    used_global_variables: Default::default(),
                    directives: reader_operation.directives.clone(),
                    type_condition: reader_operation.type_,
                };
                let request_parameters = build_request_params(operation);
                format!(
                    "{}\n\nQUERY:\n\n{}",
                    print_request(
                        &schema,
                        operation,
                        &operation_fragment,
                        request_parameters,
                        JsModuleFormat::Haste
                    ),
                    text
                )
            }
        })
        .chain({
            let mut fragments: Vec<&std::sync::Arc<FragmentDefinition>> =
                programs.reader.fragments().collect();
            fragments.sort_by_key(|fragment| fragment.name.item);
            fragments
                .into_iter()
                .map(|fragment| print_fragment(&schema, fragment, JsModuleFormat::Haste))
        })
        .collect::<Vec<_>>();
    Ok(result.join("\n\n"))
}
