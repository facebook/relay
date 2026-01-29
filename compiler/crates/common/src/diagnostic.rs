/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::BTreeMap;
use std::error::Error;
use std::fmt;
use std::fmt::Write;

use lsp_types::DiagnosticSeverity;
use lsp_types::DiagnosticTag;
use serde::ser::SerializeMap;
use serde_json::Value;

use crate::Location;
use crate::SourceLocationKey;

pub type Diagnostics = Vec<Diagnostic>;
pub type DiagnosticsResult<T> = Result<T, Diagnostics>;

#[derive(fmt::Debug)]
pub struct WithDiagnostics<T> {
    pub item: T,
    pub diagnostics: Vec<Diagnostic>,
}

impl<T> From<WithDiagnostics<T>> for Result<T, Diagnostics> {
    fn from(s: WithDiagnostics<T>) -> Result<T, Diagnostics> {
        if s.diagnostics.is_empty() {
            Ok(s.item)
        } else {
            Err(s.diagnostics)
        }
    }
}

pub fn diagnostics_result<T>(result: T, diagnostics: Diagnostics) -> DiagnosticsResult<T> {
    if diagnostics.is_empty() {
        Ok(result)
    } else {
        Err(diagnostics)
    }
}

/// A diagnostic message as a result of validating some code. This struct is
/// modeled after the LSP Diagnostic type:
/// <https://microsoft.github.io/language-server-protocol/specification#diagnostic>
///
/// Changes from LSP:
/// - `location` is different from LSP in that it's a file + span instead of
///   just a span.
/// - Unused fields are omitted.
#[derive(fmt::Debug)]
pub struct Diagnostic(Box<DiagnosticData>);

impl Diagnostic {
    fn with_severity<T: 'static + DiagnosticDisplay>(
        severity: DiagnosticSeverity,
        message: T,
        location: Location,
        tags: Vec<DiagnosticTag>,
    ) -> Self {
        Self(Box::new(DiagnosticData {
            message: Box::new(message),
            location,
            related_information: Vec::new(),
            tags,
            severity,
            data: Vec::new(),
            machine_readable: BTreeMap::new(),
            message_type_name: std::any::type_name::<T>().to_string(),
        }))
    }

    /// Creates a new error Diagnostic.
    /// Additional locations can be added with the `.annotate()` function.
    pub fn error<T: 'static + DiagnosticDisplay>(message: T, location: Location) -> Self {
        Diagnostic::with_severity(DiagnosticSeverity::ERROR, message, location, Vec::new())
    }

    /// Creates a new error Diagnostic with additional data that
    /// can be used in IDE code actions
    pub fn error_with_data<T: 'static + DiagnosticDisplay + WithDiagnosticData>(
        message: T,
        location: Location,
    ) -> Self {
        let data = message.get_data();
        Self(Box::new(DiagnosticData {
            message: Box::new(message),
            location,
            tags: Vec::new(),
            severity: DiagnosticSeverity::ERROR,
            related_information: Vec::new(),
            data,
            machine_readable: BTreeMap::new(),
            message_type_name: std::any::type_name::<T>().to_string(),
        }))
    }

    /// Creates a new Diagnostic with a severity of Warning
    /// Additional locations can be added with the `.annotate()` function.
    pub fn warning<T: 'static + DiagnosticDisplay>(
        message: T,
        location: Location,
        tags: Vec<DiagnosticTag>,
    ) -> Self {
        Diagnostic::with_severity(DiagnosticSeverity::WARNING, message, location, tags)
    }

    /// Creates a new Diagnostic with a severity of Information
    /// Additional locations can be added with the `.annotate()` function.
    pub fn info<T: 'static + DiagnosticDisplay>(
        message: T,
        location: Location,
        tags: Vec<DiagnosticTag>,
    ) -> Self {
        Diagnostic::with_severity(DiagnosticSeverity::INFORMATION, message, location, tags)
    }

    /// Creates a new Diagnostic with a severity of Hint
    /// Additional locations can be added with the `.annotate()` function.
    pub fn hint<T: 'static + DiagnosticDisplay>(
        message: T,
        location: Location,
        tags: Vec<DiagnosticTag>,
    ) -> Self {
        Diagnostic::with_severity(DiagnosticSeverity::HINT, message, location, tags)
    }

    pub fn hint_with_data<T: 'static + DiagnosticDisplay + WithDiagnosticData>(
        message: T,
        location: Location,
        tags: Vec<DiagnosticTag>,
    ) -> Self {
        let data = message.get_data();
        Self(Box::new(DiagnosticData {
            message: Box::new(message),
            location,
            tags,
            severity: DiagnosticSeverity::HINT,
            related_information: Vec::new(),
            data,
            machine_readable: BTreeMap::new(),
            message_type_name: std::any::type_name::<T>().to_string(),
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

    /// Some locations, e.g. schema locations where the schema originally comes from
    /// multiple files, have only generated locations. This leads to unhelpful error
    /// annotations. Add a method that skips annotating the error if the location is
    /// generated, so that we can have good (annotated) error messages (if possible)
    /// and sparse (but not unhelpful) error messages when not possible.
    pub fn annotate_if_location_exists<T: 'static + DiagnosticDisplay>(
        self,
        message: T,
        location: Location,
    ) -> Self {
        if !location.source_location().is_generated() {
            self.annotate(message, location)
        } else {
            self
        }
    }

    pub fn metadata_for_machine(mut self, key: impl AsRef<str>, value: impl AsRef<str>) -> Self {
        self.0
            .machine_readable
            .insert(key.as_ref().to_string(), value.as_ref().to_string());
        self
    }

    pub fn message(&self) -> &(impl DiagnosticDisplay + use<>) {
        &self.0.message
    }

    pub fn location(&self) -> Location {
        self.0.location
    }

    pub fn get_data(&self) -> &[impl DiagnosticDisplay + use<>] {
        &self.0.data
    }

    pub fn severity(&self) -> DiagnosticSeverity {
        self.0.severity
    }

    pub fn tags(&self) -> Vec<DiagnosticTag> {
        self.0.tags.clone()
    }

    pub fn machine_readable(&self) -> Option<BTreeMap<String, String>> {
        if self.0.machine_readable.is_empty() {
            None
        } else {
            Some(self.0.machine_readable.clone())
        }
    }

    pub fn message_type_name(&self) -> &str {
        &self.0.message_type_name
    }

    /// Override the location. This should only be used for exceptional situations.
    /// Typically, diagnostics should be constructed with a correct location.
    pub fn override_location(&mut self, location: Location) {
        assert!(
            self.0.location.source_location() == SourceLocationKey::Generated,
            "Diagnostic::override_location can only be called when the location is generated."
        );
        self.0.location = location;
    }

    /// Override the severity. This should only be used for escalating
    /// diagnostics for error reporting. For example, any warnings that
    /// need to be reported as errors can be reconstructed as diagnostics
    /// with a severity of DiagnosticSeverity::ERROR.
    pub fn override_severity(&mut self, severity: DiagnosticSeverity) {
        assert!(
            self.0.severity >= severity, // NOTE: The most critical severity level is actually the lowest enum value
            "Diagnostic::override_severity can only be called when increasing the severity level",
        );

        self.0.severity = severity;
    }

    pub fn related_information(&self) -> &[DiagnosticRelatedInformation] {
        &self.0.related_information
    }

    pub fn print_without_source(&self) -> String {
        let mut result = String::new();
        writeln!(
            result,
            "{message}: {location}",
            message = &self.0.message,
            location = self.0.location.source_location().path()
        )
        .unwrap();
        if !self.0.related_information.is_empty() {
            for (ix, related) in self.0.related_information.iter().enumerate() {
                writeln!(
                    result,
                    "[related {ix}] {message}:{location}",
                    ix = ix + 1,
                    message = related.message,
                    location = related.location.source_location().path()
                )
                .unwrap();
            }
        };
        result
    }
}

impl fmt::Display for Diagnostic {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.print_without_source())
    }
}

