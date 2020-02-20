/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::errors::{Error, Result};
use super::file_group::FileCategorizer;
use super::file_group::FileGroup;
use crate::compiler_state::{CompilerState, SourceSet, SourceSetName};
use crate::config::{Config, SchemaLocation};
use common::Timer;
use extract_graphql;
use rayon::prelude::*;
use serde::Deserialize;
use std::collections::HashMap;
use std::path::PathBuf;
use watchman_client::prelude::*;

pub struct GraphQLFinder<'config> {
    categorizer: FileCategorizer,
    client: Client,
    config: &'config Config,
    resolved_root: ResolvedRoot,
}
impl<'config> GraphQLFinder<'config> {
    pub async fn connect(config: &'config Config) -> Result<GraphQLFinder<'config>> {
        let connect_timer = Timer::new("connect");
        let client = Connector::new().connect().await?;
        let canonical_root = CanonicalPath::canonicalize(&config.root_dir).map_err(|err| {
            Error::CanonicalizeRoot {
                root: config.root_dir.clone(),
                source: err,
            }
        })?;
        let resolved_root = client.resolve_root(canonical_root).await?;
        connect_timer.stop();

        let categorizer = FileCategorizer::from_config(&config);

        Ok(Self {
            categorizer,
            client,
            config,
            resolved_root,
        })
    }

    /// Executes a point query (as opposed to a subscription) to find all files
    /// to compile and creates a CompilerState.
    pub async fn query(&self) -> Result<CompilerState> {
        let roots = get_all_roots(&self.config);
        let expression = get_watchman_expr(&self.config);

        let query_timer = Timer::new("query");
        let query_result = self
            .client
            .query::<WatchmanFile>(
                &self.resolved_root,
                QueryRequestCommon {
                    expression: Some(expression),
                    path: Some(
                        roots
                            .into_iter()
                            .map(PathGeneratorElement::RecursivePath)
                            .collect(),
                    ),
                    ..Default::default()
                },
            )
            .await?;
        query_timer.stop();

        let files = query_result.files.ok_or_else(|| Error::EmptyQueryResult)?;
        let categorized = self.categorize_files(files);

        let mut schemas = HashMap::new();

        let mut extensions = HashMap::new();

        let mut source_sets: HashMap<SourceSetName, SourceSet> = HashMap::new();
        let artifacts = HashMap::new();

        for (category, files) in categorized {
            match category {
                FileGroup::Source { source_set } => {
                    let extract_timer_label = format!("extract {}", source_set.0);
                    let extract_timer = Timer::new(&extract_timer_label);
                    let definitions = files
                        .into_par_iter()
                        .filter_map(|file| match self.extract_from_file(&file) {
                            Ok(definitions) if definitions.is_empty() => None,
                            Ok(definitions) => Some(Ok(((*file.name).to_owned(), definitions))),
                            Err(err) => Some(Err(err)),
                        })
                        .collect::<Result<HashMap<PathBuf, Vec<String>>>>()?;
                    source_sets.insert(source_set, SourceSet(definitions));
                    extract_timer.stop();
                }
                FileGroup::Schema { project_name } => {
                    let schema_sources = files
                        .iter()
                        .map(|file| self.read_to_string(file))
                        .collect::<Result<Vec<String>>>()?;
                    schemas.insert(project_name, schema_sources);
                }
                FileGroup::Extension { project_name } => {
                    let extension_sources: Vec<String> = files
                        .iter()
                        .map(|file| self.read_to_string(file))
                        .collect::<Result<Vec<String>>>()?;
                    extensions.insert(project_name, extension_sources);
                }
                FileGroup::Generated => {
                    // TODO
                }
            }
        }

        Ok(CompilerState {
            artifacts,
            extensions,
            schemas,
            source_sets,
        })
    }

    /// The watchman query returns a list of files, but for the compiler we
    /// need to categorize these files into multiple groups of files like
    /// schema files, extensions and sources by their SourceSet.
    ///
    /// See `FileGroup` for all groups of files.
    fn categorize_files(&self, files: Vec<WatchmanFile>) -> HashMap<FileGroup, Vec<WatchmanFile>> {
        let categorize_timer = Timer::new("categorize");
        let mut categorized = HashMap::new();
        for file in files {
            categorized
                .entry(self.categorizer.categorize(&file.name))
                .or_insert_with(Vec::new)
                .push(file);
        }
        categorize_timer.stop();
        categorized
    }

    /// Reads and extracts `graphql` tagged literals from a file.
    fn extract_from_file(&self, file: &WatchmanFile) -> Result<Vec<String>> {
        let contents = self.read_to_string(file)?;
        let definitions =
            extract_graphql::parse_chunks(&contents).map_err(|err| Error::Syntax { error: err })?;
        Ok(definitions
            .iter()
            .map(|chunk| (*chunk).to_string())
            .collect())
    }

    /// Reads a file into a string.
    fn read_to_string(&self, file: &WatchmanFile) -> Result<String> {
        let mut absolute_path = self.resolved_root.path();
        absolute_path.push(&*file.name);
        std::fs::read_to_string(&absolute_path).map_err(|err| Error::FileRead {
            file: absolute_path.clone(),
            source: err,
        })
    }
}

query_result_type! {
    struct WatchmanFile {
        name: NameField,
        exists: ExistsField,
        hash: ContentSha1HexField,
    }
}

fn get_watchman_expr(config: &Config) -> Expr {
    let mut sources_conditions = vec![
        // ending in *.js
        Expr::Suffix(vec!["js".into()]),
        // in one of the source roots
        expr_any(
            get_source_roots(&config)
                .into_iter()
                .map(|path| Expr::DirName(DirNameTerm { path, depth: None }))
                .collect(),
        ),
    ];
    // not blacklisted by any glob
    if !config.blacklist.is_empty() {
        sources_conditions.push(Expr::Not(Box::new(expr_any(
            config
                .blacklist
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

    let schema_file_paths = get_schema_file_paths(&config);
    if !schema_file_paths.is_empty() {
        let schema_file_expr = Expr::Name(NameTerm {
            paths: get_schema_file_paths(&config),
            wholename: true,
        });
        expressions.push(schema_file_expr);
    }

    let schema_dir_paths = get_schema_dir_paths(&config);
    if !schema_dir_paths.is_empty() {
        let schema_dir_expr = expr_graphql_files_in_dirs(schema_dir_paths);
        expressions.push(schema_dir_expr);
    }

    let extension_roots = get_extension_roots(&config);
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
fn get_all_roots(config: &Config) -> Vec<PathBuf> {
    let source_roots = get_source_roots(config);
    let extension_roots = get_extension_roots(config);
    let schema_file_roots = get_schema_file_roots(config);
    let schema_dir_roots = get_schema_dir_paths(config);
    unify_roots(
        source_roots
            .into_iter()
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
        .flat_map(|project_config| project_config.extensions.iter().cloned())
        .collect()
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

fn expr_graphql_files_in_dirs(roots: Vec<PathBuf>) -> Expr {
    Expr::All(vec![
        // ending in *.graphql
        Expr::Suffix(vec!["graphql".into()]),
        // in one of the extension directories
        expr_any(
            roots
                .into_iter()
                .map(|path| Expr::DirName(DirNameTerm { path, depth: None }))
                .collect(),
        ),
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
