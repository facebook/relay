/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::Diagnostic;
use common::Location;
use common::SourceLocationKey;
use common::Span;
use fixture_tests::WORKSPACE_ROOT;
use fixture_tests::assert_file_contains;

#[derive(Debug, serde::Serialize)]
struct SimpleMessage(String);

impl std::fmt::Display for SimpleMessage {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}

/// An enum using `#[serde(tag = "type")]` — the pattern that caused the
/// original typetag collision panic in production.
#[derive(Debug, serde::Serialize)]
#[serde(tag = "type")]
enum TaggedMessage {
    RequiredOnSemanticNonNull,
    UnusedVariable { variable_name: String },
}

impl std::fmt::Display for TaggedMessage {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            TaggedMessage::RequiredOnSemanticNonNull => {
                write!(
                    f,
                    "This field is semantically non-null, consider adding @required"
                )
            }
            TaggedMessage::UnusedVariable { variable_name } => {
                write!(f, "Variable '{variable_name}' is never used")
            }
        }
    }
}

fn assert_snapshot(actual: &str, snapshot_name: &str) {
    let expected_file_name = format!("{snapshot_name}.expected");
    let expected = match snapshot_name {
        "diagnostic_json_error" => include_str!("diagnostic_json_error.expected"),
        "diagnostic_json_warning_tagged_enum" => {
            include_str!("diagnostic_json_warning_tagged_enum.expected")
        }
        "diagnostic_json_hint_tagged_enum" => {
            include_str!("diagnostic_json_hint_tagged_enum.expected")
        }
        "diagnostic_json_multiple" => include_str!("diagnostic_json_multiple.expected"),
        _ => panic!("unknown snapshot: {snapshot_name}"),
    };
    let expected_file_path = WORKSPACE_ROOT
        .join(file!())
        .with_file_name(&expected_file_name);
    assert_file_contains(actual, expected_file_path, expected);
}

/// Snapshot: a simple error diagnostic with a standalone source location.
#[test]
fn diagnostic_json_error() {
    let diag = Diagnostic::error(
        SimpleMessage("Expected a SelectionSet".to_string()),
        Location::new(
            SourceLocationKey::standalone("src/schema.graphql"),
            Span::new(42, 58),
        ),
    );
    let actual = format!("{}\n", serde_json::to_string_pretty(&diag).unwrap());
    assert_snapshot(&actual, "diagnostic_json_error");
}

/// Snapshot: a warning using a `#[serde(tag = "type")]` enum — the pattern
/// that caused the original typetag collision panic. Verifies the message
/// is serialized as a plain Display string, not a trait-object JSON object.
#[test]
fn diagnostic_json_warning_tagged_enum() {
    let diag = Diagnostic::warning(
        TaggedMessage::UnusedVariable {
            variable_name: "$count".to_string(),
        },
        Location::new(
            SourceLocationKey::embedded("src/components/Feed.js", 3),
            Span::new(120, 126),
        ),
        vec![],
    );
    let actual = format!("{}\n", serde_json::to_string_pretty(&diag).unwrap());
    assert_snapshot(&actual, "diagnostic_json_warning_tagged_enum");
}

/// Snapshot: a hint diagnostic with RequiredOnSemanticNonNull — the exact
/// variant that triggered the production panic in the `intern` project.
#[test]
fn diagnostic_json_hint_tagged_enum() {
    let diag = Diagnostic::hint(
        TaggedMessage::RequiredOnSemanticNonNull,
        Location::new(
            SourceLocationKey::standalone("src/schema.graphql"),
            Span::new(100, 150),
        ),
        vec![],
    );
    let actual = format!("{}\n", serde_json::to_string_pretty(&diag).unwrap());
    assert_snapshot(&actual, "diagnostic_json_hint_tagged_enum");
}

/// Snapshot: a batch of diagnostics serialized as a JSON array, simulating
/// the output of `relay build --json` which wraps diagnostics in
/// `{"completed": true, "diagnostics": [...]}`.
#[test]
fn diagnostic_json_multiple() {
    let diagnostics = vec![
        Diagnostic::error(
            SimpleMessage("Unknown type 'Usr'".to_string()),
            Location::new(
                SourceLocationKey::standalone("src/schema.graphql"),
                Span::new(10, 13),
            ),
        ),
        Diagnostic::hint(
            TaggedMessage::RequiredOnSemanticNonNull,
            Location::new(
                SourceLocationKey::embedded("src/components/Profile.js", 1),
                Span::new(200, 250),
            ),
            vec![],
        ),
    ];
    let actual = format!("{}\n", serde_json::to_string_pretty(&diagnostics).unwrap());
    assert_snapshot(&actual, "diagnostic_json_multiple");
}
