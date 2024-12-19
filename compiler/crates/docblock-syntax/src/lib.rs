/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod ast;
mod errors;

use std::iter::Peekable;
use std::str::Chars;

pub use ast::DocblockAST;
pub use ast::DocblockField;
pub use ast::DocblockSection;
use common::Diagnostic;
use common::DiagnosticsResult;
use common::Location;
use common::SourceLocationKey;
use common::Span;
use common::TextSource;
use common::WithLocation;
use docblock_shared::ResolverSourceHash;
use errors::SyntaxError;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use serde::Deserialize;
use serde::Serialize;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DocblockSource(TextSource);

impl DocblockSource {
    pub fn new(text: impl Into<String>, line_index: usize, column_index: usize) -> Self {
        Self(TextSource {
            text: text.into(),
            line_index,
            column_index,
        })
    }

    pub fn text_source(&self) -> &TextSource {
        &self.0
    }

    pub fn to_text_source(self) -> TextSource {
        self.0
    }
}

type ParseResult<T> = Result<T, ()>;
/// Parses a docblock's contents.
///
/// Expects to be passed a string containing the _contents_ of a docblock (with
/// the leading `/*` and trailing `*/` already trimmed).
///
/// The structure of docblocks is not well defined. To avoid needing to be
/// opinionated, we use a relatively restricted definition for now:
///
/// * Docblocks consist of n "sections" where each section is either a key/value field, or free text.
/// * Each line must take the form: WHITE_SPACE* `*` WHITE_SPACE? LINE_CONTENT
/// * Free text sections may span one or more lines.
/// * Field sections are a _single line_ of the form: `@` FIELD_NAME WHITE_SPACE* VALUE
pub fn parse_docblock(
    source: &str,
    source_location: SourceLocationKey,
) -> DiagnosticsResult<DocblockAST> {
    DocblockParser::new(source, source_location).parse()
}

/**
 * Stateful parser that tries to model parsing of docblocks using recursive
 * descent.
 *
 * Parsing docblocks in this fashion is a bit awkward because it's not possible
 * to tokenize the input without being aware of context because we would like to
 * tokenize the input differently based upon what we are trying to parse.
 *
 * For example:
 * - Docblocks allow free text which might contain strings which should be
 *   considered tokens in other contexts.
 *
 * This is why languages designed to be expressible in a formal grammar delineate
 * strings with quotation marks.
 *
 * To account for this, we parse in a single pass, essentially treating each
 * character as a token. This allows us to easily interpret characters
 * differently in different contexts.
 */
struct DocblockParser<'a> {
    source_location: SourceLocationKey,
    chars: Peekable<Chars<'a>>,
    offset: u32,
    errors: Vec<Diagnostic>,
    in_progress_text: Option<SpanString>,
    sections: Vec<DocblockSection>,
    source_hash: ResolverSourceHash,
}

impl<'a> DocblockParser<'a> {
    fn new(source: &'a str, source_location: SourceLocationKey) -> Self {
        let chars = source.chars().peekable();
        Self {
            errors: Vec::new(),
            source_location,
            offset: 0,
            chars,
            in_progress_text: None,
            sections: Vec::new(),
            source_hash: ResolverSourceHash::new(source),
        }
    }

    fn parse(mut self) -> DiagnosticsResult<DocblockAST> {
        let start = self.offset;
        // By convention most docblocks start `/**`. Since we expect the leading
        // `/*` to be trimmed before it's passed to us, we want to remove the
        // second `*` and its trailing whitespace/newline.
        if self.peek_char(&'*') {
            self.next();
            self.consume_whitespace();
        }

        let result = self.parse_sections();
        let end = self.offset;

        if self.errors.is_empty() {
            result.expect("Expected no parse errors.");
            Ok(DocblockAST {
                sections: self.sections,
                location: Location::new(
                    self.source_location,
                    /*
                     * TODO(T113385544): Investigate if this is actually a bug in Span::to_range.
                     *
                     * I honestly don't fully understand this. We use
                     * self.offset as the end position for all other spans and
                     * they render perfectly. However, if we try to show a
                     * diagnostic of the full docblock (which we do when it's
                     * missing a field) it breaks Span::to_range because the end
                     * index is greater than the index of the last char that it
                     * iterates over, so it never sets an end_position and
                     * therefore shows the end position as 0,0 and VSCode
                     * renders an inverted diagnostic (a range starting at 0,0
                     * and ending at the start position.
                     *
                     * Anyway, subtracting 1 here solves the problem for now.
                     */
                    Span::new(start, end - 1),
                ),
                source_hash: self.source_hash,
            })
        } else {
            Err(self.errors)
        }
    }

