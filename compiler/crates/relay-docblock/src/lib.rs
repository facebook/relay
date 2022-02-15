/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod errors;
mod ir;

use errors::ParseError;

use common::DiagnosticsResult;
use common::{Diagnostic, Location};
use docblock_syntax::DocblockAST;
use ir::DocblockIr;

pub fn parse_docblock_ast(_ast: &DocblockAST) -> DiagnosticsResult<DocblockIr> {
    if true {
        Err(vec![Diagnostic::error(
            ParseError::Unimplemented,
            Location::generated(),
        )])
    } else {
        Ok(DocblockIr::RelayResolver)
    }
}
