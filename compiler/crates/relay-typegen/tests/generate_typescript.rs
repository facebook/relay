/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use core::panic;
use std::path::PathBuf;
use std::str::FromStr;
use std::sync::Arc;

use ::intern::string_key::Intern;
use ::intern::string_key::StringKey;
use common::ConsoleLogger;
use common::FeatureFlag;
use common::FeatureFlags;
use common::ScalarName;
use common::SourceLocationKey;
use fixture_tests::Fixture;
use fnv::FnvBuildHasher;
use fnv::FnvHashMap;
use graphql_ir::build;
use graphql_ir::OperationDefinitionName;
use graphql_ir::Program;
use graphql_syntax::parse_executable;
use indexmap::IndexMap;
use regex::Regex;
use relay_codegen::print_provided_variables;
use relay_codegen::JsModuleFormat;
use relay_config::CustomType;
use relay_config::CustomTypeImport;
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
        CustomType::Path(CustomTypeImport {
            name: "JSON".intern(),
            path: "TypeDefsFile".into(),
        }),
    );
    // TODO: T195687167 This is currently duplicated in flow and TS - export this to a common place
    let custom_error_type: Option<CustomTypeImport> = {
        let rgx =
            Regex::new(r"# relay:custom_error_type\s(?<name>[A-Za-z]+)\s(?<path>[A-Za-z/\.:]*)")
                .unwrap();
        let caps = rgx.captures(fixture.content);

        match caps {
            Some(def_caps) => {
                // we want named captures "name" and "path" - but 0 is always the full string, so we expect 3
                if def_caps.len() != 3 {
                    panic!("Expected 2 matches, got {}", def_caps.len());
                }

                let name_str = def_caps.name("name").map_or("", |m| m.as_str());
                let path_str = def_caps.name("path").map_or("", |m| m.as_str());

                match name_str.is_empty() || path_str.is_empty() {
                    true => panic!("Expected non-empty name and path"),
                    false => Some(CustomTypeImport {
                        name: StringKey::from_str(name_str).unwrap(),
                        path: PathBuf::from(path_str),
                    }),
                }
            }
            None => None,
        }
    };

    let project_config = ProjectConfig {
        name: ProjectName::default(),
        js_module_format: JsModuleFormat::Haste,
        typegen_config: TypegenConfig {
            language: TypegenLanguage::TypeScript,
            custom_scalar_types,
            use_import_type_syntax: fixture
                .content
                .contains("# typegen_config.use_import_type_syntax = true"),
            experimental_emit_semantic_nullability_types: fixture
                .content
                .contains("# relay:experimental_emit_semantic_nullability_types"),
            custom_error_type,
            ..Default::default()
        },
        feature_flags: Arc::new(FeatureFlags {
            enable_fragment_aliases: FeatureFlag::Enabled,
            enable_catch_directive_transform: FeatureFlag::Enabled,
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
        // `normalization` ASTs are present unless we are processing an updatable query
        // In that case, `reader` ASTs are present.
        let op = programs
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
            print_provided_variables(&schema, typegen_operation, &project_config),
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
