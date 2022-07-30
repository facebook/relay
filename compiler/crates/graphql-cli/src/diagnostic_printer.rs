/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::SourcePrinter;
use colored::*;
use common::Diagnostic;
use common::Location;
use common::SourceLocationKey;
use common::TextSource;
use std::fmt::Write;

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
        match diagnostic.severity() {
            common::DiagnosticSeverity::ERROR => {
                writeln!(writer, "{}\n", format!("✖︎ {}", diagnostic.message()).red())?;
            }
            common::DiagnosticSeverity::WARNING => {
                writeln!(
                    writer,
                    "{}\n",
                    format!("︎⚠ {}", diagnostic.message()).yellow()
                )?;
            }
            common::DiagnosticSeverity::INFORMATION | common::DiagnosticSeverity::HINT => {
                writeln!(writer, "{}\n", format!("ℹ {}", diagnostic.message()).blue())?;
            }
            _ => {
                writeln!(writer, "{}\n", format!("ℹ {}", diagnostic.message()).blue())?;
            }
        }
        self.write_source(writer, diagnostic.location())?;
        for related_information in diagnostic.related_information() {
            writeln!(
                writer,
                "\n{}\n",
                format!("  ℹ︎ {}", related_information.message).red()
            )?;
            self.write_source(writer, related_information.location)?;
        }
        Ok(())
    }

    /// Writes the file path and slice of the source code for the given location.
    fn write_source<W: Write>(&self, writer: &mut W, location: Location) -> std::fmt::Result {
        let source_printer = SourcePrinter::default();
        if let Some(source) = self.sources.get(location.source_location()) {
            let range = source.to_span_range(location.span());
            writeln!(
                writer,
                "  {}{}",
                location.source_location().path().underline(),
                format!(":{}:{}", range.start.line + 1, range.start.character + 1).dimmed()
            )?;
            source_printer.write_span(writer, location.span(), &source.text, source.line_index)?;
        } else {
            writeln!(
                writer,
                "{}: <missing source>",
                location.source_location().path()
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
