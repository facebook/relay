/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use colored::*;
use common::Span;
use std::fmt::Write;

#[derive(Default)]
pub struct SourcePrinter;

const PRINT_WHITESPACE: bool = false;

impl SourcePrinter {
    pub fn write_span<W: Write>(
        &self,
        writer: &mut W,
        span: &Span,
        source: &str,
    ) -> std::fmt::Result {
        let start_char_index = span.start as usize;
        let end_char_index = span.end as usize;

        let start_byte_index =
            if let Some((byte_index, _)) = source.char_indices().nth(start_char_index) {
                byte_index
            } else {
                return write!(
                    writer,
                    "Internal error: Unable to print source, start index ({}) out of range.",
                    start_char_index
                );
            };
        let end_byte_index = source
            .char_indices()
            .nth(end_char_index)
            .map_or_else(|| source.len(), |(byte_index, _)| byte_index);

        let mut line_end_byte_indices = Vec::new();
        for (byte_index, chr) in source.char_indices() {
            if chr == '\n' {
                line_end_byte_indices.push(byte_index + 1)
            }
        }
        if source.ends_with('\n') {
            line_end_byte_indices.pop();
        }

        let byte_index_to_line_index = |byte_index: usize| -> usize {
            line_end_byte_indices
                .binary_search(&byte_index)
                .unwrap_or_else(|x| x)
        };

        let line_index_to_byte_range = |line_index: usize| {
            let end = line_end_byte_indices
                .get(line_index)
                .cloned()
                .unwrap_or_else(|| source.len());
            let start = if line_index == 0 {
                0
            } else {
                line_end_byte_indices
                    .get(line_index - 1)
                    .cloned()
                    .unwrap_or_else(|| source.len())
            };
            start..end
        };

        const CONTEXT: usize = 1;

        let first_line_index = byte_index_to_line_index(start_char_index);
        let last_line_index = byte_index_to_line_index(end_char_index);

        let first_printed_line_index = first_line_index.saturating_sub(CONTEXT);
        let last_printed_line_index = (last_line_index + CONTEXT).min(line_end_byte_indices.len());

        let mut currently_hightlighted = false;
        for line_index in first_printed_line_index..=last_printed_line_index {
            write!(
                writer,
                "{}",
                format!(" {:>4} \u{2502} ", line_index + 1).bold()
            )
            .unwrap();
            let mut something_highlighted_on_line = false;
            let mut marker = String::new();
            for byte_index in line_index_to_byte_range(line_index) {
                if byte_index == start_byte_index {
                    currently_hightlighted = true
                } else if byte_index == end_byte_index {
                    currently_hightlighted = false;
                }

                let chr = match source.char_indices().find(|(idx, _)| *idx == byte_index) {
                    Some((chr_index, '\n')) => {
                        if PRINT_WHITESPACE {
                            '␤'
                        } else {
                            // This prints a white-space if the \n is the first character in the Span.
                            if chr_index == start_char_index {
                                ' '
                            } else {
                                continue;
                            }
                        }
                    }
                    Some((chr_index, '\r')) => {
                        if PRINT_WHITESPACE {
                            '␍'
                        } else {
                            // This prints a white-space if the \r is the first character in the Span.
                            if chr_index == start_char_index {
                                ' '
                            } else {
                                continue;
                            }
                        }
                    }
                    Some((_, c)) => c,
                    None => continue,
                };

                if currently_hightlighted {
                    write!(writer, "{}", chr.to_string().red()).unwrap();
                    marker.push('^');
                    something_highlighted_on_line = true;
                    if start_byte_index == end_byte_index {
                        currently_hightlighted = false;
                    }
                } else {
                    write!(writer, "{}", chr).unwrap();
                    if !something_highlighted_on_line {
                        // TODO should push 2 spaces for emojis, unicode-width crate might help
                        marker.push(' ');
                    }
                }
            }
            writeln!(writer)?;
            if something_highlighted_on_line {
                writeln!(writer, "      \u{2502} {}", marker.red()).unwrap();
            }
        }

        Ok(())
    }
}