    /// Loop over chars, consuming a line at a time.
    fn parse_sections(&mut self) -> ParseResult<()> {
        while self.chars.peek().is_some() {
            if !self.parse_margin()? {
                // We reached the end of the input
                break;
            }
            if self.peek_char(&'@') {
                self.next();

                // The fact the encountered a field tells us the previous
                // free text section is now complete.
                self.complete_previous_section();

                self.parse_field()?;
            } else {
                let free_text = self.parse_free_text_line()?;
                if let Some(previous) = self.in_progress_text.as_mut() {
                    previous.append_line(free_text)
                } else {
                    self.in_progress_text = Some(free_text);
                }
            }
        }
        self.complete_previous_section();
        Ok(())
    }

    /// Consume the `  * ` left margin, returning true/false indicating if we
    /// read the full margin without reaching the end of the input.
    fn parse_margin(&mut self) -> ParseResult<bool> {
        self.consume_whitespace();
        if self.chars.peek().is_none() {
            return Ok(false);
        }
        self.expect_str("*")?;
        if self.peek_char(&' ') {
            self.next();
        }

        if self.chars.peek().is_none() {
            return Ok(false);
        }
        Ok(true)
    }

    fn parse_field(&mut self) -> ParseResult<()> {
        let field_name = self.parse_field_name()?;
        self.consume_non_breaking_space();
        let text = self.parse_free_text_line()?;

        let field_value = if text.string.is_empty() {
            None
        } else {
            Some(text.to_with_location(self.source_location))
        };

        self.sections.push(DocblockSection::Field(DocblockField {
            field_name: field_name.to_with_location(self.source_location),
            field_value,
        }));

        Ok(())
    }

    fn parse_field_name(&mut self) -> ParseResult<SpanString> {
        let start = self.offset;
        let name = self.take_while(is_field_name_char);
        if name.is_empty() {
            self.errors.push(Diagnostic::error(
                SyntaxError::ExpectedFieldName,
                self.current_position(),
            ));
            return Err(());
        }
        let end = self.offset;
        Ok(SpanString::new(Span::new(start, end), name))
    }

    /// Read until the end of the line.
    fn parse_free_text_line(&mut self) -> ParseResult<SpanString> {
        let start = self.offset;
        let mut free_text: String = self.take_while(|c| c != &'\n');
        // Handle CRLF by stripping `\r` suffix.
        if free_text.ends_with('\r') {
            free_text.pop();
        }
        let end = self.offset;
        Ok(SpanString::new(Span::new(start, end), free_text))
    }

    fn complete_previous_section(&mut self) {
        if let Some(free_text) = &self.in_progress_text {
            if !free_text.string.is_empty() {
                self.sections.push(DocblockSection::FreeText(
                    free_text.to_with_location(self.source_location),
                ));
            }
            self.in_progress_text = None;
        }
    }

    fn consume_whitespace(&mut self) {
        self.next_while(|c| c.is_whitespace());
    }

    fn consume_non_breaking_space(&mut self) {
        self.next_while(|c| c == &' ' || c == &'\t');
    }

    fn expect_str(&mut self, expected: &'static str) -> ParseResult<()> {
        for c in expected.chars() {
            if self.peek_char(&c) {
                self.next();
            } else {
                self.errors.push(Diagnostic::error(
                    SyntaxError::ExpectedString { expected },
                    self.current_position(),
                ));
                return Err(());
            }
        }
        Ok(())
    }

    fn peek_char(&mut self, c: &char) -> bool {
        self.chars.peek() == Some(c)
    }

    fn next(&mut self) {
        self.chars.next();
        self.offset += 1; // Is this correct for unicode characters?
    }

    /// Advance over a string of characters matching predicate.
    fn next_while(&mut self, predicate: fn(&char) -> bool) {
        while let Some(c) = self.chars.peek() {
            if predicate(c) {
                self.next();
            } else {
                break;
            }
        }
    }

    /// Consume and return a string of characters matching predicate.
    fn take_while(&mut self, predicate: fn(&char) -> bool) -> String {
        let mut result = String::new();
        while let Some(c) = self.chars.peek() {
            if predicate(c) {
                result.push(self.chars.next().unwrap());
            } else {
                break;
            }
        }
        self.offset += result.len() as u32; // result.len() returns byte length
        result
    }

    fn current_position(&self) -> Location {
        Location::new(self.source_location, Span::new(self.offset, self.offset))
    }
}

fn is_field_name_char(c: &char) -> bool {
    c.is_alphanumeric() || c == &'_'
}

#[derive(Debug)]
struct SpanString {
    span: Span,
    string: String,
}

impl SpanString {
    fn new(span: Span, string: String) -> Self {
        Self { span, string }
    }
    fn append_line(&mut self, other: Self) {
        self.string.push('\n');
        self.string.push_str(&other.string);
        self.span.end = other.span.end;
    }
    fn to_with_location(&self, source_location: SourceLocationKey) -> WithLocation<StringKey> {
        WithLocation::from_span(source_location, self.span, self.string.clone().intern())
    }
}
