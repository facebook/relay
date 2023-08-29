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
use graphql_ir::build;
use graphql_ir::Program;
use graphql_syntax::parse_executable;
use indexmap::IndexMap;
use intern::string_key::Intern;
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

pub fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let parts = fixture.content.split("%extensions%").collect::<Vec<_>>();
    let (source, schema) = match parts.as_slice() {
        [source, extensions] => (source, get_test_schema_with_extensions(extensions)),
        [source] => (source, get_test_schema()),
        _ => panic!(),
    };

    let source_location = SourceLocationKey::standalone(fixture.file_name);

    let mut sources = FnvHashMap::default();
    sources.insert(source_location, source);
    let ast = parse_executable(source, source_location).unwrap_or_else(|e| {
        panic!("Encountered error building AST: {:?}", e);
    });
    let ir = build(&schema, &ast.definitions).unwrap_or_else(|e| {
        panic!("Encountered error building IR {:?}", e);
    });
    let program = Program::from_definitions(Arc::clone(&schema), ir);
    let mut custom_scalar_types = FnvIndexMap::default();
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
        typegen_config: TypegenConfig {
            language: TypegenLanguage::TypeScript,
            custom_scalar_types,
            use_import_type_syntax: fixture
                .content
                .contains("# typegen_config.use_import_type_syntax = true"),
            ..Default::default()
        },
        feature_flags: Arc::new(FeatureFlags {
            enable_fragment_aliases: FeatureFlag::Enabled,
            enable_relay_resolver_transform: true,
            ..Default::default()
        }),
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
    .unwrap();

    let fragment_locations = FragmentLocations::new(programs.typegen.fragments());
    let mut operations: Vec<_> = programs.typegen.operations().collect();
    operations.sort_by_key(|op| op.name.item.0);
    let operation_strings = operations.into_iter().map(|typegen_operation| {
        let normalization_operation = programs
            .normalization
            .operation(typegen_operation.name.item)
            .unwrap();
        relay_typegen::generate_operation_type_exports_section(
            typegen_operation,
            normalization_operation,
            &schema,
            &project_config,
            &fragment_locations,
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
