/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::{read_to_string, WatchmanFile};
use crate::errors::{Error, Result};
use common::SourceLocationKey;
use graphql_syntax::GraphQLSource;
use std::{fs, path::Path};
use watchman_client::prelude::*;

/// Reads and extracts `graphql` tagged literals from a file.
pub fn extract_graphql_strings_from_file(
    resolved_root: &ResolvedRoot,
    file: &WatchmanFile,
) -> Result<Vec<GraphQLSource>> {
    let contents = read_to_string(resolved_root, file)?;
    extract_graphql_strings_from_string(&contents)
}

pub fn source_for_location(
    root_dir: &Path,
    source_location: SourceLocationKey,
) -> Option<GraphQLSource> {
    match source_location {
        SourceLocationKey::Embedded { path, index } => {
            let absolute_path = root_dir.join(path.lookup());
            let contents = fs::read_to_string(&absolute_path).ok()?;
            let file_sources = extract_graphql_strings_from_string(&contents).ok()?;
            file_sources.into_iter().nth(index)
        }
        SourceLocationKey::Standalone { path } => {
            let absolute_path = root_dir.join(path.lookup());
            Some(GraphQLSource {
                text: fs::read_to_string(&absolute_path).ok()?,
                line_index: 0,
                column_index: 0,
            })
        }
        SourceLocationKey::Generated => None,
    }
}

/// Reads and extracts `graphql` tagged literals from a string.
fn extract_graphql_strings_from_string(contents: &str) -> Result<Vec<GraphQLSource>> {
    extract_graphql::parse_chunks(&contents).map_err(|err| Error::Syntax { error: err })
}
