/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::path::PathBuf;

use fnv::FnvBuildHasher;
use indexmap::IndexMap;
use relay_typegen::TypegenLanguage;
use watchman_client::prelude::*;

use crate::compiler_state::ProjectSet;
use crate::config::Config;

type FnvIndexMap<K, V> = IndexMap<K, V, FnvBuildHasher>;

pub fn get_watchman_expr(config: &Config) -> Expr {
    let mut sources_conditions = vec![expr_any(get_sources_dir_exprs(config, &config.sources))];
    // not excluded by any glob
    if !config.excludes.is_empty() {
        sources_conditions.push(Expr::Not(Box::new(expr_any(
            config
                .excludes
                .iter()
                .map(|item| {
                    Expr::Match(MatchTerm {
                        glob: item.into(),
                        wholename: true,
                        ..Default::default()
                    })
                })
                .collect(),
        ))));
    }
    let sources_expr = Expr::All(sources_conditions);

    let mut expressions = vec![sources_expr];

    let generated_sources_dir_exprs = get_sources_dir_exprs(config, &config.generated_sources);
    if !generated_sources_dir_exprs.is_empty() {
        expressions.push(expr_any(generated_sources_dir_exprs));
    }

    let output_dir_paths = config.get_output_dir_paths();
    if !output_dir_paths.is_empty() {
        let output_dir_expr = expr_files_in_dirs(output_dir_paths);
        expressions.push(output_dir_expr);
    }

    let schema_file_paths = config.get_schema_file_paths();
    if !schema_file_paths.is_empty() {
        let schema_file_expr = Expr::Name(NameTerm {
            paths: config.get_schema_file_paths(),
            wholename: true,
        });
        expressions.push(schema_file_expr);
    }

    let schema_dir_paths = config.get_schema_dir_paths();
    if !schema_dir_paths.is_empty() {
        let schema_dir_expr = expr_graphql_files_in_dirs(schema_dir_paths);
        expressions.push(schema_dir_expr);
    }

    let extension_roots = config.get_extension_roots();
    if !extension_roots.is_empty() {
        let extensions_expr = expr_graphql_files_in_dirs(extension_roots);
        expressions.push(extensions_expr);
    }

    Expr::All(vec![
        // we generally only care about regular files
        Expr::FileType(FileType::Regular),
        Expr::Any(expressions),
    ])
}

fn get_sources_dir_exprs(
    config: &Config,
    paths_to_project: &FnvIndexMap<PathBuf, ProjectSet>,
) -> Vec<Expr> {
    paths_to_project
        .iter()
        .flat_map(|(path, project_set)| {
            project_set
                .iter()
                .map(|name| (path, &config.projects[name]))
                .collect::<Vec<_>>()
        })
        .map(|(path, project)| {
            Expr::All(vec![
                // In the related source root.
                Expr::DirName(DirNameTerm {
                    path: path.clone(),
                    depth: None,
                }),
                // Match file extensions
                get_project_file_ext_expr(project.typegen_config.language),
            ])
        })
        .collect()
}

fn get_project_file_ext_expr(typegen_language: TypegenLanguage) -> Expr {
    // Ending in *.js(x) or *.ts(x) depending on the project language.
    Expr::Suffix(match &typegen_language {
        TypegenLanguage::Flow | TypegenLanguage::JavaScript => {
            vec![PathBuf::from("js"), PathBuf::from("jsx")]
        }
        TypegenLanguage::TypeScript => {
            vec![
                PathBuf::from("js"),
                PathBuf::from("jsx"),
                PathBuf::from("ts"),
                PathBuf::from("tsx"),
            ]
        }
    })
}

fn expr_files_in_dirs(roots: Vec<PathBuf>) -> Expr {
    expr_any(
        roots
            .into_iter()
            .map(|path| Expr::DirName(DirNameTerm { path, depth: None }))
            .collect(),
    )
}

fn expr_graphql_files_in_dirs(roots: Vec<PathBuf>) -> Expr {
    Expr::All(vec![
        // ending in *.graphql
        Expr::Suffix(vec!["graphql".into(), "gql".into()]),
        // in one of the extension directories
        expr_files_in_dirs(roots),
    ])
}

/// Helper to create an `anyof` expression if multiple items are passed or just
/// return the expression for a single item input `Vec`.
/// Panics for empty expressions. These are not valid in Watchman. We could
/// return `Expr::false`, but for that case the caller should just skip this
/// expression.
fn expr_any(expressions: Vec<Expr>) -> Expr {
    match expressions.len() {
        0 => panic!("expr_any called with empty expressions, this is an invalid query."),
        1 => expressions.into_iter().next().unwrap(),
        _ => Expr::Any(expressions),
    }
}
