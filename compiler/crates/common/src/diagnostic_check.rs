/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::DiagnosticSeverity;
use crate::Diagnostics;

#[derive(Debug)]
pub struct CriticalDiagnostics(pub Diagnostics);
#[derive(Debug)]
pub struct StableDiagnostics(pub Diagnostics);

pub type DiagnosticCheck = Result<StableDiagnostics, CriticalDiagnostics>;

/// Checks if any results with diagnostic data are fatal to the compiler
fn check(critical_severity: DiagnosticSeverity, diagnostics: Diagnostics) -> DiagnosticCheck {
    let most_critical_severity = diagnostics
        .iter()
        .map(|diagnostic| diagnostic.severity())
        .min(); // DiagnosticSeverity's lowest value is the highest severity, so we use min()

    if let Some(most_critical_severity) = most_critical_severity
        && most_critical_severity <= critical_severity
    {
        return Err(CriticalDiagnostics(diagnostics));
    }

    Ok(StableDiagnostics(diagnostics))
}

/// Escalate all diagnostics at or above the critical severity to the highest severity (DiagnosticSeverity::ERROR)
fn escalate(critical_severity: DiagnosticSeverity, diagnostics: &mut Diagnostics) {
    diagnostics.iter_mut().for_each(|diagnostic| {
        if diagnostic.severity() <= critical_severity {
            diagnostic.override_severity(DiagnosticSeverity::ERROR);
        }
    });
}

/// Convenience function that runs escalate() followed by check()
pub fn escalate_and_check(
    critical_severity: DiagnosticSeverity,
    mut diagnostics: Diagnostics,
) -> DiagnosticCheck {
    escalate(critical_severity, &mut diagnostics);
    check(critical_severity, diagnostics)
}

#[cfg(test)]
mod check_tests {
    use super::*;
    use crate::Diagnostic;
    use crate::Location;

    #[test]
    fn test_empty_diagnostics() {
        let result = check(DiagnosticSeverity::HINT, Vec::new());

        assert!(result.is_ok());
    }

    #[test]
    fn test_only_noncritical_results() {
        let diagnostics = vec![
            Diagnostic::hint("A hint", Location::generated(), Vec::new()),
            Diagnostic::hint("Some information", Location::generated(), Vec::new()),
        ];

        let result = check(DiagnosticSeverity::WARNING, diagnostics);

        assert!(result.is_ok());
    }

    #[test]
    fn test_only_critical_results() {
        let diagnostics = vec![
            Diagnostic::error("An error", Location::generated()),
            Diagnostic::warning("Some warning", Location::generated(), Vec::new()),
        ];

        let result = check(DiagnosticSeverity::WARNING, diagnostics);

        assert!(result.is_err());
    }

    #[test]
    fn test_some_critical_results() {
        let diagnostics = vec![
            Diagnostic::error("An error", Location::generated()),
            Diagnostic::warning("Some warning", Location::generated(), Vec::new()),
            // Only the last item should keep its severity
            Diagnostic::hint("An unfortunate hint", Location::generated(), Vec::new()),
        ];

        let result = check(DiagnosticSeverity::WARNING, diagnostics);

        assert!(result.is_err());
    }
}

#[cfg(test)]
mod escalate_tests {
    use super::*;
    use crate::Diagnostic;
    use crate::Location;

    #[test]
    fn test_empty_diagnostics() {
        let mut diagnostics = Vec::new();
        escalate(DiagnosticSeverity::ERROR, &mut diagnostics);
        assert!(diagnostics.is_empty());
    }

    #[test]
    fn test_no_escalation() {
        let mut diagnostics = vec![
            Diagnostic::hint("A hint", Location::generated(), Vec::new()),
            Diagnostic::hint("Some information", Location::generated(), Vec::new()),
            Diagnostic::hint("More information", Location::generated(), Vec::new()),
        ];

        escalate(DiagnosticSeverity::WARNING, &mut diagnostics);

        assert!(
            diagnostics
                .iter()
                .all(|d| d.severity() == DiagnosticSeverity::HINT)
        );
    }

    #[test]
    fn test_all_escalated() {
        let mut diagnostics = vec![
            Diagnostic::error("An error", Location::generated()),
            Diagnostic::warning("Some warning", Location::generated(), Vec::new()),
            Diagnostic::warning("Another warning", Location::generated(), Vec::new()),
            Diagnostic::warning("Yet another warning", Location::generated(), Vec::new()),
        ];

        escalate(DiagnosticSeverity::WARNING, &mut diagnostics);

        assert!(
            diagnostics
                .iter()
                .all(|d| d.severity() == DiagnosticSeverity::ERROR)
        );
    }

    #[test]
    fn test_some_escalations() {
        let mut diagnostics = vec![
            Diagnostic::error("An error", Location::generated()),
            Diagnostic::warning("Some warning", Location::generated(), Vec::new()),
            // Only the last item should keep its severity
            Diagnostic::hint("An unfortunate hint", Location::generated(), Vec::new()),
        ];

        escalate(DiagnosticSeverity::WARNING, &mut diagnostics);

        let expected_severities = [
            DiagnosticSeverity::ERROR,
            DiagnosticSeverity::ERROR,
            DiagnosticSeverity::HINT,
        ];

        assert_eq!(diagnostics.len(), expected_severities.len()); // Sanity check
        for i in 0..diagnostics.len() {
            assert_eq!(diagnostics[i].severity(), expected_severities[i]);
        }
    }
}
