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
use common::ScalarName;
use common::SourceLocationKey;
use fixture_tests::Fixture;
use fnv::FnvBuildHasher;
use fnv::FnvHashMap;
use graphql_ir::build_ir_in_relay_mode;
use graphql_ir::OperationDefinitionName;
use graphql_ir::Program;
use graphql_syntax::parse_executable;
use graphql_test_helpers::diagnostics_to_sorted_string;
use indexmap::IndexMap;
use intern::string_key::Intern;
use relay_codegen::print_provided_variables;
use relay_codegen::JsModuleFormat;
use relay_config::CustomScalarType;
use relay_config::CustomScalarTypeImport;
use relay_config::ProjectConfig;
use relay_config::ProjectName;
use relay_test_schema::get_test_schema;
use relay_test_schema::get_test_schema_with_extensions;
use relay_transforms::apply_transforms;
use relay_typegen::FragmentLocations;
use relay_typegen::TypegenConfig;
use relay_typegen::TypegenLanguage;

type FnvIndexMap<K, V> = IndexMap<K, V, FnvBuildHasher>;

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let parts = fixture.content.split("%extensions%").collect::<Vec<_>>();
    let (source, schema) = match parts.as_slice() {
        [source, extensions] => (source, get_test_schema_with_extensions(extensions)),
        [source] => (source, get_test_schema()),
        _ => panic!(),
    };

    let source_location = SourceLocationKey::standalone(fixture.file_name);

    let mut sources = FnvHashMap::default();
    sources.insert(source_location, source);
    let ast = parse_executable(source, source_location)
        .map_err(|diagnostics| diagnostics_to_sorted_string(source, &diagnostics))?;
    let feature_flags = FeatureFlags {
        no_inline: FeatureFlag::Limited {
            allowlist: [
                "noInlineFragment_address".intern(),
                "noInlineFragment_user".intern(),
                "MarkdownUserNameRenderer_name".intern(),
                "Test_userRenderer".intern(),
                "PlainUserNameRenderer_name".intern(),
            ]
            .into_iter()
            .collect(),
        },
        enable_relay_resolver_transform: true,
        relay_resolver_enable_interface_output_type: FeatureFlag::Enabled,
        actor_change_support: FeatureFlag::Enabled,
        enable_fragment_aliases: FeatureFlag::Enabled,
        ..Default::default()
    };
    let ir = build_ir_in_relay_mode(&schema, &ast.definitions, &feature_flags)
        .map_err(|diagnostics| diagnostics_to_sorted_string(source, &diagnostics))?;
    let program = Program::from_definitions(Arc::clone(&schema), ir);

    let mut custom_scalar_types = FnvIndexMap::default();

    custom_scalar_types.insert(
        ScalarName("Boolean".intern()),
        CustomScalarType::Name("CustomBoolean".intern()),
    );
    custom_scalar_types.insert(
        ScalarName("JSON".intern()),
        CustomScalarType::Path(CustomScalarTypeImport {
            name: "JSON".intern(),
            path: "TypeDefsFile".into(),
        }),
    );
    let project_config = ProjectConfig {
        name: ProjectName::default(),
        js_module_format: JsModuleFormat::Haste,
        feature_flags: Arc::new(feature_flags),
        typegen_config: TypegenConfig {
            language: TypegenLanguage::Flow,
            custom_scalar_types,
            experimental_emit_semantic_nullability_types: fixture
                .content
                .contains("# relay:experimental_emit_semantic_nullability_types"),
            ..Default::default()
        },
        ..Default::default()
    };

    let programs = apply_transforms(
        &project_config,
        Arc::new(program),
        Default::default(),
        Arc::new(ConsoleLogger),
        None,
        None,
    )
    .map_err(|diagnostics| diagnostics_to_sorted_string(source, &diagnostics))?;

    let fragment_locations = FragmentLocations::new(programs.typegen.fragments());
    let mut operations: Vec<_> = programs.typegen.operations().collect();
    operations.sort_by_key(|op| op.name.item.0);
    let operation_strings = operations.into_iter().map(|typegen_operation| {
        // `normalization` ASTs are present unless we are processing an updatable query
        // In that case, `reader` ASTs are present.
        let op: &Arc<graphql_ir::OperationDefinition> = programs
            .normalization
            .operation(OperationDefinitionName(typegen_operation.name.item.0))
            .unwrap_or_else(|| {
                programs
                    .reader
                    .operation(OperationDefinitionName(typegen_operation.name.item.0))
                    .unwrap_or_else(|| {
                        panic!(
                            "Couldn't find normalization or reader operations for {}",
                            typegen_operation.name.item
                        )
                    })
            });

        relay_typegen::generate_operation_type_exports_section(
            typegen_operation,
            op,
            &schema,
            &project_config,
            &fragment_locations,
            print_provided_variables(&schema, op, &project_config),
        )
    });

    let mut fragments: Vec<_> = programs.typegen.fragments().collect();
    fragments.sort_by_key(|frag| frag.name.item);
    let fragment_strings = fragments.into_iter().map(|frag| {
        relay_typegen::generate_fragment_type_exports_section(
            frag,
            &schema,
            &project_config,
            &fragment_locations,
        )
    });

    let mut result: Vec<String> = operation_strings.collect();
    result.extend(fragment_strings);
    Ok(result
        .join("-------------------------------------------------------------------------------\n"))
}
