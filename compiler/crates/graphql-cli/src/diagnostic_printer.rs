/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::fmt::Write;

use colored::Colorize;
use common::Diagnostic;
use common::Location;
use common::SourceLocationKey;
use common::TextSource;

use crate::SourcePrinter;
use crate::Style;
use crate::Styles;

pub struct DiagnosticPrinter<T: Sources> {
    sources: T,
}

impl<TSources: Sources> DiagnosticPrinter<TSources> {
    pub fn new(sources: TSources) -> Self {
        Self { sources }
    }

    pub fn diagnostics_to_string(&self, diagnostics: &[Diagnostic]) -> String {
        diagnostics
            .iter()
            .map(|d| self.diagnostic_to_string(d))
            .collect::<Vec<String>>()
            .join("\n")
    }

    pub fn diagnostic_to_string(&self, diagnostic: &Diagnostic) -> String {
        let mut printed = String::new();
        self.write_diagnostic(&mut printed, diagnostic).unwrap();
        printed
    }

    pub fn write_diagnostic<W: Write>(
        &self,
        writer: &mut W,
        diagnostic: &Diagnostic,
    ) -> std::fmt::Result {
        let (message, text_color): (String, Style) = match diagnostic.severity() {
            common::DiagnosticSeverity::ERROR => {
                (format!("✖︎ {}", diagnostic.message()), Styles::red)
            }
            common::DiagnosticSeverity::WARNING => {
                (format!("︎⚠ {}", diagnostic.message()), Styles::yellow)
            }
            common::DiagnosticSeverity::INFORMATION | common::DiagnosticSeverity::HINT => {
                (format!("ℹ {}", diagnostic.message()), Styles::blue)
            }
            _ => (format!("ℹ {}", diagnostic.message()), Styles::blue),
        };

        writeln!(writer, "{}\n", text_color(message))?;
        self.write_source(writer, diagnostic.location(), text_color)?;

        for related_information in diagnostic.related_information() {
            writeln!(
                writer,
                "\n{}\n",
                text_color(format!("  ℹ︎ {}", related_information.message)),
            )?;
            self.write_source(writer, related_information.location, text_color)?;
        }
        Ok(())
    }

    /// Writes the file path and slice of the source code for the given location.
    fn write_source<W: Write>(
        &self,
        writer: &mut W,
        location: Location,
        highlight_color: Style,
    ) -> std::fmt::Result {
        let source_printer = SourcePrinter;
        if let Some(source) = self.sources.get(location.source_location()) {
            let range = source.to_span_range(location.span());
            writeln!(
                writer,
                "  {}{}",
                normalize_path(location.source_location().path()).underline(),
                format!(":{}:{}", range.start.line + 1, range.start.character + 1).dimmed()
            )?;
            source_printer.write_span_with_highlight_style(
                writer,
                location.span(),
                &source.text,
                source.line_index,
                highlight_color,
            )?;
        } else {
            writeln!(
                writer,
                "{}: <missing source>",
                normalize_path(location.source_location().path())
            )?;
        }
        Ok(())
    }
}

pub trait Sources {
    fn get(&self, source_location: SourceLocationKey) -> Option<TextSource>;
}

impl<F> Sources for F
where
    F: Fn(SourceLocationKey) -> Option<TextSource>,
{
    fn get(&self, source_location: SourceLocationKey) -> Option<TextSource> {
        self(source_location)
    }
}

/// Normalize Windows paths to Unix style. This is important for stable test
/// output across Mac/Windows/Linux.
fn normalize_path(path: &str) -> String {
    path.replace("\\", "/")
}
