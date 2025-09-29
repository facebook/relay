/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::ConsoleLogger;
use common::FeatureFlag;
use common::FeatureFlags;
use common::NamedItem;
use common::SourceLocationKey;
use fixture_tests::Fixture;
use graphql_ir::BuilderOptions;
use graphql_ir::FragmentDefinition;
use graphql_ir::FragmentDefinitionName;
use graphql_ir::FragmentVariablesSemantic;
use graphql_ir::OperationDefinition;
use graphql_ir::OperationDefinitionName;
use graphql_ir::Program;
use graphql_ir::RelayMode;
use graphql_ir::build_ir_with_extra_features;
use graphql_syntax::parse_executable;
use graphql_test_helpers::diagnostics_to_sorted_string;
use graphql_text_printer::print_full_operation;
use intern::string_key::Intern;
use relay_codegen::JsModuleFormat;
use relay_codegen::build_request_params;
use relay_codegen::print_fragment;
use relay_codegen::print_operation;
use relay_codegen::print_request;
use relay_compiler::ProjectConfig;
use relay_compiler::validate;
use relay_config::ProjectName;
use relay_config::SchemaConfig;
use relay_test_schema::get_test_schema_with_custom_id;
use relay_test_schema::get_test_schema_with_custom_id_with_extensions;
use relay_transforms::DIRECTIVE_SPLIT_OPERATION;
use relay_transforms::apply_transforms;

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let source_location = SourceLocationKey::standalone(fixture.file_name);

    if fixture.content.contains("%TODO%") {
        if fixture.content.contains("expected-to-throw") {
            return Err("TODO".to_string());
        }
        return Ok("TODO".to_string());
    }

    let node_interface_query_variable_name =
        if fixture.content.contains("# use-custom-variable-name") {
            Some("variable_name".intern())
        } else {
            None
        };

    let parts: Vec<_> = fixture.content.split("%extensions%").collect();
    let (base, schema) = match parts.as_slice() {
        [base, extensions] => (
            base,
            get_test_schema_with_custom_id_with_extensions(extensions),
        ),
        [base] => (base, get_test_schema_with_custom_id()),
        _ => panic!("Invalid fixture input {}", fixture.content),
    };

    let ast = parse_executable(base, source_location)
        .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))?;
    let ir_result = build_ir_with_extra_features(
        &schema,
        &ast.definitions,
        &BuilderOptions {
            allow_undefined_fragment_spreads: false,
            allow_non_overlapping_abstract_spreads: false,
            fragment_variables_semantic: FragmentVariablesSemantic::PassedValue,
            relay_mode: Some(RelayMode),
            default_anonymous_operation_name: None,
            allow_custom_scalar_literals: true, // for compatibility
        },
    );
    let ir = ir_result
        .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))?;
    let program = Program::from_definitions(Arc::clone(&schema), ir);

    let feature_flags = FeatureFlags {
        no_inline: FeatureFlag::Enabled,
        enable_3d_branch_arg_generation: true,
        actor_change_support: FeatureFlag::Enabled,
        text_artifacts: FeatureFlag::Disabled,
        skip_printing_nulls: FeatureFlag::Disabled,
        compact_query_text: FeatureFlag::Disabled,
        ..Default::default()
    };

    let default_schema_config = SchemaConfig::default();

    let project_config = ProjectConfig {
        name: ProjectName::default(),
        feature_flags: Arc::new(feature_flags),
        schema_config: SchemaConfig {
            node_interface_id_field: "global_id".intern(),
            node_interface_id_variable_name: node_interface_query_variable_name
                .unwrap_or(default_schema_config.node_interface_id_variable_name),
            ..default_schema_config
        },
        js_module_format: JsModuleFormat::Haste,
        ..Default::default()
    };

    validate(&program, &project_config, &None)
        .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))?;

    // TODO pass base fragment names
    let programs = apply_transforms(
        &project_config,
        Arc::new(program),
        Default::default(),
        Arc::new(ConsoleLogger),
        None,
        None,
        vec![],
    )
    .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))?;

    let mut operations: Vec<&std::sync::Arc<OperationDefinition>> =
        programs.normalization.operations().collect();
    operations.sort_by_key(|operation| operation.name.item.0);
    let result = operations
        .into_iter()
        .map(|operation| {
            if operation
                .directives
                .named(*DIRECTIVE_SPLIT_OPERATION)
                .is_some()
            {
                let mut import_statements = Default::default();
                let operation =
                    print_operation(&schema, operation, &project_config, &mut import_statements);
                format!("{}{}", import_statements, operation)
            } else {
                let name = operation.name.item.0;
                let print_operation_node = programs
                    .operation_text
                    .operation(OperationDefinitionName(name));
                let text = print_operation_node.map_or_else(
                    || "Query Text is Empty.".to_string(),
                    |print_operation_node| {
                        print_full_operation(
                            &programs.operation_text,
                            print_operation_node,
                            Default::default(),
                        )
                    },
                );

                let reader_operation = programs
                    .reader
                    .operation(OperationDefinitionName(name))
                    .expect("a reader fragment should be generated for this operation");
                let operation_fragment = FragmentDefinition {
                    name: reader_operation.name.map(|x| FragmentDefinitionName(x.0)),
                    variable_definitions: reader_operation.variable_definitions.clone(),
                    selections: reader_operation.selections.clone(),
                    used_global_variables: Default::default(),
                    directives: reader_operation.directives.clone(),
                    type_condition: reader_operation.type_,
                };
                let request_parameters = build_request_params(operation);
                let mut import_statements = Default::default();
                let request = print_request(
                    &schema,
                    operation,
                    &operation_fragment,
                    request_parameters,
                    &project_config,
                    &mut import_statements,
                );
                format!("{}{}\n\nQUERY:\n\n{}", import_statements, request, text)
            }
        })
        .chain({
            let mut fragments: Vec<&std::sync::Arc<FragmentDefinition>> =
                programs.reader.fragments().collect();
            fragments.sort_by_key(|fragment| fragment.name.item);
            fragments.into_iter().map(|fragment| {
                let mut import_statements = Default::default();
                let fragment =
                    print_fragment(&schema, fragment, &project_config, &mut import_statements);
                format!("{}{}", import_statements, fragment)
            })
        })
        .collect::<Vec<_>>();
    Ok(result.join("\n\n"))
}
