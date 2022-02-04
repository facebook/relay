/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod errors;

use common::{Diagnostic, DiagnosticsResult, Location, SourceLocationKey, Span};
use errors::SyntaxError;
use intern::string_key::{Intern, StringKey};

#[derive(Debug)]
pub struct DocblockAST {
    pub description: Option<StringKey>,
}

/// Parses a docblock.
pub fn parse_docblock(
    source: &str,
    source_location: SourceLocationKey,
) -> DiagnosticsResult<DocblockAST> {
    let parser = DocblockParser::new(source, source_location);
    parser.parse()
}

struct DocblockParser<'a> {
    source: &'a str,
    source_location: SourceLocationKey,
    errors: Vec<Diagnostic>,
}

impl<'a> DocblockParser<'a> {
    fn new(source: &'a str, source_location: SourceLocationKey) -> Self {
        Self {
            source,
            errors: Vec::new(),
            source_location,
        }
    }

    fn parse(mut self) -> DiagnosticsResult<DocblockAST> {
        // Dummy implementation...
        if self.source != "/**\n * Hello World\n */\n" {
            self.errors.push(Diagnostic::error(
                SyntaxError::PlaceholderError,
                Location::new(self.source_location, Span::new(0, 0)),
            ));
        }

        if self.errors.is_empty() {
            Ok(DocblockAST {
                description: Some("Hello World".intern()),
            })
        } else {
            Err(self.errors)
        }
    }
}
