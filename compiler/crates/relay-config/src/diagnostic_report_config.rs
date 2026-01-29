/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::DiagnosticSeverity;
use schemars::JsonSchema;
use serde::Deserialize;
use serde::Serialize;

/// Levels for reporting errors in the compiler.
#[derive(Copy, Clone, Debug, Deserialize, Serialize, JsonSchema)]
#[serde(rename_all = "lowercase")]
pub enum DiagnosticLevel {
    /// Report only errors
    Error,
    /// Report diagnostics up to warnings
    Warning,
    /// Report diagnostics up to informational diagnostics
    Info,
    /// Report diagnostics up to hints
    Hint,
}

impl From<DiagnosticLevel> for DiagnosticSeverity {
    fn from(level: DiagnosticLevel) -> DiagnosticSeverity {
        match level {
            DiagnosticLevel::Error => DiagnosticSeverity::ERROR,
            DiagnosticLevel::Warning => DiagnosticSeverity::WARNING,
            DiagnosticLevel::Info => DiagnosticSeverity::INFORMATION,
            DiagnosticLevel::Hint => DiagnosticSeverity::HINT,
        }
    }
}

/// Configuration for all diagnostic reporting in the compiler
#[derive(Copy, Clone, Debug, Deserialize, Serialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct DiagnosticReportConfig {
    /// Threshold for diagnostics to be critical to the compiler's execution.
    /// All diagnostic with severities at and below this level will cause the
    /// compiler to fatally exit.
    pub critical_level: DiagnosticLevel,
}

impl Default for DiagnosticReportConfig {
    fn default() -> Self {
        Self {
            critical_level: DiagnosticLevel::Error,
        }
    }
}
