/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::path::Path;
use std::path::PathBuf;
use std::str::FromStr;
use std::sync::Arc;

use common::Diagnostic;
use common::ScalarName;
use common::SourceLocationKey;
use common::TextSource;
use extract_graphql::JavaScriptSourceFeature;
use fixture_tests::Fixture;
use fnv::FnvBuildHasher;
use graphql_cli::DiagnosticPrinter;
use graphql_syntax::ExecutableDefinition;
use graphql_test_helpers::ProjectFixture;
use indexmap::IndexMap;
use intern::string_key::Intern;
use intern::Lookup;
use relay_config::CustomScalarType;
use relay_config::CustomScalarTypeImport;
use relay_config::ProjectName;
use relay_docblock::extend_schema_with_resolver_type_system_definition;
use relay_docblock::DocblockIr;
use relay_docblock::ResolverFieldDocblockIr;
use relay_schema_generation::RelayResolverExtractor;
use relay_test_schema::get_test_schema_with_extensions;

type FnvIndexMap<K, V> = IndexMap<K, V, FnvBuildHasher>;

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let project_name = ProjectName::default();
    let mut schema = get_test_schema_with_extensions("");

    let mut errors: Vec<Diagnostic> = vec![];
    let project_fixture = ProjectFixture::deserialize(fixture.content);

    let custom_scalar_types = get_custom_scalar_types();
    let mut extractor = RelayResolverExtractor::new();
    if let Err(err) = extractor.set_custom_scalar_map(&custom_scalar_types) {
        errors.extend(err);
    }

    project_fixture.files().iter().for_each(|(path, content)| {
        let gql_operations = parse_document_definitions(content, path);
        if let Err(err) = extractor.parse_document(
            content,
            path.to_string_lossy().as_ref(),
            Some(&gql_operations),
        ) {
            errors.extend(err);
        }
    });

    let out = match extractor.resolve() {
        Ok((objects, fields)) => objects
            .into_iter()
            .chain(
                fields.into_iter().map(|field| {
                    DocblockIr::Field(ResolverFieldDocblockIr::TerseRelayResolver(field))
                }),
            )
            .map(|ir| {
                // Extend schema with the IR and print SDL
                let schema_document =
                    ir.clone()
                        .to_graphql_schema_ast(project_name, &schema, &Default::default())?;
                for definition in &schema_document.definitions {
                    extend_schema_with_resolver_type_system_definition(
                        definition.clone(),
                        Arc::get_mut(&mut schema)
                            .expect("Expected to be able to get mutable reference to schema"),
                        schema_document.location,
                    )?;
                }

                let sdl = ir
                    .clone()
                    .to_sdl_string(project_name, &schema, &Default::default())?;

                Ok(format!("{:#?}\n{}", &ir, sdl))
            })
            .collect::<Vec<Result<_, Vec<Diagnostic>>>>(),
        Err(err) => {
            errors.extend(err);
            Default::default()
        }
    };

    let mut ok_out = vec![];

    for o in out.into_iter() {
        match o {
            Err(errs) => {
                errors.extend(errs);
            }
            Ok(o) => {
                ok_out.push(o);
            }
        }
    }

    let err = diagnostics_to_sorted_string(&project_fixture, &errors);

    ok_out.sort();
    Ok(ok_out.join("\n\n") + "\n\n" + &err)
}

fn parse_document_definitions(content: &str, path: &Path) -> Vec<ExecutableDefinition> {
    let features = extract_graphql::extract(content);
    features
        .into_iter()
        .enumerate()
        .filter_map(|(i, feature)| {
            if let JavaScriptSourceFeature::GraphQL(graphql_source) = feature {
                Some(
                    graphql_syntax::parse_executable(
                        &graphql_source.to_text_source().text,
                        SourceLocationKey::Embedded {
                            path: path.to_str().unwrap().intern(),
                            index: i as u16,
                        },
                    )
                    .unwrap()
                    .definitions,
                )
            } else {
                None
            }
        })
        .flatten()
        .collect()
}

fn diagnostics_to_sorted_string(fixtures: &ProjectFixture, diagnostics: &[Diagnostic]) -> String {
    let printer = DiagnosticPrinter::new(|source_location| match source_location {
        SourceLocationKey::Standalone { path } => {
            let source = fixtures.files().get(Path::new(path.lookup())).unwrap();
            Some(TextSource::from_whole_document(source))
        }
        SourceLocationKey::Embedded { path, index } => {
            let source = fixtures.files().get(Path::new(path.lookup())).unwrap();
            let query = extract_graphql::extract(source)[index as usize]
                .text_source()
                .clone();
            Some(query)
        }
        SourceLocationKey::Generated => unreachable!(),
    });
    let mut printed = diagnostics
        .iter()
        .map(|diagnostic| printer.diagnostic_to_string(diagnostic))
        .collect::<Vec<_>>();
    printed.sort();
    printed.join("\n\n")
}

fn get_custom_scalar_types() -> FnvIndexMap<ScalarName, CustomScalarType> {
    let mut custom_scalar_map: FnvIndexMap<ScalarName, CustomScalarType> = FnvIndexMap::default();
    custom_scalar_map.insert(
        ScalarName("JSON".intern()),
        CustomScalarType::Path(CustomScalarTypeImport {
            name: "CustomJSON".intern(),
            path: PathBuf::from_str("CustomScalars").unwrap(),
        }),
    );
    custom_scalar_map.insert(
        ScalarName("GlobalID".intern()),
        CustomScalarType::Name("CustomGlobalID".intern()),
    );
    custom_scalar_map
}