impl serde::Serialize for Diagnostic {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut diagnostic = serializer.serialize_map(Some(2))?;
        diagnostic.serialize_entry("message", &self.0.message)?;
        diagnostic.serialize_entry("location", &self.0.location)?;
        diagnostic.end()
    }
}

impl Error for Diagnostic {}

// statically verify that the Diagnostic type is thread safe
fn _assert_diagnostic_constraints()
where
    Diagnostic: Send + Sync,
{
}

#[derive(fmt::Debug)]
struct DiagnosticData {
    /// Human readable error message.
    message: Box<dyn DiagnosticDisplay>,

    /// Type name for the message. It is obtained by std::any::type_name during runtime
    /// Save it for debug or logging purposes.
    message_type_name: String,

    /// The primary location of this diagnostic.
    location: Location,

    /// Related diagnostic information, such as other definitions in the case of
    /// a duplicate definition error.
    related_information: Vec<DiagnosticRelatedInformation>,

    tags: Vec<DiagnosticTag>,

    severity: DiagnosticSeverity,

    /// A list with data that can be passed to the code actions
    /// `data` is used in the LSP protocol:
    /// @see https://microsoft.github.io/language-server-protocol/specifications/specification-current/#diagnostic
    data: Vec<Box<dyn DiagnosticDisplay>>,

    /// Metadata with (K,V) are strings that can read by machine
    machine_readable: BTreeMap<String, String>,
}

/// Secondary locations attached to a diagnostic.
#[derive(fmt::Debug)]
pub struct DiagnosticRelatedInformation {
    /// The message of this related diagnostic information.
    pub message: Box<dyn DiagnosticDisplay>,

    /// The location of this related diagnostic information.
    pub location: Location,
}

pub trait WithDiagnosticData {
    fn get_data(&self) -> Vec<Box<dyn DiagnosticDisplay>>;
}

/// Trait for diagnostic messages to allow structs that capture
/// some data and can lazily convert it to a message.
#[typetag::serialize(tag = "type")]
pub trait DiagnosticDisplay: fmt::Debug + fmt::Display + Send + Sync {}

/// Automatically implement the trait if constraints are met, so that
/// implementors don't need to.
#[typetag::serialize]
impl<T> DiagnosticDisplay for T where T: fmt::Debug + fmt::Display + Send + Sync + typetag::Serialize
{}

impl From<Diagnostic> for Diagnostics {
    fn from(diagnostic: Diagnostic) -> Self {
        vec![diagnostic]
    }
}

pub fn get_diagnostics_data(diagnostic: &Diagnostic) -> Option<Value> {
    let diagnostic_data = diagnostic.get_data();
    if !diagnostic_data.is_empty() {
        Some(Value::Array(
            diagnostic_data
                .iter()
                .map(|item| Value::String(item.to_string()))
                .collect(),
        ))
    } else {
        None
    }
}
