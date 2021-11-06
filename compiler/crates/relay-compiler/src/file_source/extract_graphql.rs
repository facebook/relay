/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::{read_file_to_string, File, FileSourceResult};
use crate::errors::Result;
use common::SourceLocationKey;
use graphql_syntax::GraphQLSource;
use std::{
    fs,
    path::{Path, PathBuf},
};

pub trait SourceReader {
    fn read_file_to_string(&self, path: &PathBuf) -> std::io::Result<String>;
}

/// Default implementation of the file source reader
/// that is directly using `fs` operations to read the content of the file
pub struct FsSourceReader;

impl SourceReader for FsSourceReader {
    fn read_file_to_string(&self, path: &PathBuf) -> std::io::Result<String> {
        fs::read_to_string(path)
    }
}

/// Reads and extracts `graphql` tagged literals from a file.
pub fn extract_graphql_strings_from_file(
    file_source_result: &FileSourceResult,
    file: &File,
) -> Result<Vec<GraphQLSource>> {
    let contents = read_file_to_string(file_source_result, file)?;
    Ok(extract_graphql::parse_chunks(&contents))
}

pub fn source_for_location(
    root_dir: &Path,
    source_location: SourceLocationKey,
    source_reader: &dyn SourceReader,
) -> Option<GraphQLSource> {
    match source_location {
        SourceLocationKey::Embedded { path, index } => {
            let absolute_path = root_dir.join(path.lookup());
            let contents = source_reader.read_file_to_string(&absolute_path).ok()?;
            let file_sources = extract_graphql::parse_chunks(&contents);
            file_sources.into_iter().nth(index.try_into().unwrap())
        }
        SourceLocationKey::Standalone { path } => {
            let absolute_path = root_dir.join(path.lookup());
            Some(GraphQLSource {
                text: source_reader.read_file_to_string(&absolute_path).ok()?,
                line_index: 0,
                column_index: 0,
            })
        }
        SourceLocationKey::Generated => None,
    }
}
