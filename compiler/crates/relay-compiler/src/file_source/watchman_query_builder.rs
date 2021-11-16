/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::compiler_state::SourceSet;
use crate::config::{Config, SchemaLocation};
use relay_typegen::TypegenLanguage;
use std::path::PathBuf;
use watchman_client::prelude::*;

pub fn get_watchman_expr(config: &Config) -> Expr {
    let mut sources_conditions = vec![expr_any(
        config
            .sources
            .iter()
            .flat_map(|(path, name)| match name {
                SourceSet::SourceSetName(name) => vec![(path, &config.projects[name])],
                SourceSet::SourceSetNames(names) => names
                    .iter()
                    .map(|name| (path, &config.projects[name]))
                    .collect::<Vec<_>>(),
            })
            .map(|(path, project)| {
                Expr::All(vec![
                    // Ending in *.js(x) or *.ts(x) depending on the project language.
                    Expr::Suffix(match &project.typegen_config.language {
                        TypegenLanguage::Flow => vec![PathBuf::from("js"), PathBuf::from("jsx")],
                        TypegenLanguage::TypeScript => {
                            vec![PathBuf::from("ts"), PathBuf::from("tsx")]
                        }
                    }),
                    // In the related source root.
                    Expr::DirName(DirNameTerm {
                        path: path.clone(),
                        depth: None,
                    }),
                ])
            })
            .collect(),
    )];
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

    let output_dir_paths = get_output_dir_paths(config);
    if !output_dir_paths.is_empty() {
        let output_dir_expr = expr_files_in_dirs(output_dir_paths);
        expressions.push(output_dir_expr);
    }

    let schema_file_paths = get_schema_file_paths(config);
    if !schema_file_paths.is_empty() {
        let schema_file_expr = Expr::Name(NameTerm {
            paths: get_schema_file_paths(config),
            wholename: true,
        });
        expressions.push(schema_file_expr);
    }

    let schema_dir_paths = get_schema_dir_paths(config);
    if !schema_dir_paths.is_empty() {
        let schema_dir_expr = expr_graphql_files_in_dirs(schema_dir_paths);
        expressions.push(schema_dir_expr);
    }

    let extension_roots = get_extension_roots(config);
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

/// Compute all root paths that we need to query Watchman with. All files
/// relevant to the compiler should be in these directories.
pub fn get_all_roots(config: &Config) -> Vec<PathBuf> {
    let source_roots = get_source_roots(config);
    let output_roots = get_output_dir_paths(config);
    let extension_roots = get_extension_roots(config);
    let schema_file_roots = get_schema_file_roots(config);
    let schema_dir_roots = get_schema_dir_paths(config);
    unify_roots(
        source_roots
            .into_iter()
            .chain(output_roots)
            .chain(extension_roots)
            .chain(schema_file_roots)
            .chain(schema_dir_roots)
            .collect(),
    )
}

/// Returns all root directories of JS source files for the config.
fn get_source_roots(config: &Config) -> Vec<PathBuf> {
    config.sources.keys().cloned().collect()
}

/// Returns all root directories of GraphQL schema extension files for the
/// config.
fn get_extension_roots(config: &Config) -> Vec<PathBuf> {
    config
        .projects
        .values()
        .flat_map(|project_config| project_config.schema_extensions.iter().cloned())
        .collect()
}

/// Returns all output and extra artifact output directories for the config.
fn get_output_dir_paths(config: &Config) -> Vec<PathBuf> {
    let output_dirs = config
        .projects
        .values()
        .filter_map(|project_config| project_config.output.clone());

    let extra_artifact_output_dirs = config
        .projects
        .values()
        .filter_map(|project_config| project_config.extra_artifacts_output.clone());

    output_dirs.chain(extra_artifact_output_dirs).collect()
}

/// Returns all paths that contain GraphQL schema files for the config.
fn get_schema_file_paths(config: &Config) -> Vec<PathBuf> {
    config
        .projects
        .values()
        .filter_map(|project_config| match &project_config.schema_location {
            SchemaLocation::File(schema_file) => Some(schema_file.clone()),
            SchemaLocation::Directory(_) => None,
        })
        .collect()
}

/// Returns all GraphQL schema directories for the config.
fn get_schema_dir_paths(config: &Config) -> Vec<PathBuf> {
    config
        .projects
        .values()
        .filter_map(|project_config| match &project_config.schema_location {
            SchemaLocation::File(_) => None,
            SchemaLocation::Directory(schema_dir) => Some(schema_dir.clone()),
        })
        .collect()
}

/// Returns root directories that contain GraphQL schema files.
fn get_schema_file_roots(config: &Config) -> impl Iterator<Item = PathBuf> {
    get_schema_file_paths(config)
        .into_iter()
        .map(|schema_path| {
            schema_path
                .parent()
                .expect("A schema in the project root directory is currently not supported.")
                .to_owned()
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
        Expr::Suffix(vec!["graphql".into()]),
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

/// Finds the roots of a set of paths. This filters any paths
/// that are a subdirectory of other paths in the input.
fn unify_roots(mut paths: Vec<PathBuf>) -> Vec<PathBuf> {
    paths.sort();
    let mut roots = Vec::new();
    for path in paths {
        match roots.last() {
            Some(prev) if path.starts_with(&prev) => {
                // skip
            }
            _ => {
                roots.push(path);
            }
        }
    }
    roots
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_unify_roots() {
        assert_eq!(unify_roots(vec![]).len(), 0);
        assert_eq!(
            unify_roots(vec!["Apps".into(), "Libraries".into()]),
            &[PathBuf::from("Apps"), PathBuf::from("Libraries")]
        );
        assert_eq!(
            unify_roots(vec!["Apps".into(), "Apps/Foo".into()]),
            &[PathBuf::from("Apps")]
        );
        assert_eq!(
            unify_roots(vec!["Apps/Foo".into(), "Apps".into()]),
            &[PathBuf::from("Apps")]
        );
        assert_eq!(
            unify_roots(vec!["Foo".into(), "Foo2".into()]),
            &[PathBuf::from("Foo"), PathBuf::from("Foo2"),]
        );
    }
}
