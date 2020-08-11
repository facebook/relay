/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::{Location, SourceLocationKey};
use fnv::FnvHashMap;
use std::fmt::{Debug, Display, Write};

/// A diagnostic message as a result of validating some code. This struct is
/// modeled after the LSP Diagnostic type:
/// https://microsoft.github.io/language-server-protocol/specification#diagnostic
///
/// Changes from LSP:
/// - `location` is different from LSP in that it's a file + span instead of
///   just a span.
/// - Unused fields are omitted.
#[derive(Debug)]
pub struct Diagnostic(Box<DiagnosticData>);

impl Diagnostic {
    /// Creates a new error Diagnostic.
    /// Additional locations can be added with the `.annotate()` function.
    pub fn error<T: 'static + DiagnosticDisplay>(message: T, location: Location) -> Self {
        Self(Box::new(DiagnosticData {
            message: Box::new(message),
            location,
            related_information: Vec::new(),
        }))
    }

    /// Annotates this error with an additional location and associated message.
    pub fn annotate<T: 'static + DiagnosticDisplay>(
        mut self,
        message: T,
        location: Location,
    ) -> Self {
        self.0
            .related_information
            .push(DiagnosticRelatedInformation {
                message: Box::new(message),
                location,
            });
        self
    }

    pub fn message(&self) -> &impl DiagnosticDisplay {
        &self.0.message
    }

    pub fn location(&self) -> Location {
        self.0.location
    }

    pub fn related_information(&self) -> &[DiagnosticRelatedInformation] {
        &self.0.related_information
    }

    pub fn print_without_source(&self) -> String {
        let mut result = String::new();
        writeln!(
            result,
            "{message}:{location:?}",
            message = &self.0.message,
            location = self.0.location
        )
        .unwrap();
        if !self.0.related_information.is_empty() {
            for (ix, related) in self.0.related_information.iter().enumerate() {
                writeln!(
                    result,
                    "[related {ix}] {message}:{location:?}",
                    ix = ix + 1,
                    message = related.message,
                    location = related.location
                )
                .unwrap();
            }
        };
        result
    }

    pub fn print_with_source_fn<TStr, TFn>(&self, get_source: TFn) -> String
    where
        TStr: AsRef<str>,
        TFn: Fn(Location) -> Option<TStr>,
    {
        let mut result = String::new();
        self.write_with_source_fn(&mut result, get_source).unwrap();
        result
    }

    pub fn print_with_sources(&self, sources: &FnvHashMap<SourceLocationKey, &str>) -> String {
        let mut result = String::new();
        self.write_with_source_fn(&mut result, |key| sources.get(&key.source_location()))
            .unwrap();
        result
    }

    pub fn write_with_source_fn<TStr, TFn>(
        &self,
        writer: &mut impl Write,
        get_source: TFn,
    ) -> std::fmt::Result
    where
        TStr: AsRef<str>,
        TFn: Fn(Location) -> Option<TStr>,
    {
        writeln!(writer, "{message}:", message = &self.0.message)?;
        Self::write_source(writer, self.0.location, &get_source)?;
        if !self.0.related_information.is_empty() {
            writeln!(writer, "Notes:")?;
            for (ix, related) in self.0.related_information.iter().enumerate() {
                writeln!(
                    writer,
                    "[related {ix}] {message}:",
                    ix = ix + 1,
                    message = related.message
                )?;
                Self::write_source(writer, related.location, &get_source)?;
            }
        };
        Ok(())
    }

    fn write_source<TStr: AsRef<str>>(
        writer: &mut impl Write,
        location: Location,
        get_source: &impl Fn(Location) -> Option<TStr>,
    ) -> std::fmt::Result {
        if let Some(source) = get_source(location) {
            let source = source.as_ref();
            let range = location.span().to_range(source, 0, 0);
            writeln!(
                writer,
                "{}:{}:{}:{}:{}",
                location.source_location().path(),
                range.start.line + 1,
                range.start.character + 1,
                range.end.line + 1,
                range.end.character + 1
            )?;
            writeln!(writer, "{}", location.span().print(source))
        } else {
            writeln!(writer, "<missing source>")
        }
    }
}

// statically verify that the Diagnostic type is thread safe
fn _assert_diagnostic_constraints()
where
    Diagnostic: Send + Sync,
{
}

#[derive(Debug)]
struct DiagnosticData {
    /// Human readable error message.
    message: Box<dyn DiagnosticDisplay>,

    /// The primary location of this diagnostic.
    location: Location,

    /// Related diagnostic information, such as other definitions in the case of
    /// a duplicate definition error.
    related_information: Vec<DiagnosticRelatedInformation>,
}

/// Secondary locations attached to a diagnostic.
#[derive(Debug)]
pub struct DiagnosticRelatedInformation {
    /// The message of this related diagnostic information.
    pub message: Box<dyn DiagnosticDisplay>,

    /// The location of this related diagnostic information.
    pub location: Location,
}

/// Trait for diagnostic messages to allow structs that capture
/// some data and can lazily convert it to a message.
pub trait DiagnosticDisplay: Debug + Display + Send + Sync {}

/// Automatically implement the trait if constraints are met, so that
/// implementors don't need to.
impl<T> DiagnosticDisplay for T where T: Debug + Display + Send + Sync {}

impl From<Diagnostic> for Vec<Diagnostic> {
    fn from(diagnostic: Diagnostic) -> Self {
        vec![diagnostic]
    }
}

#[cfg(test)]
mod tests {
    use super::Diagnostic;
    use crate::location::Location;
    use crate::{span::Span, SourceLocationKey};
    use fnv::FnvHashMap;

    #[test]
    fn test_print_with_sources() {
        let file = SourceLocationKey::standalone("/tmp/file.transform");
        let file_text = "<foo> is <bar>";
        let mut sources = FnvHashMap::default();
        sources.insert(file, file_text);
        let diagnostic =
            Diagnostic::error("<foo> is invalid", Location::new(file, Span::new(0, 5)))
                .annotate("because of <bar>", Location::new(file, Span::new(9, 14)));
        colored::control::set_override(false);
        let result = diagnostic.print_with_sources(&sources);
        colored::control::unset_override();
        assert_eq!(
            &result,
            "<foo> is invalid:\n/tmp/file.transform:1:1:1:6\n<foo>\nNotes:\n[related 1] because of <bar>:\n/tmp/file.transform:1:10:1:1\n<foo> is <bar>\n"
        );
    }
}
