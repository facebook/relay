/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::fs;
use std::path::Path;

use common::SourceLocationKey;
use docblock_syntax::DocblockSource;
use extract_graphql::JavaScriptSourceFeature;
use graphql_syntax::GraphQLSource;
use intern::Lookup;
use serde::Deserialize;
use serde::Serialize;

use super::File;
use super::FileSourceResult;
use super::read_file_to_string;
use crate::errors::Result;
use crate::file_source::Config;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LocatedGraphQLSource {
    pub index: usize,
    pub graphql_source: GraphQLSource,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LocatedDocblockSource {
    pub index: usize,
    pub docblock_source: DocblockSource,
}

#[derive(Default)]
pub struct LocatedJavascriptSourceFeatures {
    pub graphql_sources: Vec<LocatedGraphQLSource>,
    pub docblock_sources: Vec<LocatedDocblockSource>,
    pub full_source: String,
}

pub trait SourceReader {
    fn read_file_to_string(&self, path: &Path) -> std::io::Result<String>;
}

/// Default implementation of the file source reader
/// that is directly using `fs` operations to read the content of the file
pub struct FsSourceReader;

impl SourceReader for FsSourceReader {
    fn read_file_to_string(&self, path: &Path) -> std::io::Result<String> {
        fs::read_to_string(path)
    }
}

/// Reads and extracts `graphql` tagged literals and Relay-specific docblocks
/// from a JavaScript file.
pub fn extract_javascript_features_from_file(
    file_source_result: &FileSourceResult,
    file: &File,
    config: &Config,
) -> Result<LocatedJavascriptSourceFeatures> {
    let contents = read_file_to_string(file_source_result, file)?;
    let features = extract_graphql::extract(&contents);
    let mut graphql_sources = Vec::new();
    let mut docblock_sources = Vec::new();
    let extract_full_source_for_docblock = match &config.should_extract_full_source {
        Some(f) => f(&contents),
        None => false,
    };

    for (index, feature) in features.into_iter().enumerate() {
        match feature {
            JavaScriptSourceFeature::GraphQL(graphql_source) => {
                graphql_sources.push(LocatedGraphQLSource {
                    graphql_source,
                    index,
                })
            }
            JavaScriptSourceFeature::Docblock(docblock_source) => {
                if !extract_full_source_for_docblock {
                    docblock_sources.push(LocatedDocblockSource {
                        docblock_source,
                        index,
                    })
                }
            }
        }
    }

    Ok(LocatedJavascriptSourceFeatures {
        graphql_sources,
        docblock_sources,
        full_source: if extract_full_source_for_docblock {
            contents
        } else {
            String::new()
        },
    })
}

pub fn source_for_location(
    root_dir: &Path,
    source_location: SourceLocationKey,
    source_reader: &dyn SourceReader,
) -> Option<JavaScriptSourceFeature> {
    match source_location {
        SourceLocationKey::Embedded { path, index } => {
            let absolute_path = root_dir.join(path.lookup());
            let contents = source_reader.read_file_to_string(&absolute_path).ok()?;
            let file_sources = extract_graphql::extract(&contents);
            file_sources.into_iter().nth(index.into())
        }
        SourceLocationKey::Standalone { path } => {
            let absolute_path = root_dir.join(path.lookup());
            Some(JavaScriptSourceFeature::GraphQL(GraphQLSource::new(
                source_reader.read_file_to_string(&absolute_path).ok()?,
                0,
                0,
            )))
        }
        SourceLocationKey::Generated => None,
    }
}
