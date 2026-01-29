/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::path::Path;

use common::DiagnosticsResult;
use common::SourceLocationKey;
use docblock_syntax::DocblockAST;
use docblock_syntax::parse_docblock;
use errors::try_all;
use relay_docblock::resolver_maybe_defining_type;

use crate::file_source::LocatedDocblockSource;
pub struct DocblockASTs {
    pub types: Vec<DocblockAST>,
    pub fields: Vec<DocblockAST>,
}

pub fn parse_docblock_asts_from_sources(
    file_path: &Path,
    docblock_sources: &[LocatedDocblockSource],
) -> DiagnosticsResult<DocblockASTs> {
    let (types, fields) = try_all(
        docblock_sources
            .iter()
            .map(|docblock_source| parse_source_to_ast(file_path, docblock_source)),
    )?
    .into_iter()
    .partition(resolver_maybe_defining_type);

    Ok(DocblockASTs { types, fields })
}

fn parse_source_to_ast(
    file_path: &Path,
    docblock_source: &LocatedDocblockSource,
) -> DiagnosticsResult<DocblockAST> {
    let source_location =
        SourceLocationKey::embedded(file_path.to_str().unwrap(), docblock_source.index);

    parse_docblock(
        &docblock_source.docblock_source.text_source().text,
        source_location,
    )
}
